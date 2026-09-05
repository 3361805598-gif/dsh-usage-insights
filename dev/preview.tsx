import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { UsageInsightsView } from '../src/client/UsageInsightsPage.js'
import { ensureUsageInsightsStyles } from '../src/client/styles.js'
import { buildSummary } from '../src/analytics/summary.js'
import { reduceSession } from '../src/analytics/reducer.js'
import type { SessionEventLike, UsageRange } from '../src/types.js'

ensureUsageInsightsStyles()
const now = Date.UTC(2026, 8, 5, 14)
const events: SessionEventLike[] = []
for (let day = 0; day < 30; day++) {
  for (let hour = 0; hour < 24; hour++) {
    if ((day + hour) % 5 === 0 || hour < 7) continue
    const time = now - day * 86_400_000 + (hour - 22) * 3_600_000
    const amount = 600 + ((day * 47 + hour * 113) % 2000)
    events.push({ seq: events.length, time, type: 'assistant/message', data: {
      message: { source: { provider: [0, 1, 4].includes(day % 8) ? 'DeepSeek' : 'OpenAI', model: ['deepseek-v3', 'deepseek-r1', 'gpt-5', 'gpt-5-mini', 'deepseek-chat', 'gpt-4.1', 'gpt-4.1-mini', 'o4-mini'][day % 8] } },
      ...((hour + day) % 9 ? { usage: { inputTokens: amount, outputTokens: amount * 2, cacheReadTokens: Math.floor(amount / 3), cacheWriteTokens: 70, reasoningTokens: amount } } : {}),
    } })
    events.push({ seq: events.length, time, type: 'tool/call', data: { turn: day * 24 + hour, name: 'skill', callId: `${day}:${hour}`, arguments: JSON.stringify({ name: ['pdf', 'docx', 'legal-article-retrieval', 'case-retrieval', 'xlsx', 'contract-review', 'imagegen'][hour % 7] }) } })
    if (hour % 7) events.push({ seq: events.length, time: time + 100, type: 'tool/result', data: { callId: `${day}:${hour}`, ...(hour % 6 ? {} : { error: true }) } })
  }
}
const record = reduceSession({ id: 'preview', createdAt: now - 30 * 86_400_000 }, events, 'preview', now)

function Preview() {
  const [range, setRange] = useState<UsageRange>('7d')
  const [dark, setDark] = useState(false)
  const [scenario, setScenario] = useState('ready')
  const data = buildSummary(scenario === 'empty' ? [] : [record], { range, timeZone: 'Asia/Shanghai', now, index: { state: scenario === 'indexing' ? 'indexing' : 'ready', processedSessions: 24, totalSessions: 50, failures: 0 } })
  return <><aside className="preview-controls"><span>设计预览 · 全部为模拟数据</span><div><select aria-label="预览状态" value={scenario} onChange={(event) => setScenario(event.target.value)}><option value="ready">正常数据</option><option value="empty">空数据</option><option value="indexing">索引中</option><option value="error">加载失败</option><option value="loading">加载中</option></select><button onClick={() => { const value = !dark; setDark(value); document.body.toggleAttribute('data-ds-dark-theme', value) }}>{dark ? '切换浅色' : '切换深色'}</button></div></aside>
    <UsageInsightsView range={range} data={scenario === 'error' || scenario === 'loading' ? undefined : data} loading={scenario === 'loading'} rebuilding={false} error={scenario === 'error' ? '模拟连接中断，请重新加载。' : undefined}
      onRangeChange={setRange} onReload={() => setScenario('ready')} onRebuild={() => { setScenario('indexing'); setTimeout(() => setScenario('ready'), 1500) }} />
  </>
}
createRoot(document.getElementById('root')!).render(<Preview />)
