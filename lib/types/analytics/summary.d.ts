import type { SessionUsageRecord, UsageRange, UsageSummaryV1 } from '../types.js';
export declare function buildSummary(records: Iterable<SessionUsageRecord>, options: {
    range: UsageRange;
    timeZone: string;
    now?: number;
    index: UsageSummaryV1['index'];
    unreadableSessions?: number;
}): UsageSummaryV1;
