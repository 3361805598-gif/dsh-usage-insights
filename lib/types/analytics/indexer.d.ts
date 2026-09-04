import type { Context } from '@deepseek-ai/cordis';
import type { SessionEventLike, SessionHeaderLike, UsageRange, UsageSummaryV1 } from '../types.js';
type Snapshot = {
    header: SessionHeaderLike;
    revision: string | number;
};
type LiveSession = {
    id: string;
    header: SessionHeaderLike;
    events: SessionEventLike[];
};
type HostContext = Context & {
    sessionPersistence: {
        listSnapshots(): Promise<Snapshot[]>;
        readFrom(id: string, fromSeq: number): Promise<{
            meta: SessionHeaderLike;
            events: SessionEventLike[];
        }>;
    };
    sessions: {
        flush(session: LiveSession): Promise<void>;
        get(id: string): LiveSession | undefined;
    };
    storageDomain: Context['storageDomain'];
};
export declare class UsageInsightsIndex {
    private readonly ctx;
    private table;
    private records;
    private index;
    private domainClose?;
    private running;
    constructor(ctx: HostContext);
    start(): Promise<void>;
    summary(range: UsageRange, timeZone: string): UsageSummaryV1;
    rebuild(): Promise<void>;
    private installLiveReducer;
    private syncLive;
    private backfill;
    private save;
}
export {};
