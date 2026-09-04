import type { UsageRange, UsageSummaryV1 } from '../types.js'

const root = '/dsh-usage-insights/api'

export async function getSummary(range: UsageRange): Promise<UsageSummaryV1> {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const response = await fetch(`${root}/summary?range=${range}&timeZone=${encodeURIComponent(timeZone)}`, { cache: 'no-store', credentials: 'same-origin' })
  const body = await response.json() as { ok: boolean; value?: UsageSummaryV1; error?: string }
  if (!response.ok || !body.ok || !body.value) throw new Error(body.error ?? '无法读取分析数据')
  return body.value
}

export async function rebuildIndex(): Promise<void> {
  const response = await fetch(`${root}/rebuild`, { method: 'POST', cache: 'no-store', credentials: 'same-origin' })
  if (!response.ok) throw new Error('无法启动重建')
}
