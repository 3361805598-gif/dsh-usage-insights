# DSH Usage Insights

DeepSeek Harness 的本机个人分析插件：在“设置 → 个人分析”展示 1 天、7 天、30 天 Token 热力图、Token 分类、模型分布和技能调用状态。

## 数据边界

插件只写入自己的派生索引（时间戳、数值型 Token 用量、模型标识、技能名、调用来源和结果）。不写入提示词、模型回复、工具参数、工具结果、工作目录或密钥。索引最多保留 90 天；“重建统计缓存”只删除该派生索引，然后从原始 DSH 会话重新归集，绝不删除会话。

## 开发

```sh
cd /Users/zhihao/Desktop/AGENT测试/DSH/dsh-usage-insights
npm install
npm run check
```

目标运行时为 `@deepseek-ai/dsh@0.1.1-rc.2` 的 Web 平台。安装到 DSH 时使用包根目录的 `cordis.patch.yml`；客户端包入口为 `dsh-usage-insights/client`。

## 统计口径

- `input + output + cache read + cache write` 是总 Token；`reasoning` 是输出子集，只展示、不重复累加。
- 有 DSH `TokenUsage` 的响应为“已知”；缺少用量不估算，计入覆盖率的“缺少用量”。
- fork / subagent 会跳过 `seedLength` 指明的继承事件，避免父会话重复计算。
- 自动技能依据 `skill` 工具的调用/结果配对；用户显式技能调用单列为“显式”。
