import type { Context } from '@deepseek-ai/cordis'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { UsageInsightsIndex } from './analytics/indexer.js'
import { sendJson } from './server/http.js'
import { isTrustedRequest } from './server/trust-fence.js'
import type { UsageRange } from './types.js'

export const name = 'dsh-usage-analytics'
export const inject = ['webServer', 'webRuntime', 'sessionPersistence', 'sessions', 'storageDomain']

type PluginContext = Context & {
  webRuntime: { trustedHosts: readonly string[] }
  webServer: { register(route: { kind: 'prefix'; path: string; handler(req: IncomingMessage, res: ServerResponse): void | Promise<void> }): () => void }
}

const API_ROOT = '/dsh-usage-analytics/api'
const ranges = new Set<UsageRange>(['1d', '7d', '30d'])

export async function apply(ctx: PluginContext): Promise<void> {
  const index = new UsageInsightsIndex(ctx as never)
  await index.start()
  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix', path: API_ROOT,
    async handler(req, res) {
      if (!isTrustedRequest(req, ctx.webRuntime.trustedHosts)) { sendJson(res, 403, { ok: false, error: 'forbidden' }); return }
      const url = new URL(req.url ?? API_ROOT, 'http://dsh.local')
      const path = url.pathname.slice(API_ROOT.length)
      if ((req.method ?? 'GET') === 'GET' && path === '/summary') {
        const range = url.searchParams.get('range') ?? '7d'
        const timeZone = url.searchParams.get('timeZone') ?? Intl.DateTimeFormat().resolvedOptions().timeZone
        if (!ranges.has(range as UsageRange)) { sendJson(res, 400, { ok: false, error: 'invalid-range' }); return }
        try { sendJson(res, 200, { ok: true, value: index.summary(range as UsageRange, timeZone) }) }
        catch { sendJson(res, 400, { ok: false, error: 'invalid-time-zone' }) }
        return
      }
      if ((req.method ?? 'GET') === 'POST' && path === '/rebuild') {
        void index.rebuild()
        sendJson(res, 202, { ok: true, value: { started: true } })
        return
      }
      sendJson(res, 404, { ok: false, error: 'not-found' })
    },
  }), 'usageInsights.api')
}

export type { UsageRange, UsageSummaryV1 } from './types.js'
