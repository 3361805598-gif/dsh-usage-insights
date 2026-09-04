import { useCallback, useEffect, useMemo, useState } from 'react'
import { getSummary, rebuildIndex } from './api.js'
import { ensureUsageInsightsStyles } from './styles.js'
import type { CalendarDay, HeatmapCell, UsageRange, UsageSummaryV1 } from '../types.js'

const integer = new Intl.NumberFormat('zh-CN', { notation: 'compact', maximumFractionDigits: 1 })
const exact = new Intl.NumberFormat('zh-CN')
const rangeLabels: Record<UsageRange, string> = { '1d': '1 天', '7d': '7 天', '30d': '30 天' }

function heatLevel(total: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (!total || !max) return 0
  const ratio = total / max
  return ratio < .18 ? 1 : ratio < .42 ? 2 : ratio < .7 ? 3 : 4
}

function Heatmap({ cells, range }: { cells: HeatmapCell[]; range: Exclude<UsageRange, '30d'> }): JSX.Element {
  const max = Math.max(...cells.map((cell) => cell.total), 0)
  return <>
    <div className={`dshi-heat ${range === '1d' ? 'one' : 'seven'}`}>
      {cells.map((cell) => <div key={cell.key} className={`dshi-cell l${heatLevel(cell.total, max)}`} title={`${cell.label}：${exact.format(cell.total)} Token${cell.unknownAttempts ? `；${cell.unknownAttempts} 次缺少用量` : ''}`} />)}
    </div>
    <div className="dshi-legend"><span>少</span><i className="dshi-swatch" /><i className="dshi-swatch" /><i className="dshi-swatch" /><i className="dshi-swatch" /><span>多</span></div>
  </>
}

const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

