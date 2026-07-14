# Testing Capability MVP Design

**Goal:** Validate a deterministic, evidence-first Testing Capability that assesses only explicitly supplied test context and produces a read-only quality-analysis package plus audit evidence.

## 1. Scope

The MVP provides static test-context analysis, not test execution. It receives only in-memory `AuthorizedTestContext` values that the caller explicitly includes in a request. It must not discover, scan, read, write, execute, patch, commit, deploy, or otherwise interact with a repository or user code.

The controlled data flow is:

```text
Authorized Test Context + Testing Objective + Execution Context
  -> TestingExecutionRequest
  -> TestingCapabilityAdapter
  -> DeterministicTestingAssistant
  -> TestingResult + Evidence
  -> Audit Event
```

Registry Record remains `ABSENT`; Activation remains `NONE`. This is not a Provider candidate, a test-framework integration, an Agent, a Workflow controller, or a source-of-truth project-state updater.

## 2. Thin Core + Contract-first Design

| Component | Responsibility | Explicit exclusions |
| --- | --- | --- |
| `TestingExecutionRequest` | Binds objective, authorised in-memory test context, project/execution context, permission, budget, and cancellation state. | No path, glob, URL, filesystem callback, executor, or mutation handle. |
| `TestingInvocationPort` | Defines the replaceable local deterministic invocation contract. | No permission, budget, audit, workflow, or state decision. |
| `DeterministicTestingAssistant` | Produces predictable static observations from validated contexts and prebuilt evidence. | No test framework, user-code execution, network, Provider, patch, commit, deployment, or write operation. |
| `TestingCapabilityAdapter` | Validates preflight, freezes input/evidence, calls the port, and validates the full output contract. | No Workflow/Task/Agent/Registry/Knowledge modification. |
| `TestingCapabilityRuntimeService` | Invokes the adapter and appends an Audit Event. | No state progression, test execution, or approval authority. |

The specialised implementation reuses only the existing `PermissionBudgetGuard` and `AuditService`. It must not change generic Runtime types, Runtime Core, Workflow, Task, Agent, Registry, or Knowledge.

## 3. Contract

The only allowed operation is `ANALYZE_TEST_CONTEXT`.

An `AuthorizedTestContext` must contain a stable `sourceRef`, a locatable `location`, in-memory `content`, and optional `versionRef`. Each `sourceRef` must be listed in `executionContext.allowedContextRefs`; duplicates, blank fields, empty context, and out-of-scope references are rejected before the invocation port is called.

The request also includes a non-empty `testingObjective`, descriptive `projectRef`/`intentRef` through the existing execution context, a read-only operation grant with a strict ISO UTC expiration timestamp, a budget snapshot, and optional cancellation state.

A successful `TestingResult` must contain all of the following non-empty fields:

1. `testAnalysisReport`
2. `coverageFindings`
3. `riskFindings`
4. `testRecommendations`
5. `evidence`
6. `confidence`
7. `limitations`

Coverage findings are static completeness observations only. The result must state that it has not measured runtime coverage, executed a test, verified a pass/fail result, or established production quality. `L3` requires a non-empty version reference for every authorised context; otherwise output is capped at `L2`.

## 4. Evidence-first and Validation

1. Reject cancellation, wrong operation, missing/invalid/expired permission, invalid scope, and exceeded budget.
2. Deep-freeze copies of authorised context, execution context, grant, budget, and canonical source evidence.
3. Build one canonical evidence item per authorised test context before invoking the assistant.
4. Invoke only the deterministic port with frozen request and frozen evidence.
5. Normalise any non-success port outcome to a controlled invocation failure.
6. Accept a result only when every required field is non-empty, each finding references only authorised evidence, result and outcome evidence exactly match the canonical ordered set, and confidence stays within the evidence bound.
7. Append Audit Evidence without changing Workflow, Task, Agent, Registry, Knowledge, or project state.

The adapter blocks a result that exposes a nontrivial full authorised test-context body through report text, findings, recommendation, limitation, result reference, or finding identifier. Short common test fragments are not treated as secret values to avoid false positives.

## 5. Deterministic Analysis Semantics

The assistant can inspect only supplied in-memory context text for static markers such as named test declarations, assertion markers, skipped/placeholder test markers, and test-fixture dependency markers. It must produce neutral summaries rather than source-body copies.

It may recommend human review for missing assertions, placeholder tests, missing error-path evidence, or absent execution evidence. It must never claim a test passed, failed, was run, covered a numerical percentage, or proves runtime behaviour.

## 6. Test Plan

Automated tests will use fixed timestamps and only request-provided memory values. Required coverage:

- complete successful analysis and all seven output fields;
- evidence-first, ordered canonical evidence, and immutable snapshots;
- empty, unauthorised, duplicate, or unlocatable test context rejection;
- permission denial, expired/malformed/calendar-invalid timestamp denial;
- budget and cancellation denial before port invocation;
- invalid, overconfident, tampered, duplicate-evidence, or source-leaking output rejection;
- normalisation of non-success port outcomes to controlled failures;
- audit completeness for success and rejection;
- no external side effects and no modification of Runtime Core, Workflow, Task, Agent, Registry, or Knowledge.

## 7. File Boundary

```text
runtime/
  capability/
    testing-execution-contract.ts
    testing-invocation-port.ts
    deterministic-testing-assistant.ts
    testing-capability-adapter.ts
  services/
    testing-capability-runtime-service.ts
  tests/
    testing-capability.test.ts
```

`package.json` may change only to add the new test file to the current Node built-in test command. No `agents/`, `tools/`, `integrations/`, `api/`, Provider SDK, database, filesystem adapter, or test-runner integration may be added.
