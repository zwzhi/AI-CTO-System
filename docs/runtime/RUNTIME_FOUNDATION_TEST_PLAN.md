# Runtime Foundation 测试方案

测试方案只定义未来测试合同，不创建测试代码，也不运行真实 Agent、模型、工具、生产环境或外部服务。

| 测试类型 | 对象 | 前置 | 关键断言 |
|---|---|---|---|
| Unit Test | Workflow State Machine | 新建单一 Workflow。 | 合法转换被允许，非法转换被拒绝，每次转换记录 Audit。 |
| Unit Test | Task Engine | 已有 Workflow。 | 能创建一个 Task；第二个 Task 被拒绝；输入输出关联正确。 |
| Unit Test | Permission / Budget Guard | 已定义动作和预算。 | 输出仅为 `ALLOW`、`CONFIRM_REQUIRED`、`DENY`；超限不被允许。 |
| Unit Test | Evidence Contract | 构造 Capability Result。 | 每个 Evidence 有来源、摘要、Confidence、Timestamp，且不含敏感信息。 |
| Integration Test | Workflow → Task → Mock Adapter → Audit | Guard 允许且有单 Task。 | 返回 Result + Evidence，生成 Invocation、Execution Record 和 Audit Event。 |
| Failure Test | Capability / Task / Workflow 失败 | 构造受控失败。 | 进入 `FAILED`，不自动重试、换 Adapter 或创建新 Task。 |
| Failure Test | 取消与超限 | 用户取消或预算不足。 | 进入 `CANCELLED` 或 `PAUSED`，阻止后续调用，不自动加预算。 |
| Audit Test | 执行记录完整性 | 任一关键事件。 | Workflow ID、Task ID、Intent、Capability、Status、Result、Timestamp 与 Evidence 可追溯。 |

## 验收场景

1. 正常完成：`CREATED → PLANNING → EXECUTING → VALIDATING → COMPLETED`。
2. Capability 失败：进入 `FAILED` 并记录安全错误与 Evidence。
3. 用户取消：进入 `CANCELLED` 并阻止新 Invocation。
4. 预算超限：进入 `PAUSED` 或 `CANCELLED`，恢复前必须重新通过 Guard 与适用确认。
5. 回滚标记：需要回滚时进入 `ROLLING_BACK` 并记录原因；不得执行真实回滚。
