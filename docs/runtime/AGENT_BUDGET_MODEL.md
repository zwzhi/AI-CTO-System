# Agent Budget Model

## Purpose

Agent budgets partition the Runtime Workflow/Task budget into bounded Agent execution limits. They prevent an Agent from expanding its own resource use or retrying indefinitely.

## Budget contract

| Budget | Contract fields | Rule |
|---|---|---|
| Token | `token_limit`, `token_used` | The Agent cannot increase its own token limit. |
| Time | `time_limit_ms`, `time_used_ms` | Expiry stops the attempt and returns a controlled outcome. |
| Tool usage | `tool_limit`, `tool_used` | Phase 9C-3 Planner allocation is `0`; no tool is callable. |
| Cost | `cost_limit`, `cost_used` | Cost is reserved for future model/capability accounting; no costed call exists now. |
| Retry | `retry_limit`, `retry_count` | Only Workflow Engine can authorize a fresh attempt. |

## Threshold behavior

| Condition | Required behavior |
|---|---|
| Within budget | Agent may continue only within its permission scope. |
| Near threshold | Agent returns partial, bounded output or a request for Workflow/human handling; it does not expand the limit. |
| Exceeded | Guard blocks/ends the attempt, Audit records the event, and Workflow decides pause, cancellation, or escalation. |
| Retry requested | Workflow checks the retry budget, risk, and human-control policy before creating another attempt. |

This is a design-only model. Phase 9C-3 introduces no runtime metering, model call, tool call, cost collection, or automatic retry implementation.
