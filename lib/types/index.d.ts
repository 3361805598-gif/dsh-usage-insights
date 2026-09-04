import type { Context } from '@deepseek-ai/cordis';
import type { IncomingMessage, ServerResponse } from 'node:http';
export declare const name = "dsh-usage-insights";
export declare const inject: string[];
type PluginContext = Context & {
    webRuntime: {
        trustedHosts: readonly string[];
    };
    webServer: {
        register(route: {
            kind: 'prefix';
            path: string;
            handler(req: IncomingMessage, res: ServerResponse): void | Promise<void>;
        }): () => void;
    };
};
export declare function apply(ctx: PluginContext): Promise<void>;
export type { UsageRange, UsageSummaryV1 } from './types.js';
