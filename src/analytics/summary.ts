import { addTokens, emptyTokens } from './reducer.js'
import type { HeatmapCell, ModelUsage, SessionUsageRecord, SkillUsage, TokenBreakdown, UsageFact, UsageRange, UsageSummaryV1 } from '../types.js'

const rangeDays: Record<UsageRange, number> = { '1d': 1, '7d': 7, '30d': 30 }

function localParts(at: number, timeZone: string): { day: string; hour: number } {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' }).formatToParts(at)
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? '00'
  return { day: `${value('year')}-${value('month')}-${value('day')}`, hour: Number(value('hour')) }
}

function selectedDays(now: number, timeZone: string, range: UsageRange): string[] {
  const current = localParts(now, timeZone).day.split('-').map(Number)
  const [year, month, day] = current as [number, number, number]
  const anchor = new Date(Date.UTC(year, month - 1, day))
  return Array.from({ length: rangeDays[range] }, (_, offset) => {
    const date = new Date(anchor)
    date.setUTCDate(anchor.getUTCDate() - (rangeDays[range] - 1 - offset))
    return date.toISOString().slice(0, 10)
  })
}

function heatmapShell(range: UsageRange, days: string[]): HeatmapCell[] {
  if (range === '1d') return Array.from({ length: 24 }, (_, hour) => ({ key: `hour-${hour}`, label: `${String(hour).padStart(2, '0')}:00`, hour, attempts: 0, unknownAttempts: 0, ...emptyTokens() }))
  if (range === '7d') return days.flatMap((day) => Array.from({ length: 24 }, (_, hour) => ({ key: `${day}-${hour}`, label: `${day.slice(5)} ${String(hour).padStart(2, '0')}:00`, day, hour, attempts: 0, unknownAttempts: 0, ...emptyTokens() })))
  return days.map((day) => ({ key: day, label: day.slice(5), day, attempts: 0, unknownAttempts: 0, ...emptyTokens() }))
}

function heatmapKey(range: UsageRange, day: string, hour: number): string {
  if (range === '1d') return `hour-${hour}`
  return range === '7d' ? `${day}-${hour}` : day
}

function upsertModel(map: Map<string, ModelUsage>, item: UsageFact): void {
  const key = `${item.provider}\u0000${item.model}`
  const target = map.get(key) ?? { provider: item.provider, model: item.model, calls: 0, ...emptyTokens() }
  target.calls += 1; addTokens(target, item); map.set(key, target)
}

export function buildSummary(records: Iterable<SessionUsageRecord>, options: {
  range: UsageRange; timeZone: string; now?: number; index: UsageSummaryV1['index']; unreadableSessions?: number
}): UsageSummaryV1 {
  const now = options.now ?? Date.now()
  // Throws a deliberate RangeError for invalid IANA zones rather than silently reporting a wrong day.
  Intl.DateTimeFormat('en-CA', { timeZone: options.timeZone }).format(now)
  const days = selectedDays(now, options.timeZone, options.range)
  const selected = new Set(days)
  const heatmap = heatmapShell(options.range, days)
  const heatmapByKey = new Map(heatmap.map((cell) => [cell.key, cell]))
  const totals = { ...emptyTokens(), modelCalls: 0, skillCalls: 0, activeDays: 0 }
  const modelMap = new Map<string, ModelUsage>()
  const skillMap = new Map<string, SkillUsage>()
  const activeDays = new Set<string>()
  let knownAttempts = 0
  let unknownAttempts = 0
  let missingParents = 0
  const recordIds = new Set<string>()
  const materialized = [...records]
  for (const record of materialized) recordIds.add(record.sessionId)

  for (const record of materialized) {
    if (record.parentSession && !recordIds.has(record.parentSession)) missingParents += 1
    for (const item of record.usage) {
      const { day, hour } = localParts(item.at, options.timeZone)
      if (!selected.has(day)) continue
      activeDays.add(day); totals.modelCalls += 1; addTokens(totals, item); upsertModel(modelMap, item)
      if (item.known) knownAttempts += 1; else unknownAttempts += 1
      const cell = heatmapByKey.get(heatmapKey(options.range, day, hour))
      if (cell) { cell.attempts += 1; if (!item.known) cell.unknownAttempts += 1; addTokens(cell, item) }
    }
    for (const item of record.skills) {
      if (!selected.has(localParts(item.at, options.timeZone).day)) continue
      totals.skillCalls += 1
      const target = skillMap.get(item.name) ?? { name: item.name, calls: 0, automatic: 0, explicit: 0, success: 0, failure: 0, incomplete: 0 }
      target.calls += 1; target[item.origin] += 1; target[item.status] += 1
      if (!target.lastUsedAt || target.lastUsedAt < item.at) target.lastUsedAt = item.at
      skillMap.set(item.name, target)
    }
  }
  totals.activeDays = activeDays.size
  const denominator = knownAttempts + unknownAttempts
  return {
    schemaVersion: 1, range: options.range, timeZone: options.timeZone, generatedAt: now, index: options.index,
    totals, heatmap,
    models: [...modelMap.values()].sort((a, b) => b.total - a.total),
    skills: [...skillMap.values()].sort((a, b) => b.calls - a.calls),
    coverage: { percent: denominator ? Math.round((knownAttempts / denominator) * 100) : 100, knownAttempts, unknownAttempts, unreadableSessions: options.unreadableSessions ?? 0, missingParents },
  }
}
