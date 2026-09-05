import type { SessionEventLike, SessionHeaderLike, SessionUsageRecord, TokenBreakdown } from '../types.js';
export declare const REDUCER_VERSION = 2;
declare const emptyTokens: () => TokenBreakdown;
/** Reduce a durable session event stream into privacy-preserving facts. */
export declare function reduceSession(header: SessionHeaderLike, events: SessionEventLike[], revision: string | number, now?: number): SessionUsageRecord;
export declare function addTokens(target: TokenBreakdown, source: TokenBreakdown): void;
export { emptyTokens };
