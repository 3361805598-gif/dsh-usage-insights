export const usageInsightsCss = `
.ui-page{color:var(--dsw-fg,#1f1f1f);font:13px/1.45 ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:20px 22px 34px;max-width:900px;margin:auto}
.ui-nav-insights>svg{display:none}.ui-nav-insights::before{content:"";display:block;width:16px;height:16px;flex:0 0 16px;background:center/contain no-repeat url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' rx='4' fill='%23e8f4ec'/%3E%3Crect x='3' y='9' width='2' height='2' rx='.5' fill='%2394c9a5'/%3E%3Crect x='7' y='6' width='2' height='2' rx='.5' fill='%2359a875'/%3E%3Crect x='11' y='3' width='2' height='2' rx='.5' fill='%23206e48'/%3E%3Cpath d='M3.5 6.5 7.5 9l5-5' fill='none' stroke='%23206e48' stroke-width='1.1' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")}
.ui-top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:18px}.ui-top h1{font-size:20px;line-height:1.2;margin:0 0 5px;letter-spacing:-.02em}.ui-muted{margin:0;color:var(--dsw-fg-muted,#777);font-size:12px}.ui-profile{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(140deg,#d9efe4,#f3e2c5);font-size:16px}
.ui-toolbar{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:12px 0 16px;flex-wrap:wrap}.ui-ranges{display:inline-flex;padding:3px;border-radius:9px;background:var(--dsw-bg-muted,#f3f3f1);gap:2px}.ui-ranges button,.ui-rebuild{appearance:none;border:0;background:transparent;color:inherit;border-radius:7px;padding:5px 10px;font-size:12px;cursor:pointer}.ui-ranges button[aria-pressed=true]{background:var(--dsw-bg,#fff);box-shadow:0 1px 3px #00000012;font-weight:600}.ui-rebuild{border:1px solid var(--dsw-border,#e5e5e2);background:var(--dsw-bg,#fff)}
.ui-cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:15px}.ui-card,.ui-panel{background:var(--dsw-bg,#fff);border:1px solid var(--dsw-border,#e6e6e2);border-radius:12px}.ui-card{padding:12px}.ui-card b{font-size:18px;display:block;margin-top:4px;letter-spacing:-.02em}.ui-card span{font-size:11px;color:var(--dsw-fg-muted,#777)}.ui-panel{padding:15px;margin-top:12px}.ui-panel h2{font-size:14px;margin:0 0 3px}.ui-panel-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:13px}
.ui-heat{display:grid;gap:3px}.ui-heat.one{grid-template-columns:repeat(24,1fr)}.ui-heat.seven{grid-template-columns:repeat(24,1fr)}.ui-heat.thirty{grid-template-columns:repeat(7,1fr);gap:5px}.ui-cell{border-radius:3px;min-height:13px;background:#edf1ed;cursor:default}.ui-cell:hover{outline:1px solid var(--dsw-fg,#444);outline-offset:1px}.ui-legend{display:flex;justify-content:flex-end;align-items:center;gap:5px;font-size:10px;color:var(--dsw-fg-muted,#777);margin-top:8px}.ui-swatch{width:10px;height:10px;border-radius:2px;background:#edf1ed}.ui-swatch:nth-of-type(2){background:#b8dfc7}.ui-swatch:nth-of-type(3){background:#65b884}.ui-swatch:nth-of-type(4){background:#19764c}
.ui-breakdown{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:13px}.ui-breakdown div{padding:8px;border-radius:8px;background:var(--dsw-bg-muted,#f7f7f4)}.ui-breakdown span{display:block;color:var(--dsw-fg-muted,#777);font-size:11px}.ui-breakdown b{font-size:13px}
.ui-grid{display:grid;grid-template-columns:1fr 1.25fr;gap:12px}.ui-table{width:100%;border-collapse:collapse}.ui-table th,.ui-table td{text-align:left;padding:7px 0;border-bottom:1px solid var(--dsw-border,#ecece8);font-size:12px}.ui-table th{color:var(--dsw-fg-muted,#777);font-weight:500}.ui-table td:last-child,.ui-table th:last-child{text-align:right}.ui-status{font-size:11px;color:var(--dsw-fg-muted,#777)}.ui-empty{padding:16px 0;color:var(--dsw-fg-muted,#777);font-size:12px}.ui-error{border-color:#d89b91;color:#9c3021;background:#fff8f6}.ui-loading{padding:56px 0;text-align:center;color:var(--dsw-fg-muted,#777)}
@media(max-width:680px){.ui-page{padding:16px}.ui-cards{grid-template-columns:repeat(2,1fr)}.ui-grid{grid-template-columns:1fr}.ui-breakdown{grid-template-columns:repeat(3,1fr)}.ui-heat.seven{gap:2px}}
`

export function ensureUsageInsightsStyles(): void {
  if (document.getElementById('dsh-usage-insights-style')) return
  const style = document.createElement('style'); style.id = 'dsh-usage-insights-style'; style.textContent = usageInsightsCss
  document.head.append(style)
}

/** The Settings slot has no icon option in DSH rc.2; scope a replacement to our one nav row. */
export function installUsageInsightsNavIcon(): () => void {
  const mark = () => {
    for (const item of document.querySelectorAll('button')) {
      if (item.textContent?.trim() === '个人分析') item.classList.add('ui-nav-insights')
    }
  }
  mark()
  const observer = new MutationObserver(mark)
  observer.observe(document.body, { childList: true, subtree: true })
  return () => observer.disconnect()
}
