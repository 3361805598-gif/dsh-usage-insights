window.__ModuleLoader__.load({
	id: "dsh-usage-insights",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/api.ts
		const root = "/dsh-usage-insights/api";
		async function getSummary(range) {
			const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
			const response = await fetch(`${root}/summary?range=${range}&timeZone=${encodeURIComponent(timeZone)}`, {
				cache: "no-store",
				credentials: "same-origin"
			});
			const body = await response.json();
			if (!response.ok || !body.ok || !body.value) throw new Error(body.error ?? "无法读取分析数据");
			return body.value;
		}
		async function rebuildIndex() {
			if (!(await fetch(`${root}/rebuild`, {
				method: "POST",
				cache: "no-store",
				credentials: "same-origin"
			})).ok) throw new Error("无法启动重建");
		}
		//#endregion
		//#region src/client/styles.ts
		const usageInsightsCss = `
.ui-page{color:var(--dsw-fg,#1f1f1f);font:13px/1.45 ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:20px 22px 34px;max-width:900px;margin:auto}
.ui-nav-insights>svg{display:none}.ui-nav-insights::before{content:"";display:block;width:16px;height:16px;flex:0 0 16px;background:center/contain no-repeat url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' rx='4' fill='%23e8f4ec'/%3E%3Crect x='3' y='9' width='2' height='2' rx='.5' fill='%2394c9a5'/%3E%3Crect x='7' y='6' width='2' height='2' rx='.5' fill='%2359a875'/%3E%3Crect x='11' y='3' width='2' height='2' rx='.5' fill='%23206e48'/%3E%3Cpath d='M3.5 6.5 7.5 9l5-5' fill='none' stroke='%23206e48' stroke-width='1.1' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")}
.ui-top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:18px}.ui-top h1{font-size:20px;line-height:1.2;margin:0 0 5px;letter-spacing:-.02em}.ui-muted{margin:0;color:var(--dsw-fg-muted,#777);font-size:12px}.ui-profile{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(140deg,#d9efe4,#f3e2c5);font-size:16px}
.ui-toolbar{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:12px 0 16px;flex-wrap:wrap}.ui-ranges{display:inline-flex;padding:3px;border-radius:9px;background:var(--dsw-bg-muted,#f3f3f1);gap:2px}.ui-ranges button,.ui-rebuild{appearance:none;border:0;background:transparent;color:inherit;border-radius:7px;padding:5px 10px;font-size:12px;cursor:pointer}.ui-ranges button[aria-pressed=true]{background:var(--dsw-bg,#fff);box-shadow:0 1px 3px #00000012;font-weight:600}.ui-rebuild{border:1px solid var(--dsw-border,#e5e5e2);background:var(--dsw-bg,#fff)}
.ui-cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:15px}.ui-card,.ui-panel{background:var(--dsw-bg,#fff);border:1px solid var(--dsw-border,#e6e6e2);border-radius:12px}.ui-card{padding:12px}.ui-card b{font-size:18px;display:block;margin-top:4px;letter-spacing:-.02em}.ui-card span{font-size:11px;color:var(--dsw-fg-muted,#777)}.ui-panel{padding:15px;margin-top:12px}.ui-panel h2{font-size:14px;margin:0 0 3px}.ui-panel-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:13px}
.ui-heat{display:grid;gap:3px}.ui-heat.one{grid-template-columns:repeat(24,1fr)}.ui-heat.seven{grid-template-columns:repeat(24,1fr)}.ui-heat.thirty{grid-template-columns:repeat(7,1fr);gap:5px}.ui-cell{border-radius:3px;min-height:13px;background:#edf1ed;cursor:default}.ui-cell:hover{outline:1px solid var(--dsw-fg,#444);outline-offset:1px}.ui-legend{display:flex;justify-content:flex-end;align-items:center;gap:5px;font-size:10px;color:var(--dsw-fg-muted,#777);margin-top:8px}.ui-swatch{width:10px;height:10px;border-radius:2px;background:#edf1ed}.ui-swatch:nth-of-type(2){background:#b8dfc7}.ui-swatch:nth-of-type(3){background:#65b884}.ui-swatch:nth-of-type(4){background:#19764c}
.ui-breakdown{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:13px}.ui-breakdown div{padding:8px;border-radius:8px;background:var(--dsw-bg-muted,#f7f7f4)}.ui-breakdown span{display:block;color:var(--dsw-fg-muted,#777);font-size:11px}.ui-breakdown b{font-size:13px}
.ui-grid{display:grid;grid-template-columns:1fr 1.25fr;gap:12px}.ui-table{width:100%;border-collapse:collapse}.ui-table th,.ui-table td{text-align:left;padding:7px 0;border-bottom:1px solid var(--dsw-border,#ecece8);font-size:12px}.ui-table th{color:var(--dsw-fg-muted,#777);font-weight:500}.ui-table td:last-child,.ui-table th:last-child{text-align:right}.ui-status{font-size:11px;color:var(--dsw-fg-muted,#777)}.ui-empty{padding:16px 0;color:var(--dsw-fg-muted,#777);font-size:12px}.ui-error{border-color:#d89b91;color:#9c3021;background:#fff8f6}.ui-loading{padding:56px 0;text-align:center;color:var(--dsw-fg-muted,#777)}
@media(max-width:680px){.ui-page{padding:16px}.ui-cards{grid-template-columns:repeat(2,1fr)}.ui-grid{grid-template-columns:1fr}.ui-breakdown{grid-template-columns:repeat(3,1fr)}.ui-heat.seven{gap:2px}}
`;
		function ensureUsageInsightsStyles() {
			if (document.getElementById("dsh-usage-insights-style")) return;
			const style = document.createElement("style");
			style.id = "dsh-usage-insights-style";
			style.textContent = usageInsightsCss;
			document.head.append(style);
		}
		/** The Settings slot has no icon option in DSH rc.2; scope a replacement to our one nav row. */
		function installUsageInsightsNavIcon() {
			const mark = () => {
				for (const item of document.querySelectorAll("button")) if (item.textContent?.trim() === "个人分析") item.classList.add("ui-nav-insights");
			};
			mark();
			const observer = new MutationObserver(mark);
			observer.observe(document.body, {
				childList: true,
				subtree: true
			});
			return () => observer.disconnect();
		}
		//#endregion
		//#region src/client/UsageInsightsPage.tsx
		const integer = new Intl.NumberFormat("zh-CN", {
			notation: "compact",
			maximumFractionDigits: 1
		});
		const exact = new Intl.NumberFormat("zh-CN");
		const rangeLabels = {
			"1d": "1 天",
			"7d": "7 天",
			"30d": "30 天"
		};
		function heatColor(total, max) {
			if (!total || !max) return "#edf1ed";
			const ratio = total / max;
			return ratio < .18 ? "#dceddf" : ratio < .42 ? "#add5ba" : ratio < .7 ? "#66b584" : "#237a50";
		}
		function Heatmap({ cells, range }) {
			const max = Math.max(...cells.map((cell) => cell.total), 0);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: `ui-heat ${range === "1d" ? "one" : range === "7d" ? "seven" : "thirty"}`,
				children: cells.map((cell) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "ui-cell",
					style: { background: heatColor(cell.total, max) },
					title: `${cell.label}：${exact.format(cell.total)} Token${cell.unknownAttempts ? `；${cell.unknownAttempts} 次缺少用量` : ""}`
				}, cell.key))
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "ui-legend",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "少" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: "ui-swatch" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: "ui-swatch" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: "ui-swatch" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: "ui-swatch" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "多" })
				]
			})] });
		}
		function card(value, label) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "ui-card",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: value })]
			});
		}
		function UsageInsightsPage() {
			ensureUsageInsightsStyles();
			const [range, setRange] = (0, react.useState)("7d");
			const [data, setData] = (0, react.useState)();
			const [error, setError] = (0, react.useState)();
			const [rebuilding, setRebuilding] = (0, react.useState)(false);
			const load = (0, react.useCallback)(async () => {
				try {
					setError(void 0);
					setData(await getSummary(range));
				} catch (cause) {
					setError(cause instanceof Error ? cause.message : "无法读取分析数据");
				}
			}, [range]);
			(0, react.useEffect)(() => {
				load();
				const timer = window.setInterval(() => void load(), 1e4);
				return () => window.clearInterval(timer);
			}, [load]);
			const status = (0, react.useMemo)(() => {
				if (data?.index.state === "ready") return "已同步";
				if (data?.index.state === "indexing") return `正在索引 ${data.index.processedSessions}/${data.index.totalSessions}`;
				if (data?.index.state === "partial") return `部分会话无法读取（${data.index.failures} 个）`;
				return "索引失败，请重建缓存后重试";
			}, [data]);
			const rebuild = async () => {
				if (!window.confirm("将删除本插件的派生统计缓存，并从原始 DSH 会话重新索引。不会删除任何会话。是否继续？")) return;
				setRebuilding(true);
				try {
					await rebuildIndex();
					await load();
				} catch (cause) {
					setError(cause instanceof Error ? cause.message : "无法启动重建");
				} finally {
					setRebuilding(false);
				}
			};
			if (!data && !error) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("main", {
				className: "ui-page",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "ui-loading",
					children: "正在准备本地使用分析…"
				})
			});
			if (error && !data) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("main", {
				className: "ui-page",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: "ui-panel ui-error",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "无法载入个人分析" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: error }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: "ui-rebuild",
							onClick: () => void load(),
							children: "重试"
						})
					]
				})
			});
			const value = data;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("main", {
				className: "ui-page",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "ui-top",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", { children: "个人分析" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "ui-muted",
							children: "本机 DSH 活动 · 仅统计可验证的 Token 用量"
						})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "ui-profile",
							"aria-label": "个人分析",
							children: "◒"
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "ui-toolbar",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "ui-ranges",
							children: Object.keys(rangeLabels).map((key) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								"aria-pressed": range === key,
								onClick: () => setRange(key),
								children: rangeLabels[key]
							}, key))
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: "ui-rebuild",
							disabled: rebuilding,
							onClick: () => void rebuild(),
							children: rebuilding ? "正在重建…" : "重建统计缓存"
						})]
					}),
					error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "ui-muted",
						children: error
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: "ui-cards",
						children: [
							card(integer.format(value.totals.total), "总 Token"),
							card(exact.format(value.totals.modelCalls), "模型调用"),
							card(exact.format(value.totals.skillCalls), "技能调用"),
							card(exact.format(value.totals.activeDays), "活跃天数")
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: "ui-panel",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "ui-panel-head",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "Token 使用热力图" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
									className: "ui-muted",
									children: [
										"按本机时区 ",
										value.timeZone,
										" 归类"
									]
								})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "ui-status",
									children: status
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Heatmap, {
								cells: value.heatmap,
								range
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "ui-breakdown",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "输入" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: integer.format(value.totals.input) })] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "输出" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: integer.format(value.totals.output) })] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "缓存读取" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: integer.format(value.totals.cacheRead) })] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "缓存写入" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: integer.format(value.totals.cacheWrite) })] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "推理（输出子集）" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: integer.format(value.totals.reasoning) })] })
								]
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "ui-grid",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: "ui-panel",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "ui-panel-head",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "模型分布" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "ui-muted",
									children: "按模型响应的用量汇总"
								})] })
							}), value.models.length ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", {
								className: "ui-table",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "模型" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "调用" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "Token" })
								] }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tbody", { children: value.models.slice(0, 6).map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: item.model }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: item.calls }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: integer.format(item.total) })
								] }, `${item.provider}-${item.model}`)) })]
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "ui-empty",
								children: "这个时段没有模型调用。"
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: "ui-panel",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "ui-panel-head",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "技能调用" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "ui-muted",
									children: "自动与显式调用均包含"
								})] })
							}), value.skills.length ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", {
								className: "ui-table",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "技能" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "调用" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "成功率" })
								] }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tbody", { children: value.skills.slice(0, 6).map((item) => {
									const settled = item.success + item.failure;
									const rate = settled ? Math.round(item.success / settled * 100) : 0;
									return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: item.name }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: item.calls }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: settled ? `${rate}%` : "未完成" })
									] }, item.name);
								}) })]
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "ui-empty",
								children: "这个时段没有技能调用。"
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
						className: "ui-muted",
						style: { marginTop: 13 },
						children: [
							"覆盖率 ",
							value.coverage.percent,
							"% · 已知 ",
							value.coverage.knownAttempts,
							" 次 · 缺少用量 ",
							value.coverage.unknownAttempts,
							" 次",
							value.coverage.missingParents ? ` · 缺少父会话 ${value.coverage.missingParents} 个` : ""
						]
					})
				]
			});
		}
		//#endregion
		//#region src/client/index.tsx
		const name = "dsh-usage-insights-client";
		const inject = ["slots"];
		function apply(ctx) {
			ensureUsageInsightsStyles();
			ctx.effect(() => installUsageInsightsNavIcon(), "usageInsights.navIcon");
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "personal-insights",
				order: 30,
				label: () => "个人分析"
			}, UsageInsightsPage));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map