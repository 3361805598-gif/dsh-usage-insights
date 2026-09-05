import { useEffect, useState } from 'react'
import { ActivityChart } from './components/ActivityChart.js'
import { TokenComposition } from './components/TokenComposition.js'
import { UsageDetails } from './components/UsageDetails.js'
import { compact, exact, rangeDays, rangeLabels } from './format.js'
import { ensureUsageInsightsStyles } from './styles.js'
import { useUsageInsights } from './useUsageInsights.js'
import type { UsageRange, UsageSummaryV1 } from '../types.js'

export interface UsageInsightsViewProps {
  range: UsageRange
  data: UsageSummaryV1 | undefined
  error?: string | undefined
  loading: boolean
  rebuilding: boolean
  onRangeChange(range: UsageRange): void
  onReload(): void
  onRebuild(): void
}

function SyncStatus({ data, rebuilding }: Pick<UsageInsightsViewProps, 'data' | 'rebuilding'>): JSX.Element {
  const state = rebuilding ? 'indexing' : data?.index.state
  const label = state === 'ready' ? '已同步' : state === 'indexing' ? '正在同步'
    : state === 'partial' ? '部分数据未同步' : state === 'error' ? '同步失败' : '准备数据中'
  return <span className={`dshi-sync ${state ?? 'indexing'}`} role="status"><i />{label}</span>
}

/** Pure page surface, shared by the host and the local fixture preview. */
export function UsageInsightsView({ range, data, error, loading, rebuilding, onRangeChange, onReload, onRebuild }: UsageInsightsViewProps): JSX.Element {
  const busy = rebuilding || data?.index.state === 'indexing'
  const hasAttempts = Boolean(data && data.coverage.knownAttempts + data.coverage.unknownAttempts)
  return <main className="dshi-page">
    <header className="dshi-top"><div><div className="dshi-title-row"><span className="dshi-brand-mark" aria-hidden="true"><i /><i /><i /></span><h1>个人分析</h1></div><p>本机使用记录 · 按自然日统计</p></div><SyncStatus data={data} rebuilding={rebuilding} /></header>
    <div className="dshi-toolbar"><div className="dshi-segmented" role="group" aria-label="统计时间范围">{(Object.keys(rangeLabels) as UsageRange[]).map((key) => <button type="button" key={key} aria-pressed={range === key} onClick={() => onRangeChange(key)}>{rangeLabels[key]}</button>)}</div>
      <button type="button" className="dshi-button" disabled={busy} onClick={onRebuild}><span aria-hidden="true">↻</span>{busy ? '同步中…' : '重建统计缓存'}</button></div>
    {error && <div className="dshi-notice is-error" role="alert"><div><strong>{data ? '刷新未成功，当前显示上次数据' : '暂时无法读取分析数据'}</strong><p>{error}</p></div><button type="button" className="dshi-button" onClick={onReload} disabled={loading}>重新加载</button></div>}
    {data?.index.state === 'indexing' && <div className="dshi-notice" role="status"><span>正在整理本机会话，统计会逐步更新。</span><span>{data.index.processedSessions} / {data.index.totalSessions}</span></div>}
    {data?.index.state === 'error' && <div className="dshi-notice is-error" role="alert">统计同步失败，当前数据可能不完整。请尝试重建统计缓存。</div>}
    {!data ? <div className="dshi-loading" aria-busy={loading} role="status"><span className="dshi-loading-mark" aria-hidden="true">▥</span><strong>{error ? '等待重新连接' : '正在整理你的使用记录'}</strong><p>{error ? '可以重新加载，也可以切换时间范围。' : '统计在本机完成，请稍候。'}</p></div> : <>
      <section className="dshi-overview" aria-label="使用总览"><div className="dshi-total"><span className="dshi-eyebrow">{rangeLabels[range]}总 Token</span><strong title={exact.format(data.totals.total)}>{compact.format(data.totals.total)}</strong><span className="dshi-caption">{exact.format(data.totals.total)} Token · 推理用量不重复累加</span></div>
        <div className="dshi-metrics"><div><span>模型调用</span><strong>{exact.format(data.totals.modelCalls)}<small>次</small></strong></div><div><span>技能调用</span><strong>{exact.format(data.totals.skillCalls)}<small>次</small></strong></div><div><span>活跃天数</span><strong>{data.totals.activeDays}<small>/ {rangeDays[range]} 天</small></strong></div></div>
      </section>
      <div className="dshi-analysis-grid"><ActivityChart key={range} data={data} /><TokenComposition tokens={data.totals} /></div>
      <UsageDetails key={range} data={data} />
      <section className="dshi-coverage" aria-label="数据完整性"><div className="dshi-coverage-summary"><span className="dshi-coverage-label">用量覆盖率</span><strong>{hasAttempts ? `${data.coverage.percent}%` : '—'}</strong><div className="dshi-coverage-track" aria-hidden="true"><i style={{ width: `${hasAttempts ? data.coverage.percent : 0}%` }} /></div></div>
        <div className="dshi-coverage-copy"><p>{hasAttempts ? `已知用量 ${data.coverage.knownAttempts} 次 · 缺少用量 ${data.coverage.unknownAttempts} 次` : '暂无模型响应，覆盖率暂不计算。'}</p>
          {(data.coverage.unreadableSessions > 0 || data.coverage.missingParents > 0 || data.index.state === 'partial') && <p className="dshi-failure">{data.coverage.unreadableSessions > 0 ? `${data.coverage.unreadableSessions} 个会话无法读取。` : ''}{data.coverage.missingParents > 0 ? `${data.coverage.missingParents} 个父会话缺失。` : ''}{data.index.state === 'partial' && !data.coverage.unreadableSessions ? '部分会话尚未同步，后台将自动重试。' : ''}</p>}</div>
      </section>
      <footer className="dshi-footer"><span>仅保存在本机 · 不记录对话内容</span><span>{loading ? '正在刷新…' : `更新于 ${new Date(data.generatedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`}</span></footer>
    </>}
  </main>
}

export function UsageInsightsPage(): JSX.Element {
  useEffect(() => { ensureUsageInsightsStyles() }, [])
  const [range, setRange] = useState<UsageRange>('7d')
  const state = useUsageInsights(range)
  const rebuild = () => {
    if (window.confirm('重新计算本插件的统计缓存，不会删除原始会话。是否继续？')) void state.rebuild()
  }
  return <UsageInsightsView range={range} {...state} onRangeChange={setRange} onReload={state.reload} onRebuild={rebuild} />
}
