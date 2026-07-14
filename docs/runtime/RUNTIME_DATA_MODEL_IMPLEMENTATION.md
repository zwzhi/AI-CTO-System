# Runtime Foundation 核心数据模型

## Entity 字段

| Entity | 字段 | Pseudo Type | 用途与关系 |
|---|---|---|---|
| WorkflowInstance | `workflowId` | `WorkflowId` | 唯一标识；拥有最多一个 Task。 |
| WorkflowInstance | `intentRef`、`executionContext` | `IntentResultRef`、`ExecutionContext` | 关联意图与受控上下文引用。 |
| WorkflowInstance | `state`、`controlMode`、`budget` | `WorkflowState`、`ControlMode`、`BudgetSnapshot` | 表示生命周期与执行约束。 |
| WorkflowInstance | `createdAt`、`updatedAt` | `Timestamp` | 可追溯时间。 |
| Task | `taskId`、`workflowId`、`taskType` | `TaskId`、`WorkflowId`、`TaskType` | 唯一 Task 与所属 Workflow。 |
| Task | `input`、`state`、`result` | `TaskInput`、`TaskState`、`CapabilityResult?` | 描述任务输入、状态与受控结果。 |
| ExecutionRecord | `executionId`、`workflowId`、`taskId`、`status` | 引用类型、`ExecutionStatus` | 记录一次执行尝试。 |
| ExecutionRecord | `startedAt`、`endedAt`、`resultRef` | `Timestamp?`、`ResultRef?` | 记录时序与结果引用。 |
| CapabilityInvocation | `invocationId`、`taskId`、`adapterId`、`status` | 引用类型、`InvocationStatus` | 记录单次 Mock 调用。 |
| CapabilityInvocation | `request`、`result`、`budgetUsage` | `CapabilityRequest`、`CapabilityResult?`、`BudgetUsage` | 记录合同输入、输出与消耗。 |
| AuditEvent | `auditId`、`workflowId`、`taskId?`、`eventType` | 引用类型、`AuditEventType` | 追加式执行 Evidence。 |
| AuditEvent | `status`、`evidence`、`timestamp` | `RuntimeStatus`、`Evidence[]`、`Timestamp` | 保留状态、证据与发生时间。 |

## Execution Context

```text
ExecutionContext {
  userRef: UserRef?
  projectRef: ProjectRef?
  intentRef: IntentResultRef
  constraintRefs: ConstraintRef[]
  allowedContextRefs: ContextRef[]
}
```

它只关联用户、项目和约束的受控引用；不复制 User Brain、Project Memory 或 Knowledge Base，也不改变任何项目治理权威。

## Evidence Contract

```text
Evidence {
  evidenceId: EvidenceId
  source: EvidenceSource
  summary: SafeText
  confidence: ConfidenceLevel
  timestamp: Timestamp
  reference: EvidenceRef?
}

CapabilityResult {
  status: SUCCESS | FAILURE | CANCELLED | BLOCKED
  output: SafeResult
  evidence: Evidence[]
  confidence: ConfidenceLevel
  timestamp: Timestamp
  error: SafeError?
}
```

Evidence 必须可追溯、脱敏、带置信度与时间。它可成为未来 Knowledge 回写候选的输入，但不自动创建、验证或激活 Knowledge。

## 状态与约束

Workflow State 使用 `CREATED`、`PLANNING`、`WAITING_APPROVAL`、`EXECUTING`、`VALIDATING`、`COMPLETED`、`FAILED`、`PAUSED`、`ROLLING_BACK`、`CANCELLED`。一个 Workflow 最多一个 Task；一个 Task 最多一次 Mock Capability Invocation；每次状态、Guard 决定和 Invocation 结局必须关联至少一个 Audit Event。
