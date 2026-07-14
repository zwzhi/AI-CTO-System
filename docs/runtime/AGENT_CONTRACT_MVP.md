# Agent Contract MVP

## 定位

MVP 只定义未来 Agent 合同，**不创建、不实例化也不调度真实 Agent**。所有未来 Agent 任务必须由 Workflow Engine 创建和流转；Agent 之间禁止直接调用。

## 合同字段

| 区域 | 最小字段 | 规则 |
|---|---|---|
| Agent Input | `task_id`、`task_type`、`input_ref`、`context_refs`、`control_mode` | 输入必须来自被授权的 Workflow Task。 |
| Agent Output | `status`、`result_ref`、`evidence_refs`、`error` | 输出不能直接改变 Gate 或核心治理文件。 |
| Permission | `permission_scope`、`allowed_actions`、`denied_actions` | 仅允许 Task 明确授予的最小权限。 |
| Budget | `token_limit`、`tool_limit`、`time_limit`、`cost_limit`、`retry_limit` | 预算由 Runtime Budget Governance 继承，超限即停止。 |
| Status | `NOT_IMPLEMENTED` | Phase 9B 仅有合同，不表示 Agent 已存在或可执行。 |

## 禁止事项

- Agent 直接调用 Agent，或绕过 Workflow Engine、Approval、Permission、Budget 与 Audit。
- 修改 Manifesto、ADR、Master Plan 或绕过项目 Gate。
- 将 Knowledge Candidate 直接提升为 `ACTIVE`，或调用真实工具和生产环境。
