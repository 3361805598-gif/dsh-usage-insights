import type { TokenBreakdown } from '../../types.js'
import { compact, exact, percent } from '../format.js'

const categories = [
  { key: 'input', label: '输入', tone: 'input' },
  { key: 'output', label: '输出', tone: 'output' },
  { key: 'cacheRead', label: '缓存读取', tone: 'read' },
  { key: 'cacheWrite', label: '缓存写入', tone: 'write' },
] as const

export function TokenComposition({ tokens }: { tokens: TokenBreakdown }): JSX.Element {
  return <section className="dshi-panel dshi-composition" aria-labelledby="dshi-composition-title">
    <div className="dshi-section-head"><div><span className="dshi-eyebrow">用量构成</span><h2 id="dshi-composition-title">Token 去向</h2></div></div>
    <div className="dshi-stacked-bar" aria-hidden="true">{categories.map(({ key, tone }) => <i key={key} className={`dshi-tone-${tone}`} style={{ width: `${tokens.total ? tokens[key] / tokens.total * 100 : 0}%` }} />)}</div>
    <div className="dshi-token-list">{categories.map(({ key, label, tone }) => <div key={key}>
      <span><i className={`dshi-dot dshi-tone-${tone}`} />{label}</span><strong title={exact.format(tokens[key])}>{compact.format(tokens[key])}</strong><span className="dshi-caption">{percent(tokens[key], tokens.total)}</span>
    </div>)}</div>
    <div className="dshi-reasoning"><div><span>推理 Token</span><strong title={exact.format(tokens.reasoning)}>{compact.format(tokens.reasoning)}</strong></div><p className="dshi-caption">包含在输出中，不重复计入总量。</p></div>
  </section>
}
