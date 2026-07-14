# Testing Capability MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a deterministic, evidence-first, read-only Testing Capability MVP that analyses only explicit in-memory test context and appends audit evidence.

**Architecture:** Create a specialised contract, adapter, deterministic assistant, and runtime service beside the existing capabilities. The adapter owns validation, immutable snapshots, canonical evidence, invocation, and output checks. The runtime service only appends audit events.

**Tech Stack:** TypeScript; Node.js 24; Node built-in test runner; existing in-memory audit repository and permission/budget guard; no third-party dependencies.

## Global Constraints

- Analyse only request-provided `AuthorizedTestContext` values held in memory.
- Do not execute tests or user code; do not read/write files, scan directories, use network access, a Provider, Codex, LLM, or MCP.
- Do not generate patches, commits, deployments, or project-state changes.
- Registry Record remains `ABSENT`; Activation remains `NONE`.
- The sole operation is `ANALYZE_TEST_CONTEXT`; permission must grant it and use a strict ISO UTC expiry.
- A successful result always includes `testAnalysisReport`, `coverageFindings`, `riskFindings`, `testRecommendations`, `evidence`, `confidence`, and `limitations`.
- Coverage is static completeness only: never claim test execution, pass/fail, numerical runtime coverage, or production quality.
- Confidence is `L3` only when every context has a non-empty version reference; otherwise it is `L2`.
- The implementation must not modify Runtime Core, Workflow, Task, Agent, Registry, or Knowledge.

## File Structure

| File | Responsibility |
| --- | --- |
| `runtime/capability/testing-execution-contract.ts` | Request, result, finding, permission, failure, invocation, and outcome contracts. |
| `runtime/capability/testing-invocation-port.ts` | Replaceable local-only assistant boundary. |
| `runtime/capability/deterministic-testing-assistant.ts` | Deterministic static observations from frozen memory context and evidence. |
| `runtime/capability/testing-capability-adapter.ts` | Preflight, snapshots, canonical evidence, port invocation, output validation, controlled failures. |
| `runtime/services/testing-capability-runtime-service.ts` | Adapter call and audit append only. |
| `runtime/tests/testing-capability.test.ts` | Fixed-time, in-memory behaviour and boundary tests. |
| `package.json` | Adds only the new test file to the current Node test command. |

### Task 1: Define Contracts and Start with a Failing Test

**Files:**
- Create: `runtime/capability/testing-execution-contract.ts`
- Create: `runtime/capability/testing-invocation-port.ts`
- Create: `runtime/tests/testing-capability.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces `TESTING_OPERATIONS`, `TestingExecutionRequest`, `TestingResult`, `TestingExecutionOutcome`, `TestingInvocationRequest`, and `TestingInvocationPort`.
- `TestingInvocationPort.invoke(invocation: TestingInvocationRequest): TestingExecutionOutcome` is the only assistant entry point.

- [ ] **Step 1: Write a failing contract test**

```ts
import { TESTING_OPERATIONS } from '../capability/testing-execution-contract.ts';

test('TC-01 declares the sole read-only testing operation', () => {
  assert.deepEqual(TESTING_OPERATIONS, ['ANALYZE_TEST_CONTEXT']);
});
```

- [ ] **Step 2: Verify RED**

Run: `node --experimental-strip-types --test runtime/tests/testing-capability.test.ts`

Expected: fail because `testing-execution-contract.ts` does not exist.

- [ ] **Step 3: Write the minimal contracts**

```ts
export const TESTING_OPERATIONS = ['ANALYZE_TEST_CONTEXT'] as const;
export type TestingOperation = (typeof TESTING_OPERATIONS)[number];

export interface AuthorizedTestContext {
  readonly sourceRef: string;
  readonly location: string;
  readonly content: string;
  readonly versionRef?: string;
}

