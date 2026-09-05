import { describe, expect, it } from 'vitest'
import { reduceSession } from '../src/analytics/reducer.js'
import { buildSummary } from '../src/analytics/summary.js'
import type { SessionEventLike, SessionHeaderLike } from '../src/types.js'

const header: SessionHeaderLike = { id: 's1', createdAt: Date.UTC(2026, 8, 4) }
const at = Date.UTC(2026, 8, 4, 4)
const event = (seq: number, type: string, data: unknown, time = at): SessionEventLike => ({ seq, type, data, time })

describe('reduceSession', () => {
  it('counts a terminal streamed usage once and keeps reasoning as output subset', () => {
    const record = reduceSession(header, [
      event(0, 'request/header', { header: { config: { provider: 'deepseek', model: 'deepseek-chat' } } }),
      event(1, 'assistant/chunk', { turn: 't', step: 's', chunk: { usage: { inputTokens: 100, outputTokens: 40, cacheReadTokens: 8, cacheWriteTokens: 2, reasoningTokens: 30 } } }),
      event(2, 'assistant/chunk', { turn: 't', step: 's', chunk: { finish: { reason: 'stop' } } }),
      event(3, 'assistant/message', { turn: 't', step: 's', message: { source: { provider: 'deepseek', model: 'deepseek-chat' }, usage: { inputTokens: 100, outputTokens: 40 } } }),
    ], 'r1', at)
    expect(record.usage).toHaveLength(1)
    expect(record.usage[0]).toMatchObject({ total: 150, reasoning: 30, provider: 'deepseek', model: 'deepseek-chat' })
  })

  it('classifies automatic, explicit, failed and incomplete skill calls without retaining arguments', () => {
    const record = reduceSession(header, [
      event(1, 'tool/call', { turn: 'a', callId: 'one', name: 'skill', arguments: '{"name":"imagegen"}' }),
      event(2, 'tool/result', { message: { source: { kind: 'tool', callId: 'one' }, content: [{ type: 'text', text: 'done' }] } }, at + 100),
      event(3, 'tool/call', { turn: 'a', callId: 'two', name: 'skill', arguments: '{bad json' }),
      event(4, 'tool/result', { message: { source: { kind: 'tool', callId: 'two' } }, error: { message: 'failed' } }, at + 200),
      event(5, 'tool/call', { turn: 'b', callId: 'three', name: 'skill', arguments: '{"name":"pdf"}' }),
      event(6, 'turn/end', { turn: 'b' }),
      event(7, 'user/message', { message: { source: { kind: 'skill-invocation', name: 'openai-docs' } } }),
    ], 'r1', at)
    expect(record.skills).toEqual([
      expect.objectContaining({ name: 'imagegen', origin: 'automatic', status: 'success', durationMs: 100 }),
      expect.objectContaining({ name: '未知技能', origin: 'automatic', status: 'failure', durationMs: 200 }),
      expect.objectContaining({ name: 'pdf', origin: 'automatic', status: 'incomplete' }),
      expect.objectContaining({ name: 'openai-docs', origin: 'explicit', status: 'success' }),
    ])
    expect(JSON.stringify(record)).not.toContain('bad json')
  })

  it('does not fold fork-inherited prefix events', () => {
    const record = reduceSession({ ...header, id: 'fork', seedLength: 2, parentSession: 's1', origin: 'subagent' }, [
      event(0, 'assistant/message', { turn: 'old', step: 'old', usage: { inputTokens: 999, outputTokens: 1 } }),
      event(1, 'tool/call', { callId: 'old', name: 'skill', arguments: '{"name":"old"}' }),
      event(2, 'assistant/message', { turn: 'new', step: 'new', usage: { inputTokens: 5, outputTokens: 4 } }),
    ], 'r1', at)
    expect(record.origin).toBe('subagent')
    expect(record.usage).toHaveLength(1)
    expect(record.usage[0]?.total).toBe(9)
    expect(record.skills).toHaveLength(0)
  })
})

