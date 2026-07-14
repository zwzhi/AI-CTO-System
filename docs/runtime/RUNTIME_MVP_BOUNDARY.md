# Runtime MVP 边界

## 包含

| 范围 | MVP 约束 |
|---|---|
| Workflow | 单 Workflow、单 Task、受限状态转换。 |
| Task | 有唯一 ID、输入、状态、Result 与关联 Evidence。 |
| Capability | 仅 Mock Capability，经 Adapter Contract 表达。 |
| Control | `AUTO`、`CONFIRM`、`BLOCK`。 |
| Guardrail | Permission、Token / 工具 / 时间 / 成本预算检查与重试限制。 |
| Audit | 最小执行证据的追加式记录。 |

## 明确不包含

- 多 Agent 自主协作、Agent 到 Agent 的直接调用或复杂 Agent Loop。
- 自动代码修改、自动部署、生产环境执行、真实外部工具或服务调用。
- Codex、MCP、GitHub、浏览器、数据库或部署系统接入。
- 自动模型切换、无限递归、无限重试、预算自动增加或绕过人工控制。

## 边界原则

MVP 只验证 Control Plane 是否能约束一次模拟执行。它不拥有项目价值、架构、Gate、发布或风险接受的最终决策权；这些权威仍归属既有 Layer 与人工审批机制。
