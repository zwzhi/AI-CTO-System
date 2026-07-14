# Codex Execution Contract

## Contract identity

| Field | Value |
|---|---|
| Contract name | `CodexExecutionContract` |
| Contract purpose | Bind one controlled Runtime Task to one Capability invocation. |
| Versioning | Contract, Adapter and Mock Capability versions are recorded on every outcome. |
| Provider state | Local Mock only; no real provider is selected or activated. |

## Input definition

| Input | Required fields | Rule |
|---|---|---|
| Task | `taskRef`, task goal, allowed operation, input references | Must bind exactly one Runtime Task. |
| Execution Context | user/project/intent references, allowed context references, constraints | Cannot grant project-wide or undeclared read access. |
| Permission | grant ID, operation scope, affected-file proposal scope, expiry | Least privilege; missing or stale grants are denied. |
| Budget | token, time, tool, cost and retry limits | Limits are checked before the Mock invocation. |
| Approval | control mode, approval reference, approver, expiry | Required as `CONFIRM_REQUIRED` for change/file/commit operations. |

## Output definition

| Output | Required fields | Rule |
|---|---|---|
| Result | result reference, bounded summary, assumptions | A result is not an execution authorization. |
| Evidence | evidence ID, contract/provider versions, input/output references, confidence, timestamp | Must be auditable and secret-safe. |
| Status | stable invocation status | Drives Runtime validation, never a direct Workflow transition. |
| Changed Files Proposal | proposed file references and rationale | Never denotes actual file changes. |
| Usage | measured or `NOT_CAPTURED` token/time/tool/cost facts | Missing facts cannot be inferred. |
| Failure | category, stage, reason and recommended next action | Required for non-success status. |

## Contract invariants

1. The Adapter rejects calls with no Task, no matching Permission, exceeded Budget, missing required Approval, invalid Context or cancelled Runtime scope.
2. The Capability cannot mutate Workflow, Task, Registry, Knowledge, code, Git or project state.
3. The Adapter returns facts and Evidence; Runtime owns validation, Audit append and Workflow decisions.
4. A real Codex implementation cannot substitute the Mock invocation interface until Capability Governance has completed Admission, Evaluation, Registry and Activation.
