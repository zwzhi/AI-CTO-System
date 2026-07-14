# Runtime Foundation Review Report

## Review Scope and Evidence

- **Review target:** Phase 9C-2 Runtime Foundation MVP implementation at commit `e065e3a`.
- **Review date:** 2026-07-14.
- **Evidence reviewed:** Phase 9B MVP scope and boundary, Phase 9C-1 implementation design, source under `runtime/`, ADR-0020, ADR-0021, and a fresh `npm.cmd test` run.
- **Verification result:** 12 tests passed, 0 failed, 0 skipped. No third-party dependency, real Agent, Codex/MCP integration, external tool invocation, database, Web framework, or production execution was found in the reviewed MVP.

This is an implementation-quality review. It does not create a new Runtime design, change an existing Gate, authorize a production workload, or authorize connection to a real Agent or tool.

## 1. Implementation Scope Review

| Phase 9B MVP scope | Reviewed implementation evidence | Result |
|---|---|---|
| Workflow state management | `WorkflowService` creates and performs declared transitions for `WorkflowInstance`. | Compliant |
| One Task per Workflow | `TaskService` uses `TaskRepositoryPort` and rejects a second Task for the same Workflow. | Compliant |
| Capability Adapter contract | `CapabilityAdapterPort` is consumed by `RuntimeFoundationService`; `MockCapabilityAdapter` is the only adapter. | Compliant |
| Mock capability result | Deterministic success and failure results include output, timestamp, confidence, and Evidence. | Compliant |
| Permission / Budget Guard | `PermissionBudgetGuard` evaluates cancellation, all four budget dimensions, and `AUTO` / `CONFIRM` / `BLOCK`. | Compliant |
| Execution Record and Audit Evidence | Execution records are appended through a Port; audit events are appended through `AuditService` and contain Evidence. | Compliant |
| Runtime Foundation coordination | `RuntimeFoundationService` creates the MVP loop, coordinates domain services, and does not contain a real tool or Agent implementation. | Compliant |

**Scope conclusion:** the reviewed implementation realizes the Phase 9B minimum closed loop: `User Request / Intent reference → Workflow → single Task → Mock Capability → Result → Audit Evidence`. It remains within the approved local-MVP boundary.

## 2. Architecture Compliance Review

| Design principle | Review finding | Result |
|---|---|---|
| Thin Core | The Runtime Foundation wires only a small set of domain services and Ports. It contains no framework, transport, persistence engine, tool SDK, Agent loop, or production policy implementation. | Compliant |
| Contract First | Repository and Capability dependencies are expressed as Ports; `ExecutionContext`, `Evidence`, `CapabilityResult`, and domain entities are explicit type contracts. | Compliant |
| Repository Port | Workflow, Task, Audit, and Execution storage are consumed through dedicated repository Ports. | Compliant |
| In-memory Adapter | The only repositories are in-memory adapters, consistent with the explicit Phase 9C-2 MVP constraint. | Compliant |
| Domain boundary | Workflow transitions occur through `WorkflowService`; Task creation/completion occurs through `TaskService`; capability invocation goes through an adapter; audit recording goes through `AuditService`; constraints are evaluated by the Guard. | Compliant |

No direct cross-domain repository mutation was found in the reviewed control path. `RuntimeFoundationService` is a permitted orchestration point: it composes domain services and Ports, but does not replace their state or contract responsibilities.

**Coupling observation:** the orchestrator currently owns identifier generation and audit-event assembly. This is acceptable in a small synchronous MVP, but should remain an orchestration concern and must not grow into a hidden workflow-state, approval, or business-decision authority.

## 3. Workflow State Machine Review

### Implemented states

| Category | States | Review result |
|---|---|---|
| Normal path | `CREATED` → `PLANNING` → `EXECUTING` → `VALIDATING` → `COMPLETED` | Implemented |
| Approval control | `PLANNING` → `WAITING_APPROVAL` → `EXECUTING` or `CANCELLED` | Implemented in the state machine and service path |
| Failure and cancellation | `PLANNING` / `EXECUTING` / `VALIDATING` → `FAILED`; `PLANNING` / `WAITING_APPROVAL` / `EXECUTING` / `PAUSED` → `CANCELLED` | Implemented |
| Pause and recovery | `EXECUTING` → `PAUSED` → `EXECUTING` or `CANCELLED` | Implemented in the transition map |
| Rollback semantics | `EXECUTING` / `VALIDATING` → `ROLLING_BACK` → `CANCELLED` | Implemented as state-and-audit semantics only |

