# Runtime API Contract

## 合同边界

下列为未来服务接口的技术栈中立合同，并非 HTTP、RPC、框架或可调用实现。所有输入均只使用受控引用和安全文本；禁止包含 API Key、Secret、未脱敏配置或敏感用户数据。

```text
WorkflowService.create(input: CreateWorkflowInput) -> CreateWorkflowOutput
WorkflowService.get(query: WorkflowQuery) -> WorkflowView
WorkflowService.transition(command: TransitionWorkflowCommand) -> TransitionWorkflowOutput

TaskService.create(input: CreateTaskInput) -> CreateTaskOutput
TaskService.get(query: TaskQuery) -> TaskView

CapabilityAdapter.invoke(request: CapabilityRequest) -> CapabilityResult
PermissionBudgetGuard.evaluate(request: GuardRequest) -> GuardDecision
AuditPort.append(event: AuditEvent) -> AuditReceipt
AuditPort.list(query: AuditQuery) -> AuditEvent[]
```

## 输入与输出定义

| 合同 | 最小输入 | 最小输出 | 边界 |
|---|---|---|---|
| `WorkflowService.create` | `intentRef`、`executionContext`、`controlMode`、`budget` | `workflowId`、`state=CREATED`、Audit 引用 | 不创建 Task 或调用能力。 |
| `WorkflowService.transition` | `workflowId`、目标状态、原因、Guard 引用 | 新状态、Audit 引用或拒绝原因 | 只校验状态，不执行 Capability。 |
| `TaskService.create` | `workflowId`、`taskType`、`input` | `taskId`、Task View | 已有 Task 时必须拒绝。 |
| `CapabilityAdapter.invoke` | `taskId`、`adapterId=Mock`、Context 引用、Budget Snapshot | `CapabilityResult` | 不直接调用具体工具。 |
| `PermissionBudgetGuard.evaluate` | 动作、权限范围、预算使用、控制模式 | `GuardDecision`、原因、约束引用 | 不替代业务审批或 Gate。 |
| `AuditPort.append` | `AuditEvent` | `auditId`、`timestamp` | 追加，不覆盖历史。 |

## Guard 结论

`GuardDecision` 只允许 `ALLOW`、`CONFIRM_REQUIRED`、`DENY`。`ALLOW` 仍必须通过适用状态转换；`CONFIRM_REQUIRED` 进入 `WAITING_APPROVAL`；`DENY`、用户取消或预算超限不得创建可执行 Invocation。Capability Result 必须携带 Evidence、Confidence 和 Timestamp，供 Audit 记录与未来受控 Knowledge 回写评估使用。
