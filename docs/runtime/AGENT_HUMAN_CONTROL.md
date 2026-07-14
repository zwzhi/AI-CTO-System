# Agent Human Control

## Relationship to Phase 9A

This model specializes the Phase 9A Human Control Model for Agent Tasks. It does not replace `AUTO_EXECUTE`, `NOTIFY_AFTER`, `CONFIRM_BEFORE`, or `MANDATORY_APPROVAL`; the short names below map to those existing authority levels.

| Agent mode | Phase 9A relation | Meaning | Planner Agent in Phase 9C-3 |
|---|---|---|---|
| `AUTO` | `AUTO_EXECUTE` | A future low-risk, reversible task may run under an explicit policy. | Not permitted. |
| `NOTIFY` | `NOTIFY_AFTER` | A future low-risk task may execute with an auditable notification. | Not permitted. |
| `CONFIRM` | `CONFIRM_BEFORE` | Human confirmation is required before the action that follows the Agent output. | Required default. Planner output causes `WAITING_APPROVAL`. |
| `BLOCK` | Mandatory approval or policy prohibition | Agent Task is not assigned/executed until the blocking condition is resolved. | Applies to forbidden scope, missing authority, or prohibited external action. |

## Planner control flow

1. Workflow Engine assigns the Planner Agent under `CONFIRM`.
2. Planner returns a proposed plan and Evidence only.
3. Workflow records Audit and moves to `WAITING_APPROVAL`.
4. The human confirms, rejects, or cancels through Workflow-controlled handling.
5. A future phase may define what follows confirmation; Phase 9C-3 does not execute it.

## Non-delegable decisions

Human control remains mandatory for new project initiation, major architecture change, permission elevation, production release, Knowledge `ACTIVE`, and any action required by existing Layer 2–4 Gates. An Agent cannot downgrade `CONFIRM` or `BLOCK` to `AUTO` or `NOTIFY`.
