import type { IncomingHttpHeaders } from 'node:http';
/** Reject browser requests that do not originate from DSH's trusted local UI. */
export declare function isTrustedRequest(request: {
    headers: IncomingHttpHeaders;
}, trustedHosts: readonly string[]): boolean;
