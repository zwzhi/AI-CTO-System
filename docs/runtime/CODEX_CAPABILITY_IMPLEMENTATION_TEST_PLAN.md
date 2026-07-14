# Codex Capability Implementation Test Plan

## Test boundary

Future tests use only deterministic local Mock Codex Capability fixtures. They must not access Codex, API, CLI, MCP, network, filesystem, Git, external tools or a real project.

## Required cases

| Case | Setup | Expected result |
|---|---|---|
| Mock Adapter success | Valid `ANALYZE_CODE` request, matching Permission/Budget and required approval. | Normalized `COMPLETED` outcome and complete Audit Candidate. |
| Proposal success | Valid `PROPOSE_CHANGE` fixture. | `COMPLETED`, bounded proposal and `PROPOSED` Changed Files references only. |
| Mock failure | Failure fixture. | `EXECUTION_FAILED` with failure stage/reason; no state mutation or retry. |
| Permission denial | Missing, expired or mismatched grant. | `PERMISSION_DENIED`; Mock is not invoked. |
| Budget denial | Exceeded token/time/tool/cost/retry bound. | `BUDGET_EXCEEDED`; Mock is not invoked. |
| Approval barrier | Missing/rejected/expired or mismatched confirmation. | `APPROVAL_REQUIRED` or controlled rejection; Mock is not invoked. |
| Invalid output | Malformed Result/Evidence or unauthorized changed-file proposal. | `OUTPUT_INVALID`; output is not accepted. |
| Cancellation | Runtime cancelled before controlled boundary. | `CANCELLED`; no Mock invocation after cancellation. |
| Audit completeness | All paths. | Task, versions, input/output references, permission/budget snapshots, approval, Evidence, duration and failure fields are present. |

## Assertions

1. The Adapter cannot call Workflow transition APIs or mutate Workflow/Task repositories.
2. `APPLY_CHANGE` and `CREATE_COMMIT` are rejected by the Mock even with approval.
3. Changed Files references are labelled `PROPOSED`, never actual changes.
4. No test creates Registry entries, `ACTIVE` Knowledge, files or commits.

## Acceptance

All cases must pass before any code implementation is considered complete. Passing Mock tests proves control-contract behavior only; it does not prove real Codex provider quality, security, performance, compatibility or cost.
