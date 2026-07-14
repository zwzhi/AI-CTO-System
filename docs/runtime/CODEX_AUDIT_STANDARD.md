# Codex Audit Standard

## Required audit record

Every future Codex Capability attempt appends an audit event. Audit is observational: it records Evidence and control facts but does not approve, dispatch another task, change Workflow state or activate Knowledge.

| Field | Requirement |
|---|---|
| Task | `workflowId`, `taskRef`, AgentTask reference when applicable, operation and project reference. |
| Capability identity | Capability ID, contract version, adapter version and provider/Codex version. |
| Input | Authorized input references, context references and permission/budget snapshots; do not duplicate secrets. |
| Output | Result reference, status, output summary and changed-file references. |
| Evidence | Evidence IDs, source, confidence, timestamp, result validation facts and usage values or `NOT_CAPTURED`. |
| Approval | Control mode, approval reference, approver reference, decision and expiry. |
| Duration | Start, end and measured duration. |
| Failure | Category, stage, bounded reason, retry decision and escalation target. |

## Event sequence

`CODEX_REQUEST_VALIDATED → CODEX_APPROVAL_WAITING / CODEX_DENIED → CODEX_DISPATCHED → CODEX_RESULT_RECEIVED → CODEX_RESULT_VALIDATED → CODEX_COMPLETED / CODEX_FAILED / CODEX_CANCELLED`.

The events must preserve the exact Capability and adapter versions so results can be traced without asserting that a result is reproducible across provider versions.

## Knowledge boundary

Audit Evidence can be proposed as a Knowledge Candidate only through Knowledge Governance. It never creates `ACTIVE` Knowledge or changes project documentation automatically.
