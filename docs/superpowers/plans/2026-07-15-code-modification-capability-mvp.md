# Code Modification Capability MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a deterministic, evidence-first, proposal-only Code Modification Capability that emits a structured Change Proposal, display-only minimal unified Diff, and audit evidence without modifying a project.

**Architecture:** A specialised contract and port feed a deterministic assistant through a guarded adapter. The adapter validates authorised code and both evidence categories, freezes snapshots, constructs canonical evidence, validates the proposal/diff, and returns controlled failures. The runtime service only appends audit events.

**Tech Stack:** TypeScript, Node.js 24, Node built-in test runner, existing `PermissionBudgetGuard` and `AuditService`; no third-party dependency.

## Global Constraints

- The only operation is `PROPOSE_CHANGE`; output approval status is always `CONFIRM_REQUIRED`.
- Inputs are only explicit in-memory code contexts plus explicit Code Analysis Evidence and Test Evidence.
- Do not read/write files, scan, run tests/user code, access network/database/repository, call Provider/Codex/LLM/MCP, apply a patch, create a commit, or deploy.
- Do not modify Runtime Core, Workflow, Task, Agent, Registry, Knowledge, Manifesto, ADR, Master Plan, Gate, or project files.
- Registry Record stays `ABSENT`; Activation stays `NONE`.
- The Diff is display-only and contains exactly one removal and one addition for a supported target marker; never a full context or unrelated source body.
- Successful results have zero token/tool/time/cost usage and confidence L3 only when every code context is versioned; otherwise L2.
- Missing/unauthorised Code Analysis Evidence or Test Evidence blocks before port invocation.
- No `agents/`, `tools/`, `integrations/`, `api/`, Provider SDK, database, filesystem adapter, test runner integration, patch applier, commit, or deployment module.

## File Structure

| File | Responsibility |
| --- | --- |
| `runtime/capability/code-modification-execution-contract.ts` | Request, evidence binding, proposal, diff, failure, invocation, and result contracts. |
| `runtime/capability/code-modification-invocation-port.ts` | Deterministic assistant boundary only. |
| `runtime/capability/deterministic-code-modification-assistant.ts` | Produces one proposal/diff for a supported in-memory marker; has no side effects. |
| `runtime/capability/code-modification-capability-adapter.ts` | Preflight, immutable snapshot, canonical evidence, invocation, and defensive result validation. |
| `runtime/services/code-modification-capability-runtime-service.ts` | Adapter invocation and audit append only. |
| `runtime/tests/code-modification-capability.test.ts` | Fixed-time, in-memory TDD tests. |
| `package.json` | Adds only this test file to the existing Node test command. |

### Task 1: Contracts and First Failing Test

**Files:** Create `runtime/capability/code-modification-execution-contract.ts`, `runtime/capability/code-modification-invocation-port.ts`, `runtime/tests/code-modification-capability.test.ts`; modify `package.json`.

**Interfaces:** Export `CODE_MODIFICATION_OPERATIONS = ['PROPOSE_CHANGE'] as const`, `AuthorizedChangeContext`, `ChangeEvidenceBinding`, `ModificationPermissionGrant`, `ChangeProposal`, `ProposedDiff`, `ModificationResult`, `ModificationExecutionRequest`, invocation/outcome/failure types, and `CodeModificationInvocationPort.invoke(invocation)`.

- [ ] **Step 1: Write the RED test**

```ts
test('CM-01 exposes only the proposal operation', () => {
  assert.deepEqual(CODE_MODIFICATION_OPERATIONS, ['PROPOSE_CHANGE']);
});
```

- [ ] **Step 2: Verify RED**

Run: `node --experimental-strip-types --test runtime/tests/code-modification-capability.test.ts`

Expected: module-not-found failure for the new execution contract.

- [ ] **Step 3: Implement minimal contracts**

```ts
export interface ChangeProposal {
  readonly changeId: string;
  readonly goal: string;
  readonly scope: readonly string[];
  readonly originalSummary: string;
  readonly proposedChange: string;
  readonly risk: 'LOW' | 'MEDIUM' | 'HIGH';
  readonly impact: string;
  readonly rollback: string;
  readonly evidenceRefs: readonly string[];
  readonly approvalStatus: 'CONFIRM_REQUIRED';
  readonly confidence: ConfidenceLevel;
  readonly limitations: readonly string[];
}

export interface ProposedDiff {
  readonly diffId: string;
  readonly targetRef: string;
  readonly displayText: string;
  readonly evidenceRefs: readonly string[];
}
```

