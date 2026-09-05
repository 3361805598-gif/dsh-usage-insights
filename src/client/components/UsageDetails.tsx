import { useState } from 'react'
import type { UsageSummaryV1 } from '../../types.js'
import { compact, exact, percent } from '../format.js'

export function UsageDetails({ data }: { data: UsageSummaryV1 }): JSX.Element {
  const [tab, setTab] = useState<'models' | 'skills'>('models')
  const [expanded, setExpanded] = useState(false)
  const count = data[tab].length
  return <section className="dshi-panel dshi-details" aria-labelledby="dshi-details-title">
    <div className="dshi-section-head"><div><span className="dshi-eyebrow">调用明细</span><h2 id="dshi-details-title">{tab === 'models' ? '模型分布' : '技能调用'}</h2></div>
      <div className="dshi-segmented" role="group" aria-label="明细类型">{(['models', 'skills'] as const).map((key) => <button type="button" key={key} aria-pressed={tab === key} onClick={() => { setTab(key); setExpanded(false) }}>{key === 'models' ? '模型' : '技能'} <span>{data[key].length}</span></button>)}</div></div>
    {count ? <>
      <div className="dshi-table-scroll" tabIndex={0} aria-label={tab === 'models' ? '模型用量明细，可横向滚动' : '技能调用明细，可横向滚动'}>
        {tab === 'models' ? <table className="dshi-table"><thead><tr><th scope="col">模型 / 提供方</th><th scope="col">调用次数</th><th scope="col">Token</th><th scope="col">用量占比</th></tr></thead><tbody>
          {data.models.slice(0, expanded ? undefined : 6).map((item) => <tr key={JSON.stringify([item.provider, item.model])}>
            <td><strong>{item.model}</strong><span className="dshi-caption">{item.provider}</span></td><td>{exact.format(item.calls)}</td><td title={exact.format(item.total)}>{compact.format(item.total)}</td>
            <td><div className="dshi-share"><span className="dshi-share-track"><i style={{ width: `${data.totals.total ? item.total / data.totals.total * 100 : 0}%` }} /></span><span>{percent(item.total, data.totals.total)}</span></div></td>
          </tr>)}</tbody></table> : <table className="dshi-table"><thead><tr><th scope="col">技能 / 调用来源</th><th scope="col">调用次数</th><th scope="col">结果</th><th scope="col">成功率</th></tr></thead><tbody>
          {data.skills.slice(0, expanded ? undefined : 6).map((item) => <tr key={item.name}><td><strong>{item.name}</strong><span className="dshi-caption">自动 {item.automatic} · 显式 {item.explicit}</span></td><td>{exact.format(item.calls)}</td>
            <td><div className="dshi-results"><span className="dshi-success">{item.success} 成功</span>{item.failure > 0 && <span className="dshi-failure">{item.failure} 失败</span>}{item.incomplete > 0 && <span>{item.incomplete} 未完成</span>}</div></td><td>{percent(item.success, item.success + item.failure)}</td></tr>)}</tbody></table>}
      </div>
      <div className="dshi-table-foot"><span className="dshi-caption">{tab === 'models' ? '按 Token 用量排序' : '按调用次数排序 · 成功率仅计算已完成调用'} · 共 {count} 项</span>{count > 6 && <button type="button" className="dshi-text-button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? '收起列表 ↑' : `展开全部 ${count} 项 ↓`}</button>}</div>
    </> : <div className="dshi-empty"><span className="dshi-empty-symbol" aria-hidden="true">—</span><strong>这个时段还没有{tab === 'models' ? '模型响应' : '技能调用'}</strong><p>换一个时间范围，或完成一次会话后再来查看。</p></div>}
  </section>
}
