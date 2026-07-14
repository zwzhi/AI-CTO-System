# ADR-0023：Single Agent Runtime 先实现确定性 Planner

## 状态

Accepted — 仅限 Phase 9C-4 Single Agent Runtime Implementation Design。

## 背景

Phase 9C-3 已定义 Planner-first Agent Contract：Planner 只生成 Proposed Execution Plan + Evidence，默认受 `CONFIRM` 控制，Workflow Engine 独占 `WAITING_APPROVAL` 和后续状态。当前 Runtime Foundation 仍是本地、In-memory、Mock-only MVP，且没有真实 Agent、模型、工具、Codex/MCP 或自动执行。

## 决策

未来第一个可实现 Agent Runtime 闭环采用 `PlannerAgentPort → DeterministicPlanner`。DeterministicPlanner 基于明确、固定输入和封闭模板生成可预测、版本化的 `ExecutionPlan` Contract，并返回 Evidence。`ExecutionPlan` 必须包含 `planner_version` 和 `plan_schema_version`，状态固定为 `PROPOSED`，随后仅由 Workflow Engine 写入 Audit 并进入 `WAITING_APPROVAL`。

## 后果

该选择首先验证 AgentTask、Port/Adapter、版本化 Plan、权限/预算、审计和确认屏障，而非验证模型能力。代价是 Planner 的表达能力受模板限制，且本阶段不包含 LLM、网络、工具、真实 Agent、多 Agent、自动执行、持久化或生产能力。

## 替代方案

1. 直接接入 LLM Planner：拒绝，模型质量、成本、提示、网络、数据和安全变量会掩盖 Runtime 合同验证。
2. 只定义 Port 而没有本地 Planner：拒绝，不能验证 Agent Runtime 的端到端控制闭环。
3. 让 Planner 计划后自动执行：拒绝，违反 Phase 9C-3 的 `CONFIRM`、`WAITING_APPROVAL` 与 Control Plane First 边界。

## 相关文档

- [Implementation Design](../runtime/SINGLE_AGENT_RUNTIME_IMPLEMENTATION_DESIGN.md)
- [Agent Task Model](../runtime/AGENT_TASK_MODEL.md)
- [Planner Implementation Design](../runtime/PLANNER_AGENT_IMPLEMENTATION_DESIGN.md)
- [Implementation Gate](../runtime/SINGLE_AGENT_IMPLEMENTATION_GATE.md)
