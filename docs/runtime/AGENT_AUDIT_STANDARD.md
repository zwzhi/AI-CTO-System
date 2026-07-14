# Agent Audit Standard

## Required record

Each Agent Task attempt must produce an append-only audit record, including a controlled failure or cancellation. Audit records execution facts; they do not grant approval or decide a Gate.

| Field | Requirement |
|---|---|
| `agent_id`, `agent_type`, `agent_version` | Identifies the contract implementation. |
| `workflow_id`, `agent_task_id` | Connects the record to Runtime coordination. |
| `input_refs` | References authorized inputs; do not duplicate sensitive content unnecessarily. |
| `output_ref` / output summary | Identifies the contract result or bounded failure. |
| `operational_decision` | `COMPLETED`, `FAILED`, `CANCELLED`, or `BLOCKED`; this is not a business/Gate decision. |
| `evidence` | Evidence source, summary, confidence, timestamp, and optional reference. |
| `permission_snapshot`, `budget_snapshot` | Shows the authorized bounds at the attempt. |
| `started_at`, `ended_at`, `duration` | Supports tracing and future efficiency review. |
| `failure` | Required for failure/cancellation/blocking, with retry/escalation recommendation. |
| `human_control_ref` | Connects to the applicable `AUTO`/`NOTIFY`/`CONFIRM`/`BLOCK` policy outcome. |

## Planner-specific audit events

1. `PLANNER_ASSIGNED`
2. `PLANNER_STARTED`
3. `PLAN_PROPOSED` with Plan Evidence
4. `WORKFLOW_WAITING_APPROVAL`
5. `PLANNER_FAILED` or `PLANNER_CANCELLED` when applicable

Audit Evidence may be proposed for later Knowledge extraction, but it cannot automatically write or activate Knowledge.
