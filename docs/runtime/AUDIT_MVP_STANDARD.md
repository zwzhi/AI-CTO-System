# Audit MVP 标准

## 必填记录

每个 Workflow 的创建、状态变化、控制决定、Mock Capability Invocation 与结局至少记录：

| 字段 | 说明 |
|---|---|
| Workflow ID | 唯一 Workflow 标识。 |
| Task ID | 唯一关联 Task 标识。 |
| Intent | 输入 Intent 或其受控引用。 |
| Capability | `Mock Capability Adapter` 标识。 |
| Status | 事件发生后的状态。 |
| Result | 结果引用、失败原因或取消 / 超限原因。 |
| Timestamp | 使用一致时区和格式的记录时间。 |

## 规则

- Audit Event 为追加式 Evidence；更正通过新事件表达，不能静默覆盖历史。
- 记录必须关联 Workflow 和 Task，并与 Execution Record、Approval Record 或 Invocation 可追溯对应。
- 不记录 API Key、Secret、原始敏感配置和未脱敏敏感数据。
- 审计不构成 Gate 批准、业务决策或生产执行授权。