`WorkflowService.transition` only permits targets listed in its closed transition map and emits `INVALID_TRANSITION` for prohibited transitions. The test suite directly verifies a legal `CREATED → PLANNING` transition and rejects `PLANNING → COMPLETED`; the rest of the map is code-reviewed but not individually test-covered.

**State-machine conclusion:** required normal, failure, cancellation, pause, and rollback states exist, and illegal transitions are programmatically blocked. `WAITING_APPROVAL` is a valid additional control state from the Phase 9A/9B design, not a scope expansion.

## 4. Domain Boundary Review

| Domain | Intended responsibility | Review finding | Result |
|---|---|---|---|
| Workflow | Lifecycle state and controlled coordination | Owns Workflow creation, retrieval, and transition validation; does not invoke a capability. | Compliant |
| Task | Single-task entity and input/output result | Owns Task creation, one-Task constraint, retrieval, and result completion; does not coordinate Agents. | Compliant |
| Capability | Capability invocation contract | Adapter receives a request and returns a structured result; current implementation is only a mock. | Compliant |
| Audit | Append-only execution facts and Evidence | `AuditService` appends/lists events and does not decide a Gate, approval, or result. | Compliant |
| Guard | Pre-execution permission/budget constraints | Evaluates cancellation, budget, and control mode; it does not grant business approval or modify project governance. | Compliant |
| Execution Context | Runtime-scoped references and constraints | Passed into Workflow and Capability requests; it does not change Project Memory, Knowledge Base, or governance authority. | Compliant |
| Evidence | Traceable result facts | Carried by results and audit events; no code writes it into Knowledge Base or marks Knowledge `ACTIVE`. | Compliant |

No reviewed component gives the Runtime project-value, architecture, Gate, or release-decision authority.

## 5. Test Coverage Review

### Covered by the 12 current `node:test` cases

| Coverage area | Evidence |
|---|---|
| Runtime error contract | Code, message, and safe details are preserved. |
| Workflow state validation | A declared transition succeeds; an illegal transition throws `INVALID_TRANSITION`. |
| Single-Task constraint | A second Task for one Workflow is rejected. |
| Budget Guard | An over-token budget is denied. |
| Mock Capability | Both deterministic success and controlled failure return Evidence. |
| Audit | Appending multiple evidence-bearing events preserves both events. |
| End-to-end success | Workflow completes with Task result, Execution Record, Audit, and Evidence. |
| Capability failure | Workflow fails without retry. |
| User cancellation | Workflow cancels before capability invocation. |
| Budget exceedance | Workflow cancels before capability invocation and records denial. |
| Rollback boundary | `ROLLING_BACK` is recorded without an external rollback action. |

### Coverage not yet present

| Missing coverage | Risk level | Why it matters before expanding scope |
|---|---|---|
| `CONFIRM` / `WAITING_APPROVAL` path and an explicit subsequent approval/resume contract | Medium | The state exists, but the current MVP has no resume operation or direct test for this path. |
| `BLOCK` control mode and tool/time/cost budget dimensions | Medium | The Guard contains logic for them, but only over-token denial has a direct test. |
| All declared transition edges, especially `PAUSED` recovery and `VALIDATING → ROLLING_BACK` | Medium | The transition map is larger than the direct test set. |
| Not-found errors and repository copy/alias behavior | Low | These matter when callers and adapters become more numerous. |
| Audit masking and untrusted-input handling | Medium for future integrations | No external input/tool exists now, so input sanitization and secret-redaction behavior have not been implemented or exercised. |
| Re-entrant/concurrent state update behavior | Medium for future asynchronous execution | The reviewed MVP is synchronous and in-memory; concurrency is outside its approved scope. |

The gaps do not invalidate the stated MVP scope, but they are required review inputs before widening the execution model.

## 6. Runtime Risk Review

