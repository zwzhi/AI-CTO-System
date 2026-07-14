# Runtime MVP 数据模型

## 实体

| 实体 | 关键字段 | 状态 / 关系 |
|---|---|---|
| Workflow Instance | `workflow_id`、`intent_ref`、`state`、`control_mode`、`budget_ref`、`created_at`、`updated_at` | 一对一拥有一个 Task；状态见下文。 |
| Task | `task_id`、`workflow_id`、`task_type`、`input_ref`、`state`、`result_ref` | 属于一个 Workflow；MVP 只允许一个。 |
| Execution Record | `execution_id`、`task_id`、`status`、`started_at`、`ended_at`、`result_ref` | 记录一次 Mock 执行。 |
| Approval Record | `approval_id`、`subject_id`、`control_mode`、`decision`、`actor`、`timestamp` | 对 `CONFIRM` 或 `BLOCK` 的控制结论。 |
| Capability Invocation | `invocation_id`、`task_id`、`adapter_id`、`status`、`input_ref`、`result_ref`、`budget_usage` | 只能引用 Mock Adapter。 |
| Audit Event | `audit_id`、`workflow_id`、`task_id`、`intent`、`capability`、`status`、`result`、`timestamp` | 追加式 Evidence；可关联其他实体。 |

## Workflow 状态

`CREATED`、`PLANNING`、`WAITING_APPROVAL`、`EXECUTING`、`VALIDATING`、`COMPLETED`、`FAILED`、`ROLLBACK`、`PAUSED`、`CANCELLED`。

MVP 正常路径使用 `CREATED → PLANNING → EXECUTING → VALIDATING → COMPLETED`。`FAILED`、`CANCELLED` 与完成后的 `ROLLBACK` 为受控终态；`PAUSED` 只能经授权恢复。MVP 不实现真实回滚动作，只记录需要回滚的状态与 Evidence。

## 关系与数据约束

1. 一个 Workflow 必须有一个 Intent 引用和最多一个 Task。
2. 一个 Task 最多有一次 Mock Capability Invocation；失败不得自动切换真实 Capability。
3. 每次状态变化、控制决定与 Invocation 结局必须有 Audit Event。
4. Audit 中不得写入 API Key、Secret、原始敏感配置或未经脱敏的用户数据。
