import type { SessionUsageRecord } from '../types.js';
export declare const usageInsightsDomain: {
    name: string;
    version: number;
    tables: {
        sessions: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, SessionUsageRecord>;
    };
};