Use a `ChangeEvidenceBinding` shape of `evidenceRef`, `source`, `summary`, `confidence`, and `timestamp`; request has non-empty `changeGoal`, contexts, code-analysis bindings, test bindings, execution context, permission, budget, cancellation. Failure categories include permission, budget, cancellation, source scope, evidence insufficient, output invalid, execution failed.

- [ ] **Step 4: Add test file to package command and verify GREEN**

Run: `npm.cmd test`

Expected: existing suite plus CM-01 passes.

- [ ] **Step 5: Commit**

```powershell
git add package.json runtime/capability/code-modification-execution-contract.ts runtime/capability/code-modification-invocation-port.ts runtime/tests/code-modification-capability.test.ts
git commit -m "test: define code modification capability contract"
```

### Task 2: Deterministic Proposal Assistant

**Files:** Create `runtime/capability/deterministic-code-modification-assistant.ts`; modify `runtime/tests/code-modification-capability.test.ts`.

**Interfaces:** Consumes the Task 1 invocation; produces `DeterministicCodeModificationAssistant implements CodeModificationInvocationPort`.

- [ ] **Step 1: Write RED tests**

```ts
test('CM-02 returns a CONFIRM_REQUIRED proposal and one display-only diff', () => {
  const outcome = new DeterministicCodeModificationAssistant(() => NOW).invoke(invocation);
  assert.equal(outcome.status, 'SUCCESS');
  assert.equal(outcome.result!.changeProposal.approvalStatus, 'CONFIRM_REQUIRED');
  assert.match(outcome.result!.proposedDiff.displayText, /^--- /m);
  assert.match(outcome.result!.proposedDiff.displayText, /^\+\+\+ /m);
});

test('CM-03 fails when no supported marker exists', () => {
  assert.equal(outcome.status, 'FAILURE');
});
```

- [ ] **Step 2: Verify RED**

Run: `node --experimental-strip-types --test runtime/tests/code-modification-capability.test.ts`

Expected: module-not-found failure for deterministic assistant.

- [ ] **Step 3: Implement minimal deterministic behaviour**

Use one supported marker only: `console.log(`. For the first authorised context containing it, create one proposal that recommends replacing the matched call prefix with `logger.info(`. The display text has `--- <location>`, `+++ <location>`, one `-` source line, and one `+` proposed line. It must not copy the full context, cannot apply the change, and must state human confirmation and downstream testing are required.

- [ ] **Step 4: Verify GREEN**

Run: `npm.cmd test`

Expected: all tests pass; deterministic output has zero usage and canonical evidence.

- [ ] **Step 5: Commit**

```powershell
git add runtime/capability/deterministic-code-modification-assistant.ts runtime/tests/code-modification-capability.test.ts
git commit -m "feat: add deterministic code modification assistant"
```

### Task 3: Guarded Modification Adapter

**Files:** Create `runtime/capability/code-modification-capability-adapter.ts`; modify `runtime/tests/code-modification-capability.test.ts`.

**Interfaces:** Produces `CodeModificationCapabilityAdapter.invoke(request): ModificationExecutionOutcome`.

- [ ] **Step 1: Write RED boundary tests**

```ts
test('CM-04 blocks missing code-analysis or test evidence before port invocation', () => {
  const port = new CountingPort();
  for (const request of [
    createRequest({ codeAnalysisEvidence: [] }),
    createRequest({ testEvidence: [] }),
  ]) {
    const outcome = createAdapter(port).invoke(request);
    assert.equal(outcome.failure?.category, 'EVIDENCE_INSUFFICIENT');
  }
  assert.equal(port.calls, 0);
});

test('CM-05 blocks cancellation, permission, budget, and invalid scope before invocation', () => {
  const requests = [
    createRequest({ cancelled: true }),
    createRequest({ permissionGrant: { ...createRequest().permissionGrant, allowedOperations: [] } }),
    createRequest({ budget: { ...createRequest().budget, tokenLimit: 0, tokenUsed: 1 } }),
    createRequest({ executionContext: { ...createRequest().executionContext, allowedContextRefs: [] } }),
  ];
  for (const request of requests) {
    const port = new CountingPort();
    const outcome = createAdapter(port).invoke(request);
    assert.equal(outcome.status, 'BLOCKED');
    assert.equal(port.calls, 0);
  }
});
```

