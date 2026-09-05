import { afterEach, describe, expect, it, vi } from 'vitest'
import { UsageInsightsIndex } from '../src/analytics/indexer.js'
import { reduceSession } from '../src/analytics/reducer.js'
import type { SessionEventLike, SessionUsageRecord } from '../src/types.js'

const now = Date.UTC(2026, 8, 5, 12)
const header = { id: 's1', createdAt: now }
const message = (total: number, time = now): SessionEventLike => ({
  seq: 0, time, type: 'assistant/message', data: { usage: { inputTokens: total } },
})
const cleanups: Array<() => unknown> = []
afterEach(async () => {
  for (const cleanup of cleanups.splice(0).reverse()) await cleanup()
  vi.useRealTimers()
})

function harness(initial: SessionUsageRecord[] = []) {
  const stored = new Map(initial.map((item) => [item.sessionId, item]))
  const table = {
    entries: () => stored.entries(), keys: () => stored.keys(),
    put: vi.fn(async (key: string, record: SessionUsageRecord) => { stored.set(key, record) }),
    delete: vi.fn(async (key: string) => { stored.delete(key) }),
  }
  const close = vi.fn(async () => {})
  const persistence = {
    listSnapshots: vi.fn(async () => [{ header, revision: 'r1' }]),
    readFrom: vi.fn(async () => ({ meta: header, events: [message(5)] })),
  }
  let listener: (session: { id: string; header: typeof header; events: SessionEventLike[] }, event: SessionEventLike) => void
  const ctx = {
    storageDomain: { open: async () => ({ table: () => table, close }) },
    sessionPersistence: persistence,
    sessions: { flush: vi.fn(async () => {}), get: () => undefined },
    effect: (setup: () => () => unknown) => { cleanups.push(setup()) },
    on: (_: string, callback: typeof listener) => { listener = callback },
  }
  const index = new UsageInsightsIndex(ctx as never)
  return { index, table, stored, persistence, close,
    emit: (events = [message(999)]) => listener({ id: header.id, header, events }, { seq: 1, time: now, type: 'turn/end', data: { turn: 1 } }),
  }
}

describe('index lifecycle', () => {
  it('coalesces concurrent rebuilds and serializes live writes behind backfill', async () => {
    const h = harness()
    let release!: () => void
    const blocked = new Promise<void>((resolve) => { release = resolve })
    h.persistence.readFrom.mockImplementationOnce(async () => {
      await blocked
      return { meta: header, events: [message(1)] }
    })
    await h.index.start()
    await vi.waitFor(() => expect(h.persistence.readFrom).toHaveBeenCalledTimes(1))
    h.emit()
    const first = h.index.rebuild()
    expect(h.index.rebuild()).toBe(first)
    expect(h.table.delete).not.toHaveBeenCalled()
    release()
    await first
    expect(h.stored.get('s1')?.usage[0]?.total).toBe(5)
    expect(h.table.delete).toHaveBeenCalledTimes(1)
    expect(h.index.summary('1d', 'UTC').index.state).toBe('ready')
  })

  it('only indexes durable events after flushing a live session', async () => {
    const h = harness()
    await h.index.start()
    await h.index.rebuild()
    h.emit([message(999)])
    await vi.waitFor(() => expect(h.table.put).toHaveBeenCalledTimes(3))
    expect(h.stored.get('s1')?.usage[0]?.total).toBe(5)
  })

  it('prunes unchanged cached records at startup and during periodic reconciliation', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
    const old = now - 91 * 86_400_000
    const almostOld = now - 90 * 86_400_000 + 30_000
    const record = reduceSession(header, [message(10, old), message(20, almostOld)], 'r1', old)
    const h = harness([record])
    await h.index.start()
    await vi.advanceTimersByTimeAsync(0)
    expect(h.stored.get('s1')?.usage.map((item) => item.total)).toEqual([20])
    expect(h.persistence.readFrom).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(60_000)
    expect(h.stored.get('s1')?.usage).toEqual([])
    expect(h.persistence.readFrom).not.toHaveBeenCalled()
  })

  it('recomputes legacy caches even when the source revision is unchanged', async () => {
    const record = reduceSession(header, [message(999)], 'r1', now)
    delete record.reducerVersion
    const h = harness([record])
    await h.index.start()
    await vi.waitFor(() => expect(h.stored.get('s1')?.usage[0]?.total).toBe(5))
    expect(h.persistence.readFrom).toHaveBeenCalledTimes(1)
  })

  it('reports failed rebuild deletion and allows a later retry', async () => {
    const h = harness()
    await h.index.start()
    await h.index.rebuild()
    h.table.delete.mockRejectedValueOnce(new Error('disk unavailable'))
    await expect(h.index.rebuild()).resolves.toBeUndefined()
    expect(h.index.summary('1d', 'UTC').index.state).toBe('error')
    await h.index.rebuild()
    expect(h.index.summary('1d', 'UTC').index.state).toBe('ready')
  })
})
