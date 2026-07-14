# Deterministic Planner Runtime Review Report

## Review scope and evidence

This review examines the local Phase 9C-4 implementation in commit `4987079`. It is a quality and architecture-consistency review only. It creates no Agent, model, tool, Codex/MCP integration, external invocation, or Phase 9C-5 authorization.

Evidence reviewed:

- Phase 9C-3 and 9C-4 Agent, approval, audit, contract, implementation, and test-design documents.
- `runtime/agent/`, `runtime/services/single-agent-runtime-service.ts`, `runtime/models/runtime-types.ts`, and `runtime/permission/permission-budget-guard.ts`.
- Fresh `npm.cmd test` execution: 21 passed, 0 failed.

## 1. Agent Runtime Scope Review

| Area | Result | Evidence |
|---|---|---|
| `AgentTask` | Conforms | One in-memory AgentTask per Workflow, explicit lifecycle, and terminal-state rejection in `agent-task-service.ts`. |
| `PlannerAgentPort` | Conforms | Stable input/output boundary is defined in `planner-agent-port.ts`. |
| `DeterministicPlanner` | Conforms | A local closed-template implementation returns only a proposed plan or bounded failure Evidence; it has no integration imports. |
| Versioned `ExecutionPlan` | Partial | Identity, planner/schema versions, proposed status, steps, assumptions, risks, Evidence, and approval requirement exist. Execution Context constraints are only copied into `assumptions`; there is no distinct constraint field. |
| Agent Audit | Partial | Identity, type, versions, duration, Evidence, and approval status are recorded; required input/output references and permission/budget snapshots are not. |

## 2. Agent Boundary Review

The Planner is within its permitted boundary: it generates a plan and Evidence only. `DeterministicPlanner` has no reference to Workflow, repositories, Capability adapters, filesystem, network, Code/Codex/MCP, or Knowledge Base.

The implementation provides no Planner path to modify a Workflow, invoke a Capability, modify code, activate Knowledge, or bypass human approval. Workflow transition calls are made by `SingleAgentRuntimeService` through `WorkflowService`, after the Planner returns.

Result: **Conforms**, subject to the control-mode issue in the Risk Review.

## 3. Workflow Authority Review

The Planner returns `PlannerAgentResult`, not a Workflow command. The Runtime validates the returned plan and then asks `WorkflowService` to move from `PLANNING` to `WAITING_APPROVAL`. The success test confirms that transition; the approval-barrier test confirms that no Capability invocation, execution record, or follow-up work is created.

Result: **Conforms**. The Planner cannot directly enter `EXECUTING`, skip `WAITING_APPROVAL`, or invoke the transition service.

## 4. ExecutionPlan Contract Review

| Required concern | Review result |
|---|---|
| Plan identity | Present as `executionPlanId`; it is the documented implementation-name equivalent of `plan_id`. |
| Planner and schema versions | Present and checked against the assigned Port. |
| Steps, assumptions, risks, Evidence | Present. |
| Constraints | Partial: `ExecutionContext.constraintRefs` become assumptions; the plan does not expose a separately named constraint field. |
| Future LLM replacement | Structurally possible through `PlannerAgentPort`, but an LLM adapter needs separate input-validation, contract-negative, security, budget, and audit-completeness tests before admission. |

## 5. Human Control Review

The completed path is `Planner output → AgentTask completion → Audit → Workflow WAITING_APPROVAL`. The result contract explicitly exposes no Capability invocation, execution record, or follow-up execution, and no confirmation endpoint exists in this MVP.

Result: **Conforms for the approval barrier**. However, `evaluatePlannerPreflight` accepts `AUTO` as well as `CONFIRM`; Phase 9C-4 defined Planner control as `CONFIRM` only. This is recorded as a Medium risk rather than treated as approval bypass, because both modes still stop at `WAITING_APPROVAL` in the current service.

## 6. Audit Review

Present in Agent Audit:

- Agent ID, Agent type, AgentTask ID, planner version, and plan schema version.
- Workflow ID, event/status, timestamp, Evidence, approval status, and successful execution duration.

Missing against `AGENT_EXECUTION_AUDIT_DESIGN.md`:

- Authorized input references/input summary.
- Output reference (for example, the proposed plan ID) and output summary separate from a generic result string.
- Permission snapshot and budget snapshot.
- Explicit failure field and recovery recommendation.

Result: **Partial**. The implementation is traceable enough for the local demonstration but does not yet meet its declared Agent Audit contract.

## 7. Test Coverage Review

The 21 tests cover the 12 Runtime Foundation cases plus 9 Single Agent cases:

- Deterministic, versioned Planner output and unsupported-intent failure.
- Declared AgentTask lifecycle and terminal-state rejection.
- Workflow move to `WAITING_APPROVAL` and post-plan execution barrier.
- Permission denial, budget denial, pre-execution cancellation, and Agent Audit metadata.

Coverage gaps:

- An injected Planner Port that returns a contract-invalid or malformed Plan.
- Integration-level Planner failure from the Runtime, not only direct Planner failure.
- Rejection of `AUTO` for this `CONFIRM`-only Planner MVP.
- Audit assertions for input/output references, permission/budget snapshots, and failure detail.
- Cancellation after Planner start; the current synchronous local adapter only verifies pre-execution cancellation.

## 8. Risk Review

| Level | Risk | Effect / required treatment |
|---|---|---|
| High | None identified within the intentionally local, non-executing MVP boundary. | No external capability, model, tool, or execution path exists. |
| Medium | Audit contract fields are missing. | Do not treat current Audit as sufficient for stronger Runtime evidence or future Knowledge write-back. |
| Medium | `AUTO` mode is accepted by Planner preflight despite the Phase 9C-4 `CONFIRM`-only rule. | Explicitly enforce or reject non-`CONFIRM` mode before any next-phase design. |
| Medium | Constraint semantics are ambiguous. | Define whether constraints are a first-class plan field or a validated reference set before replacing the Planner adapter. |
| Low | In-memory repositories and a narrow fixed template catalog. | Valid only for local MVP evidence; no persistence, scalability, or planning-quality conclusion follows. |
| Low | No separate TypeScript compile-time validation step. | Add when a future implementation phase introduces broader contracts. |

## 9. Single Agent Runtime Review Gate

`CHANGES_REQUIRED`

The local MVP is within its non-executing security boundary and all 21 tests pass. The Gate does not permit next-phase design until the audit-contract gap and the `CONFIRM`-only control-mode gap are resolved through separately authorized work and verification.

This Gate does not authorize a real model, Codex, MCP, external tools, production use, or Phase 9C-5.

## 10. Knowledge Candidate

Propose one candidate only; do not create or activate a Knowledge record automatically.

| Field | Proposal |
|---|---|
| Candidate | Controlled planner adapter pattern: Port returns a versioned proposed plan and Evidence; Workflow retains transition and approval authority. |
| Type | Engineering Pattern |
| Source | Phase 9C-4 local MVP and this review. |
| Lifecycle proposal | `CAPTURED → VALIDATING` only. |
| Evidence / confidence | Local implementation plus 21 tests; L3 for the AI CTO Runtime MVP scope. |
| Applicable scenario | Controlled AI CTO governance/runtime prototypes with a non-executing Planner. |
| Limitation | Not a general Agent, LLM, production, or autonomous-execution pattern. |
