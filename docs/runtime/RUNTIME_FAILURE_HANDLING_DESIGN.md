# Runtime 失败处理设计

## 原则

失败处理首先停止扩大影响，再保留可追溯 Evidence。它不自动重试、替换能力、增加预算、修改项目状态或绕过人类审批与 Gate。

| 情况 | 触发 | 状态转换 | 必须动作 | 恢复条件 |
|---|---|---|---|---|
| Capability 失败 | Mock 返回 `FAILURE`。 | `EXECUTING → FAILED` | 记录 Invocation、错误摘要、Evidence 与 Audit；停止调用。 | 未来必须有独立授权；本 MVP 无自动重试。 |
| Task 失败 | 输入、状态或 Guard 合同不成立。 | 当前非终态 → `FAILED` | 记录失败原因，不创建新 Task。 | 需重新评估输入、状态和人类决策。 |
| Workflow 失败 | 生命周期转换或核心合同无法维持。 | 当前非终态 → `FAILED` | 停止编排并写入 Audit。 | 需人工评估后创建新的受控路径。 |
| 预算超限 | Token、工具、时间或成本任一超过限制。 | `EXECUTING → PAUSED` 或 `CANCELLED` | 阻止新增 Invocation，写入用量与 Evidence。 | 重新通过 Budget Guard；不得自动扩大预算。 |
| 用户取消 | 用户或 Kill Switch 请求停止。 | 任意非终态 → `CANCELLED` | 阻止后续调用，记录取消人、时间与 Evidence。 | 不自动恢复；需新的明确授权。 |
| 回滚需要 | 已批准的未来动作被标记需撤销。 | 适用状态 → `ROLLING_BACK` | 记录待回滚对象、原因与 Evidence。 | 本阶段不执行真实回滚。 |

`PAUSED` 不是成功也不是授权等待的替代品；恢复前必须重新检查 Permission、Budget、Control Mode 和适用审批。`ROLLING_BACK` 只描述状态与审计语义，不能被解释为已有回滚实现。
