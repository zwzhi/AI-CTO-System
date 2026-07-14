# Codex Capability Test Plan

## Test boundary

All future Phase 9C-5 implementation tests use a local Mock Codex Adapter. They do not call Codex, an API, Codex CLI, MCP, network, filesystem, Git or external tools.

## Required scenarios

| Scenario | Setup | Acceptance evidence |
|---|---|---|
| Successful analysis | Authorized `ANALYZE_CODE`, `CONFIRM` approval and remaining budget. | Normalized `COMPLETED` Result, no changed files, complete Audit. |
| Provider failure | Mock returns `EXECUTION_FAILED`. | Runtime receives bounded failure Evidence; no Workflow self-advance. |
| Invalid output | Mock returns mismatched contract, forbidden changed file or malformed Evidence. | Result is `OUTPUT_INVALID`; no side effect is accepted. |
| Permission denial | Missing/expired/mismatched Permission Grant. | Adapter does not dispatch; Audit contains `PERMISSION_DENIED`. |
| Budget denial | Any token/time/tool/cost/retry limit is exceeded. | Adapter does not dispatch; Audit contains `BUDGET_EXCEEDED`. |
| Approval barrier | `APPLY_CHANGE` or `CREATE_COMMIT` lacks confirmation. | No dispatch, file change or commit candidate is accepted. |
| Cancellation | Workflow/human/Kill Switch cancels before dispatch or at a controlled boundary. | Attempt is `CANCELLED` with complete Audit. |
| Audit completeness | Each path above. | Required task/version/input/output/permission/budget/approval/duration/failure/Evidence fields exist. |

## Non-negotiable assertions

- The Mock Adapter cannot call Workflow transition APIs.
- The Capability cannot write `Manifesto`, ADR, Master Plan, SKILL, Gates or `ACTIVE` Knowledge.
- An `AUTO` route is not implemented for this first Codex design.
- Tests prove contracts and controls only; they do not claim real Codex quality, security, cost, latency or provider behavior.
