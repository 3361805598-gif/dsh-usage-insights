import { useState } from 'react'
import type { HeatmapCell, UsageSummaryV1 } from '../../types.js'
import { compact, exact, heatLevel, hourLabel, rangeLabels } from '../format.js'

const weekdays = ['一', '二', '三', '四', '五', '六', '日']
const description = (cell: HeatmapCell) => `${cell.label}，${exact.format(cell.total)} Token，${cell.attempts} 次响应${cell.unknownAttempts ? `，${cell.unknownAttempts} 次缺少用量` : ''}`

export function ActivityChart({ data }: { data: UsageSummaryV1 }): JSX.Element {
  const [selectedKey, setSelectedKey] = useState<string>()
  const selected = data.heatmap.find((cell) => cell.key === selectedKey)
  const peak = data.heatmap.reduce<HeatmapCell | undefined>((best, cell) => !best || cell.total > best.total ? cell : best, undefined)
  const max = peak?.total ?? 0
  const maxHour = data.calendar?.reduce((max, day) => day.hours.reduce((max, hour) => Math.max(max, hour.total), max), 0) ?? 0
  const detail = selected ?? peak
  const days = [...new Set(data.heatmap.map((cell) => cell.day).filter((day): day is string => Boolean(day)))]
  const cellButton = (cell: HeatmapCell) => <button type="button" key={cell.key}
    className={`dshi-cell l${heatLevel(cell.total, max)}${cell.unknownAttempts ? ' has-unknown' : ''}`}
    aria-label={description(cell)} aria-pressed={selected?.key === cell.key}
    title={description(cell)} onClick={() => setSelectedKey(cell.key)} />

  return <section className="dshi-panel dshi-activity" aria-labelledby="dshi-activity-title">
    <div className="dshi-section-head"><div><span className="dshi-eyebrow">活动分布</span><h2 id="dshi-activity-title">{data.range === '30d' ? '每一天的使用节奏' : 'Token 使用时段'}</h2></div>
      <span className="dshi-caption">{rangeLabels[data.range]} · {data.timeZone}</span></div>
    {data.range === '1d' ? <div className="dshi-chart-scroll" tabIndex={0} aria-label="按小时使用量，可横向滚动">
      <div className="dshi-hour-bars">{data.heatmap.map((cell) => <button type="button" key={cell.key} className="dshi-hour-bar"
        aria-label={description(cell)} aria-pressed={selected?.key === cell.key} title={description(cell)} onClick={() => setSelectedKey(cell.key)}>
        <span className="dshi-bar-track"><i style={{ height: `${max ? Math.max(cell.total ? 3 : 0, cell.total / max * 100) : 0}%` }} /></span>
        <span>{cell.hour! % 3 === 0 ? hourLabel(cell.hour!) : ''}</span>
      </button>)}</div>
    </div> : data.range === '7d' ? <div className="dshi-chart-scroll" tabIndex={0} aria-label="7 天小时热力图，可横向滚动">
      <div className="dshi-week-chart"><div className="dshi-hour-axis"><span />{Array.from({ length: 24 }, (_, hour) => <span key={hour}>{hour % 3 === 0 ? hourLabel(hour) : ''}</span>)}</div>
        {days.map((day) => <div className="dshi-week-row" key={day}><span className="dshi-day-label">{day.slice(5).replace('-', '/')}</span>{data.heatmap.filter((cell) => cell.day === day).map(cellButton)}</div>)}
      </div>
    </div> : <div className="dshi-month-chart">
      <div className="dshi-month-weekdays">{weekdays.map((day) => <span key={day}>周{day}</span>)}</div>
      <div className="dshi-month-grid">
        {Array.from({ length: days[0] ? (new Date(`${days[0]}T00:00:00Z`).getUTCDay() + 6) % 7 : 0 }, (_, i) => <span key={`blank-${i}`} />)}
        {data.heatmap.map((cell) => <button key={cell.key} type="button" className={`dshi-month-day l${heatLevel(cell.total, max)}`}
          aria-label={description(cell)} aria-pressed={selected?.key === cell.key} onClick={() => setSelectedKey(cell.key)} title={description(cell)}>
          <span>{cell.label.replace('-', '/')}</span><b>{compact.format(cell.total)}</b>
          <span className="dshi-micro-hours" aria-hidden="true">{data.calendar?.find((day) => day.day === cell.day)?.hours.map((hour) =>
            <i key={hour.hour} className={`l${heatLevel(hour.total, maxHour)}`} />)}</span>
        </button>)}
      </div>
    </div>}
    <div className="dshi-chart-foot"><span className="dshi-caption">{data.range === '30d' ? '点击日期查看明细 · 色阶按每日总量比较' : '点击时段查看明细'}{data.coverage.unknownAttempts ? ' · 缺少用量不估算' : ''}</span>
      <div className="dshi-legend" aria-label="颜色由浅到深表示用量由少到多"><span>少</span>{[0, 1, 2, 3, 4].map((level) => <i key={level} className={`l${level}`} />)}<span>多</span></div></div>
    <div className="dshi-chart-detail" aria-live="polite"><div><span className="dshi-caption">{selected ? '选中时段' : max ? '用量最高' : '暂无用量'}</span><strong>{detail?.label ?? '—'}</strong></div>
      <div><span className="dshi-caption">Token</span><strong>{exact.format(detail?.total ?? 0)}</strong></div>
      <div><span className="dshi-caption">模型响应</span><strong>{exact.format(detail?.attempts ?? 0)} <small>次</small></strong></div>
      <div><span className="dshi-caption">缺少用量</span><strong>{exact.format(detail?.unknownAttempts ?? 0)} <small>次</small></strong></div>
    </div>
    {data.range === '30d' && selected?.day && <div className="dshi-selected-hours"><span className="dshi-caption">{selected.label} · 小时明细</span><div>{data.calendar?.find((day) => day.day === selected.day)?.hours.map((hour) => <span key={hour.hour}>{hourLabel(hour.hour)}<b>{compact.format(hour.total)}</b><small>{hour.unknownAttempts ? `${hour.unknownAttempts} 次缺少用量` : `${hour.attempts} 次响应`}</small></span>)}</div></div>}
  </section>
}
