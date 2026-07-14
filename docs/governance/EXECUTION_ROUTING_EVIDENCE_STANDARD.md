# Execution Routing Evidence Standard

## 目的

Execution Routing Evidence 用于评估路由建议是否改善质量、时延、成本、Token 使用、人工交互和风险控制，并为未来 Evolution 提供可复核输入。它不等于授权、能力激活或自动化规则。

## 必填记录

| 字段 | 说明 |
|---|---|
| Task Type | 任务意图与类别。 |
| Complexity | L0–L4、判定依据与升级条件。 |
| Workflow | 建议与实际使用的 Workflow，及差异原因。 |
| Skill / Tool | 建议与实际调用的类别、必要性、权限和副作用。 |
| Model / Reasoning | 模型类别、R0–R4、选择理由与实际差异。 |
| Context | 建议 / 实际上下文范围、来源、敏感性与排除项。 |
| Duration | 端到端时间及采集方式；未采集为 `NOT_CAPTURED`。 |
| Token | 输入 / 输出 / 总量及采集方式；未采集为 `NOT_CAPTURED`。 |
| Quality | 验收、返工、错误、用户反馈或测试 Evidence。 |
| Cost / Risk / Interaction | 成本、风险事件、人工确认次数、阻塞与回滚情况。 |
| Evidence / Confidence | 来源、完整度、L1–L4 Confidence、适用范围与限制。 |

## 质量与使用规则

1. 事实、推断、建议与未知必须分开记录；未知不用估算值填充。
2. 单案例只能形成假设，不能自动改变默认 Workflow、Skill、Tool、Model、Reasoning、Context 或用户偏好策略。
3. 对比实验必须定义可比较的任务类型、质量标准、成本、时延、风险和人工干预边界。
4. 只有多个案例、足够 Evidence 和适用治理审查后，才能提出 Evolution Proposal；仍需用户审批和适用 Gate。

## EFF-001 的状态

[EFF-001](./execution_cases/EFF-001-phase-8-4-route-sync-review.md) 是 `Governance Documentation Sync` 的单一真实案例，Confidence 为 `L3 / 中等`，其中 Duration、Token、精确成本、内部推理和工具调用次数为 `NOT_CAPTURED`。它支持“需要路由治理并继续收集案例”的假设，不支持默认自动路由、流程跳过、模型切换或 Git 偏好自动应用。
