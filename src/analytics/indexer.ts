import type { Context } from '@deepseek-ai/cordis'
import type { KvTable } from '@deepseek-ai/dsh-storage-domain'
import { REDUCER_VERSION, reduceSession } from './reducer.js'
import { buildSummary } from './summary.js'
import { usageInsightsDomain } from './spec.js'
import type { SessionEventLike, SessionHeaderLike, SessionUsageRecord, UsageRange, UsageSummaryV1 } from '../types.js'

type Snapshot = { header: SessionHeaderLike; revision: string | number }
type LiveSession = { id: string; header: SessionHeaderLike; events: SessionEventLike[] }
type HostContext = Context & {
  sessionPersistence: { listSnapshots(): Promise<Snapshot[]>; readFrom(id: string, fromSeq: number): Promise<{ meta: SessionHeaderLike; events: SessionEventLike[] }> }
  sessions: { flush(session: LiveSession): Promise<void>; get(id: string): LiveSession | undefined }
  storageDomain: Context['storageDomain']
}

export class UsageInsightsIndex {
  private table!: KvTable<string, SessionUsageRecord>
  private records = new Map<string, SessionUsageRecord>()
  private index: UsageSummaryV1['index'] = { state: 'indexing', processedSessions: 0, totalSessions: 0, failures: 0 }
  private domainClose?: () => Promise<void>
  private queue: Promise<void> = Promise.resolve()
  private refreshPending: Promise<void> | undefined
  private rebuildPending: Promise<void> | undefined
  private disposed = false

  constructor(private readonly ctx: HostContext) {}

  async start(): Promise<void> {
    const domain = await this.ctx.storageDomain.open(usageInsightsDomain)
    this.domainClose = () => domain.close()
    this.ctx.effect(() => async () => {
      this.disposed = true
      await this.queue
      await this.domainClose?.()
    }, 'usageInsights.domainClose')
    this.table = domain.table('sessions')
    this.records = new Map(this.table.entries())
    await this.prune()
    this.installLiveReducer()
    void this.refresh()
    this.ctx.effect(() => {
      const timer = setInterval(() => void this.refresh(), 60_000)
      timer.unref()
      return () => clearInterval(timer)
    }, 'usageInsights.refresh')
  }

  summary(range: UsageRange, timeZone: string): UsageSummaryV1 {
    return buildSummary(this.records.values(), { range, timeZone, index: this.index, unreadableSessions: this.index.failures })
  }

  rebuild(): Promise<void> {
    if (this.rebuildPending) return this.rebuildPending
    this.index = { state: 'indexing', processedSessions: 0, totalSessions: this.records.size, failures: 0 }
    this.rebuildPending = this.enqueue(async () => {
      for (const key of [...this.table.keys()]) {
        await this.table.delete(key)
        this.records.delete(key)
      }
      await this.backfill()
    }).finally(() => { this.rebuildPending = undefined })
    return this.rebuildPending
  }

  private enqueue(operation: () => Promise<void>): Promise<void> {
    this.queue = this.queue.then(async () => {
      if (this.disposed) return
      try { await operation() } catch { this.index.state = 'error' }
    })
    return this.queue
  }

  private refresh(): Promise<void> {
    if (this.refreshPending) return this.refreshPending
    this.refreshPending = this.enqueue(() => this.backfill())
      .finally(() => { this.refreshPending = undefined })
    return this.refreshPending
  }

  private async prune(): Promise<void> {
    const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000
    for (const record of this.records.values()) {
      const usage = record.usage.filter((item) => item.at >= cutoff)
      const skills = record.skills.filter((item) => item.at >= cutoff)
      if (usage.length !== record.usage.length || skills.length !== record.skills.length) {
        await this.save({ ...record, usage, skills })
      }
    }
  }

  private installLiveReducer(): void {
    const events = this.ctx as unknown as { on(name: string, listener: (session: LiveSession, event: SessionEventLike) => void): void }
    events.on('session/event', (session, event) => {
      // A turn boundary is both stable and cheap: flush source events first, then replace the whole fact record.
      if (event.type === 'turn/end') void this.enqueue(() => this.syncLive(session))
    })
  }

  private async syncLive(session: LiveSession): Promise<void> {
    try {
      await this.ctx.sessions.flush(session)
      const snapshots = await this.ctx.sessionPersistence.listSnapshots()
      const snapshot = snapshots.find((item) => item.header.id === session.id)
      if (!snapshot) return
      // Read durable events: the live array may already contain the next, unflushed turn.
      const source = await this.ctx.sessionPersistence.readFrom(session.id, 0)
      const record = reduceSession(source.meta, source.events, String(snapshot.revision))
      await this.save(record)
    } catch {
      // The periodic reconciliation retries failures without publishing live-only facts.
      this.index.state = 'partial'
    }
  }

  private async backfill(): Promise<void> {
    try {
      await this.prune()
      const snapshots = await this.ctx.sessionPersistence.listSnapshots()
      const available = new Set(snapshots.map((item) => item.header.id))
      this.index = { state: 'indexing', processedSessions: 0, totalSessions: snapshots.length, failures: 0 }
      for (const key of [...this.records.keys()]) {
        if (!available.has(key)) { await this.table.delete(key); this.records.delete(key) }
      }
      for (const snapshot of snapshots) {
        const existing = this.records.get(snapshot.header.id)
        const revision = String(snapshot.revision)
        if (existing?.reducerVersion === REDUCER_VERSION && existing.sourceCreatedAt === snapshot.header.createdAt && String(existing.sourceRevision) === revision) {
          this.index.processedSessions += 1
          continue
        }
        try {
          const source = await this.ctx.sessionPersistence.readFrom(snapshot.header.id, 0)
          await this.save(reduceSession(source.meta, source.events, revision))
        } catch {
          this.index.failures += 1
        } finally {
          this.index.processedSessions += 1
        }
      }
      this.index.state = this.index.failures ? 'partial' : 'ready'
    } catch {
      this.index.state = 'error'
    }
  }

  private async save(record: SessionUsageRecord): Promise<void> {
    await this.table.put(record.sessionId, record)
    this.records.set(record.sessionId, record)
  }
}
