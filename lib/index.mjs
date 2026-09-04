import { z } from "zod";
import { defineDomain, domainTable } from "@deepseek-ai/dsh-storage-domain";
//#region src/analytics/reducer.ts
const emptyTokens = () => ({
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0,
	reasoning: 0,
	total: 0
});
function numberOf(value) {
	return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
}
function usageFrom(value) {
	if (!value || typeof value !== "object") return void 0;
	const raw = value;
	if (![
		"inputTokens",
		"outputTokens",
		"cacheReadTokens",
		"cacheWriteTokens",
		"reasoningTokens"
	].some((key) => typeof raw[key] === "number")) return void 0;
	const input = numberOf(raw.inputTokens);
	const output = numberOf(raw.outputTokens);
	const cacheRead = numberOf(raw.cacheReadTokens);
	const cacheWrite = numberOf(raw.cacheWriteTokens);
	return {
		input,
		output,
		cacheRead,
		cacheWrite,
		reasoning: numberOf(raw.reasoningTokens),
		total: input + output + cacheRead + cacheWrite
	};
}
function keyOf(data) {
	return `${String(data.turn ?? "")}:${String(data.step ?? "")}`;
}
function providerAndModel(header) {
	const config = header.config;
	if (!config || typeof config !== "object") return {
		provider: "unknown",
		model: "unknown"
	};
	const raw = config;
	return {
		provider: typeof raw.provider === "string" ? raw.provider : "unknown",
		model: typeof raw.model === "string" ? raw.model : "unknown"
	};
}
function isToolError(data) {
	if (data.error) return true;
	const message = data.message;
	if (!message || typeof message !== "object") return false;
	const content = message.content;
	return Array.isArray(content) && content.some((item) => Boolean(item && typeof item === "object" && item.isError));
}
function resultCallId(data) {
	const message = data.message;
	if (message && typeof message === "object") {
		const source = message.source;
		if (source && typeof source === "object" && typeof source.callId === "string") return source.callId;
	}
	return typeof data.callId === "string" ? data.callId : void 0;
}
function skillName(argumentsText) {
	if (typeof argumentsText !== "string") return "未知技能";
	try {
		const parsed = JSON.parse(argumentsText);
		const name = parsed && typeof parsed === "object" ? parsed.name : void 0;
		if (typeof name === "string") return name;
	} catch {}
	return "未知技能";
}
/** Reduce a durable session event stream into privacy-preserving facts. */
function reduceSession(header, events, revision, now = Date.now()) {
	const usage = [];
	const skills = [];
	const attempts = /* @__PURE__ */ new Map();
	const pendingSkills = /* @__PURE__ */ new Map();
	let currentModel = {
		provider: "unknown",
		model: "unknown"
	};
	const inheritedPrefix = header.seedLength ?? 0;
	for (const event of events) {
		if (event.seq < inheritedPrefix || !event.data || typeof event.data !== "object") continue;
		const data = event.data;
		if (event.type === "request/header") {
			const candidate = data.header;
			if (candidate && typeof candidate === "object") currentModel = providerAndModel(candidate);
			continue;
		}
		if (event.type === "assistant/chunk") {
			const attempt = attempts.get(keyOf(data)) ?? {
				terminal: false,
				...currentModel
			};
			const chunk = data.chunk;
			if (chunk && typeof chunk === "object") {
				const raw = chunk;
				const reported = usageFrom(raw.usage);
				if (reported) attempt.usage = reported;
				if (raw.finish) {
					attempt.terminal = true;
					const token = attempt.usage ?? emptyTokens();
					usage.push({
						at: event.time,
						provider: attempt.provider,
						model: attempt.model,
						known: Boolean(attempt.usage),
						...token
					});
				}
			}
			attempts.set(keyOf(data), attempt);
			continue;
		}
		if (event.type === "assistant/message") {
			if (!attempts.get(keyOf(data))?.terminal) {
				const message = data.message;
				const rawMessage = message && typeof message === "object" ? message : {};
				const token = usageFrom(data.usage) ?? usageFrom(rawMessage.usage) ?? emptyTokens();
				const source = rawMessage.source && typeof rawMessage.source === "object" ? rawMessage.source : {};
				usage.push({
					at: event.time,
					provider: typeof source.provider === "string" ? source.provider : currentModel.provider,
					model: typeof source.model === "string" ? source.model : currentModel.model,
					known: token.total > 0 || token.reasoning > 0,
					...token
				});
			}
			continue;
		}
		if (event.type === "tool/call" && data.name === "skill") {
			pendingSkills.set(String(data.callId ?? event.seq), {
				name: skillName(data.arguments),
				at: event.time,
				turn: data.turn
			});
			continue;
		}
		if (event.type === "tool/result") {
			const callId = resultCallId(data);
			const call = callId === void 0 ? void 0 : pendingSkills.get(callId);
			if (call) {
				skills.push({
					at: call.at,
					name: call.name,
					origin: "automatic",
					status: isToolError(data) ? "failure" : "success",
					durationMs: Math.max(0, event.time - call.at)
				});
				pendingSkills.delete(callId);
			}
			continue;
		}
		if (event.type === "user/message") {
			const message = data.message;
			const source = message && typeof message === "object" ? message.source : void 0;
			if (source && typeof source === "object" && source.kind === "skill-invocation") {
				const name = source.name;
				skills.push({
					at: event.time,
					name: typeof name === "string" ? name : "未知技能",
					origin: "explicit",
					status: "success"
				});
			}
			continue;
		}
		if (event.type === "turn/end") {
			for (const [callId, call] of pendingSkills) if (call.turn === data.turn) {
				skills.push({
					at: call.at,
					name: call.name,
					origin: "automatic",
					status: "incomplete"
				});
				pendingSkills.delete(callId);
			}
		}
	}
	for (const call of pendingSkills.values()) skills.push({
		at: call.at,
		name: call.name,
		origin: "automatic",
		status: "incomplete"
	});
	const cutoff = now - 7776e6;
	return {
		schemaVersion: 1,
		sessionId: header.id,
		sourceCreatedAt: header.createdAt,
		sourceRevision: revision,
		...header.parentSession ? { parentSession: header.parentSession } : {},
		origin: header.origin === "subagent" ? "subagent" : "root",
		updatedAt: now,
		usage: usage.filter((item) => item.at >= cutoff),
		skills: skills.filter((item) => item.at >= cutoff)
	};
}
function addTokens(target, source) {
	target.input += source.input;
	target.output += source.output;
	target.cacheRead += source.cacheRead;
	target.cacheWrite += source.cacheWrite;
	target.reasoning += source.reasoning;
	target.total += source.total;
}
//#endregion
//#region src/analytics/summary.ts
const rangeDays = {
	"1d": 1,
	"7d": 7,
	"30d": 30
};
function localParts(at, timeZone) {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		hourCycle: "h23"
	}).formatToParts(at);
	const value = (type) => parts.find((part) => part.type === type)?.value ?? "00";
	return {
		day: `${value("year")}-${value("month")}-${value("day")}`,
		hour: Number(value("hour"))
	};
}
function selectedDays(now, timeZone, range) {
	const [year, month, day] = localParts(now, timeZone).day.split("-").map(Number);
	const anchor = new Date(Date.UTC(year, month - 1, day));
	return Array.from({ length: rangeDays[range] }, (_, offset) => {
		const date = new Date(anchor);
		date.setUTCDate(anchor.getUTCDate() - (rangeDays[range] - 1 - offset));
		return date.toISOString().slice(0, 10);
	});
}
function heatmapShell(range, days) {
	if (range === "1d") return Array.from({ length: 24 }, (_, hour) => ({
		key: `hour-${hour}`,
		label: `${String(hour).padStart(2, "0")}:00`,
		hour,
		attempts: 0,
		unknownAttempts: 0,
		...emptyTokens()
	}));
	if (range === "7d") return days.flatMap((day) => Array.from({ length: 24 }, (_, hour) => ({
		key: `${day}-${hour}`,
		label: `${day.slice(5)} ${String(hour).padStart(2, "0")}:00`,
		day,
		hour,
		attempts: 0,
		unknownAttempts: 0,
		...emptyTokens()
	})));
	return days.map((day) => ({
		key: day,
		label: day.slice(5),
		day,
		attempts: 0,
		unknownAttempts: 0,
		...emptyTokens()
	}));
}
function heatmapKey(range, day, hour) {
	if (range === "1d") return `hour-${hour}`;
	return range === "7d" ? `${day}-${hour}` : day;
}
function upsertModel(map, item) {
	const key = `${item.provider}\u0000${item.model}`;
	const target = map.get(key) ?? {
		provider: item.provider,
		model: item.model,
		calls: 0,
		...emptyTokens()
	};
	target.calls += 1;
	addTokens(target, item);
	map.set(key, target);
}
function buildSummary(records, options) {
	const now = options.now ?? Date.now();
	Intl.DateTimeFormat("en-CA", { timeZone: options.timeZone }).format(now);
	const days = selectedDays(now, options.timeZone, options.range);
	const selected = new Set(days);
	const heatmap = heatmapShell(options.range, days);
	const heatmapByKey = new Map(heatmap.map((cell) => [cell.key, cell]));
	const totals = {
		...emptyTokens(),
		modelCalls: 0,
		skillCalls: 0,
		activeDays: 0
	};
	const modelMap = /* @__PURE__ */ new Map();
	const skillMap = /* @__PURE__ */ new Map();
	const activeDays = /* @__PURE__ */ new Set();
	let knownAttempts = 0;
	let unknownAttempts = 0;
	let missingParents = 0;
	const recordIds = /* @__PURE__ */ new Set();
	const materialized = [...records];
	for (const record of materialized) recordIds.add(record.sessionId);
	for (const record of materialized) {
		if (record.parentSession && !recordIds.has(record.parentSession)) missingParents += 1;
		for (const item of record.usage) {
			const { day, hour } = localParts(item.at, options.timeZone);
			if (!selected.has(day)) continue;
			activeDays.add(day);
			totals.modelCalls += 1;
			addTokens(totals, item);
			upsertModel(modelMap, item);
			if (item.known) knownAttempts += 1;
			else unknownAttempts += 1;
			const cell = heatmapByKey.get(heatmapKey(options.range, day, hour));
			if (cell) {
				cell.attempts += 1;
				if (!item.known) cell.unknownAttempts += 1;
				addTokens(cell, item);
			}
		}
		for (const item of record.skills) {
			if (!selected.has(localParts(item.at, options.timeZone).day)) continue;
			totals.skillCalls += 1;
			const target = skillMap.get(item.name) ?? {
				name: item.name,
				calls: 0,
				automatic: 0,
				explicit: 0,
				success: 0,
				failure: 0,
				incomplete: 0
			};
			target.calls += 1;
			target[item.origin] += 1;
			target[item.status] += 1;
			if (!target.lastUsedAt || target.lastUsedAt < item.at) target.lastUsedAt = item.at;
			skillMap.set(item.name, target);
		}
	}
	totals.activeDays = activeDays.size;
	const denominator = knownAttempts + unknownAttempts;
	return {
		schemaVersion: 1,
		range: options.range,
		timeZone: options.timeZone,
		generatedAt: now,
		index: options.index,
		totals,
		heatmap,
		models: [...modelMap.values()].sort((a, b) => b.total - a.total),
		skills: [...skillMap.values()].sort((a, b) => b.calls - a.calls),
		coverage: {
			percent: denominator ? Math.round(knownAttempts / denominator * 100) : 100,
			knownAttempts,
			unknownAttempts,
			unreadableSessions: options.unreadableSessions ?? 0,
			missingParents
		}
	};
}
//#endregion
//#region src/analytics/spec.ts
const token = z.object({
	at: z.number(),
	provider: z.string(),
	model: z.string(),
	known: z.boolean(),
	input: z.number(),
	output: z.number(),
	cacheRead: z.number(),
	cacheWrite: z.number(),
	reasoning: z.number(),
	total: z.number()
});
const skill = z.object({
	at: z.number(),
	name: z.string(),
	origin: z.enum(["automatic", "explicit"]),
	status: z.enum([
		"success",
		"failure",
		"incomplete"
	]),
	durationMs: z.number().optional()
});
const record = z.object({
	schemaVersion: z.literal(1),
	sessionId: z.string(),
	sourceCreatedAt: z.number(),
	sourceRevision: z.union([z.string(), z.number()]),
	parentSession: z.string().optional(),
	origin: z.enum(["root", "subagent"]),
	updatedAt: z.number(),
	usage: z.array(token),
	skills: z.array(skill)
});
const usageInsightsDomain = defineDomain({
	name: "usage_insights",
	version: 1,
	tables: { sessions: domainTable(record) }
});
//#endregion
//#region src/analytics/indexer.ts
var UsageInsightsIndex = class {
	ctx;
	table;
	records = /* @__PURE__ */ new Map();
	index = {
		state: "indexing",
		processedSessions: 0,
		totalSessions: 0,
		failures: 0
	};
	domainClose;
	running = false;
	constructor(ctx) {
		this.ctx = ctx;
	}
	async start() {
		const domain = await this.ctx.storageDomain.open(usageInsightsDomain);
		this.domainClose = () => domain.close();
		this.ctx.effect(() => () => this.domainClose?.(), "usageInsights.domainClose");
		this.table = domain.table("sessions");
		this.records = new Map(this.table.entries());
		this.installLiveReducer();
		this.backfill();
	}
	summary(range, timeZone) {
		return buildSummary(this.records.values(), {
			range,
			timeZone,
			index: this.index,
			unreadableSessions: this.index.failures
		});
	}
	async rebuild() {
		if (this.running) return;
		for (const key of this.table.keys()) await this.table.delete(key);
		this.records.clear();
		await this.backfill();
	}
	installLiveReducer() {
		this.ctx.on("session/event", (session, event) => {
			if (event.type === "turn/end") this.syncLive(session);
		});
	}
	async syncLive(session) {
		try {
			await this.ctx.sessions.flush(session);
			const snapshots = await this.ctx.sessionPersistence.listSnapshots();
			const revision = String(snapshots.find((item) => item.header.id === session.id)?.revision ?? 0);
			const record = reduceSession(session.header, session.events, revision);
			await this.save(record);
		} catch {}
	}
	async backfill() {
		if (this.running) return;
		this.running = true;
		try {
			const snapshots = await this.ctx.sessionPersistence.listSnapshots();
			const available = new Set(snapshots.map((item) => item.header.id));
			this.index = {
				state: "indexing",
				processedSessions: 0,
				totalSessions: snapshots.length,
				failures: 0
			};
			for (const key of [...this.records.keys()]) if (!available.has(key)) {
				await this.table.delete(key);
				this.records.delete(key);
			}
			for (const snapshot of snapshots) {
				const existing = this.records.get(snapshot.header.id);
				const revision = String(snapshot.revision);
				if (existing?.sourceCreatedAt === snapshot.header.createdAt && String(existing.sourceRevision) === revision) {
					this.index.processedSessions += 1;
					continue;
				}
				try {
					const source = await this.ctx.sessionPersistence.readFrom(snapshot.header.id, 0);
					await this.save(reduceSession(source.meta, source.events, revision));
				} catch {
					this.index.failures += 1;
				} finally {
					this.index.processedSessions += 1;
				}
			}
			this.index.state = this.index.failures ? "partial" : "ready";
		} catch {
			this.index.state = "error";
		} finally {
			this.running = false;
		}
	}
	async save(record) {
		await this.table.put(record.sessionId, record);
		this.records.set(record.sessionId, record);
	}
};
//#endregion
//#region src/server/http.ts
function sendJson(response, status, value) {
	response.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"cache-control": "no-store",
		"x-content-type-options": "nosniff"
	});
	response.end(JSON.stringify(value));
}
//#endregion
//#region src/server/trust-fence.ts
function one(headers, name) {
	const value = headers[name];
	return typeof value === "string" ? value : void 0;
}
function authority(value) {
	try {
		return new URL(`http://${value}`);
	} catch {
		return;
	}
}
function loopback(hostname) {
	const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
	if (host === "localhost" || host === "::1") return true;
	const parts = host.split(".");
	return parts.length === 4 && parts[0] === "127" && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}
