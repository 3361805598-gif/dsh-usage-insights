import type { Context } from '@deepseek-ai/cordis'
import type { KvTable } from '@deepseek-ai/dsh-storage-domain'
import { reduceSession } from './reducer.js'
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
  private running = false

  constructor(private readonly ctx: HostContext) {}

  async start(): Promise<void> {
    const domain = await this.ctx.storageDomain.open(usageInsightsDomain)
    this.domainClose = () => domain.close()
    this.ctx.effect(() => () => this.domainClose?.(), 'usageInsights.domainClose')
    this.table = domain.table('sessions')
    this.records = new Map(this.table.entries())
    this.installLiveReducer()
    void this.backfill()
  }

  summary(range: UsageRange, timeZone: string): UsageSummaryV1 {
    return buildSummary(this.records.values(), { range, timeZone, index: this.index, unreadableSessions: this.index.failures })
  }

  async rebuild(): Promise<void> {
    if (this.running) return
    for (const key of this.table.keys()) await this.table.delete(key)
    this.records.clear()
    await this.backfill()
  }

  private installLiveReducer(): void {
    const events = this.ctx as unknown as { on(name: string, listener: (session: LiveSession, event: SessionEventLike) => void): void }
    events.on('session/event', (session, event) => {
      // A turn boundary is both stable and cheap: flush source events first, then replace the whole fact record.
      if (event.type === 'turn/end') void this.syncLive(session)
    })
  }

  private async syncLive(session: LiveSession): Promise<void> {
    try {
      await this.ctx.sessions.flush(session)
      const snapshots = await this.ctx.sessionPersistence.listSnapshots()
      const revision = String(snapshots.find((item) => item.header.id === session.id)?.revision ?? 0)
      const record = reduceSession(session.header, session.events, revision)
      await this.save(record)
    } catch {
      // The next background listing will retry; never publish a cache ahead of durable history.
    }
  }

  private async backfill(): Promise<void> {
    if (this.running) return
    this.running = true
    try {
      const snapshots = await this.ctx.sessionPersistence.listSnapshots()
      const available = new Set(snapshots.map((item) => item.header.id))
      this.index = { state: 'indexing', processedSessions: 0, totalSessions: snapshots.length, failures: 0 }
      for (const key of [...this.records.keys()]) {
        if (!available.has(key)) { await this.table.delete(key); this.records.delete(key) }
      }
      for (const snapshot of snapshots) {
        const existing = this.records.get(snapshot.header.id)
        const revision = String(snapshot.revision)
        if (existing?.sourceCreatedAt === snapshot.header.createdAt && String(existing.sourceRevision) === revision) {
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
    } finally {
      this.running = false
    }
  }

  private async save(record: SessionUsageRecord): Promise<void> {
    await this.table.put(record.sessionId, record)
    this.records.set(record.sessionId, record)
  }
}
