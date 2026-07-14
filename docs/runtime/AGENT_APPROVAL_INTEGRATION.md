# Agent Approval Integration

## Planner approval flow

```mermaid
sequenceDiagram
    participant W as Workflow Engine
    participant R as Agent Runtime
    participant P as DeterministicPlanner
    participant H as Human
    W->>R: Assign AgentTask (CONFIRM)
    R->>P: Execute PlannerAgentPort
    P-->>R: Proposed Plan + Evidence
    R-->>W: Validated Agent Result
    W->>W: Append Audit; transition to WAITING_APPROVAL
    H->>W: Confirm, reject, or cancel
```

## Rules

1. A plan is accepted only when AgentTask is `COMPLETED`, the ExecutionPlan Contract is valid, Plan status is `PROPOSED`, Evidence exists, and `approval_required` is `true`.
2. Workflow Engine then records `PLAN_PROPOSED` and `WORKFLOW_WAITING_APPROVAL` Audit events and transitions the Workflow from `PLANNING` to `WAITING_APPROVAL`.
3. Before confirmation, no AgentTask, Capability invocation, generic Task execution, or code change may be created from the plan.
4. Confirmation records an Approval Record with human identity/reference, timestamp, decision, and plan/version references. Phase 9C-4 does not design or execute the post-confirmation action.
5. Rejection or cancellation remains under Workflow control and preserves the Plan and Audit Evidence.

## Boundary

Approval accepts or rejects a specific proposed plan; it is not a blanket authorization for future tools, models, Agents, code changes, release, or Gate bypass.