export interface TestingExecutionRequest {
  readonly taskId: string;
  readonly workflowId: string;
  readonly operation: TestingOperation;
  readonly testingObjective: string;
  readonly authorizedTestContexts: readonly AuthorizedTestContext[];
  readonly executionContext: ExecutionContext;
  readonly permissionGrant: TestingPermissionGrant;
  readonly budget: BudgetSnapshot;
  readonly cancelled?: boolean;
}
```

Define typed static `CoverageFinding`, `TestingRiskFinding`, and `TestingRecommendation` records with identifier, summary, and `evidenceRefs`. Define `TestingResult` with all seven required fields. Define failure categories `PERMISSION_DENIED`, `BUDGET_EXCEEDED`, `CANCELLED`, `SOURCE_SCOPE_INVALID`, `OUTPUT_INVALID`, `EXECUTION_FAILED` and stages `PREFLIGHT`, `INVOCATION`, `VALIDATION`. Reuse existing generic runtime types; do not extend them.

- [ ] **Step 4: Add the test file to `package.json`, then verify GREEN**

Run: `node --experimental-strip-types --test runtime/tests/testing-capability.test.ts`

Expected: `TC-01` passes.

- [ ] **Step 5: Commit**

```powershell
git add package.json runtime/capability/testing-execution-contract.ts runtime/capability/testing-invocation-port.ts runtime/tests/testing-capability.test.ts
git commit -m "test: define testing capability contract"
```

### Task 2: Implement Deterministic Static Analysis by TDD

**Files:**
- Create: `runtime/capability/deterministic-testing-assistant.ts`
- Modify: `runtime/tests/testing-capability.test.ts`

**Interfaces:**
- Consumes `TestingInvocationPort`, `TestingInvocationRequest`, and canonical evidence.
- Produces `DeterministicTestingAssistant implements TestingInvocationPort`.

- [ ] **Step 1: Write failing behaviour tests**

```ts
test('TC-02 produces static findings without asserting execution or runtime coverage', () => {
  const outcome = new DeterministicTestingAssistant(() => NOW).invoke(invocation);
  assert.equal(outcome.status, 'SUCCESS');
  assert.match(outcome.result!.testAnalysisReport, /static/i);
  assert.match(outcome.result!.limitations.join(' '), /not executed/i);
  assert.equal(outcome.result!.confidence, 'L3');
});

test('TC-03 caps confidence at L2 when a test context lacks a version reference', () => {
  const outcome = new DeterministicTestingAssistant(() => NOW).invoke(unversionedInvocation);
  assert.equal(outcome.result!.confidence, 'L2');
});
```

- [ ] **Step 2: Verify RED**

Run: `node --experimental-strip-types --test runtime/tests/testing-capability.test.ts`

Expected: fail because `deterministic-testing-assistant.ts` does not exist.

- [ ] **Step 3: Implement the minimum assistant**

```ts
export class DeterministicTestingAssistant implements TestingInvocationPort {
  constructor(private readonly now: () => string = () => new Date().toISOString()) {}

  invoke(invocation: TestingInvocationRequest): TestingExecutionOutcome {
    const confidence = invocation.request.authorizedTestContexts.every(hasVersion) ? 'L3' : 'L2';
    return {
      status: 'SUCCESS',
      result: createStaticResult(invocation, confidence),
      evidence: invocation.evidence,
      confidence,
      timestamp: this.now(),
      usage: { tokenUsed: 0, toolUsed: 0, timeUsedMs: 0, costUsed: 0 },
    };
  }
}
```

Inspect only supplied strings for test declaration, assertion, skipped/placeholder, and fixture markers. Produce neutral summary text and evidence references without copying source bodies. Include a limitation that no test ran and no runtime coverage or production behaviour was verified.

- [ ] **Step 4: Verify GREEN**

Run: `npm.cmd test`

Expected: all baseline tests and `TC-01` to `TC-03` pass.

- [ ] **Step 5: Commit**

```powershell
git add runtime/capability/deterministic-testing-assistant.ts runtime/tests/testing-capability.test.ts
git commit -m "feat: add deterministic testing assistant"
```

### Task 3: Implement the Adapter and Boundary Validation by TDD

**Files:**
- Create: `runtime/capability/testing-capability-adapter.ts`
- Modify: `runtime/tests/testing-capability.test.ts`

**Interfaces:**
- Consumes `TestingExecutionRequest`, `TestingInvocationPort`, and `PermissionBudgetGuard`.
- Produces `TestingCapabilityAdapter.invoke(request): TestingExecutionOutcome`.

- [ ] **Step 1: Write failing guard and validation tests**

```ts
test('TC-04 blocks an unauthorised context before the port is invoked', () => {
  const port = new CountingPort();
  const outcome = createAdapter(port).invoke(createRequest({
    executionContext: { ...context, allowedContextRefs: [] },
  }));
  assert.equal(outcome.status, 'BLOCKED');
  assert.equal(outcome.failure?.category, 'SOURCE_SCOPE_INVALID');
  assert.equal(port.calls, 0);
});

