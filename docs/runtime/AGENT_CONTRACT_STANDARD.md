# Agent Contract Standard

## Purpose

Every future Runtime Agent must use this explicit contract. A contract is created by the Workflow Engine for one Agent Task; no Agent may infer missing input, permission, budget, or authority.

## Contract fields

| Area | Required fields | Rule |
|---|---|---|
| Identity | `agent_id`, `agent_type`, `agent_version` | Identifies the accountable Agent contract version. |
| Task | `workflow_id`, `agent_task_id`, `task_type`, `objective` | References one Workflow-assigned task only. |
| Input | `user_request_ref`, `intent_result_ref`, `input_refs`, `allowed_context_refs` | Inputs must be explicit and within the Execution Context. |
| Execution Context | `user_ref`, `project_ref`, `intent_ref`, `constraint_refs`, `allowed_context_refs` | Provides scoped references; it does not grant governance authority. |
| Output | `result_status`, `output`, `evidence`, `confidence`, `timestamp`, `failure` | Output must be structured, traceable, and bounded by the output contract. |
| Permission Scope | `allowed_actions`, `denied_actions`, `write_scope`, `expiry` | Least privilege; unlisted actions are denied. |
| Budget Scope | `token_limit`, `time_limit`, `tool_limit`, `cost_limit`, `retry_limit` | Budget is inherited from Runtime governance and cannot be increased by the Agent. |
| Human Control | `control_mode`, `approval_ref` | The Agent obeys the assigned mode and cannot self-approve. |
| Failure Handling | `retry_policy`, `escalation_target`, `cancellation_rule` | Failure outcomes are returned to the Workflow Engine. |

## Input contract

Input must be complete enough to perform the assigned task and must identify every permitted context reference. If required input is missing, ambiguous, unauthorized, or inconsistent, the Agent returns `FAILED` with an Evidence-bearing failure; it must not browse, call a tool, or fill the gap with an unrecorded assumption.

## Output contract

`AgentResult` contains:

| Field | Meaning |
|---|---|
| `result_status` | `COMPLETED`, `FAILED`, or `CANCELLED` for this Agent Task. |
| `output` | Task-specific structured output; never a direct Workflow command. |
| `evidence` | Source, summary, confidence, timestamp, and optional reference for every material result. |
| `confidence` | `L1`–`L4`; insufficient evidence must reduce the level rather than fabricate certainty. |
| `failure` | Required when `result_status` is `FAILED` or `CANCELLED`; states a bounded reason and recovery recommendation. |
| `timestamp` | Time at which the result was produced. |

## Contract invariants

1. One Agent Task has one assigned Agent type and one output contract.
2. Agent results return to the Workflow Engine; they do not mutate Workflow state.
3. Permission, Budget, Evidence, and Audit are mandatory contract concerns, not optional implementation details.
4. Evidence may become a future Knowledge Candidate only through Knowledge Governance; it never becomes `ACTIVE` automatically.
5. A contract does not override Layer 2 decisions, Layer 3 design baseline, Layer 4 Gate, or human approval.