- [ ] **Step 2: Verify RED**

Run: `node --experimental-strip-types --test runtime/tests/code-modification-capability.test.ts`

Expected: module-not-found failure for adapter.

- [ ] **Step 3: Implement adapter**

Preflight must reject wrong operation, missing/expired strict UTC permission, blank goal, empty/duplicate/blank/out-of-scope contexts, missing/duplicate/blank/unallowed evidence bindings, cancellation, and budget before port invocation. Freeze all request arrays/records and construct canonical source plus evidence bindings before port call. Normalise exceptions/non-success to `EXECUTION_FAILED`.

Require every proposal/diff/result field; fixed `CONFIRM_REQUIRED`; valid LOW/MEDIUM/HIGH risk; L2/L3 confidence bound; zero usage; exact ordered canonical evidence; all evidence refs authorised; diff target matches context and exactly one removal/one addition; no full source-body leakage beyond the one displayed removal line.

- [ ] **Step 4: Add negative tests and verify GREEN**

Test invalid output, invalid diff, duplicate/tampered evidence, overconfidence, source leakage, non-zero usage, immutable snapshots, non-success port normalisation, and short context acceptance.

Run: `npm.cmd test`

Expected: all tests pass.

- [ ] **Step 5: Commit**

```powershell
git add runtime/capability/code-modification-capability-adapter.ts runtime/tests/code-modification-capability.test.ts
git commit -m "feat: add code modification capability adapter"
```

### Task 4: Audit-only Runtime Service and Final Verification

**Files:** Create `runtime/services/code-modification-capability-runtime-service.ts`; modify `runtime/tests/code-modification-capability.test.ts`.

**Interfaces:** `CodeModificationCapabilityRuntimeService.execute(request)` returns adapter outcome plus one audit event.

- [ ] **Step 1: Write RED audit test**

```ts
test('CM-06 appends proposal audit evidence without applying a change', () => {
  const result = service.execute(createRequest());
  assert.equal(result.auditEvent.outputRef, result.outcome.result?.resultRef);
  assert.equal(result.outcome.result?.changeProposal.approvalStatus, 'CONFIRM_REQUIRED');
});
```

- [ ] **Step 2: Verify RED**

Run: `node --experimental-strip-types --test runtime/tests/code-modification-capability.test.ts`

Expected: module-not-found failure for runtime service.

- [ ] **Step 3: Implement the audit-only service**

Append one event containing workflow/task IDs, input refs, canonical evidence, result/proposal/diff references, permission/budget snapshots, approval status, and failure details. It must not import state-changing services.

- [ ] **Step 4: Full verification**

Run: `npm.cmd test`

Expected: exit code 0.

Run: `rg -n "\\bcodex\\b|\\bopenai\\b|\\bmcp\\b|\\bfetch\\(|\\bhttps?://|\\bfs\\.|\\breadFile\\b|\\bwriteFile\\b|\\bchild_process\\b|\\bspawn\\(|\\bexec\\(" runtime/capability/code-modification-* runtime/services/code-modification-capability-runtime-service.ts runtime/tests/code-modification-capability.test.ts`

Expected: no forbidden integration or side-effect implementation.

- [ ] **Step 5: Commit**

```powershell
git add runtime/services/code-modification-capability-runtime-service.ts runtime/tests/code-modification-capability.test.ts
git commit -m "feat: add code modification capability audit integration"
```

## Plan Self-Review

- Task 1 defines all specialised contracts without changing generic runtime types.
- Task 2 creates only a deterministic proposal/diff and cannot apply it.
- Task 3 enforces evidence-first, confirmation, confidence, diff, immutability, and failure boundaries.
- Task 4 records audit evidence and verifies all prohibited integration surfaces.
- All type names are defined in Task 1 and used consistently in Tasks 2–4.
