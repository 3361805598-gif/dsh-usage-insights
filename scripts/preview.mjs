import { build } from 'tsdown'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'

process.chdir(fileURLToPath(new URL('..', import.meta.url)))
await build({ config: false, entry: { preview: 'dev/preview.tsx' }, outDir: 'dist/preview', platform: 'browser', format: 'esm', dts: false, clean: true,
  deps: { alwaysBundle: () => true, onlyBundle: false }, env: { NODE_ENV: 'development' } })
await mkdir('dist/preview', { recursive: true })
await writeFile('dist/preview/index.html', `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>个人分析 · 本地设计预览</title><style>
body{margin:0;background:#f8fafb}body[data-ds-dark-theme]{background:#151b20;color:#e5ebef}.preview-controls{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:12px 24px;border-bottom:1px solid #8796a433;font:12px/1.5 system-ui;color:#687b87}.preview-controls>div{display:flex;gap:8px}.preview-controls button,.preview-controls select{font:inherit;padding:6px 10px;border:1px solid #8796a466;border-radius:6px;background:transparent;color:inherit}.preview-controls select option{color:#182c3c;background:#fff}@media(max-width:540px){.preview-controls{align-items:flex-start;flex-direction:column;padding:10px 16px}}
</style></head><body><div id="root"></div><script type="module" src="/preview.js"></script></body></html>`)
if (process.argv.includes('--build')) process.exit(0)
const server = createServer(async (req, res) => {
  const path = req.url?.split('?')[0]
  const file = path === '/' ? 'index.html' : path === '/preview.js' ? 'preview.js' : undefined
  if (!file) { res.writeHead(404); res.end(); return }
  try { res.setHeader('content-type', file.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/javascript; charset=utf-8'); res.setHeader('cache-control', 'no-store'); res.end(await readFile(`dist/preview/${file}`)) }
  catch { res.writeHead(500); res.end('Preview unavailable') }
})
server.listen(4179, '127.0.0.1', () => console.log('UI preview: http://127.0.0.1:4179 (synthetic data only)'))
