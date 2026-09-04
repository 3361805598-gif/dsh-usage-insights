const NAV_ICON_LIGHT = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' rx='4' fill='%23e8f4ec'/%3E%3Crect x='3' y='9' width='2' height='2' rx='.5' fill='%2394c9a5'/%3E%3Crect x='7' y='6' width='2' height='2' rx='.5' fill='%2359a875'/%3E%3Crect x='11' y='3' width='2' height='2' rx='.5' fill='%23206e48'/%3E%3Cpath d='M3.5 6.5 7.5 9l5-5' fill='none' stroke='%23206e48' stroke-width='1.1' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"
const NAV_ICON_DARK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' rx='4' fill='%231a3d2c'/%3E%3Crect x='3' y='9' width='2' height='2' rx='.5' fill='%232a6b48'/%3E%3Crect x='7' y='6' width='2' height='2' rx='.5' fill='%233d9a64'/%3E%3Crect x='11' y='3' width='2' height='2' rx='.5' fill='%235ecf88'/%3E%3Cpath d='M3.5 6.5 7.5 9l5-5' fill='none' stroke='%235ecf88' stroke-width='1.1' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"

export const usageInsightsCss = `
.dshi-page{
  --dshi-heat-0:var(--dsw-alias-bg-module-platform);
  --dshi-heat-1:#dceddf;
  --dshi-heat-2:#add5ba;
  --dshi-heat-3:#66b584;
  --dshi-heat-4:#237a50;
  color:var(--dsw-alias-label-primary);font:13px/1.45 ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:20px 22px 34px;max-width:900px;margin:auto
}
body[data-ds-dark-theme] .dshi-page{
  --dshi-heat-0:var(--dsw-alias-bg-layer-1);
  --dshi-heat-1:#1a3d2c;
  --dshi-heat-2:#2a6b48;
  --dshi-heat-3:#3d9a64;
  --dshi-heat-4:#5ecf88
}
.dshi-nav>svg{display:none}
.dshi-nav::before{content:"";display:block;width:16px;height:16px;flex:0 0 16px;background:center/contain no-repeat url("${NAV_ICON_LIGHT}")}
body[data-ds-dark-theme] .dshi-nav::before{background-image:url("${NAV_ICON_DARK}")}
.dshi-top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:18px}
.dshi-top h1{font-size:20px;line-height:1.2;margin:0 0 5px;letter-spacing:-.02em;color:var(--dsw-alias-label-primary)}
.dshi-muted{margin:0;color:var(--dsw-alias-label-tertiary);font-size:12px}
.dshi-profile{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(140deg,#d9efe4,#f3e2c5);font-size:16px}
body[data-ds-dark-theme] .dshi-profile{background:linear-gradient(140deg,#1a3d2c,#4a3d22)}
.dshi-toolbar{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:12px 0 16px;flex-wrap:wrap}
.dshi-ranges{display:inline-flex;padding:3px;border-radius:9px;background:var(--dsw-alias-bg-module-platform);gap:2px}
.dshi-ranges button,.dshi-rebuild{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-primary);border-radius:7px;padding:5px 10px;font-size:12px;cursor:pointer}
.dshi-ranges button:hover,.dshi-rebuild:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dshi-ranges button[aria-pressed=true]{background:var(--dsw-alias-bg-layer-3);box-shadow:var(--dsw-elevation-panel);font-weight:600}
.dshi-rebuild{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2)}
.dshi-rebuild:disabled{opacity:.45;cursor:not-allowed}
.dshi-cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:15px}
.dshi-card,.dshi-panel{background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l2);border-radius:12px}
.dshi-card{padding:12px}
.dshi-card b{font-size:18px;display:block;margin-top:4px;letter-spacing:-.02em;color:var(--dsw-alias-label-primary)}
.dshi-card span{font-size:11px;color:var(--dsw-alias-label-tertiary)}
.dshi-panel{padding:15px;margin-top:12px}
.dshi-panel h2{font-size:14px;margin:0 0 3px;color:var(--dsw-alias-label-primary)}
.dshi-panel-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:13px}
.dshi-heat{display:grid;gap:3px}
.dshi-heat.one,.dshi-heat.seven{grid-template-columns:repeat(24,1fr)}
.dshi-heat.thirty{grid-template-columns:repeat(7,1fr);gap:5px}
.dshi-cell{border-radius:3px;min-height:13px;background:var(--dshi-heat-0);cursor:default}
.dshi-cell.l1{background:var(--dshi-heat-1)}
.dshi-cell.l2{background:var(--dshi-heat-2)}
.dshi-cell.l3{background:var(--dshi-heat-3)}
.dshi-cell.l4{background:var(--dshi-heat-4)}
.dshi-cell:hover{outline:1px solid var(--dsw-alias-label-primary);outline-offset:1px}
.dshi-legend{display:flex;justify-content:flex-end;align-items:center;gap:5px;font-size:10px;color:var(--dsw-alias-label-tertiary);margin-top:8px}
.dshi-swatch{width:10px;height:10px;border-radius:2px;background:var(--dshi-heat-0)}
.dshi-swatch:nth-of-type(2){background:var(--dshi-heat-1)}
.dshi-swatch:nth-of-type(3){background:var(--dshi-heat-3)}
.dshi-swatch:nth-of-type(4){background:var(--dshi-heat-4)}
.dshi-breakdown{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:13px}
.dshi-breakdown div{padding:8px;border-radius:8px;background:var(--dsw-alias-bg-module-platform)}
.dshi-breakdown span{display:block;color:var(--dsw-alias-label-tertiary);font-size:11px}
.dshi-breakdown b{font-size:13px;color:var(--dsw-alias-label-primary)}
.dshi-grid{display:grid;grid-template-columns:1fr 1.25fr;gap:12px}
.dshi-table{width:100%;border-collapse:collapse}
.dshi-table th,.dshi-table td{text-align:left;padding:7px 0;border-bottom:1px solid var(--dsw-alias-border-l2);font-size:12px;color:var(--dsw-alias-label-primary)}
.dshi-table th{color:var(--dsw-alias-label-tertiary);font-weight:500}
.dshi-table td:last-child,.dshi-table th:last-child{text-align:right}
.dshi-status{font-size:11px;color:var(--dsw-alias-label-tertiary)}
.dshi-empty{padding:16px 0;color:var(--dsw-alias-label-tertiary);font-size:12px}
.dshi-error{border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-bg-layer-2)}
.dshi-loading{padding:56px 0;text-align:center;color:var(--dsw-alias-label-tertiary)}
@media(max-width:680px){.dshi-page{padding:16px}.dshi-cards{grid-template-columns:repeat(2,1fr)}.dshi-grid{grid-template-columns:1fr}.dshi-breakdown{grid-template-columns:repeat(3,1fr)}.dshi-heat.seven{gap:2px}}
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
      if (item.textContent?.trim() === '个人分析') item.classList.add('dshi-nav')
    }
  }
  mark()
  const observer = new MutationObserver(mark)
  observer.observe(document.body, { childList: true, subtree: true })
  return () => observer.disconnect()
}