function mondayOffset(day: string): number {
  return (new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7
}

function MonthlyCalendar({ days }: { days: CalendarDay[] }): JSX.Element {
  const maxDay = Math.max(...days.map((day) => day.total), 0)
  const maxHour = Math.max(...days.flatMap((day) => day.hours.map((hour) => hour.total)), 0)
  const leading = days[0] ? mondayOffset(days[0].day) : 0
  const cells: Array<CalendarDay | undefined> = [...Array<CalendarDay | undefined>(leading).fill(undefined), ...days]
  while (cells.length % 7 !== 0) cells.push(undefined)
  return <div className="dshi-calendar" aria-label="最近 30 天 Token 使用日历">
    <div className="dshi-calendar-weekdays">{weekdays.map((label) => <span key={label}>{label}</span>)}</div>
    <div className="dshi-calendar-grid">
      {cells.map((day, index) => day === undefined
        ? <div key={`empty-${index}`} className="dshi-calendar-empty" aria-hidden="true" />
        : <div key={day.day} className={`dshi-calendar-day l${heatLevel(day.total, maxDay)}`} title={`${day.day}：${exact.format(day.total)} Token${day.unknownAttempts ? `；${day.unknownAttempts} 次缺少用量` : ''}`}>
          <div className="dshi-calendar-dayhead"><span>{day.label}</span><b>{integer.format(day.total)}</b></div>
          <div className="dshi-calendar-hours" aria-label={`${day.label} 的 24 小时使用热力图`}>
            {day.hours.map((hour) => <i key={hour.hour} className={`l${heatLevel(hour.total, maxHour)}`} title={`${String(hour.hour).padStart(2, '0')}:00：${exact.format(hour.total)} Token`} />)}
          </div>
        </div>) }
    </div>
  </div>
}

function card(value: string, label: string): JSX.Element { return <div className="dshi-card"><span>{label}</span><b>{value}</b></div> }

export function UsageInsightsPage(): JSX.Element {
  ensureUsageInsightsStyles()
  const [range, setRange] = useState<UsageRange>('7d')
  const [data, setData] = useState<UsageSummaryV1>()
  const [error, setError] = useState<string>()
  const [rebuilding, setRebuilding] = useState(false)
  const load = useCallback(async () => {
    try { setError(undefined); setData(await getSummary(range)) } catch (cause) { setError(cause instanceof Error ? cause.message : '无法读取分析数据') }
  }, [range])
  useEffect(() => { void load(); const timer = window.setInterval(() => void load(), 10_000); return () => window.clearInterval(timer) }, [load])
  const status = useMemo(() => {
    if (data?.index.state === 'ready') return '已同步'
    if (data?.index.state === 'indexing') return `正在索引 ${data.index.processedSessions}/${data.index.totalSessions}`
    if (data?.index.state === 'partial') return `部分会话无法读取（${data.index.failures} 个）`
    return '索引失败，请重建缓存后重试'
  }, [data])
  const rebuild = async () => {
    if (!window.confirm('将删除本插件的派生统计缓存，并从原始 DSH 会话重新索引。不会删除任何会话。是否继续？')) return
    setRebuilding(true); try { await rebuildIndex(); await load() } catch (cause) { setError(cause instanceof Error ? cause.message : '无法启动重建') } finally { setRebuilding(false) }
  }
  if (!data && !error) return <main className="dshi-page"><div className="dshi-loading">正在准备本地使用分析…</div></main>
  if (error && !data) return <main className="dshi-page"><section className="dshi-panel dshi-error"><h2>无法载入个人分析</h2><p>{error}</p><button className="dshi-rebuild" onClick={() => void load()}>重试</button></section></main>
  const value = data!
  return <main className="dshi-page">
    <div className="dshi-top"><div><h1>个人分析</h1><p className="dshi-muted">本机 DSH 活动 · 仅统计可验证的 Token 用量</p></div></div>
    <div className="dshi-toolbar"><div className="dshi-ranges">{(Object.keys(rangeLabels) as UsageRange[]).map((key) => <button key={key} aria-pressed={range === key} onClick={() => setRange(key)}>{rangeLabels[key]}</button>)}</div><button className="dshi-rebuild" disabled={rebuilding} onClick={() => void rebuild()}>{rebuilding ? '正在重建…' : '重建统计缓存'}</button></div>
    {error && <p className="dshi-muted">{error}</p>}
    <section className="dshi-cards">{card(integer.format(value.totals.total), '总 Token')}{card(exact.format(value.totals.modelCalls), '模型调用')}{card(exact.format(value.totals.skillCalls), '技能调用')}{card(exact.format(value.totals.activeDays), '活跃天数')}</section>
    <section className="dshi-panel"><div className="dshi-panel-head"><div><h2>{range === '30d' ? '30 天使用日历' : 'Token 使用热力图'}</h2><p className="dshi-muted">按本机时区 {value.timeZone} 归类{range === '30d' ? ' · 每日内含 24 小时微热力图' : ''}</p></div><span className="dshi-status">{status}</span></div>{range === '30d' && value.calendar ? <MonthlyCalendar days={value.calendar} /> : <Heatmap cells={value.heatmap} range={range as Exclude<UsageRange, '30d'>} />}<div className="dshi-breakdown"><div><span>输入</span><b>{integer.format(value.totals.input)}</b></div><div><span>输出</span><b>{integer.format(value.totals.output)}</b></div><div><span>缓存读取</span><b>{integer.format(value.totals.cacheRead)}</b></div><div><span>缓存写入</span><b>{integer.format(value.totals.cacheWrite)}</b></div><div><span>推理（输出子集）</span><b>{integer.format(value.totals.reasoning)}</b></div></div></section>
    <div className="dshi-grid"><section className="dshi-panel"><div className="dshi-panel-head"><div><h2>模型分布</h2><p className="dshi-muted">按模型响应的用量汇总</p></div></div>{value.models.length ? <table className="dshi-table"><thead><tr><th>模型</th><th>调用</th><th>Token</th></tr></thead><tbody>{value.models.slice(0, 6).map((item) => <tr key={`${item.provider}-${item.model}`}><td>{item.model}</td><td>{item.calls}</td><td>{integer.format(item.total)}</td></tr>)}</tbody></table> : <div className="dshi-empty">这个时段没有模型调用。</div>}</section>
      <section className="dshi-panel"><div className="dshi-panel-head"><div><h2>技能调用</h2><p className="dshi-muted">自动与显式调用均包含</p></div></div>{value.skills.length ? <table className="dshi-table"><thead><tr><th>技能</th><th>调用</th><th>成功率</th></tr></thead><tbody>{value.skills.slice(0, 6).map((item) => { const settled = item.success + item.failure; const rate = settled ? Math.round(item.success / settled * 100) : 0; return <tr key={item.name}><td>{item.name}</td><td>{item.calls}</td><td>{settled ? `${rate}%` : '未完成'}</td></tr> })}</tbody></table> : <div className="dshi-empty">这个时段没有技能调用。</div>}</section></div>
    <p className="dshi-muted" style={{ marginTop: 13 }}>覆盖率 {value.coverage.percent}% · 已知 {value.coverage.knownAttempts} 次 · 缺少用量 {value.coverage.unknownAttempts} 次{value.coverage.missingParents ? ` · 缺少父会话 ${value.coverage.missingParents} 个` : ''}</p>
  </main>
}
