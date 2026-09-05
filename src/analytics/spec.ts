import { z } from 'zod'
import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain'
import type { SessionUsageRecord } from '../types.js'

const token = z.object({
  at: z.number(), provider: z.string(), model: z.string(), known: z.boolean(),
  input: z.number(), output: z.number(), cacheRead: z.number(), cacheWrite: z.number(), reasoning: z.number(), total: z.number(),
})
const skill = z.object({
  at: z.number(), name: z.string(), origin: z.enum(['automatic', 'explicit']), status: z.enum(['success', 'failure', 'incomplete']), durationMs: z.number().optional(),
})
const record = z.object({
  schemaVersion: z.literal(1), reducerVersion: z.number().optional(), sessionId: z.string(), sourceCreatedAt: z.number(), sourceRevision: z.union([z.string(), z.number()]), parentSession: z.string().optional(),
  origin: z.enum(['root', 'subagent']), updatedAt: z.number(), usage: z.array(token), skills: z.array(skill),
}) satisfies z.ZodType<SessionUsageRecord>

export const usageInsightsDomain = defineDomain({
  // Keep v1 readable: preview builds wrote numeric revisions, while current DSH writes opaque strings.
  name: 'usage_insights', version: 1,
  tables: { sessions: domainTable<string, SessionUsageRecord>(record) },
})
