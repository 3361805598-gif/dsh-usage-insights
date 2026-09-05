import { createRequire } from 'node:module'
import { createElement, type ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import { UsageInsightsView, type UsageInsightsViewProps } from '../src/client/UsageInsightsPage.js'
import { ActivityChart } from '../src/client/components/ActivityChart.js'
import { buildSummary } from '../src/analytics/summary.js'
import { reduceSession } from '../src/analytics/reducer.js'

// React DOM is already a dev dependency; keep the tests runnable without a DOM emulator.
const { renderToStaticMarkup } = createRequire(import.meta.url)('react-dom/server') as { renderToStaticMarkup(element: ReactElement): string }
const now = Date.UTC(2026, 8, 5, 12)
const index = { state: 'ready' as const, processedSessions: 0, totalSessions: 0, failures: 0 }
const empty = buildSummary([], { range: '7d', timeZone: 'Asia/Shanghai', now, index })
const props: UsageInsightsViewProps = { range: '7d', data: empty, loading: false, rebuilding: false, onRangeChange() {}, onReload() {}, onRebuild() {} }
const render = (overrides: Partial<UsageInsightsViewProps> = {}) => renderToStaticMarkup(createElement(UsageInsightsView, { ...props, ...overrides }))

describe('usage page states', () => {
  it('keeps range controls accessible while loading or failed', () => {
    for (const state of [{ loading: true }, { loading: false, error: '连接中断' }]) {
      const html = render({ ...state, data: undefined })
      expect(html).toContain('aria-label="统计时间范围"')
      expect(html).toContain('近 30 天')
      expect(html).not.toContain('dshi-overview')
    }
    expect(render({ data: undefined, error: '连接中断' })).toContain('重新加载')
  })

  it('does not present an empty dataset as 100 percent coverage', () => {
    const html = render()
    expect(html).toContain('暂无模型响应，覆盖率暂不计算。')
    expect(html).not.toContain('100%')
  })

  it('keeps previous data visible and explicitly marks failed refreshes', () => {
    const html = render({ error: '连接中断' })
    expect(html).toContain('当前显示上次数据')
    expect(html).toContain('dshi-overview')
  })

  it('disables rebuilding during indexing and shows progress', () => {
    const html = render({ data: { ...empty, index: { state: 'indexing', processedSessions: 2, totalSessions: 9, failures: 0 } } })
    expect(html).toContain('disabled=""')
    expect(html).toContain('2 / 9')
  })

  it('escapes model names and renders providers without accepting HTML', () => {
    const html = render({ data: { ...empty, models: [{ provider: 'Example', model: '<script>alert(1)</script>', calls: 1, input: 0, output: 0, total: 0, cacheRead: 0, cacheWrite: 0, reasoning: 0 }] } })
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>')
    expect(html).toContain('Example')
  })

  it('makes missing usage available in chart labels, including when tokens are zero', () => {
    const record = reduceSession({ id: 's', createdAt: now }, [{ seq: 0, type: 'assistant/message', time: now, data: {} }], 'r1', now)
    const data = buildSummary([record], { range: '1d', timeZone: 'Asia/Shanghai', now, index })
    const html = renderToStaticMarkup(createElement(ActivityChart, { data }))
    expect(html).toContain('20:00，0 Token，1 次响应，1 次缺少用量')
  })
})
