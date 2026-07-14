# Human Control MVP

## 三类控制

| 模式 | MVP 适用情况 | 行为 |
|---|---|---|
| `AUTO` | 无副作用的 Mock Capability 与低风险状态推进。 | 在预算和 Permission 通过后执行，保留 Audit。 |
| `CONFIRM` | 用户需要确认开始、恢复或接受指定模拟 Result。 | 进入 `WAITING_APPROVAL`；未批准不得执行。 |
| `BLOCK` | 真实工具、生产操作、权限提升、代码修改、超出预算或违反治理边界。 | 不创建可执行调用，记录阻断理由。 |

## 不可覆盖的边界

`AUTO` 不是永久授权；用户取消、Kill Switch、预算超限、安全规则、项目 Gate 与更高等级人工批准均可停止执行。MVP 不把所有行为设计为人工审批，也不允许任一控制模式越过既有治理权威。