| ID | Level | Risk and evidence | Required handling |
|---|---|---|---|
| RF-R01 | Medium | In-memory repositories lose Workflow, Task, Execution, and Audit data on process restart. This is an accepted ADR-0021 MVP limitation. | Do not represent this MVP as durable or production-ready; evaluate persistence only through a later approved design. |
| RF-R02 | Medium | Node's type stripping runs the tests but does not provide an independent compile-time type-checking step. | Add a separate type-validation decision only if a later phase needs it; do not imply that current tests prove static type safety. |
| RF-R03 | Medium | Every Guard denial, including a budget exceedance, currently ends as `CANCELLED`. The approved MVP allowed cancellation, but this loses a future resume distinction. | Preserve this as current MVP semantics; reconsider only with a future pause/resume requirement and an approved design. |
| RF-R04 | Medium | `WAITING_APPROVAL`, `BLOCK`, non-token budgets, most transition edges, and pause recovery lack direct tests. | Treat the 12 tests as minimum evidence, not complete state-machine evidence. |
| RF-R05 | Low now / Medium with integrations | `ROLLING_BACK` only records a controlled state and audit trail; it does not reverse an external side effect. | Keep it explicitly non-operational until a later capability and rollback design is approved. |
| RF-R06 | Low now / Medium with growth | `RuntimeFoundationService` is the central synchronous coordinator and may become over-coupled if future behavior is added directly to it. | Keep new behavior behind domain services and Ports; do not give the coordinator decision or Gate authority. |
| RF-R07 | Low now / Medium with untrusted input | No real external data or tool is handled; therefore no runtime sanitation or secret-redaction behavior has been exercised. | Require security, data-handling, and capability reviews before any integration. |

No High risk was found within the explicitly constrained local, mock-only MVP. This is not a production security assessment.

## 7. Runtime Foundation Review Gate

### Result: `APPROVED_FOR_NEXT_PHASE`

The implementation matches the approved Phase 9B/9C-1 minimum boundary, keeps the intended contracts and domain boundaries, and has fresh evidence of 12 passing local tests. Known risks are documented and none requires a present architecture change to preserve the MVP's stated boundary.

This Gate only permits **consideration and design of a subsequent phase** after user confirmation. It does **not** mean:

- the Runtime is production-ready;
- a real Agent, Codex/MCP, tool, database, Web framework, or deployment may be connected;
- any autonomous execution is authorized; or
- an existing Layer 2 decision or Layer 3/4 Gate may be bypassed.

## 8. Runtime Foundation Experience Candidates

No Knowledge Record is automatically created and no candidate is marked `ACTIVE` by this review. The following entries are candidates for a later Knowledge Admission Review:

| Candidate | Proposed type | Evidence and confidence | Strict applicable scenario | Candidate lifecycle recommendation |
|---|---|---|---|---|
| Thin Core + Port + In-memory Adapter runtime foundation | Architecture Pattern | One AI CTO System MVP implementation and 12 local passing tests; `L3` / medium confidence | Local, single-process, mock-only control-plane MVPs that need replaceable persistence and capability edges | `CAPTURED` → `VALIDATING` |
| Domain-service-only state mutation | Engineering Pattern | Workflow/Task state changes are centralized in their services and invalid transition / duplicate Task tests pass; `L3` / medium confidence | Small runtime domains with explicit state machines and a single synchronous coordinator | `CAPTURED` → `VALIDATING` |
| Type stripping is not a type-safety gate | Failure Experience | ADR-0021 and this review identify a verified constraint of Node type stripping; `L2` / medium confidence | Node TypeScript projects that run through type stripping without a separate type-check command | `CAPTURED` → `VALIDATING` |

These are scoped observations from one project. They are not general best practices, mandatory rules, or reusable `ACTIVE` Knowledge without additional independent validation.

## ADR Decision

**ADR Not Required.** This review does not introduce a new major architecture decision, alter the Control Plane First Runtime model, or modify an existing authority/Gate. ADR-0018 through ADR-0021 remain the governing Runtime decisions.

## References

- [Runtime MVP Scope](./RUNTIME_MVP_SCOPE.md)
- [Runtime MVP Boundary](./RUNTIME_MVP_BOUNDARY.md)
- [Runtime Foundation Implementation Plan](./RUNTIME_FOUNDATION_IMPLEMENTATION_PLAN.md)
- [Runtime Foundation Test Plan](./RUNTIME_FOUNDATION_TEST_PLAN.md)
- [ADR-0020](../adr/ADR-0020-RUNTIME-FOUNDATION-IMPLEMENTATION.md)
- [ADR-0021](../adr/ADR-0021-RUNTIME-FOUNDATION-TECH-STACK.md)
