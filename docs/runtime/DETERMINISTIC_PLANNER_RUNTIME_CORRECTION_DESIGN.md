# Deterministic Planner Runtime Correction Design

## Objective

Resolve the three findings accepted in the Phase 9C-4 Review without expanding the Runtime MVP: make Agent Audit traceable, enforce Planner `CONFIRM`-only control, and add negative integration tests for invalid plan contracts, constraint violations, and Planner failures.

## Scope and boundaries

In scope:

- Extend the Agent Audit contract with `inputRefs`, `outputRef`, `permissionSnapshot`, `budgetSnapshot`, `failureReason`, and `failureStage`.
- Make Planner preflight reject every control mode other than `CONFIRM`.
- Add `constraintRefs` to the proposed ExecutionPlan and validate that every proposed constraint is authorized by the Workflow Execution Context.
- Add local `node:test` coverage for invalid plans, constraint violations, and integration-level Planner failure.

Out of scope:

- LLMs, Codex, MCP, external tools, network, database, persistence, multi-Agent execution, confirmation handling, or post-approval execution.

## Contract changes

`AuditEvent` records authorized inputs and outputs by reference rather than duplicating raw user data. For every Agent-related event, Runtime supplies an immutable permission and budget snapshot. Failure events also include a bounded reason and a stage: `PREFLIGHT`, `EXECUTION`, or `VALIDATION`.

`ExecutionPlan.constraintRefs` is an explicit, read-only list. `DeterministicPlanner` copies it from `ExecutionContext.constraintRefs`. Runtime accepts a plan only when its workflow/task/version fields match and every plan constraint is present in the assigned Execution Context.

## Control and failure behavior

Planner preflight accepts `CONFIRM` only. `AUTO` and `BLOCK` return a denied preflight result, create no plan, and leave the Workflow/AgentTask in controlled failed outcomes. The result remains `WAITING_APPROVAL` only after a valid proposed plan; no confirmation or continuation is implemented.

## Test design

1. A fake Planner Port returns an otherwise completed plan with a mismatched contract field; Runtime fails it at `VALIDATION` and writes failure audit facts.
2. A fake Planner Port returns a plan containing an unassigned constraint reference; Runtime fails it at `VALIDATION`.
3. A fake Planner Port returns a bounded `FAILED` result; Runtime fails at `EXECUTION` and preserves its Evidence.
4. Existing happy-path audit assertions are extended to require input/output references and permission/budget snapshots. A Planner request using `AUTO` is rejected at `PREFLIGHT`.

## Acceptance criteria

- All Agent Audit fields requested by the Phase 9C-4 Review exist and are recorded on applicable Agent events.
- Planner cannot run under `AUTO` or `BLOCK`.
- Invalid plan, constraint violation, and integration-level Planner failure tests fail before implementation and pass after the minimal fix.
- `npm.cmd test` passes with no external dependency or invocation.
- The follow-up Review Gate can be re-evaluated without entering Phase 9C-5.
