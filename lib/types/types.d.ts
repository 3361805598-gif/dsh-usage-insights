export type UsageRange = '1d' | '7d' | '30d';
export type SkillOrigin = 'automatic' | 'explicit';
export type SkillStatus = 'success' | 'failure' | 'incomplete';
export interface TokenBreakdown {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
    reasoning: number;
    total: number;
}
export interface UsageFact extends TokenBreakdown {
    at: number;
    provider: string;
    model: string;
    known: boolean;
}
export interface SkillFact {
    at: number;
    name: string;
    origin: SkillOrigin;
    status: SkillStatus;
    durationMs?: number | undefined;
}
export interface SessionUsageRecord {
    /** Missing on caches produced before accounting fixes. */
    reducerVersion?: number | undefined;
    schemaVersion: 1;
    sessionId: string;
    sourceCreatedAt: number;
    /** Opaque DSH persistence revision; old preview caches used a number. */
    sourceRevision: string | number;
    parentSession?: string | undefined;
    origin: 'root' | 'subagent';
    updatedAt: number;
    usage: UsageFact[];
    skills: SkillFact[];
}
export interface HeatmapCell extends TokenBreakdown {
    key: string;
    label: string;
    day?: string;
    hour?: number;
    attempts: number;
    unknownAttempts: number;
}
/** One day in the 30-day calendar, with a privacy-safe hourly micro heatmap. */
export interface CalendarDay extends TokenBreakdown {
    day: string;
    label: string;
    attempts: number;
    unknownAttempts: number;
    hours: Array<{
        hour: number;
        total: number;
        attempts: number;
        unknownAttempts: number;
    }>;
}
export interface ModelUsage extends TokenBreakdown {
    provider: string;
    model: string;
    calls: number;
}
export interface SkillUsage {
    name: string;
    calls: number;
    automatic: number;
    explicit: number;
    success: number;
    failure: number;
    incomplete: number;
    lastUsedAt?: number | undefined;
}
export interface UsageSummaryV1 {
    schemaVersion: 1;
    range: UsageRange;
    timeZone: string;
    generatedAt: number;
    index: {
        state: 'indexing' | 'ready' | 'partial' | 'error';
        processedSessions: number;
        totalSessions: number;
        failures: number;
    };
    totals: TokenBreakdown & {
        modelCalls: number;
        skillCalls: number;
        activeDays: number;
    };
    heatmap: HeatmapCell[];
    calendar?: CalendarDay[] | undefined;
    models: ModelUsage[];
    skills: SkillUsage[];
    coverage: {
        percent: number;
        knownAttempts: number;
        unknownAttempts: number;
        unreadableSessions: number;
        missingParents: number;
    };
}
export interface SessionHeaderLike {
    id: string;
    createdAt: number;
    parentSession?: string | undefined;
    seedLength?: number;
    origin?: string;
}
export interface SessionEventLike {
    seq: number;
    time: number;
    type: string;
    data: unknown;
}