test('TC-05 blocks missing permission, exceeded budget, and cancellation before invocation', () => {
  for (const request of [
    createRequest({ permissionGrant: { ...createRequest().permissionGrant, allowedOperations: [] } }),
    createRequest({ budget: { ...createRequest().budget, tokenLimit: 0, tokenUsed: 1 } }),
    createRequest({ cancelled: true }),
  ]) {
    const port = new CountingPort();
    const outcome = createAdapter(port).invoke(request);
    assert.equal(outcome.status, 'BLOCKED');
    assert.equal(port.calls, 0);
  }
});

test('TC-06 rejects incomplete, tampered, source-leaking, or overconfident output', () => {
  const invalidPort: TestingInvocationPort = {
    invoke: (invocation) => ({
      status: 'SUCCESS', evidence: invocation.evidence, confidence: 'L4', timestamp: NOW,
      usage: { tokenUsed: 0, toolUsed: 0, timeUsedMs: 0, costUsed: 0 },
      result: undefined,
    }),
  };
  const outcome = createAdapter(invalidPort).invoke(createRequest());
  assert.equal(outcome.failure?.category, 'OUTPUT_INVALID');
});
```

- [ ] **Step 2: Verify RED**

Run: `node --experimental-strip-types --test runtime/tests/testing-capability.test.ts`

Expected: fail because `testing-capability-adapter.ts` does not exist.

- [ ] **Step 3: Implement adapter operations in this sequence**

```ts
invoke(request: TestingExecutionRequest): TestingExecutionOutcome {
  const preflight = this.preflight(request);
  if (preflight !== undefined) return preflight;
  const immutableRequest = this.snapshotRequest(request);
  const evidence = this.buildEvidence(immutableRequest);
  const outcome = this.invokePortOrFailure(immutableRequest, evidence);
  if (outcome.status !== 'SUCCESS') return this.failed(immutableRequest, 'EXECUTION_FAILED', 'INVOCATION', 'invocation port returned a non-success result');
  if (!this.hasValidResult(immutableRequest, outcome, evidence)) return this.failed(immutableRequest, 'OUTPUT_INVALID', 'VALIDATION', 'successful testing output is invalid');
  return outcome;
}
```

Preflight rejects cancellation, incorrect operation, missing operation permission, malformed/expired strict UTC timestamp, blank objective, empty/duplicate/blank/out-of-scope context, and denied budget before port invocation. Snapshot context arrays, execution-context arrays, permission operations, budget, and canonical evidence with deep freeze. Validation requires every result field, exact ordered canonical evidence in outcome and result, authorised finding references, confidence within bound, and no nontrivial full-context source body in any output string.

- [ ] **Step 4: Add and verify all remaining adapter tests**

Add checks for malformed and calendar-invalid timestamps, duplicate context, non-success port normalisation to `EXECUTION_FAILED`, immutable request/evidence, and short ordinary context not causing a false positive.

Run: `npm.cmd test`

Expected: all tests pass.

- [ ] **Step 5: Commit**

```powershell
git add runtime/capability/testing-capability-adapter.ts runtime/tests/testing-capability.test.ts
git commit -m "feat: add testing capability adapter"
```

### Task 4: Add Audit-only Runtime Integration by TDD

**Files:**
- Create: `runtime/services/testing-capability-runtime-service.ts`
- Modify: `runtime/tests/testing-capability.test.ts`

**Interfaces:**
- Consumes `TestingCapabilityAdapter`, `AuditService`, and `TestingExecutionRequest`.
- Produces `TestingCapabilityRuntimeService.execute(request): { outcome; auditEvent }`.

- [ ] **Step 1: Write a failing audit integration test**

```ts
test('TC-07 records complete audit evidence for successful and rejected analysis', () => {
  const repository = new InMemoryAuditRepository();
  const service = new TestingCapabilityRuntimeService(createAdapter(), new AuditService(repository), () => NOW);
  const succeeded = service.execute(createRequest());
  const blocked = service.execute(createRequest({ cancelled: true }));

  assert.equal(succeeded.auditEvent.outputRef, succeeded.outcome.result?.resultRef);
  assert.equal(blocked.auditEvent.failureReason, 'CANCELLED');
  assert.equal(repository.listByWorkflowId('workflow-testing-1').length, 2);
});
```

- [ ] **Step 2: Verify RED**

Run: `node --experimental-strip-types --test runtime/tests/testing-capability.test.ts`

Expected: fail because `testing-capability-runtime-service.ts` does not exist.

- [ ] **Step 3: Implement the audit-only service**

```ts
execute(request: TestingExecutionRequest): TestingCapabilityRuntimeExecutionResult {
  const outcome = this.adapter.invoke(request);
  const auditEvent = this.auditService.append({
    auditId: `testing-capability-audit-${this.nextAuditId++}`,
    workflowId: request.workflowId,
    taskId: request.taskId,
    eventType: outcome.status === 'SUCCESS' ? 'TESTING_CAPABILITY_COMPLETED' : 'TESTING_CAPABILITY_REJECTED',
    status: outcome.status,
    evidence: outcome.evidence,
    timestamp: this.now(),
    inputRefs: [request.executionContext.intentRef, request.permissionGrant.grantId, ...request.authorizedTestContexts.map((context) => context.sourceRef)],
  });
  return { outcome, auditEvent };
}
```

Add `result`, `outputRef`, `budgetSnapshot`, and failure category/stage when they exist. Do not change workflow or project state.

- [ ] **Step 4: Verify GREEN and perform scope check**

Run: `npm.cmd test`

Expected: exit code 0 and all tests pass.

Run: `git diff --name-only main...HEAD`

Expected: only planned capability, service, test, package, plan, and spec files; no prohibited directory.

- [ ] **Step 5: Commit**

```powershell
git add runtime/services/testing-capability-runtime-service.ts runtime/tests/testing-capability.test.ts
git commit -m "feat: add testing capability audit integration"
```

### Task 5: Fresh Completion Verification

**Files:**
- Modify: `runtime/tests/testing-capability.test.ts` only if a specified boundary is not already covered.

- [ ] **Step 1: Run the complete suite from a clean working tree**

Run: `npm.cmd test`

Expected: exit code 0 with all baseline and Testing Capability tests passing.

- [ ] **Step 2: Scan the new capability surface for prohibited integration**

Run: `rg -n "codex|openai|mcp|fetch\\(|http|https|fs\\.|readFile|writeFile|child_process|spawn\\(|exec\\(" runtime/capability/testing-* runtime/services/testing-capability-runtime-service.ts runtime/tests/testing-capability.test.ts`

Expected: no implementation of network, filesystem, external-tool, or user-code execution.

- [ ] **Step 3: Check paths and cleanliness**

Run: `git diff --name-only main...HEAD; git status --short`

Expected: no changes to Runtime Core, Workflow, Task, Agent, Registry, Knowledge, `agents/`, `tools/`, `integrations/`, or `api/`; working tree is clean after commits.

- [ ] **Step 4: Commit a final test-only correction only if required**

```powershell
git add runtime/tests/testing-capability.test.ts
git commit -m "test: cover testing capability boundaries"
```

Skip this command when no correction is necessary; do not create an empty commit.

## Plan Self-Review

### Spec coverage

- Static, in-memory, read-only contract: Task 1.
- Deterministic evidence-first analysis and confidence control: Task 2.
- Permission, budget, cancellation, scope, immutable evidence, invalid output, and source-leak controls: Task 3.
- Audit evidence without state progression: Task 4.
- Full test run and prohibited-surface check: Task 5.

### Placeholder scan

No task contains a deferred implementation marker. Each specified failure type has a concrete test or implementation action.

### Type consistency

All tasks consistently use `TestingExecutionRequest`, `TestingInvocationRequest`, `TestingExecutionOutcome`, `TestingInvocationPort`, `TestingCapabilityAdapter`, and `TestingCapabilityRuntimeService`. Existing generic runtime types are imported, never changed.
