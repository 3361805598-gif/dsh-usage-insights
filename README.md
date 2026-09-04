# dsh-usage-insights

DeepSeek Harness 的本机个人分析插件：在「设置 → 个人分析」展示 1 天、7 天、30 天 Token 热力图、Token 分类、模型分布和技能调用状态。

## 功能

- 设置页新增「个人分析」分区，按 1 / 7 / 30 天切换统计窗口；
- Token 使用热力图（按本机时区归类），以及输入 / 输出 / 缓存读取 / 缓存写入 / 推理（输出子集）拆分；
- 模型分布：按模型响应汇总调用次数与 Token；
- 技能调用：自动与显式调用均计入，展示调用次数与成功率；
- 「重建统计缓存」只删除本插件的派生索引，再从原始 DSH 会话重新归集。

## 数据边界

插件只写入自己的派生索引（时间戳、数值型 Token 用量、模型标识、技能名、调用来源和结果）。不写入提示词、模型回复、工具参数、工具结果、工作目录或密钥。索引最多保留 90 天；「重建统计缓存」只删除该派生索引，然后从原始 DSH 会话重新归集，绝不删除会话。

## 依赖

- DSH web profile；
- 目标运行时为 `@deepseek-ai/dsh@0.1.1-rc.2` 的 Web 平台。

## 安装

前置：Node ≥ 20，`dsh web` 可正常运行。

### 安装发布版（推荐）

```sh
curl -L -o dsh-usage-insights-0.1.1.tgz \
  https://github.com/3361805598-gif/dsh-usage-insights/releases/download/v0.1.1/dsh-usage-insights-0.1.1.tgz
shasum -a 256 dsh-usage-insights-0.1.1.tgz

mkdir -p ~/.dsh/profiles/web/vendor
cp dsh-usage-insights-0.1.1.tgz ~/.dsh/profiles/web/vendor/
dsh plugin --profile web add file:vendor/dsh-usage-insights-0.1.1.tgz
```

安装后重启 `dsh web`，再硬刷新浏览器（Cmd/Ctrl+Shift+R）。

`v0.1.1` 安装包的 SHA-256 应为：

```text
26a949fc51c8f0189142d2a747df5b9966caad763cb05175d76d5f921f01f1e4
```

### 从源码打包

```sh
npm install
npm run check
npm run pack         # 产出 dist/dsh-usage-insights-<version>.tgz

cp dist/dsh-usage-insights-<version>.tgz ~/.dsh/profiles/web/vendor/
dsh plugin --profile web add file:vendor/dsh-usage-insights-<version>.tgz
```

安装后重启 `dsh web`，再硬刷新浏览器。

## 更新

改完代码后：`npm run pack` → 把 tgz 放入 `~/.dsh/profiles/web/vendor/`（逐版本留档、不覆盖旧包）→ 重新执行 `dsh plugin --profile web add file:vendor/...` → 重启 `dsh web` + 硬刷新。

## 开发与测试

```sh
npm install
npm run check        # typecheck + vitest + build
```

安装到 DSH 时使用包根目录的 `cordis.patch.yml`；客户端包入口为 `dsh-usage-insights/client`。

## 统计口径

- `input + output + cache read + cache write` 是总 Token；`reasoning` 是输出子集，只展示、不重复累加。
- 有 DSH `TokenUsage` 的响应为「已知」；缺少用量不估算，计入覆盖率的「缺少用量」。
- fork / subagent 会跳过 `seedLength` 指明的继承事件，避免父会话重复计算。
- 自动技能依据 `skill` 工具的调用/结果配对；用户显式技能调用单列为「显式」。

## 说明与限制

- 仅 Web 平台。样式跟随 DSH Appearance（Light / Dark / System），读取官方 `--dsw-alias-*` token。
- API 受本机同源 trust-fence 保护；`POST /rebuild` 在 fence 之外没有额外鉴权。
- UI 为全中文，无 i18n 层（个人插件定位）。

## 卸载

```sh
dsh plugin --profile web remove dsh-usage-insights
```

然后重启 `dsh web`。
