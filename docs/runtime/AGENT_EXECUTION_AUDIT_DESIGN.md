# Agent Execution Audit Design

## Extension

Agent execution extends the existing Runtime Audit with Agent-specific facts. Audit remains append-only and observational: it records Evidence and control facts but does not decide a Gate or alter Workflow state.

| Field | Purpose |
|---|---|
| `agent_id`, `agent_type` | Identifies the assigned Agent. |
| `planner_version`, `plan_schema_version` | Makes deterministic output reproducible and schema-compatible. |
| `agent_task_id`, `workflow_id`, `task_id` | Links Agent work to Runtime entities. |
| `input_refs`, input summary | Identifies authorized input without duplicating sensitive data. |
| `output_ref`, output summary | Identifies the plan/result/failure. |
| `execution_duration_ms` | Captures local execution duration. |
| `permission_snapshot`, `budget_snapshot` | Captures enforced limits. |
| `evidence`, `confidence` | Stores traceable facts and confidence. |
| `approval_status` | `NOT_REQUESTED`, `WAITING_APPROVAL`, `CONFIRMED`, `REJECTED`, or `CANCELLED`. |
| `failure` | Bounded failure detail and recovery recommendation. |

## Required events

| Event | When |
|---|---|
| `AGENT_TASK_CREATED` | Workflow creates the AgentTask. |
| `PLANNER_ASSIGNED` | Runtime assigns deterministic Planner. |
| `PLANNER_STARTED` | Preflight passes and execution begins. |
| `PLAN_PROPOSED` | Contract-valid Plan + Evidence is returned. |
| `WORKFLOW_WAITING_APPROVAL` | Workflow enters the required approval state. |
| `PLANNER_FAILED` / `PLANNER_CANCELLED` | The attempt stops without a valid plan. |
| `PLAN_APPROVED` / `PLAN_REJECTED` | A human records a decision; no automatic execution follows. |

No audit event automatically creates a Knowledge Record, activates Knowledge, or grants execution authorization.
