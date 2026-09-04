# Changelog

本插件版本演进记录。版本号遵循语义化版本（SemVer）。

## [0.1.1] - 2026-09-04

### Fixed

- 个人分析页跟随 DSH Appearance 的 Light / Dark / System：样式改读官方 `--dsw-alias-*` token，热力图与导航图标用 `body[data-ds-dark-theme]` 分档，不再钉死浅色 fallback。

### Changed

- 客户端类名前缀由 `.ui-*` 改为 `.dshi-*`，避免与宿主设置页撞车。
- README / LICENSE / `package.json` 补齐收录所需元数据（author、repository、安装路径、版权人）。

## [0.1.0] - 2026-09-04

首发。在「设置 → 个人分析」展示 1 / 7 / 30 天 Token 热力图、Token 分类、模型分布和技能调用状态。派生索引最长保留 90 天；重建缓存不删除原始会话。
