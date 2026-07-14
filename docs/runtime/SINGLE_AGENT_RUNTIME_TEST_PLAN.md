# Single Agent Runtime Test Plan

## Test scope

Tests must use only local deterministic inputs and in-memory Ports. No test may call a model, network, external tool, Codex, MCP, filesystem side effect, or database.

| Scenario | Setup | Expected evidence |
|---|---|---|
| Normal planning | Valid supported input, `CONFIRM`, within budget | Deterministic Plan with matching `planner_version` / `plan_schema_version`; AgentTask `COMPLETED`; Workflow `WAITING_APPROVAL`; Audit complete. |
| Determinism | Same input and same planner version twice | Same Plan content/template/version apart from permitted runtime identifiers/timestamps. |
| Planner failure | Unsupported category or invalid required input | AgentTask `FAILED`; bounded failure Evidence; Workflow does not enter `WAITING_APPROVAL`. |
| Permission denial | Planner input requests an unlisted action or invalid scope | Guard/Runtime rejects before Planner execution; no Plan and denial Audit exist. |
| Budget denial | Token/time/tool/cost/retry bound is exceeded | No Planner execution; controlled AgentTask/Workflow outcome and Audit exist. |
| Approval barrier | Valid proposed Plan before human confirmation | No Capability, next AgentTask, generic execution, or code-change path is created. |
| Cancellation | Workflow/human cancellation before or during planned attempt | AgentTask becomes `CANCELLED`; Planner stops; no valid Plan is accepted. |
| Audit completeness | Each success/failure/denial/cancellation path | Required Agent ID/type, input/output references, duration, Evidence, and approval status are present. |
| Workflow authority | Agent returns a result that attempts a state command | Runtime rejects/ignores it; only Workflow Engine transitions the Workflow. |

## Acceptance criteria

- All listed tests pass using Node's built-in test runner and no external dependency.
- No test or implementation creates forbidden directories or integrations (`agents/`, `tools/`, `integrations/`, `api/`).
- `WAITING_APPROVAL` is reached only through Workflow Engine after a valid proposed plan.
- A test explicitly proves that confirmation is a barrier, not an automatic execution trigger.
