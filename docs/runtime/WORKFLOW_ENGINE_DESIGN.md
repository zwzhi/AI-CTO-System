# Workflow Engine Design

Workflow Instance 含 ID、Intent、Execution Plan、Task、依赖、状态、预算、Approval、Evidence、Audit。

状态：`CREATED → PLANNING → WAITING_APPROVAL → EXECUTING → VALIDATING → COMPLETED`；任意非终态可 `PAUSED`，获授权后恢复；失败进入 `FAILED`，可逆任务进入 `ROLLING_BACK` 后 `CANCELLED` 或恢复；Kill Switch 可进入 `CANCELLED`。失败、暂停、恢复、回滚均记录原因、Evidence 与责任。
