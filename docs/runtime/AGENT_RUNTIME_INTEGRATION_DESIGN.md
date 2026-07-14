# Agent Runtime Integration Design

## Integration model

The future Runtime uses an Agent Runtime service as a coordinator around existing Workflow, Permission/Budget, Audit, and repository Ports. It does not replace `RuntimeFoundationService` with an Agent decision-maker.

| Step | Owner | Contract result |
|---|---|---|
| Registration | Runtime configuration | Register `PLANNER`, `PlannerAgentPort`, `planner_version`, supported schema version, and an implementation scope limited to the local deterministic MVP. |
| Assignment | Workflow Engine | Create one AgentTask with explicit input, Permission, Budget, and `CONFIRM` control mode. |
| Preflight | Permission/Budget Guard | Allow, deny, or require the already-defined confirmation handling; no agent override. |
| Execution | Agent Runtime service | Invoke `PlannerAgentPort.execute` with the complete AgentTask Contract. |
| Result | Planner adapter | Return Agent Result, versioned Execution Plan, Evidence, confidence, and bounded failure if any. |
| Acceptance | Workflow Engine | Validate the Result Contract, append Audit, and transition to `WAITING_APPROVAL` only for a valid plan. |

## Registration contract

| Field | Rule |
|---|---|
| `agent_type` | `PLANNER` only for this MVP. |
| `agent_id` | Stable local identity, e.g. `planner-deterministic`. |
| `planner_version` | Required semantic implementation version. |
| `supported_plan_schema_versions` | Includes the registered `ExecutionPlan` schema version. |
| `adapter_port` | `PlannerAgentPort`; Runtime Core depends on this contract, not on `DeterministicPlanner`. |
| `allowed_actions` | Generate a proposed plan and evidence only. |
| `denied_actions` | Tool/model/network use, writes, Workflow transition, execution, approval, and Knowledge activation. |

## Interface contract (pseudo type)

```text
PlannerAgentPort.execute(input: PlannerExecutionInput): PlannerAgentResult

PlannerExecutionInput = {
  agent_task: AgentTask,
  user_request_ref: Reference,
  intent_result_ref: Reference,
  execution_context: ExecutionContext
}

PlannerAgentResult = {
  status: COMPLETED | FAILED | CANCELLED,
  execution_plan?: ExecutionPlan,
  evidence: Evidence[],
  confidence: L1 | L2 | L3 | L4,
  failure?: AgentFailure,
  timestamp: Timestamp
}
```

The port has no methods for state transition, tool invocation, Agent discovery, approval, or Task creation.
