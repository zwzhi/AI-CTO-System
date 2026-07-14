# Phase 9B Runtime MVP Scope Design

## 目标

定义第一个可验证 Runtime 基础闭环：`User Request → Intent Result → Workflow Instance → Task → Mock Capability → Result → Audit Evidence`。MVP 验证 Runtime 的控制、状态、权限、预算和审计合同，不是完整 AI CTO，也不验证真实 Agent 或工具能力。

## MVP 范围

仅支持单 Workflow、单 Task、Mock Capability、单一结果、Audit Evidence 和 Human Control 三分类：`AUTO`、`CONFIRM`、`BLOCK`。核心实体为 WorkflowInstance、Task、ExecutionRecord、ApprovalRecord、CapabilityInvocation、AuditEvent。

不包含多 Agent 自主协作、自动代码修改、自动部署、复杂工具调用、生产环境执行、Codex/MCP 接入、真实 Agent、自动执行、复杂循环或递归调用。

## 控制约束

Mock Capability 必须经 Capability Adapter Contract；Runtime 不直接调用工具。预算继承 Token、工具调用、时间、成本与重试限制。`BLOCK` 用于真实工具、生产环境、权限提升、代码修改或不满足审批条件的操作。

## Success Criteria

1. 可创建 Workflow 与唯一 Task，并记录关联 Intent。
2. 状态可按受限状态机推进并保留状态转换 Evidence。
3. Mock Capability 只经 Adapter Contract 被调用，生成受控 Result。
4. 每次执行生成最小 Audit：Workflow ID、Task ID、Intent、Capability、Status、Result、Timestamp。
5. 失败、取消和预算超限被安全停止、记录并进入正确终态，不绕过 Approval 或预算。

## Failure Scenarios

| 场景 | 预期状态 / 行为 |
|---|---|
| 正常完成 | `CREATED → PLANNING → EXECUTING → VALIDATING → COMPLETED`，写 Result 与 Audit。 |
| Capability 失败 | 停止 Task，写失败 Evidence 与 Audit，状态 `FAILED`；不自动调用真实替代工具。 |
| 用户取消 | 阻断新调用，状态 `CANCELLED`，保留 Audit；可逆时按合同安全停止。 |
| 预算超限 | 停止 / 暂停 Mock Invocation，状态 `PAUSED` 或 `CANCELLED`，写预算 Evidence；不自动扩大预算。 |

## 明确排除

不开发 Runtime 代码，不接入 Codex/MCP，不创建真实 Agent，不调用外部工具，不实现自动执行或进入生产环境。

## 后续文档

Phase 9B 将建立 MVP Scope、Boundary、Data Model、Workflow、Agent Contract、Adapter、Human Control、Audit、Technical Constraints、Implementation Plan 与 ADR-0019，并同步入口；不进入 Runtime 代码开发。
