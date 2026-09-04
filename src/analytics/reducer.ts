import type { SessionEventLike, SessionHeaderLike, SessionUsageRecord, SkillFact, TokenBreakdown, UsageFact } from '../types.js'

const emptyTokens = (): TokenBreakdown => ({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0, reasoning: 0, total: 0 })

function numberOf(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0
}

function usageFrom(value: unknown): TokenBreakdown | undefined {
  if (!value || typeof value !== 'object') return undefined
  const raw = value as Record<string, unknown>
  const seen = ['inputTokens', 'outputTokens', 'cacheReadTokens', 'cacheWriteTokens', 'reasoningTokens']
    .some((key) => typeof raw[key] === 'number')
  if (!seen) return undefined
  const input = numberOf(raw.inputTokens)
  const output = numberOf(raw.outputTokens)
  const cacheRead = numberOf(raw.cacheReadTokens)
  const cacheWrite = numberOf(raw.cacheWriteTokens)
  const reasoning = numberOf(raw.reasoningTokens)
  // reasoning is a subset of output in DSH TokenUsage, never add it twice.
  return { input, output, cacheRead, cacheWrite, reasoning, total: input + output + cacheRead + cacheWrite }
}

function keyOf(data: Record<string, unknown>): string {
  return `${String(data.turn ?? '')}:${String(data.step ?? '')}`
}

function providerAndModel(header: Record<string, unknown>): { provider: string; model: string } {
  const config = header.config
  if (!config || typeof config !== 'object') return { provider: 'unknown', model: 'unknown' }
  const raw = config as Record<string, unknown>
  return { provider: typeof raw.provider === 'string' ? raw.provider : 'unknown', model: typeof raw.model === 'string' ? raw.model : 'unknown' }
}

function isToolError(data: Record<string, unknown>): boolean {
  if (data.error) return true
  const message = data.message
  if (!message || typeof message !== 'object') return false
  const content = (message as Record<string, unknown>).content
  return Array.isArray(content) && content.some((item) => Boolean(item && typeof item === 'object' && (item as Record<string, unknown>).isError))
}

function resultCallId(data: Record<string, unknown>): string | undefined {
  const message = data.message
  if (message && typeof message === 'object') {
    const source = (message as Record<string, unknown>).source
    if (source && typeof source === 'object' && typeof (source as Record<string, unknown>).callId === 'string') return (source as Record<string, string>).callId
  }
  return typeof data.callId === 'string' ? data.callId : undefined
}

function skillName(argumentsText: unknown): string {
  if (typeof argumentsText !== 'string') return '未知技能'
  try {
    const parsed = JSON.parse(argumentsText) as unknown
    const name = parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>).name : undefined
    if (typeof name === 'string') return name
  } catch { /* malformed arguments remain anonymous */ }
  return '未知技能'
}

/** Reduce a durable session event stream into privacy-preserving facts. */
export function reduceSession(header: SessionHeaderLike, events: SessionEventLike[], revision: string | number, now = Date.now()): SessionUsageRecord {
  const usage: UsageFact[] = []
  const skills: SkillFact[] = []
  const attempts = new Map<string, { usage?: TokenBreakdown; terminal: boolean; provider: string; model: string }>()
  const pendingSkills = new Map<string, { name: string; at: number; turn: unknown }>()
  let currentModel = { provider: 'unknown', model: 'unknown' }
  const inheritedPrefix = header.seedLength ?? 0

  for (const event of events) {
    if (event.seq < inheritedPrefix || !event.data || typeof event.data !== 'object') continue
    const data = event.data as Record<string, unknown>

    if (event.type === 'request/header') {
      const candidate = data.header
      if (candidate && typeof candidate === 'object') currentModel = providerAndModel(candidate as Record<string, unknown>)
      continue
    }

    if (event.type === 'assistant/chunk') {
      const attempt = attempts.get(keyOf(data)) ?? { terminal: false, ...currentModel }
      const chunk = data.chunk
      if (chunk && typeof chunk === 'object') {
        const raw = chunk as Record<string, unknown>
        const reported = usageFrom(raw.usage)
        if (reported) attempt.usage = reported
        if (raw.finish) {
          attempt.terminal = true
          const token = attempt.usage ?? emptyTokens()
          usage.push({ at: event.time, provider: attempt.provider, model: attempt.model, known: Boolean(attempt.usage), ...token })
        }
      }
      attempts.set(keyOf(data), attempt)
      continue
    }

    if (event.type === 'assistant/message') {
      const attempt = attempts.get(keyOf(data))
      // A streamed terminal attempt is authoritative. The assembled message is its fallback only.
      if (!attempt?.terminal) {
        const message = data.message
        const rawMessage = message && typeof message === 'object' ? message as Record<string, unknown> : {}
        const token = usageFrom(data.usage) ?? usageFrom(rawMessage.usage) ?? emptyTokens()
        const source = rawMessage.source && typeof rawMessage.source === 'object' ? rawMessage.source as Record<string, unknown> : {}
        usage.push({
          at: event.time,
          provider: typeof source.provider === 'string' ? source.provider : currentModel.provider,
          model: typeof source.model === 'string' ? source.model : currentModel.model,
          known: token.total > 0 || token.reasoning > 0,
          ...token,
        })
      }
      continue
    }

    if (event.type === 'tool/call' && data.name === 'skill') {
      pendingSkills.set(String(data.callId ?? event.seq), { name: skillName(data.arguments), at: event.time, turn: data.turn })
      continue
    }

    if (event.type === 'tool/result') {
      const callId = resultCallId(data)
      const call = callId === undefined ? undefined : pendingSkills.get(callId)
      if (call) {
        skills.push({ at: call.at, name: call.name, origin: 'automatic', status: isToolError(data) ? 'failure' : 'success', durationMs: Math.max(0, event.time - call.at) })
        pendingSkills.delete(callId!)
      }
      continue
    }

    if (event.type === 'user/message') {
      const message = data.message
      const source = message && typeof message === 'object' ? (message as Record<string, unknown>).source : undefined
      if (source && typeof source === 'object' && (source as Record<string, unknown>).kind === 'skill-invocation') {
        const name = (source as Record<string, unknown>).name
        skills.push({ at: event.time, name: typeof name === 'string' ? name : '未知技能', origin: 'explicit', status: 'success' })
      }
      continue
    }

    if (event.type === 'turn/end') {
      for (const [callId, call] of pendingSkills) {
        if (call.turn === data.turn) {
          skills.push({ at: call.at, name: call.name, origin: 'automatic', status: 'incomplete' })
          pendingSkills.delete(callId)
        }
      }
    }
  }

  for (const call of pendingSkills.values()) skills.push({ at: call.at, name: call.name, origin: 'automatic', status: 'incomplete' })
  const cutoff = now - 90 * 24 * 60 * 60 * 1000
  return {
    schemaVersion: 1, sessionId: header.id, sourceCreatedAt: header.createdAt, sourceRevision: revision,
    ...(header.parentSession ? { parentSession: header.parentSession } : {}),
    origin: header.origin === 'subagent' ? 'subagent' : 'root', updatedAt: now,
    usage: usage.filter((item) => item.at >= cutoff), skills: skills.filter((item) => item.at >= cutoff),
  }
}

export function addTokens(target: TokenBreakdown, source: TokenBreakdown): void {
  target.input += source.input; target.output += source.output; target.cacheRead += source.cacheRead
  target.cacheWrite += source.cacheWrite; target.reasoning += source.reasoning; target.total += source.total
}

export { emptyTokens }
