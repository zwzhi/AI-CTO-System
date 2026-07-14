# Codex Failure Handling

## Failure categories and Runtime response

| Failure | Detection | Runtime response | Retry / escalation |
|---|---|---|---|
| `TIMEOUT` | Provider did not return within the task time budget. | Stop dispatch, record elapsed time and preserve Task state. | Default no automatic retry; a future retry needs remaining budget and explicit policy. |
| `EXECUTION_FAILED` | Provider returns a bounded unsuccessful result. | Validate output, mark attempt failed and write Evidence. | Escalate to human when recovery changes scope. |
| `OUTPUT_INVALID` | Result violates Capability Contract, expected schema, permission scope or changed-file scope. | Reject result; do not accept side effects as valid. | No retry with the same invalid output. |
| `PERMISSION_DENIED` | Grant missing, expired, revoked or insufficient. | Do not dispatch / accept result. | Require a new human-approved grant. |
| `BUDGET_EXCEEDED` | Token, time, tool, cost or retry bound exceeded. | Cancel attempt and record measured/unknown usage. | No retry until a separately authorized budget decision. |
| `CANCELLED` | Human, Workflow or Kill Switch cancels. | Stop at the next controlled boundary and preserve Audit. | No automatic resume. |
| `ADAPTER_UNAVAILABLE` | Adapter/transport cannot be used. | Return controlled failure without fallback dispatch. | Human decides whether a separately admitted replacement is appropriate. |

## Rules

1. Adapter retries are disabled by default for the first implementation.
2. Retry, fallback and escalation are Workflow policies, never provider self-decisions.
3. A failed Capability result cannot move Workflow to `EXECUTING`, create a commit, or bypass Human Control.
4. Failure records include category, stage, reason, Evidence, remaining budget and next action.
