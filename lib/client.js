window.__ModuleLoader__.load({
	id: "dsh-usage-analytics",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/format.ts
		const compact = new Intl.NumberFormat("zh-CN", {
			notation: "compact",
			maximumFractionDigits: 1
		});
		const exact = new Intl.NumberFormat("zh-CN");
		const rangeLabels = {
			"1d": "今天",
			"7d": "近 7 天",
			"30d": "近 30 天"
		};
		const rangeDays = {
			"1d": 1,
			"7d": 7,
			"30d": 30
		};
		const percent = (value, total) => total ? `${Math.round(value / total * 100)}%` : "—";
		const hourLabel = (hour) => `${String(hour).padStart(2, "0")}:00`;
		function heatLevel(total, max) {
			if (total <= 0 || max <= 0) return 0;
			const ratio = total / max;
			return ratio < .18 ? 1 : ratio < .42 ? 2 : ratio < .7 ? 3 : 4;
		}
		//#endregion
		//#region src/client/components/ActivityChart.tsx
		const weekdays = [
			"一",
			"二",
			"三",
			"四",
			"五",
			"六",
			"日"
		];
		const description = (cell) => `${cell.label}，${exact.format(cell.total)} Token，${cell.attempts} 次响应${cell.unknownAttempts ? `，${cell.unknownAttempts} 次缺少用量` : ""}`;
		function ActivityChart({ data }) {
			const [selectedKey, setSelectedKey] = (0, react.useState)();
			const selected = data.heatmap.find((cell) => cell.key === selectedKey);
			const peak = data.heatmap.reduce((best, cell) => !best || cell.total > best.total ? cell : best, void 0);
			const max = peak?.total ?? 0;
			const maxHour = data.calendar?.reduce((max, day) => day.hours.reduce((max, hour) => Math.max(max, hour.total), max), 0) ?? 0;
			const detail = selected ?? peak;
			const days = [...new Set(data.heatmap.map((cell) => cell.day).filter((day) => Boolean(day)))];
			const cellButton = (cell) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: `dshi-cell l${heatLevel(cell.total, max)}${cell.unknownAttempts ? " has-unknown" : ""}`,
				"aria-label": description(cell),
				"aria-pressed": selected?.key === cell.key,
				title: description(cell),
				onClick: () => setSelectedKey(cell.key)
			}, cell.key);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "dshi-panel dshi-activity",
				"aria-labelledby": "dshi-activity-title",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshi-section-head",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dshi-eyebrow",
							children: "活动分布"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
							id: "dshi-activity-title",
							children: data.range === "30d" ? "每一天的使用节奏" : "Token 使用时段"
						})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "dshi-caption",
							children: [
								rangeLabels[data.range],
								" · ",
								data.timeZone
							]
						})]
					}),
					data.range === "1d" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshi-chart-scroll",
						tabIndex: 0,
						"aria-label": "按小时使用量，可横向滚动",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshi-hour-bars",
							children: data.heatmap.map((cell) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "dshi-hour-bar",
								"aria-label": description(cell),
								"aria-pressed": selected?.key === cell.key,
								title: description(cell),
								onClick: () => setSelectedKey(cell.key),
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dshi-bar-track",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { style: { height: `${max ? Math.max(cell.total ? 3 : 0, cell.total / max * 100) : 0}%` } })
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: cell.hour % 3 === 0 ? hourLabel(cell.hour) : "" })]
							}, cell.key))
						})
					}) : data.range === "7d" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshi-chart-scroll",
						tabIndex: 0,
						"aria-label": "7 天小时热力图，可横向滚动",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dshi-week-chart",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dshi-hour-axis",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {}), Array.from({ length: 24 }, (_, hour) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: hour % 3 === 0 ? hourLabel(hour) : "" }, hour))]
							}), days.map((day) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dshi-week-row",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dshi-day-label",
									children: day.slice(5).replace("-", "/")
								}), data.heatmap.filter((cell) => cell.day === day).map(cellButton)]
							}, day))]
						})
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshi-month-chart",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshi-month-weekdays",
							children: weekdays.map((day) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: ["周", day] }, day))
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dshi-month-grid",
							children: [Array.from({ length: days[0] ? ((/* @__PURE__ */ new Date(`${days[0]}T00:00:00Z`)).getUTCDay() + 6) % 7 : 0 }, (_, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {}, `blank-${i}`)), data.heatmap.map((cell) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: `dshi-month-day l${heatLevel(cell.total, max)}`,
								"aria-label": description(cell),
								"aria-pressed": selected?.key === cell.key,
								onClick: () => setSelectedKey(cell.key),
								title: description(cell),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: cell.label.replace("-", "/") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: compact.format(cell.total) }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dshi-micro-hours",
										"aria-hidden": "true",
										children: data.calendar?.find((day) => day.day === cell.day)?.hours.map((hour) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: `l${heatLevel(hour.total, maxHour)}` }, hour.hour))
									})
								]
							}, cell.key))]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshi-chart-foot",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "dshi-caption",
							children: [data.range === "30d" ? "点击日期查看明细 · 色阶按每日总量比较" : "点击时段查看明细", data.coverage.unknownAttempts ? " · 缺少用量不估算" : ""]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dshi-legend",
							"aria-label": "颜色由浅到深表示用量由少到多",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "少" }),
								[
									0,
									1,
									2,
									3,
									4
								].map((level) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: `l${level}` }, level)),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "多" })
							]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshi-chart-detail",
						"aria-live": "polite",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dshi-caption",
								children: selected ? "选中时段" : max ? "用量最高" : "暂无用量"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: detail?.label ?? "—" })] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dshi-caption",
								children: "Token"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: exact.format(detail?.total ?? 0) })] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dshi-caption",
								children: "模型响应"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", { children: [
								exact.format(detail?.attempts ?? 0),
								" ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "次" })
							] })] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dshi-caption",
								children: "缺少用量"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", { children: [
								exact.format(detail?.unknownAttempts ?? 0),
								" ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "次" })
							] })] })
						]
					}),
					data.range === "30d" && selected?.day && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshi-selected-hours",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "dshi-caption",
							children: [selected.label, " · 小时明细"]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: data.calendar?.find((day) => day.day === selected.day)?.hours.map((hour) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
							hourLabel(hour.hour),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: compact.format(hour.total) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: hour.unknownAttempts ? `${hour.unknownAttempts} 次缺少用量` : `${hour.attempts} 次响应` })
						] }, hour.hour)) })]
					})
				]
			});
		}
		//#endregion
		//#region src/client/components/TokenComposition.tsx
		const categories = [
			{
				key: "input",
				label: "输入",
				tone: "input"
			},
			{
				key: "output",
				label: "输出",
				tone: "output"
			},
			{
				key: "cacheRead",
				label: "缓存读取",
				tone: "read"
			},
			{
				key: "cacheWrite",
				label: "缓存写入",
				tone: "write"
			}
		];
		function TokenComposition({ tokens }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "dshi-panel dshi-composition",
				"aria-labelledby": "dshi-composition-title",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshi-section-head",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dshi-eyebrow",
							children: "用量构成"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
							id: "dshi-composition-title",
							children: "Token 去向"
						})] })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshi-stacked-bar",
						"aria-hidden": "true",
						children: categories.map(({ key, tone }) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
							className: `dshi-tone-${tone}`,
							style: { width: `${tokens.total ? tokens[key] / tokens.total * 100 : 0}%` }
						}, key))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshi-token-list",
						children: categories.map(({ key, label, tone }) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: `dshi-dot dshi-tone-${tone}` }), label] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
								title: exact.format(tokens[key]),
								children: compact.format(tokens[key])
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dshi-caption",
								children: percent(tokens[key], tokens.total)
							})
						] }, key))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshi-reasoning",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "推理 Token" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
							title: exact.format(tokens.reasoning),
							children: compact.format(tokens.reasoning)
						})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "dshi-caption",
							children: "包含在输出中，不重复计入总量。"
						})]
					})
				]
			});
		}
		//#endregion
		//#region src/client/components/UsageDetails.tsx
		function UsageDetails({ data }) {
			const [tab, setTab] = (0, react.useState)("models");
			const [expanded, setExpanded] = (0, react.useState)(false);
			const count = data[tab].length;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "dshi-panel dshi-details",
				"aria-labelledby": "dshi-details-title",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshi-section-head",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dshi-eyebrow",
						children: "调用明细"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
						id: "dshi-details-title",
						children: tab === "models" ? "模型分布" : "技能调用"
					})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshi-segmented",
						role: "group",
						"aria-label": "明细类型",
						children: ["models", "skills"].map((key) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							"aria-pressed": tab === key,
							onClick: () => {
								setTab(key);
								setExpanded(false);
							},
							children: [
								key === "models" ? "模型" : "技能",
								" ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: data[key].length })
							]
						}, key))
					})]
				}), count ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshi-table-scroll",
					tabIndex: 0,
					"aria-label": tab === "models" ? "模型用量明细，可横向滚动" : "技能调用明细，可横向滚动",
					children: tab === "models" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", {
						className: "dshi-table",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
								scope: "col",
								children: "模型 / 提供方"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
								scope: "col",
								children: "调用次数"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
								scope: "col",
								children: "Token"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
								scope: "col",
								children: "用量占比"
							})
						] }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tbody", { children: data.models.slice(0, expanded ? void 0 : 6).map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: item.model }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dshi-caption",
								children: item.provider
							})] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: exact.format(item.calls) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
								title: exact.format(item.total),
								children: compact.format(item.total)
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dshi-share",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dshi-share-track",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { style: { width: `${data.totals.total ? item.total / data.totals.total * 100 : 0}%` } })
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: percent(item.total, data.totals.total) })]
							}) })
						] }, JSON.stringify([item.provider, item.model]))) })]
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", {
						className: "dshi-table",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
								scope: "col",
								children: "技能 / 调用来源"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
								scope: "col",
								children: "调用次数"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
								scope: "col",
								children: "结果"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
								scope: "col",
								children: "成功率"
							})
						] }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tbody", { children: data.skills.slice(0, expanded ? void 0 : 6).map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: item.name }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "dshi-caption",
								children: [
									"自动 ",
									item.automatic,
									" · 显式 ",
									item.explicit
								]
							})] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: exact.format(item.calls) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dshi-results",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "dshi-success",
										children: [item.success, " 成功"]
									}),
									item.failure > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "dshi-failure",
										children: [item.failure, " 失败"]
									}),
									item.incomplete > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [item.incomplete, " 未完成"] })
								]
							}) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: percent(item.success, item.success + item.failure) })
						] }, item.name)) })]
					})
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshi-table-foot",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "dshi-caption",
						children: [
							tab === "models" ? "按 Token 用量排序" : "按调用次数排序 · 成功率仅计算已完成调用",
							" · 共 ",
							count,
							" 项"
						]
					}), count > 6 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshi-text-button",
						"aria-expanded": expanded,
						onClick: () => setExpanded(!expanded),
						children: expanded ? "收起列表 ↑" : `展开全部 ${count} 项 ↓`
					})]
				})] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshi-empty",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dshi-empty-symbol",
							"aria-hidden": "true",
							children: "—"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", { children: ["这个时段还没有", tab === "models" ? "模型响应" : "技能调用"] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "换一个时间范围，或完成一次会话后再来查看。" })
					]
				})]
			});
		}
		const usageInsightsCss = `
.dshi-page{
 --dshi-bg:var(--dsw-alias-bg-layer-2,#fff);--dshi-soft:var(--dsw-alias-bg-module-platform,#f5f7fa);--dshi-text:var(--dsw-alias-label-primary,#182c3c);--dshi-muted:var(--dsw-alias-label-tertiary,#667782);--dshi-line:var(--dsw-alias-border-l2,#e2e8ed);
 --dshi-accent:#17745d;--dshi-accent-soft:#edf7f3;--dshi-heat-0:#edf1f3;--dshi-heat-1:#cee8df;--dshi-heat-2:#8fc9b4;--dshi-heat-3:#459b7b;--dshi-heat-4:#176c53;--dshi-error:#b84c36;--dshi-blue:#6395ce;--dshi-purple:#a49ac7;--dshi-teal:#a3cabc;
 box-sizing:border-box;max-width:1200px;margin:0 auto;padding:30px clamp(16px,3.5vw,40px) 24px;color:var(--dshi-text);font:14px/1.55 -apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;font-variant-numeric:tabular-nums;container-type:inline-size
}
body[data-ds-dark-theme] .dshi-page{--dshi-bg:var(--dsw-alias-bg-layer-2,#1d242b);--dshi-soft:var(--dsw-alias-bg-module-platform,#242d35);--dshi-text:var(--dsw-alias-label-primary,#edf3f6);--dshi-muted:var(--dsw-alias-label-tertiary,#a1afb9);--dshi-line:var(--dsw-alias-border-l2,#34414c);--dshi-accent:#73cbae;--dshi-accent-soft:#243e35;--dshi-heat-0:#2b363d;--dshi-heat-1:#294f43;--dshi-heat-2:#377c61;--dshi-heat-3:#4da480;--dshi-heat-4:#7dd8af;--dshi-error:#ef9b87;--dshi-teal:#58a392}
.dshi-page *{box-sizing:border-box}.dshi-page button{font:inherit;cursor:pointer}.dshi-page button:disabled{cursor:wait;opacity:.5}.dshi-page button:focus-visible,.dshi-page [tabindex]:focus-visible{outline:2px solid var(--dshi-accent);outline-offset:4px}.dshi-page button{touch-action:manipulation}.dshi-page h1,.dshi-page h2,.dshi-page p{margin:0}.dshi-page h1{font-size:24px;letter-spacing:-.7px;font-weight:650}.dshi-page h2{font-size:17px;letter-spacing:-.2px;font-weight:650}.dshi-page strong{font-weight:600}.dshi-caption{font-size:12px;color:var(--dshi-muted)}.dshi-eyebrow{display:block;font-size:12px;letter-spacing:.06em;color:var(--dshi-muted);margin-bottom:5px}
.dshi-top{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:24px}.dshi-top p{color:var(--dshi-muted);margin-top:7px}.dshi-title-row{display:flex;gap:12px;align-items:center}.dshi-brand-mark{width:29px;height:29px;display:flex;align-items:flex-end;gap:3px;padding:5px;border:1px solid var(--dshi-line);border-radius:7px}.dshi-brand-mark i{width:5px;background:var(--dshi-accent);border-radius:2px;height:45%}.dshi-brand-mark i:nth-child(2){height:75%;opacity:.7}.dshi-brand-mark i:nth-child(3){height:100%;opacity:.45}
.dshi-sync{display:inline-flex;align-items:center;gap:7px;white-space:nowrap;font-size:12px;color:var(--dshi-muted);padding:5px 9px;border:1px solid var(--dshi-line);border-radius:20px}.dshi-sync i{width:6px;height:6px;border-radius:50%;background:var(--dshi-muted)}.dshi-sync.ready i{background:var(--dshi-accent)}.dshi-sync.error i,.dshi-sync.partial i{background:var(--dshi-error)}
.dshi-toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap}.dshi-segmented{display:flex;gap:3px;border:1px solid var(--dshi-line);border-radius:9px;padding:3px;background:var(--dshi-soft)}.dshi-segmented button{border:0;background:transparent;color:var(--dshi-muted);padding:7px 16px;border-radius:6px;white-space:nowrap;font-size:13px;min-height:34px}.dshi-segmented button[aria-pressed=true]{background:var(--dshi-bg);color:var(--dshi-text);box-shadow:0 1px 4px #0000000d;font-weight:600}.dshi-segmented button:hover{color:var(--dshi-accent)}.dshi-segmented button span{font-size:12px;margin-left:4px;opacity:.65}.dshi-button{display:inline-flex;gap:8px;align-items:center;justify-content:center;border:1px solid var(--dshi-line);border-radius:8px;background:var(--dshi-bg);color:var(--dshi-muted);padding:8px 12px;font-size:13px!important;min-height:38px}.dshi-button:hover{border-color:var(--dshi-accent);color:var(--dshi-accent)}.dshi-button>span{font-size:18px;line-height:1}
.dshi-overview{display:grid;grid-template-columns:1fr 1.4fr;align-items:center;gap:24px;padding:26px 28px;border:1px solid var(--dshi-line);border-radius:12px;background:linear-gradient(115deg,var(--dshi-accent-soft),var(--dshi-bg) 65%);margin-bottom:20px}.dshi-total>strong{display:block;font-size:clamp(32px,4.5vw,46px);line-height:1.2;letter-spacing:-1.5px;color:var(--dshi-accent);margin:5px 0 8px}.dshi-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.dshi-metrics>div{padding-left:20px;border-left:1px solid var(--dshi-line)}.dshi-metrics>div>span{color:var(--dshi-muted);font-size:13px}.dshi-metrics strong{display:block;font-size:24px;letter-spacing:-.5px;margin-top:9px}.dshi-metrics small{font-size:12px;color:var(--dshi-muted);font-weight:400;margin-left:6px;white-space:nowrap}
.dshi-analysis-grid{display:grid;grid-template-columns:minmax(0,1fr) 255px;gap:16px;align-items:start}.dshi-panel{background:var(--dshi-bg);border:1px solid var(--dshi-line);border-radius:12px;padding:22px;min-width:0}.dshi-section-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:23px;flex-wrap:wrap}.dshi-section-head>.dshi-caption{text-align:right}.dshi-chart-scroll{overflow-x:auto;padding:4px 3px 6px;margin:0 -3px}.dshi-week-chart{min-width:455px}.dshi-week-row,.dshi-hour-axis{display:grid;grid-template-columns:42px repeat(24,minmax(0,1fr));gap:4px;align-items:center}.dshi-week-row{margin-top:5px}.dshi-day-label{font-size:12px;color:var(--dshi-muted)}.dshi-hour-axis{font-size:12px;color:var(--dshi-muted);margin-bottom:12px}.dshi-hour-axis>span{white-space:nowrap}.dshi-cell{aspect-ratio:1;min-height:13px;width:100%;padding:0;border:0;border-radius:3px}.dshi-page .l0{background:var(--dshi-heat-0)}.dshi-page .l1{background:var(--dshi-heat-1)}.dshi-page .l2{background:var(--dshi-heat-2)}.dshi-page .l3{background:var(--dshi-heat-3)}.dshi-page .l4{background:var(--dshi-heat-4)}.dshi-cell:hover{filter:brightness(.9)}.dshi-cell[aria-pressed=true],.dshi-month-day[aria-pressed=true]{outline:2px solid var(--dshi-accent);outline-offset:2px}.dshi-cell.has-unknown{box-shadow:inset 0 -2px var(--dshi-muted)}
.dshi-hour-bars{display:grid;grid-template-columns:repeat(24,minmax(0,1fr));gap:5px;min-width:455px;padding-top:4px}.dshi-hour-bar{border:0;background:none;padding:0;color:var(--dshi-muted);font-size:12px!important;text-align:left;min-width:0}.dshi-hour-bar>span:last-child{display:block;height:24px;white-space:nowrap;margin-top:8px}.dshi-bar-track{height:148px;display:flex;align-items:flex-end;border-bottom:1px solid var(--dshi-line);background:var(--dshi-soft);border-radius:3px 3px 0 0;overflow:hidden}.dshi-bar-track i{display:block;width:100%;background:var(--dshi-accent);opacity:.75;border-radius:3px 3px 0 0}.dshi-hour-bar:hover i,.dshi-hour-bar[aria-pressed=true] i{opacity:1}.dshi-hour-bar[aria-pressed=true] .dshi-bar-track{outline:2px solid var(--dshi-accent);outline-offset:1px}
.dshi-chart-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:18px;flex-wrap:wrap}.dshi-legend{display:flex;gap:4px;align-items:center;font-size:12px;color:var(--dshi-muted);white-space:nowrap}.dshi-legend i{width:10px;height:10px;border-radius:2px}.dshi-legend span:first-child{margin-right:3px}.dshi-legend span:last-child{margin-left:3px}.dshi-chart-detail{border-top:1px solid var(--dshi-line);margin-top:19px;padding-top:16px;display:grid;grid-template-columns:1.2fr 1fr 1fr 1fr;gap:8px}.dshi-chart-detail>div{min-width:0}.dshi-chart-detail strong{display:block;margin-top:5px;font-size:14px;overflow-wrap:anywhere}.dshi-chart-detail small{font-size:12px;font-weight:400;color:var(--dshi-muted)}
.dshi-month-weekdays,.dshi-month-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}.dshi-month-weekdays{font-size:12px;color:var(--dshi-muted);margin-bottom:10px;text-align:center}.dshi-month-day{border:1px solid var(--dshi-line);border-radius:6px;min-width:0;min-height:69px;padding:7px 5px;text-align:left;color:var(--dshi-text)}.dshi-month-day.l3,.dshi-month-day.l4{color:#fff}body[data-ds-dark-theme] .dshi-month-day.l3,body[data-ds-dark-theme] .dshi-month-day.l4{color:#101f18}.dshi-month-day>span:first-child{display:block;font-size:12px}.dshi-month-day>b{display:block;font-size:13px;letter-spacing:-.3px;margin:2px 0 5px}.dshi-micro-hours{display:grid;grid-template-columns:repeat(12,1fr);gap:1px}.dshi-micro-hours i{height:3px;border-radius:1px}.dshi-selected-hours{margin-top:18px;border-top:1px solid var(--dshi-line);padding-top:15px}.dshi-selected-hours>div{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-top:10px}.dshi-selected-hours>div>span{font-size:12px;color:var(--dshi-muted);background:var(--dshi-soft);padding:6px;border-radius:5px}.dshi-selected-hours b{display:block;color:var(--dshi-text)}.dshi-selected-hours small{font-size:12px}
.dshi-stacked-bar{height:12px;border-radius:4px;overflow:hidden;display:flex;background:var(--dshi-soft);margin:8px 0 24px;gap:2px}.dshi-tone-input{background:var(--dshi-accent)}.dshi-tone-output{background:var(--dshi-blue)}.dshi-tone-read{background:var(--dshi-teal)}.dshi-tone-write{background:var(--dshi-purple)}.dshi-token-list>div{display:grid;grid-template-columns:1fr auto 35px;gap:8px;align-items:center;margin-top:17px;font-size:13px}.dshi-token-list>div>span:first-child{display:flex;align-items:center;gap:8px}.dshi-token-list>div>span:last-child{text-align:right}.dshi-dot{display:inline-block;width:7px;height:7px;border-radius:2px;flex-shrink:0}.dshi-reasoning{margin-top:24px;padding-top:15px;border-top:1px solid var(--dshi-line)}.dshi-reasoning>div{display:flex;justify-content:space-between;font-size:13px}.dshi-reasoning p{margin-top:7px}
.dshi-details{margin-top:20px}.dshi-details .dshi-section-head{margin-bottom:12px}.dshi-table-scroll{overflow-x:auto}.dshi-table{width:100%;border-collapse:collapse;text-align:left;min-width:510px;font-size:14px}.dshi-table th{padding:11px 12px;background:var(--dshi-soft);font-size:12px;color:var(--dshi-muted);font-weight:500}.dshi-table th:first-child{border-radius:5px 0 0 5px}.dshi-table th:last-child{border-radius:0 5px 5px 0}.dshi-table td{padding:15px 12px;border-bottom:1px solid var(--dshi-line)}.dshi-table td:first-child{max-width:300px;overflow-wrap:anywhere}.dshi-table td:first-child>span{display:block;margin-top:3px}.dshi-table td:not(:first-child),.dshi-table th:not(:first-child){text-align:right}.dshi-table tbody tr:last-child td{border-bottom:0}.dshi-share{display:flex;gap:10px;align-items:center;justify-content:flex-end}.dshi-share>span:last-child{min-width:34px}.dshi-share-track{width:75px;height:5px;border-radius:4px;background:var(--dshi-soft);overflow:hidden}.dshi-share-track i{display:block;height:100%;background:var(--dshi-accent);border-radius:4px}.dshi-results{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;font-size:12px;color:var(--dshi-muted)}.dshi-success{color:var(--dshi-accent)}.dshi-failure{color:var(--dshi-error)}.dshi-table-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;border-top:1px solid var(--dshi-line);padding-top:14px;flex-wrap:wrap}.dshi-text-button{border:0;background:none;padding:6px 0;color:var(--dshi-accent);font-size:13px!important}
.dshi-coverage{display:flex;gap:28px;align-items:center;background:var(--dshi-soft);border-radius:9px;margin-top:20px;padding:18px 22px}.dshi-coverage-summary{display:grid;grid-template-columns:1fr auto;column-gap:20px;min-width:150px}.dshi-coverage-label{font-size:12px;color:var(--dshi-muted)}.dshi-coverage-summary strong{font-size:16px}.dshi-coverage-track{height:4px;margin-top:9px;background:var(--dshi-line);grid-column:1/-1;border-radius:3px;overflow:hidden}.dshi-coverage-track i{height:100%;display:block;background:var(--dshi-accent)}.dshi-coverage-copy{font-size:12px;color:var(--dshi-muted)}.dshi-coverage-copy p+p{margin-top:4px}.dshi-footer{display:flex;justify-content:space-between;gap:12px;margin-top:18px;color:var(--dshi-muted);font-size:12px;flex-wrap:wrap}
.dshi-notice{padding:14px 16px;background:var(--dshi-soft);border:1px solid var(--dshi-line);border-radius:9px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;gap:16px;font-size:13px}.dshi-notice p{margin-top:4px;font-size:12px}.dshi-notice.is-error{border-color:var(--dshi-error)}.dshi-loading,.dshi-empty{text-align:center;padding:64px 20px;color:var(--dshi-muted)}.dshi-loading strong,.dshi-empty strong{display:block;font-size:16px;color:var(--dshi-text);margin:14px 0 6px}.dshi-loading p,.dshi-empty p{font-size:13px}.dshi-loading-mark,.dshi-empty-symbol{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border:1px solid var(--dshi-line);border-radius:12px;color:var(--dshi-accent);font-size:24px}.dshi-empty{padding:32px 16px}
@container(max-width:850px){.dshi-analysis-grid{grid-template-columns:1fr}.dshi-composition .dshi-token-list{display:grid;grid-template-columns:1fr 1fr;gap:0 28px}.dshi-composition .dshi-section-head{margin-bottom:12px}.dshi-composition .dshi-stacked-bar{margin-bottom:5px}.dshi-composition .dshi-reasoning{margin-top:18px}.dshi-overview{padding:22px;gap:18px}.dshi-metrics{gap:10px}.dshi-metrics>div{padding-left:12px}}
@container(max-width:540px){.dshi-overview{grid-template-columns:1fr}.dshi-metrics{border-top:1px solid var(--dshi-line);padding-top:18px}.dshi-metrics>div:first-child{padding-left:0;border-left:0}.dshi-metrics strong{font-size:21px}.dshi-panel{padding:16px}.dshi-chart-detail{grid-template-columns:1fr 1fr;gap:14px}.dshi-top{align-items:flex-start}.dshi-top h1{font-size:22px}.dshi-top p{font-size:12px}.dshi-sync{font-size:12px}.dshi-segmented button{padding:7px 12px}.dshi-month-grid,.dshi-month-weekdays{gap:4px}.dshi-month-day{padding:5px 3px;min-height:64px}.dshi-micro-hours{display:none}.dshi-selected-hours>div{grid-template-columns:repeat(4,1fr)}.dshi-coverage{align-items:stretch;flex-direction:column;gap:12px;padding:16px}.dshi-composition .dshi-token-list{grid-template-columns:1fr}.dshi-notice{align-items:flex-start;flex-wrap:wrap}}
.dshi-nav>svg{display:none}.dshi-nav::before{content:"";display:block;width:16px;height:16px;flex:0 0 16px;background:center/contain no-repeat url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' rx='4' fill='%23e8f4ec'/%3E%3Crect x='3' y='9' width='2' height='2' rx='.5' fill='%2394c9a5'/%3E%3Crect x='7' y='6' width='2' height='2' rx='.5' fill='%2359a875'/%3E%3Crect x='11' y='3' width='2' height='2' rx='.5' fill='%23206e48'/%3E%3Cpath d='M3.5 6.5 7.5 9l5-5' fill='none' stroke='%23206e48' stroke-width='1.1' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")}body[data-ds-dark-theme] .dshi-nav::before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' rx='4' fill='%231a3d2c'/%3E%3Crect x='3' y='9' width='2' height='2' rx='.5' fill='%232a6b48'/%3E%3Crect x='7' y='6' width='2' height='2' rx='.5' fill='%233d9a64'/%3E%3Crect x='11' y='3' width='2' height='2' rx='.5' fill='%235ecf88'/%3E%3Cpath d='M3.5 6.5 7.5 9l5-5' fill='none' stroke='%235ecf88' stroke-width='1.1' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")}
`;
		function ensureUsageInsightsStyles() {
			if (document.getElementById("dsh-usage-analytics-style")) return;
			const style = document.createElement("style");
			style.id = "dsh-usage-analytics-style";
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
		//#region src/client/api.ts
		const root = "/dsh-usage-analytics/api";
		async function getSummary(range, signal) {
			const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
			const response = await fetch(`${root}/summary?range=${range}&timeZone=${encodeURIComponent(timeZone)}`, {
				cache: "no-store",
				credentials: "same-origin",
				...signal ? { signal } : {}
			});
			const body = await response.json();
			if (!response.ok || !body.ok || !body.value) throw new Error(body.error ?? "无法读取分析数据");
			return body.value;
		}
		async function rebuildIndex(signal) {
			if (!(await fetch(`${root}/rebuild`, {
				method: "POST",
				cache: "no-store",
				credentials: "same-origin",
				...signal ? { signal } : {}
			})).ok) throw new Error("无法启动重建");
		}
		//#endregion
		//#region src/client/useUsageInsights.ts
		/** Own request lifetimes here; presentation components never fetch. */
		function useUsageInsights(range) {
			const [stored, setStored] = (0, react.useState)();
			const [error, setError] = (0, react.useState)();
			const [loading, setLoading] = (0, react.useState)(true);
			const [rebuilding, setRebuilding] = (0, react.useState)(false);
			const [refresh, setRefresh] = (0, react.useState)(0);
			const rebuildRequest = (0, react.useRef)();
			const data = stored?.range === range ? stored : void 0;
			(0, react.useEffect)(() => {
				const controller = new AbortController();
				let timer;
				const poll = async () => {
					setLoading(true);
					try {
						const value = await getSummary(range, controller.signal);
						if (!controller.signal.aborted) {
							setStored(value);
							setError(void 0);
						}
					} catch (cause) {
						if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "无法读取分析数据");
					} finally {
						if (!controller.signal.aborted) {
							setLoading(false);
							timer = setTimeout(() => void poll(), 1e4);
						}
					}
				};
				setError(void 0);
				poll();
				return () => {
					controller.abort();
					clearTimeout(timer);
				};
			}, [range, refresh]);
			(0, react.useEffect)(() => () => rebuildRequest.current?.abort(), []);
			const reload = (0, react.useCallback)(() => setRefresh((value) => value + 1), []);
			return {
				data,
				error,
				loading,
				rebuilding,
				reload,
				rebuild: (0, react.useCallback)(async () => {
					if (rebuildRequest.current) return;
					const controller = new AbortController();
					rebuildRequest.current = controller;
					setRebuilding(true);
					try {
						await rebuildIndex(controller.signal);
						if (!controller.signal.aborted) reload();
					} catch (cause) {
						if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "无法启动重建");
					} finally {
						if (!controller.signal.aborted) setRebuilding(false);
						rebuildRequest.current = void 0;
					}
				}, [reload])
			};
		}
		//#endregion
		//#region src/client/UsageInsightsPage.tsx
		function SyncStatus({ data, rebuilding }) {
			const state = rebuilding ? "indexing" : data?.index.state;
			const label = state === "ready" ? "已同步" : state === "indexing" ? "正在同步" : state === "partial" ? "部分数据未同步" : state === "error" ? "同步失败" : "准备数据中";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: `dshi-sync ${state ?? "indexing"}`,
				role: "status",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {}), label]
			});
		}
		/** Pure page surface, shared by the host and the local fixture preview. */
		function UsageInsightsView({ range, data, error, loading, rebuilding, onRangeChange, onReload, onRebuild }) {
			const busy = rebuilding || data?.index.state === "indexing";
			const hasAttempts = Boolean(data && data.coverage.knownAttempts + data.coverage.unknownAttempts);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("main", {
				className: "dshi-page",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: "dshi-top",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dshi-title-row",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "dshi-brand-mark",
								"aria-hidden": "true",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {})
								]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", { children: "个人分析" })]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "本机使用记录 · 按自然日统计" })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SyncStatus, {
							data,
							rebuilding
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshi-toolbar",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshi-segmented",
							role: "group",
							"aria-label": "统计时间范围",
							children: Object.keys(rangeLabels).map((key) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": range === key,
								onClick: () => onRangeChange(key),
								children: rangeLabels[key]
							}, key))
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "dshi-button",
							disabled: busy,
							onClick: onRebuild,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								"aria-hidden": "true",
								children: "↻"
							}), busy ? "同步中…" : "重建统计缓存"]
						})]
					}),
					error && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshi-notice is-error",
						role: "alert",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: data ? "刷新未成功，当前显示上次数据" : "暂时无法读取分析数据" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: error })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dshi-button",
							onClick: onReload,
							disabled: loading,
							children: "重新加载"
						})]
					}),
					data?.index.state === "indexing" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshi-notice",
						role: "status",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "正在整理本机会话，统计会逐步更新。" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
							data.index.processedSessions,
							" / ",
							data.index.totalSessions
						] })]
					}),
					data?.index.state === "error" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshi-notice is-error",
						role: "alert",
						children: "统计同步失败，当前数据可能不完整。请尝试重建统计缓存。"
					}),
					!data ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshi-loading",
						"aria-busy": loading,
						role: "status",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dshi-loading-mark",
								"aria-hidden": "true",
								children: "▥"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: error ? "等待重新连接" : "正在整理你的使用记录" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: error ? "可以重新加载，也可以切换时间范围。" : "统计在本机完成，请稍候。" })
						]
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: "dshi-overview",
							"aria-label": "使用总览",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dshi-total",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "dshi-eyebrow",
										children: [rangeLabels[range], "总 Token"]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
										title: exact.format(data.totals.total),
										children: compact.format(data.totals.total)
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "dshi-caption",
										children: [exact.format(data.totals.total), " Token · 推理用量不重复累加"]
									})
								]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dshi-metrics",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "模型调用" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", { children: [exact.format(data.totals.modelCalls), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "次" })] })] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "技能调用" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", { children: [exact.format(data.totals.skillCalls), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "次" })] })] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "活跃天数" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", { children: [data.totals.activeDays, /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("small", { children: [
										"/ ",
										rangeDays[range],
										" 天"
									] })] })] })
								]
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dshi-analysis-grid",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ActivityChart, { data }, range), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TokenComposition, { tokens: data.totals })]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(UsageDetails, { data }, range),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: "dshi-coverage",
							"aria-label": "数据完整性",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dshi-coverage-summary",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dshi-coverage-label",
										children: "用量覆盖率"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: hasAttempts ? `${data.coverage.percent}%` : "—" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "dshi-coverage-track",
										"aria-hidden": "true",
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { style: { width: `${hasAttempts ? data.coverage.percent : 0}%` } })
									})
								]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dshi-coverage-copy",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: hasAttempts ? `已知用量 ${data.coverage.knownAttempts} 次 · 缺少用量 ${data.coverage.unknownAttempts} 次` : "暂无模型响应，覆盖率暂不计算。" }), (data.coverage.unreadableSessions > 0 || data.coverage.missingParents > 0 || data.index.state === "partial") && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
									className: "dshi-failure",
									children: [
										data.coverage.unreadableSessions > 0 ? `${data.coverage.unreadableSessions} 个会话无法读取。` : "",
										data.coverage.missingParents > 0 ? `${data.coverage.missingParents} 个父会话缺失。` : "",
										data.index.state === "partial" && !data.coverage.unreadableSessions ? "部分会话尚未同步，后台将自动重试。" : ""
									]
								})]
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", {
							className: "dshi-footer",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "仅保存在本机 · 不记录对话内容" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: loading ? "正在刷新…" : `更新于 ${new Date(data.generatedAt).toLocaleTimeString("zh-CN", {
								hour: "2-digit",
								minute: "2-digit"
							})}` })]
						})
					] })
				]
			});
		}
		function UsageInsightsPage() {
			(0, react.useEffect)(() => {
				ensureUsageInsightsStyles();
			}, []);
			const [range, setRange] = (0, react.useState)("7d");
			const state = useUsageInsights(range);
			const rebuild = () => {
				if (window.confirm("重新计算本插件的统计缓存，不会删除原始会话。是否继续？")) state.rebuild();
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UsageInsightsView, {
				range,
				...state,
				onRangeChange: setRange,
				onReload: state.reload,
				onRebuild: rebuild
			});
		}
		//#endregion
		//#region src/client/index.tsx
		const name = "dsh-usage-analytics-client";
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