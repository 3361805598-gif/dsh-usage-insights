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
		const usageInsightsCss = `
.dshi-page{
  --dshi-heat-0:var(--dsw-alias-bg-module-platform);
  --dshi-heat-1:#dceddf;
  --dshi-heat-2:#add5ba;
  --dshi-heat-3:#66b584;
  --dshi-heat-4:#237a50;
  color:var(--dsw-alias-label-primary);font:13px/1.45 ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:20px 22px 34px;max-width:900px;margin:auto
}
body[data-ds-dark-theme] .dshi-page{
  --dshi-heat-0:var(--dsw-alias-bg-layer-1);
  --dshi-heat-1:#1a3d2c;
  --dshi-heat-2:#2a6b48;
  --dshi-heat-3:#3d9a64;
  --dshi-heat-4:#5ecf88
}
.dshi-nav>svg{display:none}
.dshi-nav::before{content:"";display:block;width:16px;height:16px;flex:0 0 16px;background:center/contain no-repeat url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' rx='4' fill='%23e8f4ec'/%3E%3Crect x='3' y='9' width='2' height='2' rx='.5' fill='%2394c9a5'/%3E%3Crect x='7' y='6' width='2' height='2' rx='.5' fill='%2359a875'/%3E%3Crect x='11' y='3' width='2' height='2' rx='.5' fill='%23206e48'/%3E%3Cpath d='M3.5 6.5 7.5 9l5-5' fill='none' stroke='%23206e48' stroke-width='1.1' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")}
body[data-ds-dark-theme] .dshi-nav::before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' rx='4' fill='%231a3d2c'/%3E%3Crect x='3' y='9' width='2' height='2' rx='.5' fill='%232a6b48'/%3E%3Crect x='7' y='6' width='2' height='2' rx='.5' fill='%233d9a64'/%3E%3Crect x='11' y='3' width='2' height='2' rx='.5' fill='%235ecf88'/%3E%3Cpath d='M3.5 6.5 7.5 9l5-5' fill='none' stroke='%235ecf88' stroke-width='1.1' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")}
.dshi-top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:18px}
.dshi-top h1{font-size:20px;line-height:1.2;margin:0 0 5px;letter-spacing:-.02em;color:var(--dsw-alias-label-primary)}
.dshi-muted{margin:0;color:var(--dsw-alias-label-tertiary);font-size:12px}
.dshi-toolbar{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:12px 0 16px;flex-wrap:wrap}
.dshi-ranges{display:inline-flex;padding:3px;border-radius:9px;background:var(--dsw-alias-bg-module-platform);gap:2px}
.dshi-ranges button,.dshi-rebuild{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-primary);border-radius:7px;padding:5px 10px;font-size:12px;cursor:pointer}
.dshi-ranges button:hover,.dshi-rebuild:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dshi-ranges button[aria-pressed=true]{background:var(--dsw-alias-bg-layer-3);box-shadow:var(--dsw-elevation-panel);font-weight:600}
.dshi-rebuild{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2)}
.dshi-rebuild:disabled{opacity:.45;cursor:not-allowed}
.dshi-cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:15px}
.dshi-card,.dshi-panel{background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l2);border-radius:12px}
.dshi-card{padding:12px}
.dshi-card b{font-size:18px;display:block;margin-top:4px;letter-spacing:-.02em;color:var(--dsw-alias-label-primary)}
.dshi-card span{font-size:11px;color:var(--dsw-alias-label-tertiary)}
.dshi-panel{padding:15px;margin-top:12px}
.dshi-panel h2{font-size:14px;margin:0 0 3px;color:var(--dsw-alias-label-primary)}
.dshi-panel-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:13px}
.dshi-heat{display:grid;gap:3px}
.dshi-heat.one,.dshi-heat.seven{grid-template-columns:repeat(24,1fr)}
.dshi-cell{aspect-ratio:1/1;width:100%;min-height:0;border-radius:3px;background:var(--dshi-heat-0);cursor:default}
.dshi-cell.l1{background:var(--dshi-heat-1)}
.dshi-cell.l2{background:var(--dshi-heat-2)}
.dshi-cell.l3{background:var(--dshi-heat-3)}
.dshi-cell.l4{background:var(--dshi-heat-4)}
.dshi-cell:hover{outline:1px solid var(--dsw-alias-label-primary);outline-offset:1px}
.dshi-calendar{max-width:780px}
.dshi-calendar-weekdays,.dshi-calendar-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}
.dshi-calendar-weekdays{margin-bottom:6px}.dshi-calendar-weekdays span{padding-left:4px;color:var(--dsw-alias-label-tertiary);font-size:11px}
.dshi-calendar-grid{grid-auto-rows:94px}
.dshi-calendar-day{min-width:0;padding:7px;border:1px solid var(--dsw-alias-border-l2);border-radius:9px;background:var(--dsw-alias-bg-module-platform);box-shadow:inset 0 -2px var(--dshi-heat-0);cursor:default}
.dshi-calendar-day.l1{box-shadow:inset 0 -2px var(--dshi-heat-1)}.dshi-calendar-day.l2{box-shadow:inset 0 -2px var(--dshi-heat-2)}.dshi-calendar-day.l3{box-shadow:inset 0 -2px var(--dshi-heat-3)}.dshi-calendar-day.l4{box-shadow:inset 0 -2px var(--dshi-heat-4)}
.dshi-calendar-day:hover{outline:1px solid var(--dsw-alias-label-primary);outline-offset:1px}.dshi-calendar-empty{border-radius:9px;background:color-mix(in srgb,var(--dsw-alias-bg-module-platform) 45%,transparent)}
.dshi-calendar-dayhead{display:flex;justify-content:space-between;align-items:center;gap:4px;margin-bottom:7px;color:var(--dsw-alias-label-tertiary);font-size:11px}.dshi-calendar-dayhead b{overflow:hidden;color:var(--dsw-alias-label-primary);font-size:11px;font-weight:600;text-overflow:ellipsis;white-space:nowrap}
.dshi-calendar-hours{display:grid;grid-template-columns:repeat(6,1fr);gap:2px}.dshi-calendar-hours i{display:block;aspect-ratio:1/1;border-radius:2px;background:var(--dshi-heat-0)}.dshi-calendar-hours i.l1{background:var(--dshi-heat-1)}.dshi-calendar-hours i.l2{background:var(--dshi-heat-2)}.dshi-calendar-hours i.l3{background:var(--dshi-heat-3)}.dshi-calendar-hours i.l4{background:var(--dshi-heat-4)}
.dshi-legend{display:flex;justify-content:flex-end;align-items:center;gap:5px;font-size:10px;color:var(--dsw-alias-label-tertiary);margin-top:8px}
.dshi-swatch{width:10px;height:10px;border-radius:2px;background:var(--dshi-heat-0)}
.dshi-swatch:nth-of-type(2){background:var(--dshi-heat-1)}
.dshi-swatch:nth-of-type(3){background:var(--dshi-heat-3)}
.dshi-swatch:nth-of-type(4){background:var(--dshi-heat-4)}
.dshi-breakdown{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:13px}
.dshi-breakdown div{padding:8px;border-radius:8px;background:var(--dsw-alias-bg-module-platform)}
.dshi-breakdown span{display:block;color:var(--dsw-alias-label-tertiary);font-size:11px}
.dshi-breakdown b{font-size:13px;color:var(--dsw-alias-label-primary)}
.dshi-grid{display:grid;grid-template-columns:1fr 1.25fr;gap:12px}
.dshi-table{width:100%;border-collapse:collapse}
.dshi-table th,.dshi-table td{text-align:left;padding:7px 0;border-bottom:1px solid var(--dsw-alias-border-l2);font-size:12px;color:var(--dsw-alias-label-primary)}
.dshi-table th{color:var(--dsw-alias-label-tertiary);font-weight:500}
.dshi-table td:last-child,.dshi-table th:last-child{text-align:right}
.dshi-status{font-size:11px;color:var(--dsw-alias-label-tertiary)}
.dshi-empty{padding:16px 0;color:var(--dsw-alias-label-tertiary);font-size:12px}
.dshi-error{border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-bg-layer-2)}
.dshi-loading{padding:56px 0;text-align:center;color:var(--dsw-alias-label-tertiary)}
@media(max-width:680px){.dshi-page{padding:16px}.dshi-cards{grid-template-columns:repeat(2,1fr)}.dshi-grid{grid-template-columns:1fr}.dshi-breakdown{grid-template-columns:repeat(3,1fr)}.dshi-heat.seven{gap:2px}.dshi-calendar{overflow-x:auto}.dshi-calendar-weekdays,.dshi-calendar-grid{min-width:610px}.dshi-calendar-grid{grid-auto-rows:82px}}
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
				for (const item of document.querySelectorAll("button")) if (item.textContent?.trim() === "个人分析") item.classList.add("dshi-nav");
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
		function heatLevel(total, max) {
			if (!total || !max) return 0;
			const ratio = total / max;
			return ratio < .18 ? 1 : ratio < .42 ? 2 : ratio < .7 ? 3 : 4;
		}
		function Heatmap({ cells, range }) {
			const max = Math.max(...cells.map((cell) => cell.total), 0);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: `dshi-heat ${range === "1d" ? "one" : "seven"}`,
				children: cells.map((cell) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: `dshi-cell l${heatLevel(cell.total, max)}`,
					title: `${cell.label}：${exact.format(cell.total)} Token${cell.unknownAttempts ? `；${cell.unknownAttempts} 次缺少用量` : ""}`
				}, cell.key))
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshi-legend",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "少" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: "dshi-swatch" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: "dshi-swatch" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: "dshi-swatch" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: "dshi-swatch" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "多" })
				]
			})] });
		}
		const weekdays = [
			"周一",
			"周二",
			"周三",
			"周四",
			"周五",
			"周六",
			"周日"
		];
		function mondayOffset(day) {
			return ((/* @__PURE__ */ new Date(`${day}T00:00:00Z`)).getUTCDay() + 6) % 7;
		}
		function MonthlyCalendar({ days }) {
			const maxDay = Math.max(...days.map((day) => day.total), 0);
			const maxHour = Math.max(...days.flatMap((day) => day.hours.map((hour) => hour.total)), 0);
			const leading = days[0] ? mondayOffset(days[0].day) : 0;
			const cells = [...Array(leading).fill(void 0), ...days];
			while (cells.length % 7 !== 0) cells.push(void 0);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshi-calendar",
				"aria-label": "最近 30 天 Token 使用日历",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshi-calendar-weekdays",
					children: weekdays.map((label) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: label }, label))
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshi-calendar-grid",
					children: cells.map((day, index) => day === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshi-calendar-empty",
						"aria-hidden": "true"
					}, `empty-${index}`) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: `dshi-calendar-day l${heatLevel(day.total, maxDay)}`,
						title: `${day.day}：${exact.format(day.total)} Token${day.unknownAttempts ? `；${day.unknownAttempts} 次缺少用量` : ""}`,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dshi-calendar-dayhead",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: day.label }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: integer.format(day.total) })]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshi-calendar-hours",
							"aria-label": `${day.label} 的 24 小时使用热力图`,
							children: day.hours.map((hour) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
								className: `l${heatLevel(hour.total, maxHour)}`,
								title: `${String(hour.hour).padStart(2, "0")}:00：${exact.format(hour.total)} Token`
							}, hour.hour))
						})]
					}, day.day))
				})]
			});
		}
		function card(value, label) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshi-card",
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
				className: "dshi-page",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshi-loading",
					children: "正在准备本地使用分析…"
				})
			});
			if (error && !data) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("main", {
				className: "dshi-page",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: "dshi-panel dshi-error",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "无法载入个人分析" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: error }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: "dshi-rebuild",
							onClick: () => void load(),
							children: "重试"
						})
					]
				})
			});
			const value = data;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("main", {
				className: "dshi-page",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshi-top",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", { children: "个人分析" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "dshi-muted",
							children: "本机 DSH 活动 · 仅统计可验证的 Token 用量"
						})] })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshi-toolbar",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshi-ranges",
							children: Object.keys(rangeLabels).map((key) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								"aria-pressed": range === key,
								onClick: () => setRange(key),
								children: rangeLabels[key]
							}, key))
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: "dshi-rebuild",
							disabled: rebuilding,
							onClick: () => void rebuild(),
							children: rebuilding ? "正在重建…" : "重建统计缓存"
						})]
					}),
					error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "dshi-muted",
						children: error
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: "dshi-cards",
						children: [
							card(integer.format(value.totals.total), "总 Token"),
							card(exact.format(value.totals.modelCalls), "模型调用"),
							card(exact.format(value.totals.skillCalls), "技能调用"),
							card(exact.format(value.totals.activeDays), "活跃天数")
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: "dshi-panel",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dshi-panel-head",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: range === "30d" ? "30 天使用日历" : "Token 使用热力图" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
									className: "dshi-muted",
									children: [
										"按本机时区 ",
										value.timeZone,
										" 归类",
										range === "30d" ? " · 每日内含 24 小时微热力图" : ""
									]
								})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dshi-status",
									children: status
								})]
							}),
							range === "30d" && value.calendar ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MonthlyCalendar, { days: value.calendar }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Heatmap, {
								cells: value.heatmap,
								range
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dshi-breakdown",
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
						className: "dshi-grid",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: "dshi-panel",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dshi-panel-head",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "模型分布" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "dshi-muted",
									children: "按模型响应的用量汇总"
								})] })
							}), value.models.length ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", {
								className: "dshi-table",
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
								className: "dshi-empty",
								children: "这个时段没有模型调用。"
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: "dshi-panel",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dshi-panel-head",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "技能调用" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "dshi-muted",
									children: "自动与显式调用均包含"
								})] })
							}), value.skills.length ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", {
								className: "dshi-table",
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
								className: "dshi-empty",
								children: "这个时段没有技能调用。"
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
						className: "dshi-muted",
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