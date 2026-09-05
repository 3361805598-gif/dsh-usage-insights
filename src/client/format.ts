import type { UsageRange } from '../types.js'

export const compact = new Intl.NumberFormat('zh-CN', { notation: 'compact', maximumFractionDigits: 1 })
export const exact = new Intl.NumberFormat('zh-CN')
export const rangeLabels: Record<UsageRange, string> = { '1d': '今天', '7d': '近 7 天', '30d': '近 30 天' }
export const rangeDays: Record<UsageRange, number> = { '1d': 1, '7d': 7, '30d': 30 }
export const percent = (value: number, total: number): string => total ? `${Math.round(value / total * 100)}%` : '—'
export const hourLabel = (hour: number): string => `${String(hour).padStart(2, '0')}:00`
export function heatLevel(total: number, max: number): number {
  if (total <= 0 || max <= 0) return 0
  const ratio = total / max
  return ratio < .18 ? 1 : ratio < .42 ? 2 : ratio < .7 ? 3 : 4
}
