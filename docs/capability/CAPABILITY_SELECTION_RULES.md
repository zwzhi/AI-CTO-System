# Capability 选择规则

## 1. 选择前提

AI CTO 只能从 Registry Status 为 `ACTIVE`、当前版本 Evaluation 有效、权限与项目范围匹配的 Capability 中选择。`DISCOVERED`、`EVALUATING`、`DEPRECATED`（新项目）、`DISABLED` 和 `REMOVED` 均不得成为新调用候选。

选择只产生 Selection Decision，不等于 Invocation Authorization。实际调用前仍须验证当前任务、环境、数据、权限、预算和副作用批准。

## 2. 五项选择依据

按以下顺序过滤：

1. **Current Phase：** Registry 的 Applicable Phase 是否覆盖当前 Lifecycle Stage / 工作阶段。
2. **Task Type：** Capability Type、Input / Output 与任务是否匹配。
3. **Risk Level：** 能力风险是否低于项目允许上限，红线是否关闭。
4. **Permission：** 当前主体、项目和环境是否拥有最小必要权限。
5. **Project Requirement：** Requirement、Architecture、数据、安全、成本、时延、地域、License 和验收条件是否满足。

任一硬条件不满足时从候选集中排除，不用高 Quality Score 抵消。

## 3. 阶段与类型映射

| Current Stage / Task | 优先匹配类型 | 示例目的 |
|---|---|---|
| IDEA / RESEARCH | Research、Documentation、Data | 调研、来源验证、信息整理 |
| EVALUATION | Research、Data、AI Model | 价值、成本、可行性与证据分析 |
| DESIGN | Engineering、Documentation、Data、Security | PRD、架构、数据和安全设计支持 |
| DEVELOPMENT | Engineering Capability | Planning、TDD、Debugging、Code Review |
| TESTING | Testing、Security、AI Model | 测试执行、安全检查、AI 效果评测 |
| RELEASE | Deployment、Security Capability | 构建、部署、回滚和发布核验 |
| MAINTENANCE / EVOLUTION | Engineering、Testing、Security、Data、Research | Incident、债务、趋势和升级分析 |

类型映射是候选筛选，不授予跨阶段状态转换。

## 4. 候选排序

硬条件通过后，按任务适配度、Quality Score、Confidence、稳定性、成本、时延、可用性、复用价值、维护状态和替换难度排序。90–100 分能力可以成为默认候选，但只有在用途、权限和风险范围完全一致时才可默认选择。

分数相近时优先：权限更小、依赖更少、可替换性更好、已有项目证据更多、成本更低且维护更活跃的能力。选择理由和未选候选必须可追溯。

## 5. Fallback 与降级

每项关键调用必须定义无能力、超时、失败、限流、质量下降、权限撤销和供应商不可用时的行为。Fallback 也必须是 `ACTIVE` 且当前授权有效；不得在主能力失败后绕过 Registry 临时调用未评估工具。

没有安全 Fallback 时停止、转人工或返回前序阶段。降级不得静默降低安全、数据、质量或用户批准条件。

## 6. Selection Record

每次高风险、生产、写入或有外部副作用的选择至少记录：Project / Task、Current Stage、Requirement、Candidates、Selected Capability / Version、Type、Quality / Confidence、Risk、Permissions、Data、Cost、Fallback、Reason、Human Approval、Invocation Scope、Result 和 Evidence。

低风险重复调用可以批量记录，但必须能追溯到相同的 Registry、版本、授权和策略基线。