describe('buildSummary', () => {
  it('uses the requested local natural day and reports unknown coverage', () => {
    const record = reduceSession(header, [
      event(1, 'assistant/message', { turn: 'a', step: 'a', usage: { inputTokens: 2, outputTokens: 3 } }, Date.UTC(2026, 8, 3, 16, 30)),
      event(2, 'assistant/message', { turn: 'b', step: 'b', message: {} }, Date.UTC(2026, 8, 3, 17, 30)),
    ], 'r1', at)
    const summary = buildSummary([record], {
      range: '1d', timeZone: 'Asia/Shanghai', now: Date.UTC(2026, 8, 4, 2),
      index: { state: 'ready', processedSessions: 1, totalSessions: 1, failures: 0 },
    })
    expect(summary.totals.total).toBe(5)
    expect(summary.coverage).toMatchObject({ knownAttempts: 1, unknownAttempts: 1, percent: 50 })
    expect(summary.heatmap).toHaveLength(24)
  })

  it('builds a 30-day calendar with a 24-hour micro heatmap for every date', () => {
    const record = reduceSession(header, [
      event(1, 'assistant/message', { turn: 'a', step: 'a', usage: { inputTokens: 2, outputTokens: 3 } }, Date.UTC(2026, 8, 3, 16, 30)),
    ], 'r1', at)
    const summary = buildSummary([record], {
      range: '30d', timeZone: 'Asia/Shanghai', now: Date.UTC(2026, 8, 4, 2),
      index: { state: 'ready', processedSessions: 1, totalSessions: 1, failures: 0 },
    })
    expect(summary.calendar).toHaveLength(30)
    const day = summary.calendar?.find((item) => item.day === '2026-09-04')
    expect(day).toMatchObject({ total: 5, attempts: 1 })
    expect(day?.hours).toHaveLength(24)
    expect(day?.hours[0]).toMatchObject({ hour: 0, total: 5, attempts: 1 })
  })
})

describe('usage accounting regressions', () => {
  it('treats reported zero as known and invalid numeric usage as unknown', () => {
    const record = reduceSession(header, [
      event(1, 'assistant/message', { usage: { inputTokens: 0, outputTokens: 0 } }),
      event(2, 'assistant/message', { usage: { inputTokens: NaN, outputTokens: -1 } }),
    ], 'r1', at)
    expect(record.usage.map((item) => item.known)).toEqual([true, false])
  })

  it('counts repeated terminal chunks once', () => {
    const record = reduceSession(header, [
      event(1, 'assistant/chunk', { turn: 1, step: 1, chunk: { usage: { inputTokens: 3 }, finish: { reason: 'stop' } } }),
      event(2, 'assistant/chunk', { turn: 1, step: 1, chunk: { finish: { reason: 'stop' } } }),
    ], 'r1', at)
    expect(record.usage).toHaveLength(1)
    expect(record.usage[0]?.total).toBe(3)
  })

  it('preserves usage from an interrupted stream without a terminal chunk', () => {
    const record = reduceSession(header, [
      event(1, 'assistant/chunk', { turn: 1, step: 1, chunk: { usage: { inputTokens: 3 } } }),
      event(2, 'assistant/message', { turn: 1, step: 1, message: {}, interrupted: true }),
    ], 'r1', at)
    expect(record.usage[0]).toMatchObject({ known: true, total: 3 })
  })

  it('reads explicit skill invocations from the native DSH user event', () => {
    const record = reduceSession(header, [
      event(1, 'user/message', { source: { kind: 'skill-invocation', name: 'pdf' }, content: [] }),
    ], 'r1', at)
    expect(record.skills[0]).toMatchObject({ name: 'pdf', origin: 'explicit' })
  })

  it('groups repeated daylight-saving hours into the same local hour', () => {
    const record = reduceSession(header, [
      event(1, 'assistant/message', { usage: { inputTokens: 2 } }, Date.UTC(2026, 10, 1, 5, 30)),
      event(2, 'assistant/message', { usage: { inputTokens: 3 } }, Date.UTC(2026, 10, 1, 6, 30)),
    ], 'r1', Date.UTC(2026, 10, 1, 12))
    const summary = buildSummary([record], {
      range: '1d', timeZone: 'America/New_York', now: Date.UTC(2026, 10, 1, 12),
      index: { state: 'ready', processedSessions: 1, totalSessions: 1, failures: 0 },
    })
    expect(summary.heatmap[1]).toMatchObject({ total: 5, attempts: 2 })
  })
})

it('constructs one timezone formatter per summary, independent of fact count', () => {
  const original = Intl.DateTimeFormat
  let calls = 0
  Intl.DateTimeFormat = new Proxy(original, {
    construct(target, args) { calls += 1; return Reflect.construct(target, args) },
    apply(target, receiver, args) { calls += 1; return Reflect.apply(target, receiver, args) },
  })
  try {
    const record = reduceSession(header, Array.from({ length: 500 }, (_, seq) =>
      event(seq, 'assistant/message', { usage: { inputTokens: 1 } })), 'r1', at)
    const summary = buildSummary([record], {
      range: '7d', timeZone: 'Asia/Shanghai', now: at,
      index: { state: 'ready', processedSessions: 1, totalSessions: 1, failures: 0 },
    })
    expect(summary.totals.total).toBe(500)
    expect(calls).toBe(1)
  } finally { Intl.DateTimeFormat = original }
})
