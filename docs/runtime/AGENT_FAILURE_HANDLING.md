# Agent Failure Handling

## Failure classes

| Class | Example | Agent action | Workflow action |
|---|---|---|---|
| Input failure | Missing Intent Result or unauthorized context reference | Return `FAILED` with missing-input Evidence | Request clarification, cancel, or create an approved new attempt |
| Permission/Budget denial | Scope denied, expiry, token/time/tool/cost/retry limit exceeded | Stop; do not attempt a workaround | Record Audit; pause, cancel, or escalate under policy |
| Output validation failure | Plan lacks required Evidence, scope, risk, or approval marker | Return `FAILED`; do not publish partial output as valid plan | Reject result and decide whether a bounded retry is authorized |
| Cancellation | Human, Kill Switch, or Workflow cancellation | Stop and return `CANCELLED` | Move the Workflow through its approved cancellation path |
| Internal Agent failure | Contract processing cannot complete | Return bounded failure Evidence | Apply retry/escalation policy; no Agent self-retry |

## Retry, fail, escalate, cancel

- **Retry:** only Workflow Engine may authorize it; it must be within `retry_limit`, preserve prior Audit, and create a separately identifiable attempt.
- **Fail:** the Agent returns `FAILED` when a valid result cannot be produced; Workflow records it and owns the Workflow state transition.
- **Escalate:** missing authority, ambiguous intent, or a requirement for human judgment is escalated to the Workflow/human-control process, not to another Agent.
- **Cancel:** the Agent obeys cancellation immediately and never resumes itself.

## Workflow connection

An Agent does not set Workflow `FAILED`, `PAUSED`, `ROLLING_BACK`, or `CANCELLED`. It returns an operational result; the Workflow Engine applies its own state machine, Approval model, Budget governance, and Kill Switch rules.