/** Reject browser requests that do not originate from DSH's trusted local UI. */
function isTrustedRequest(request, trustedHosts) {
	const host = one(request.headers, "host");
	const hostUrl = host ? authority(host) : void 0;
	if (!hostUrl) return false;
	const trusted = trustedHosts.some((candidate) => {
		const allowed = authority(candidate);
		return allowed && (allowed.port === "" ? allowed.hostname === hostUrl.hostname : allowed.host === hostUrl.host);
	});
	if (!loopback(hostUrl.hostname) && !trusted) return false;
	if (one(request.headers, "sec-fetch-site") === "cross-site") return false;
	const origin = one(request.headers, "origin");
	if (!origin) return true;
	try {
		return new URL(origin).host === hostUrl.host;
	} catch {
		return false;
	}
}
//#endregion
//#region src/index.ts
const name = "dsh-usage-insights";
const inject = [
	"webServer",
	"webRuntime",
	"sessionPersistence",
	"sessions",
	"storageDomain"
];
const API_ROOT = "/dsh-usage-insights/api";
const ranges = /* @__PURE__ */ new Set([
	"1d",
	"7d",
	"30d"
]);
async function apply(ctx) {
	const index = new UsageInsightsIndex(ctx);
	await index.start();
	ctx.effect(() => ctx.webServer.register({
		kind: "prefix",
		path: API_ROOT,
		async handler(req, res) {
			if (!isTrustedRequest(req, ctx.webRuntime.trustedHosts)) {
				sendJson(res, 403, {
					ok: false,
					error: "forbidden"
				});
				return;
			}
			const url = new URL(req.url ?? API_ROOT, "http://dsh.local");
			const path = url.pathname.slice(23);
			if ((req.method ?? "GET") === "GET" && path === "/summary") {
				const range = url.searchParams.get("range") ?? "7d";
				const timeZone = url.searchParams.get("timeZone") ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
				if (!ranges.has(range)) {
					sendJson(res, 400, {
						ok: false,
						error: "invalid-range"
					});
					return;
				}
				try {
					sendJson(res, 200, {
						ok: true,
						value: index.summary(range, timeZone)
					});
				} catch {
					sendJson(res, 400, {
						ok: false,
						error: "invalid-time-zone"
					});
				}
				return;
			}
			if ((req.method ?? "GET") === "POST" && path === "/rebuild") {
				index.rebuild();
				sendJson(res, 202, {
					ok: true,
					value: { started: true }
				});
				return;
			}
			sendJson(res, 404, {
				ok: false,
				error: "not-found"
			});
		}
	}), "usageInsights.api");
}
//#endregion
export { apply, inject, name };
