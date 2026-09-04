import type { Context } from '@deepseek-ai/cordis'
import { UsageInsightsPage } from './UsageInsightsPage.js'
import { ensureUsageInsightsStyles, installUsageInsightsNavIcon } from './styles.js'

export const name = 'dsh-usage-insights-client'
export const inject = ['slots']

export function apply(ctx: Context & { slots: { inject(name: string, callback: () => unknown): unknown; register(options: unknown, component: unknown): unknown } }): void {
  ensureUsageInsightsStyles()
  ctx.effect(() => installUsageInsightsNavIcon(), 'usageInsights.navIcon')
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section', id: 'personal-insights', order: 30, label: () => '个人分析',
  }, UsageInsightsPage))
}
