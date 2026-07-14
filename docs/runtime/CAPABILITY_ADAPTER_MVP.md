# Capability Adapter MVP

## 定位

Runtime 仅通过 Adapter Contract 调用能力。Phase 9B 的唯一候选是概念性的 `Mock Capability Adapter`，不连接 Codex、MCP 或任何外部工具。

## 合同

| 输入 | 输出 | 约束 |
|---|---|---|
| `invocation_id`、`task_id`、`adapter_id`、`input_ref`、`permission_scope`、`budget_ref` | `status`、`result_ref`、`evidence_ref`、`error`、`budget_usage` | Adapter 必须先通过 Permission 与 Budget 检查；只返回模拟结果。 |

## 调用规则

1. Workflow Engine 创建 Invocation，Runtime 记录预算和控制上下文。
2. Adapter 只接受已授权的单一 Task，且必须返回可审计结局。
3. Invocation 失败后不得直接调用其他 Adapter、真实工具或无界重试。
4. 将来接入 Codex、GitHub、MCP、文件系统、浏览器、数据库或部署工具时，必须重新完成 Capability Admission、Adapter 设计、安全审查与适用 Gate。
