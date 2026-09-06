# Changelog

本插件版本演进记录。版本号遵循语义化版本（SemVer）。

## [0.2.1] - 2026-09-07

### Changed

- 插件由 `dsh-usage-insights` 更名为 `dsh-usage-analytics`（npm 已存在同名包，为后续发布避让）；GitHub 仓库、cordis 插件名与 API 前缀同步更名。存储域名 `usage_insights`、设置分区「个人分析」与本地统计缓存不受影响。

### Fixed

- 「Token 构成」缓存读取色块由写死的浅色改为主题变量（`--dshi-teal`），深色模式下对比度恢复正常。
- README 恢复发布包 SHA-256 校验说明（校验值随各 Release 说明发布）。
- 移除仓库内已过时的内部评审文档 `CODE_REVIEW.md`。

## [0.2.0] - 2026-09-05

- 重构个人分析界面：总览、可选时段图表、Token 构成、模型/技能完整明细和覆盖率分层展示。
- 新增模拟数据本地预览，覆盖主题、窄屏和异常状态；数据请求逻辑拆分为独立 Hook。
- 修复零 Token 响应覆盖率、重复终止块、流中断用量回退及原生显式技能事件漏计。
- 串行处理索引写入与重建，读取落盘事件，定期重试与清理过期明细，自动刷新旧规则缓存。
- 汇总复用时区格式器；切换窗口取消旧请求，轮询等待请求完成再计时。
- 加强 Host / Origin 格式校验，打包前自动运行完整检查与构建。

## [0.1.1] - 2026-09-04

### Fixed

- 个人分析页跟随 DSH Appearance 的 Light / Dark / System：样式改读官方 `--dsw-alias-*` token，热力图与导航图标用 `body[data-ds-dark-theme]` 分档，不再钉死浅色 fallback。

### Changed

- 客户端类名前缀由 `.ui-*` 改为 `.dshi-*`，避免与宿主设置页撞车。
- README / LICENSE / `package.json` 补齐收录所需元数据（author、repository、安装路径、版权人）。

## [0.1.0] - 2026-09-04

首发。在「设置 → 个人分析」展示 1 / 7 / 30 天 Token 热力图、Token 分类、模型分布和技能调用状态。派生索引最长保留 90 天；重建缓存不删除原始会话。
