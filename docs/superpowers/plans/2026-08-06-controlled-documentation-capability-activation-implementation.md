# Controlled Documentation Capability Activation & Execution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Register and restrictively activate the existing deterministic Documentation Capability, then connect an explicitly confirmed `WAITING_APPROVAL` Workflow to that Capability and return a traceable Draft Package, Validation Evidence, and Audit chain.

**Architecture:** Extend the existing Layer 5 Capability Governance and Runtime modules with an immutable activation projection and a dedicated approval-bound execution bridge. The bridge performs all approval, activation, permission, budget, source-scope, and correlation checks before the Workflow enters `EXECUTING`; it then delegates only the Documentation execution to the existing `DocumentationCapabilityRuntimeService` and leaves Workflow state authority with `WorkflowService`.

**Tech Stack:** TypeScript, Node.js 24, `node:test`, `node:crypto`, in-memory Ports/Adapters, no third-party dependencies.

## Global Constraints

- Design authority: `docs/superpowers/specs/2026-08-06-controlled-documentation-capability-activation-design.md`, object `SYS-L5-DOC-ACT-001`.
- Capability identity: `CAP-DOC-0001`, version `1.0.0-internal`, source commit `9876764`, operation `GENERATE_DRAFT` only.
- Capability environment: `INTERNAL_LOCAL`, internal non-production use only.
- Human control: every invocation is `CONFIRM_REQUIRED`; `ACTIVE` never authorizes an individual invocation.
- Runtime flow: `WAITING_APPROVAL -> EXECUTING -> VALIDATING -> COMPLETED`, or a documented blocked/cancelled/failed path.
- Runtime Core, Workflow, Task, Agent, Permission/Budget Guard, existing Documentation public contracts, Manifesto, ADRs, core lifecycle, Knowledge, and other Capability records must not be modified.
- No new Phase, Module, Agent, generic dispatcher, generic approval system, Provider, LLM, Codex, MCP, network, filesystem, database, API, tool call, document write, Knowledge write, retry, or automatic fallback.
- Authorized sources are caller-supplied in-memory values. Fingerprinting uses `node:crypto` only and never reads a path.
- The formal Registry record starts at `EVALUATING`; it may move to restricted `ACTIVE` only after all implementation and regression evidence passes.
- Existing 150 tests must remain green; the planned 15 new top-level tests bring the expected suite to 165 tests.

---

## 0. File Map and Responsibility Lock

### Create

- `capabilities/documentation/CAP-DOC-0001.md` — human-auditable Registry record and lifecycle history.
- `docs/capability/DOCUMENTATION_CAPABILITY_EVALUATION.md` — frozen evaluation evidence, score, risk, and activation recommendation.
- `runtime/capability/documentation-capability-activation-contract.ts` — closed activation identity/status/scope contract.
- `runtime/capability/documentation-capability-activation-port.ts` — read-only Runtime Port for the trusted activation projection.
- `runtime/capability/in-memory-documentation-capability-activation-repository.ts` — single-record immutable in-memory Adapter.
- `runtime/integration/documentation-source-scope-fingerprint.ts` — canonical in-memory source fingerprint algorithm.
- `runtime/integration/approved-documentation-execution-contract.ts` — approval, bridge request/result, failure, and execution Port contracts.
- `runtime/integration/approved-documentation-execution-service.ts` — preflight orchestration, Workflow/Task transitions, Capability delegation, and bridge audit.
- `runtime/tests/approved-documentation-execution.test.ts` — exactly 15 top-level tests named `AD-01` through `AD-15`.

### Modify

- `package.json` — append the new test file to the existing test command.
- `capabilities/README.md` — replace the “no formal records” statement with the exact restricted record state.
- `docs/DEVELOPMENT_PROGRESS.md` — record implementation evidence, limitations, and Gate result.
- `docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md` — update the existing Layer 5 Runtime/Capability route only.
- `docs/architecture/MODULE_REGISTRY.md` — update existing Runtime and Capability Governance rows; do not add a module.
- `memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md` — append the verified decision and remaining limitations.
- This plan file — check completed boxes and record final commands/results only.

### Explicitly forbidden modifications

- `runtime/models/runtime-types.ts`
- `runtime/workflow/**`
- `runtime/task/**`
- `runtime/agent/**`
- `runtime/permission/**`
- Existing files under `runtime/capability/documentation-*`
- Existing `runtime/services/documentation-capability-runtime-service.ts`
- `README.md`, `SKILL.md`, Manifesto, ADR, lifecycle, Gate, Knowledge, or another Capability record.

---

## 1. Contract Baseline

### 1.1 Activation projection

Implement the exact public contract in `runtime/capability/documentation-capability-activation-contract.ts`:

```ts
export const DOCUMENTATION_CAPABILITY_ID = 'CAP-DOC-0001' as const;
export const DOCUMENTATION_CAPABILITY_VERSION = '1.0.0-internal' as const;

export type DocumentationCapabilityRegistryStatus =
  | 'DISCOVERED'
  | 'EVALUATING'
  | 'ACTIVE'
  | 'DEPRECATED'
  | 'DISABLED'
  | 'REMOVED';

export interface DocumentationCapabilityActivationSnapshot {
  readonly capabilityId: typeof DOCUMENTATION_CAPABILITY_ID;
  readonly version: typeof DOCUMENTATION_CAPABILITY_VERSION;
  readonly registryStatus: DocumentationCapabilityRegistryStatus;
  readonly sourceCommit: '9876764';
  readonly allowedOperations: readonly ['GENERATE_DRAFT'];
  readonly allowedEnvironment: 'INTERNAL_LOCAL';
  readonly activationScope: readonly string[];
  readonly lastReviewAt: string;
  readonly nextReviewAt: string;
}
```

The active fixture used after final activation is:

```ts
export const ACTIVE_DOCUMENTATION_CAPABILITY: DocumentationCapabilityActivationSnapshot = {
  capabilityId: 'CAP-DOC-0001',
  version: '1.0.0-internal',
  registryStatus: 'ACTIVE',
  sourceCommit: '9876764',
  allowedOperations: ['GENERATE_DRAFT'],
  allowedEnvironment: 'INTERNAL_LOCAL',
  activationScope: [
    'INTERNAL_NON_PRODUCTION',
    'EXPLICIT_CONFIRMATION_REQUIRED',
    'AUTHORIZED_IN_MEMORY_SOURCES_ONLY',
    'DRAFT_OUTPUT_ONLY',
    'NO_FILESYSTEM_NETWORK_PROVIDER_TOOL_OR_KNOWLEDGE_WRITE',
  ],
  lastReviewAt: '2026-08-06T00:00:00.000Z',
  nextReviewAt: '2026-09-05T00:00:00.000Z',
};
```

### 1.2 Read-only activation Port

Implement:

```ts
export interface DocumentationCapabilityActivationPort {
  getById(
    capabilityId: string,
  ): DocumentationCapabilityActivationSnapshot | undefined;
}
```

The in-memory Adapter constructor accepts one trusted snapshot from the composition root, stores a deeply frozen clone, and returns a fresh deeply frozen clone. It exposes no `create`, `update`, `activate`, or status override method.

### 1.3 Approval and execution contract

Implement in `runtime/integration/approved-documentation-execution-contract.ts`:

```ts
import type { AuditEvent, Evidence, Task, WorkflowInstance } from '../models/runtime-types.ts';
import type {
  DocumentationExecutionOutcome,
  DocumentationExecutionRequest,
} from '../capability/documentation-execution-contract.ts';
import type { DocumentationRuntimeExecutionResult } from '../services/documentation-capability-runtime-service.ts';

export interface DocumentationExecutionApproval {
  readonly approvalId: string;
  readonly status: 'CONFIRMED';
  readonly classificationId: string;
  readonly routingId: string;
  readonly workflowId: string;
  readonly taskId: string;
  readonly capabilityId: 'CAP-DOC-0001';
  readonly capabilityVersion: '1.0.0-internal';
  readonly operation: 'GENERATE_DRAFT';
  readonly sourceScopeFingerprint: string;
  readonly confirmedAt: string;
  readonly expiresAt: string;
}

export interface ApprovedDocumentationExecutionRequest {
  readonly classificationId: string;
  readonly routingId: string;
  readonly executionEnvironment: 'INTERNAL_LOCAL';
  readonly approval?: DocumentationExecutionApproval;
  readonly documentationRequest: DocumentationExecutionRequest;
  readonly cancelled?: boolean;
}

export type ApprovedDocumentationExecutionDecision =
  | 'COMPLETED'
  | 'FAILED'
  | 'BLOCKED'
  | 'CANCELLED';

export type ApprovedDocumentationExecutionFailureCode =
  | 'WORKFLOW_NOT_FOUND'
  | 'WORKFLOW_NOT_WAITING_APPROVAL'
  | 'TASK_NOT_FOUND'
  | 'TASK_MISMATCH'
  | 'HANDOFF_REFERENCE_MISMATCH'
  | 'APPROVAL_REJECTED'
  | 'CAPABILITY_NOT_ACTIVE'
  | 'ACTIVATION_SCOPE_MISMATCH'
  | 'SOURCE_SCOPE_CHANGED'
  | 'PERMISSION_DENIED'
  | 'BUDGET_EXCEEDED'
  | 'SOURCE_SCOPE_INVALID'
  | 'CANCELLED'
  | 'CAPABILITY_FAILED';

export interface ApprovedDocumentationExecutionFailure {
  readonly code: ApprovedDocumentationExecutionFailureCode;
  readonly stage: 'PREFLIGHT' | 'EXECUTION' | 'VALIDATION';
  readonly reason: string;
}

export interface ApprovedDocumentationExecutionResult {
  readonly decision: ApprovedDocumentationExecutionDecision;
  readonly workflow?: WorkflowInstance;
  readonly task?: Task;
  readonly documentationOutcome?: DocumentationExecutionOutcome;
  readonly auditEvents: readonly AuditEvent[];
  readonly evidence: readonly Evidence[];
  readonly failure?: ApprovedDocumentationExecutionFailure;
}

export interface DocumentationExecutionPort {
  execute(request: DocumentationExecutionRequest): DocumentationRuntimeExecutionResult;
}
```

The existing `DocumentationCapabilityRuntimeService` satisfies `DocumentationExecutionPort` structurally. Do not edit the existing service.

### 1.4 Canonical source fingerprint

Implement this signature:

```ts
export function createDocumentationSourceScopeFingerprint(
  sources: readonly AuthorizedDocumentationSource[],
): string;
```

Exact algorithm:

1. Reject an empty array, duplicate/blank `sourceRef`, blank `location`, or blank `content` with `TypeError`.
2. Calculate `contentHash = SHA-256(UTF-8 content)` per source.
3. Sort by `sourceRef` ascending without mutating caller input.
4. Canonicalize each element as `{ sourceRef, location, versionRef: versionRef ?? null, contentHash }`.
5. Calculate SHA-256 over UTF-8 `JSON.stringify(canonicalArray)`.
6. Return a lowercase 64-character hexadecimal string.

---

## 2. Isolated Implementation Workspace

- [ ] **Step 1: Create a dedicated worktree at execution time**

Use `superpowers:using-git-worktrees` and create branch `feat/controlled-documentation-capability-activation`. Do not implement on `main`.

- [ ] **Step 2: Verify the starting baseline**

Run:

```powershell
git status --short
npm.cmd test
```

Expected: clean worktree and `150/150` tests passing.

- [ ] **Step 3: Verify the source identity**

Run:

```powershell
git show --no-patch --oneline 9876764
git diff --exit-code 9876764 -- runtime/capability/documentation-execution-contract.ts runtime/capability/documentation-capability-adapter.ts runtime/capability/documentation-invocation-port.ts runtime/capability/deterministic-documentation-assistant.ts runtime/services/documentation-capability-runtime-service.ts runtime/tests/documentation-capability.test.ts
```

Expected: source commit exists; the second command exits 0. If the source files have changed since `9876764`, stop and return the Registry to `EVALUATING`; do not activate the stale evaluation.

---

## 3. Task 1 — Capability Admission and EVALUATING Registry Record

**Files:**

- Create: `capabilities/documentation/CAP-DOC-0001.md`
- Create: `docs/capability/DOCUMENTATION_CAPABILITY_EVALUATION.md`
- Modify: `capabilities/README.md`

**Interfaces:**

- Consumes: Capability Admission, Registry, Evaluation, and Lifecycle standards.
- Produces: a formal `CAP-DOC-0001` record at `EVALUATING` and a frozen 84/100 evaluation record; it does not yet permit project execution.

- [ ] **Step 1: Create the Registry record at EVALUATING**

Write all Registry Standard fields with these exact values:

| Field | Value |
|---|---|
| Capability ID | `CAP-DOC-0001` |
| Name | Deterministic Evidence-driven Documentation Assistant |
| Type | Documentation Capability |
| Source | Internal TypeScript files named in the design spec |
| Version | `1.0.0-internal`; source commit `9876764` |
| License | `INTERNAL_USE_ONLY`; not an open-source license |
| Applicable Layer | Layer 5, usable by Layer 2/3/4 documentation tasks |
| Applicable Phase | `RESEARCH`, `EVALUATION`, `DESIGN`, `DEVELOPMENT`, `TESTING`, `RELEASE`, `MAINTENANCE` |
| Input | Explicit in-memory authorized source scope + objective + context + permission + budget |
| Output | Draft, Source References, Confidence, Evidence, Limitations; no write side effect |
| Dependencies | Node.js 24, existing Guard, Audit, Documentation Adapter/Service |
| Permission | `GENERATE_DRAFT`; no filesystem/network/provider/tool/Knowledge permission |
| Status | `EVALUATING` |
| Quality Score | `84/100`, Confidence `L3`, 2026-08-06 evidence baseline |
| Risk | Low only inside restricted internal scope |
| Human Control | `CONFIRM_REQUIRED` per invocation |
| Selection | `PROHIBITED` while `EVALUATING` |
| Activation Scope | `NONE` while `EVALUATING` |
| Fallback | reject execution and return to manual drafting; no provider fallback |
| Last Review | `2026-08-06T00:00:00.000Z` |
| Next Review | `2026-09-05T00:00:00.000Z` |

Change History must contain separate entries for `ABSENT -> DISCOVERED` and `DISCOVERED -> EVALUATING / ADMIT_FOR_EVALUATION`. Do not write the `ACTIVE` transition yet.

- [ ] **Step 2: Create the frozen Evaluation record**

Record the exact score breakdown `23/25`, `15/20`, `13/15`, `10/15`, `15/15`, `8/10`, total `84/100`, Confidence `L3`. Record source/version, internal usage terms, permission surface, test evidence, known limitations, rollback/fallback, and the recommendation: `Eligible for restricted internal activation only after the approval-bound Runtime bridge and full regression pass`.

- [ ] **Step 3: Update the capabilities directory status honestly**

Replace only the final “no formal Capability Record” statement in `capabilities/README.md` with: one formal Documentation record exists at `EVALUATING`; it is not selectable or active; no external capability is installed.

- [ ] **Step 4: Validate document completeness**

Run:

```powershell
$record = Get-Content -Raw -Encoding utf8 capabilities/documentation/CAP-DOC-0001.md
@('CAP-DOC-0001','1.0.0-internal','9876764','EVALUATING','ADMIT_FOR_EVALUATION','Selection','PROHIBITED','Activation Scope','NONE','INTERNAL_USE_ONLY') | ForEach-Object { if (-not $record.Contains($_)) { throw "Missing registry field: $_" } }
$evaluation = Get-Content -Raw -Encoding utf8 docs/capability/DOCUMENTATION_CAPABILITY_EVALUATION.md
@('84/100','L3','23/25','15/20','13/15','10/15','15/15','8/10') | ForEach-Object { if (-not $evaluation.Contains($_)) { throw "Missing evaluation evidence: $_" } }
git diff --check
```

Expected: no exception and no whitespace error.

- [ ] **Step 5: Commit the evaluation admission**

```powershell
git add capabilities/README.md capabilities/documentation/CAP-DOC-0001.md docs/capability/DOCUMENTATION_CAPABILITY_EVALUATION.md
git commit -m "docs: admit documentation capability for evaluation"
```

---

## 4. Task 2 — Activation Projection, Approval Contract, and Source Fingerprint

**Files:**

- Create: `runtime/capability/documentation-capability-activation-contract.ts`
- Create: `runtime/capability/documentation-capability-activation-port.ts`
- Create: `runtime/capability/in-memory-documentation-capability-activation-repository.ts`
- Create: `runtime/integration/documentation-source-scope-fingerprint.ts`
- Create: `runtime/integration/approved-documentation-execution-contract.ts`
- Create/Test: `runtime/tests/approved-documentation-execution.test.ts`

**Interfaces:**

- Consumes: `AuthorizedDocumentationSource`, existing Runtime types, and `DocumentationRuntimeExecutionResult`.
- Produces: immutable activation lookup, exact approval-bound request/result contract, and deterministic fingerprint helper used by Task 3.

- [ ] **Step 1: Write tests AD-01 through AD-04 first**

Add four top-level `node:test` cases:

```ts
test('AD-01 activation repository returns only immutable trusted projections', () => {
  const repository = new InMemoryDocumentationCapabilityActivationRepository(activeSnapshot());
  const first = repository.getById('CAP-DOC-0001')!;
  assert.equal(first.registryStatus, 'ACTIVE');
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.activationScope), true);
  assert.equal(repository.getById('CAP-DOC-9999'), undefined);
  assert.notEqual(repository.getById('CAP-DOC-0001'), first);
});

test('AD-02 source fingerprint is deterministic and source-order independent', () => {
  assert.equal(
    createDocumentationSourceScopeFingerprint([sourceB(), sourceA()]),
    createDocumentationSourceScopeFingerprint([sourceA(), sourceB()]),
  );
});

test('AD-03 source fingerprint changes for content, location, or version drift', () => {
  const baseline = createDocumentationSourceScopeFingerprint([sourceA()]);
  for (const source of [
    { ...sourceA(), content: 'changed' },
    { ...sourceA(), location: 'docs/other.md' },
    { ...sourceA(), versionRef: 'v2' },
  ]) assert.notEqual(createDocumentationSourceScopeFingerprint([source]), baseline);
});

test('AD-04 source fingerprint rejects empty, duplicate, and blank source fields', () => {
  assert.throws(() => createDocumentationSourceScopeFingerprint([]), TypeError);
  assert.throws(() => createDocumentationSourceScopeFingerprint([sourceA(), sourceA()]), TypeError);
  assert.throws(() => createDocumentationSourceScopeFingerprint([{ ...sourceA(), content: ' ' }]), TypeError);
});
```

The test fixture `activeSnapshot()` must use the exact constant values from section 1.1. `sourceA()` and `sourceB()` must return new in-memory objects each call.

- [ ] **Step 2: Run the focused tests and observe red**

```powershell
node --experimental-strip-types --test runtime/tests/approved-documentation-execution.test.ts
```

Expected: module-not-found failure for the new activation or fingerprint files.

- [ ] **Step 3: Implement the minimum activation contract, Port, and Adapter**

Use the exact interfaces in sections 1.1 and 1.2. Validate constructor input once: exact ID/version/source commit, canonical ISO review dates, nonempty unique activation scope, one allowed operation, and `nextReviewAt > lastReviewAt`. Throw `TypeError` for an invalid trusted projection.

Use a local recursive clone/freeze helper. The Adapter must not expose mutators and must not parse the Markdown Registry file.

- [ ] **Step 4: Implement the minimum fingerprint helper and execution contracts**

Use `createHash` from `node:crypto`, UTF-8 strings, the exact canonical object key order, and lowercase hex. Add only the types from sections 1.3 and 1.4; do not add service behavior yet.

- [ ] **Step 5: Verify and commit Task 2**

```powershell
node --experimental-strip-types --test runtime/tests/approved-documentation-execution.test.ts
npm.cmd test
git diff --check
git add runtime/capability/documentation-capability-activation-contract.ts runtime/capability/documentation-capability-activation-port.ts runtime/capability/in-memory-documentation-capability-activation-repository.ts runtime/integration/documentation-source-scope-fingerprint.ts runtime/integration/approved-documentation-execution-contract.ts runtime/tests/approved-documentation-execution.test.ts
git commit -m "feat: add documentation activation contracts"
```

Expected: 4 focused tests and all existing tests pass.

---

## 5. Task 3 — Approval-Bound Preflight and Non-Executing Paths

**Files:**

- Create: `runtime/integration/approved-documentation-execution-service.ts`
- Modify/Test: `runtime/tests/approved-documentation-execution.test.ts`

**Interfaces:**

- Consumes: `WorkflowService`, `TaskService`, `AuditService`, `DocumentationCapabilityActivationPort`, `DocumentationExecutionPort`, approval/fingerprint contracts.
- Produces: `ApprovedDocumentationExecutionService.execute(request): ApprovedDocumentationExecutionResult` with deterministic preflight outcomes and no Capability call on blocked/cancelled paths.

- [ ] **Step 1: Add counting fakes and tests AD-05 through AD-10**

Create a `CountingDocumentationExecutionPort` whose `execute` increments `calls`. Build Workflow/Task fixtures with real in-memory repositories and this exact setup sequence:

```ts
const workflow = workflowService.create({
  intentRef: 'intent-001',
  executionContext,
  controlMode: 'CONFIRM',
  budget,
});
workflowService.transition(workflow.workflowId, 'PLANNING');
const task = taskService.create(workflow.workflowId, {
  request: 'handoff:v1:{"routingId":"routing-intent-001","objective":"Create an evidence-backed draft."}',
});
workflowService.transition(workflow.workflowId, 'WAITING_APPROVAL');
```

Add:

- `AD-05`: workflow missing, wrong state, task missing, task/workflow mismatch, and malformed handoff request each return `BLOCKED`; Capability calls remain zero.
- `AD-06`: missing approval, expired approval, noncanonical dates, and each classification/routing/workflow/task ID mismatch return `APPROVAL_REJECTED` or the more specific correlation code; state remains `WAITING_APPROVAL`; calls remain zero.
- `AD-07`: non-`ACTIVE` snapshot, wrong capability version, wrong operation, or wrong environment returns `CAPABILITY_NOT_ACTIVE`/`ACTIVATION_SCOPE_MISMATCH`; calls remain zero.
- `AD-08`: any post-confirmation content/location/version change returns `SOURCE_SCOPE_CHANGED`; calls remain zero.
- `AD-09`: permission missing/expired, any budget dimension exceeded/invalid, empty/duplicate/unallowed source, or mismatched request Workflow/Task/Execution Context returns the matching preflight failure; calls remain zero.
- `AD-10`: `cancelled: true` after valid checks transitions `WAITING_APPROVAL -> CANCELLED`, returns `CANCELLED`, records `DOCUMENTATION_EXECUTION_CANCELLED`, and never calls Capability.

Each table-driven test is one top-level test and must assert every case; do not create nested `test()` calls, preserving the 15-test target.

- [ ] **Step 2: Run the tests and observe red**

```powershell
node --experimental-strip-types --test runtime/tests/approved-documentation-execution.test.ts
```

Expected: AD-01..AD-04 pass; AD-05..AD-10 fail because the service is missing.

- [ ] **Step 3: Implement service dependencies and safe result construction**

```ts
export interface ApprovedDocumentationExecutionDependencies {
  readonly workflowService: WorkflowService;
  readonly taskService: TaskService;
  readonly activationPort: DocumentationCapabilityActivationPort;
  readonly documentationExecutionPort: DocumentationExecutionPort;
  readonly auditService: AuditService;
  readonly now?: () => string;
}

export class ApprovedDocumentationExecutionService {
  constructor(dependencies: ApprovedDocumentationExecutionDependencies);
  execute(request: ApprovedDocumentationExecutionRequest): ApprovedDocumentationExecutionResult;
}
```

Every return value is reconstructed and recursively frozen; caller request, approval, sources, Workflow, Task, and dependency-owned objects are never frozen or mutated in place.

- [ ] **Step 4: Implement the exact preflight order before any state transition**

1. Get Workflow; map `RuntimeError('WORKFLOW_NOT_FOUND')` to controlled `WORKFLOW_NOT_FOUND`.
2. Require Workflow state exactly `WAITING_APPROVAL`.
3. Get Task; require `CREATED` and `task.workflowId === workflow.workflowId`.
4. Parse only the prefix `handoff:v1:` and require its JSON `routingId` and `objective` to be nonblank strings.
5. Require classification ID = Workflow `intentRef`; routing ID/objective = parsed Task input; request IDs = Workflow/Task.
6. Require approval present, status `CONFIRMED`, canonical ISO dates, `confirmedAt <= now < expiresAt`, and every approval binding equal to the request.
7. Load activation by fixed ID; require exact version/source identity and status `ACTIVE`.
8. Require operation allowed and environment exactly `INTERNAL_LOCAL`.
9. Recompute and compare the source fingerprint.
10. Require Documentation request Workflow/Task/Execution Context/objective correlation.
11. Require permission `GENERATE_DRAFT`, canonical unexpired grant date.
12. Require each budget field finite/nonnegative and each used value `<=` limit.
13. Require nonempty unique authorized sources and every `sourceRef` in `allowedContextRefs`.
14. If `cancelled`, transition Workflow to `CANCELLED`, audit, and return `CANCELLED`.

For steps 1–13, append `DOCUMENTATION_EXECUTION_BLOCKED`, return `BLOCKED`, preserve `WAITING_APPROVAL` whenever the Workflow exists in that state, and never call the Documentation Port.

- [ ] **Step 5: Use audit fields without changing the Audit contract**

Bridge audit IDs use `approved-documentation-audit-${counter}`. For preflight rejection:

```ts
{
  eventType: 'DOCUMENTATION_EXECUTION_BLOCKED',
  status: 'BLOCKED',
  inputRefs: [classificationId, routingId, workflowId, taskId, approvalIdOrMissing, capabilityId, fingerprint],
  outputRef: undefined,
  budgetSnapshot: documentationRequest.budget,
  failureReason: failure.code,
  failureStage: 'PREFLIGHT',
}
```

Evidence source is `approved-documentation-execution`, confidence `L3` only for verified activation/approval/source facts, otherwise `L2`; it must not contain source content or credentials.

- [ ] **Step 6: Verify and commit Task 3**

```powershell
node --experimental-strip-types --test runtime/tests/approved-documentation-execution.test.ts
npm.cmd test
git diff --check
git add runtime/integration/approved-documentation-execution-service.ts runtime/tests/approved-documentation-execution.test.ts
git commit -m "feat: guard approved documentation execution"
```

Expected: 10 focused tests pass; all previous tests remain green.

---

## 6. Task 4 — Controlled Documentation Execution and Terminal State Mapping

**Files:**

- Modify: `runtime/integration/approved-documentation-execution-service.ts`
- Modify/Test: `runtime/tests/approved-documentation-execution.test.ts`

**Interfaces:**

- Consumes: successful preflight from Task 3 and existing `DocumentationCapabilityRuntimeService` through `DocumentationExecutionPort`.
- Produces: full success/failure/replay/audit behavior while preserving existing Workflow/Task authority.

- [ ] **Step 1: Add integration composition and tests AD-11 through AD-15**

Compose the real capability exactly as follows:

```ts
const auditService = new AuditService(new InMemoryAuditRepository());
const documentationRuntime = new DocumentationCapabilityRuntimeService(
  new DocumentationCapabilityAdapter(
    new DeterministicDocumentationAssistant(() => NOW),
    new PermissionBudgetGuard(),
    () => NOW,
  ),
  auditService,
  () => NOW,
);
```

Add:

- `AD-11`: valid approval executes once; result contains Draft, Source References, Confidence, Evidence, Limitations; Task is `COMPLETED`; Workflow is `COMPLETED`.
- `AD-12`: a controlled Documentation failure maps to Task `FAILED`, Workflow `FAILED`, decision `FAILED`, no retry, and no alternative Provider.
- `AD-13`: submitting the same approval after a terminal success returns `WORKFLOW_NOT_WAITING_APPROVAL`; no second Capability call and no state change.
- `AD-14`: success audit order contains `DOCUMENTATION_APPROVAL_VERIFIED`, `DOCUMENTATION_EXECUTION_STARTED`, existing `DOCUMENTATION_CAPABILITY_COMPLETED`, and `DOCUMENTATION_WORKFLOW_COMPLETED`; all required IDs, fingerprint, result reference, budget, and Evidence are traceable. Failure audit contains stage/reason.
- `AD-15`: caller input is unchanged; result is deeply frozen; a test-local side-effect sentinel proves no filesystem, network, Provider, tool, Knowledge, or other Capability call path is exposed.

- [ ] **Step 2: Run the tests and observe red**

Expected: AD-01..AD-10 pass; AD-11..AD-15 fail because the successful execution branch is incomplete.

- [ ] **Step 3: Implement approval verification and start events**

After preflight succeeds:

1. Append `DOCUMENTATION_APPROVAL_VERIFIED` with `status: 'WAITING_APPROVAL'` and `approvalStatus: 'CONFIRMED'`, plus approval ID, capability version, source fingerprint, permission and budget snapshots.
2. Transition Workflow through `WorkflowService.transition(workflowId, 'EXECUTING')`.
3. Append `DOCUMENTATION_EXECUTION_STARTED` with `status: 'EXECUTING'`.
4. Call `documentationExecutionPort.execute(documentationRequest)` exactly once.

The Agent, Adapter, or caller must never receive direct access to Workflow repositories or state mutation.

- [ ] **Step 4: Implement exact success mapping**

Map the existing outcome to the existing `CapabilityResult` without flattening the returned Draft Package:

```ts
const capabilityResult: CapabilityResult = {
  status: outcome.status,
  output: outcome.result?.draft ?? '',
  evidence: outcome.evidence,
  confidence: outcome.confidence,
  timestamp: outcome.timestamp,
  ...(outcome.failure === undefined ? {} : { error: outcome.failure.reason }),
};
```

For `SUCCESS` with a present result:

1. `taskService.complete(taskId, capabilityResult)`.
2. `workflowService.transition(workflowId, 'VALIDATING')`.
3. Verify the Task is `COMPLETED`, output is nonblank, result/evidence/limitations/reference arrays remain nonempty, and every source reference remains authorized.
4. `workflowService.transition(workflowId, 'COMPLETED')`.
5. Append `DOCUMENTATION_WORKFLOW_COMPLETED` with output reference and result Evidence.
6. Return decision `COMPLETED`, original `documentationOutcome`, terminal Workflow/Task, combined audit events, and Evidence.

- [ ] **Step 5: Implement exact failure mapping**

For any non-success Documentation outcome or invalid success result:

1. Complete Task with a non-success `CapabilityResult`; Task becomes `FAILED` through existing `TaskService`.
2. Transition Workflow directly from `EXECUTING` to `FAILED`.
3. Append `DOCUMENTATION_WORKFLOW_FAILED` with the existing Documentation failure category/reason/stage.
4. Return decision `FAILED` and code `CAPABILITY_FAILED`.
5. Do not retry, mutate sources, invoke another Provider, or create a fallback Draft.

- [ ] **Step 6: Verify and commit Task 4**

```powershell
node --experimental-strip-types --test runtime/tests/approved-documentation-execution.test.ts
npm.cmd test
git diff --check
git add runtime/integration/approved-documentation-execution-service.ts runtime/tests/approved-documentation-execution.test.ts
git commit -m "feat: execute approved documentation capability"
```

Expected: all 15 focused tests and all previous tests pass.

---

## 7. Task 5 — Suite Registration, Regression, and Scope Gate

**Files:**

- Modify: `package.json`
- Modify/Test: `runtime/tests/approved-documentation-execution.test.ts` only if a test assertion is insufficient; do not expand feature scope.

**Interfaces:**

- Consumes: the completed integration slice.
- Produces: one repeatable `npm.cmd test` entry, 165 passing tests, and static boundary evidence.

- [ ] **Step 1: Register the new test file**

Append `runtime/tests/approved-documentation-execution.test.ts` to the existing `test` command; do not reorder or remove prior files.

- [ ] **Step 2: Run focused and full regression**

```powershell
node --experimental-strip-types --test runtime/tests/approved-documentation-execution.test.ts
npm.cmd test
git diff --check
```

Expected: `15/15` focused and `165/165` full tests pass.

- [ ] **Step 3: Run the forbidden-scope scan**

```powershell
rg -n "fetch\(|node:http|node:https|node:fs|child_process|Codex|MCP|LLM|ACTIVE Knowledge|writeFile|appendFile|applyPatch|git commit" runtime/integration/approved-documentation-execution-service.ts runtime/integration/documentation-source-scope-fingerprint.ts runtime/capability/documentation-capability-activation-*.ts
rg -n "class .*Agent|generic dispatcher|CapabilityDispatcher|ApprovalRepository|retry|fallback provider" runtime/integration/approved-documentation-execution-service.ts runtime/capability/documentation-capability-activation-*.ts
```

Expected: no production-code match indicating a forbidden dependency or behavior. The string `ACTIVE` may appear only as a Registry status check; `node:crypto` is allowed.

- [ ] **Step 4: Verify the protected file set is untouched**

```powershell
git diff main...HEAD --name-only | Where-Object {
  $_ -match '^runtime/(models/runtime-types\.ts|workflow/|task/|agent/|permission/)' -or
  $_ -match '^runtime/capability/documentation-(execution-contract|capability-adapter|invocation-port)\.ts$' -or
  $_ -eq 'runtime/services/documentation-capability-runtime-service.ts'
}
```

Expected: no output.

- [ ] **Step 5: Commit suite registration**

```powershell
git add package.json runtime/tests/approved-documentation-execution.test.ts
git commit -m "test: verify approved documentation execution"
```

---

## 8. Task 6 — Restricted Activation and Governance Synchronization

**Files:**

- Modify: `capabilities/documentation/CAP-DOC-0001.md`
- Modify: `docs/capability/DOCUMENTATION_CAPABILITY_EVALUATION.md`
- Modify: `capabilities/README.md`
- Modify: `docs/DEVELOPMENT_PROGRESS.md`
- Modify: `docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md`
- Modify: `docs/architecture/MODULE_REGISTRY.md`
- Modify: `memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md`
- Modify: this plan file

**Interfaces:**

- Consumes: verified 165-test evidence, scope scan, protected-file scan, current user approval, and the formal Evaluation record.
- Produces: `ACTIVATE_CAPABILITY` with a restricted `ACTIVE` Registry record; it still requires task-level confirmation for every call.

- [ ] **Step 1: Run the activation preconditions before editing status**

```powershell
npm.cmd test
git diff --check
git status --short
git log -5 --oneline
```

Required result: 165 tests pass; no unintended change; the implementation commits from Tasks 2–5 are present. If any requirement fails, leave Status `EVALUATING`, record `CHANGES_REQUIRED`, and stop.

- [ ] **Step 2: Update the Registry lifecycle without collapsing concepts**

In `CAP-DOC-0001.md`:

- change Status from `EVALUATING` to `ACTIVE`;
- keep Quality Score `84/100`, Confidence `L3`;
- set Admission Result `ACTIVATE_CAPABILITY`;
- set Selection to `ELIGIBLE_ONLY_AFTER_TASK_LEVEL_APPROVAL_AND_PREFLIGHT`;
- set Activation Scope to the five exact strings in `ACTIVE_DOCUMENTATION_CAPABILITY`;
- retain `CONFIRM_REQUIRED` and `INTERNAL_USE_ONLY`;
- record user approval as `Project owner explicit approval in this task, 2026-08-06`;
- append `EVALUATING -> ACTIVE / ACTIVATE_CAPABILITY` to Change History, citing the exact implementation/test commit hashes shown by `git log`;
- retain Last Review `2026-08-06T00:00:00.000Z` and Next Review `2026-09-05T00:00:00.000Z`.

Do not write `APPROVED`, `BLOCKED`, or a custom Registry status. Do not imply that `ACTIVE` is invocation authorization.

- [ ] **Step 3: Update Evaluation and capability directory status**

Record the bridge tests, 165-test regression, scope scan, source commit check, protected-file scan, and final recommendation `ACTIVATE_CAPABILITY for restricted internal use`. Update `capabilities/README.md` to say exactly one internal Documentation record is restricted `ACTIVE`; no external Capability is installed or active.

- [ ] **Step 4: Synchronize existing governance entries only**

Record:

- verified chain: structured Intent/Handoff `WAITING_APPROVAL` -> explicit bound confirmation -> active Documentation Capability -> Draft Package/Evidence/Audit -> terminal Workflow;
- maturity: `INTERNAL_ONLY`;
- one active internal Capability, no Provider/LLM/Codex/MCP/tool/filesystem/Knowledge write;
- activation does not authorize other Documentation operations or any other Capability;
- remaining blockers: real user identity/confirmation adapter, persistent Registry/Approval/Workflow/Audit, target project safety, isolated real-project pilot, production security and incident controls.

Only extend existing `AI CTO Runtime Architecture` and `Capability Governance` module entries. Do not create a new Module or Phase.

- [ ] **Step 5: Run the final gate**

```powershell
npm.cmd test
git diff --check
$record = Get-Content -Raw -Encoding utf8 capabilities/documentation/CAP-DOC-0001.md
@('ACTIVE','ACTIVATE_CAPABILITY','ELIGIBLE_ONLY_AFTER_TASK_LEVEL_APPROVAL_AND_PREFLIGHT','CONFIRM_REQUIRED','INTERNAL_USE_ONLY','2026-09-05T00:00:00.000Z') | ForEach-Object { if (-not $record.Contains($_)) { throw "Missing activation field: $_" } }
git status --short
```

Gate result:

- `APPROVED_FOR_RESTRICTED_INTERNAL_ACTIVATION` only if all 165 tests pass, all protected boundaries are clean, and the formal Registry/Evaluation records match the current version.
- Otherwise `CHANGES_REQUIRED`, with Registry remaining `EVALUATING`.

This Gate does not mean production-ready, user-ready, externally licensed, persistent, or authorized for file writing or another Capability.

- [ ] **Step 6: Commit the restricted activation evidence**

```powershell
git add capabilities/README.md capabilities/documentation/CAP-DOC-0001.md docs/capability/DOCUMENTATION_CAPABILITY_EVALUATION.md docs/DEVELOPMENT_PROGRESS.md docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md docs/architecture/MODULE_REGISTRY.md memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md docs/superpowers/plans/2026-08-06-controlled-documentation-capability-activation-implementation.md
git commit -m "docs: activate restricted documentation capability"
```

- [ ] **Step 7: Final branch handoff**

Report branch, focused commits, 15/15 focused tests, 165/165 full tests, protected-file scan, forbidden-scope scan, Gate result, Registry state, and explicit limitations. Do not merge automatically.

---

## 9. Requirement-to-Test Matrix

| Requirement | Test/Evidence |
|---|---|
| Immutable trusted activation projection; caller cannot forge status | AD-01 |
| Fingerprint deterministic and order independent | AD-02 |
| Fingerprint detects content/location/version drift | AD-03, AD-08 |
| Invalid source fingerprint inputs rejected | AD-04 |
| Workflow/Task/handoff prerequisites block before execution | AD-05 |
| Approval presence, time, and exact binding | AD-06 |
| Active version/operation/environment restriction | AD-07 |
| Permission, budget, context, source restrictions | AD-09 |
| Pre-execution cancellation without Capability call | AD-10 |
| Five-field Draft Package and terminal success | AD-11 |
| Controlled Capability failure maps Task/Workflow to FAILED | AD-12 |
| Approval replay cannot execute twice | AD-13 |
| Complete approval/capability/workflow audit chain | AD-14 |
| No mutation or external side effect | AD-15 + static scan |
| Registry lifecycle and evaluation evidence | Manual Registry/Evaluation checklist in Tasks 1 and 6 |
| Existing system behavior preserved | 165-test full regression |

---

## 10. Implementation Review Checklist

- [ ] Design object remains `SYS-L5-DOC-ACT-001`; no new Phase or Module.
- [ ] Registry status progression is `ABSENT -> DISCOVERED -> EVALUATING -> ACTIVE` only after evidence passes.
- [ ] `ACTIVE`, Admission Result, Evaluation Result, Selection, and per-invocation Approval remain separate concepts.
- [ ] Runtime never parses the Markdown Registry record.
- [ ] Request cannot supply or override Capability Registry status.
- [ ] Approval binds classification, routing, Workflow, Task, capability version, operation, and source fingerprint.
- [ ] All non-cancel preflight failures preserve `WAITING_APPROVAL` and call no Capability.
- [ ] WorkflowService is the only Workflow state transition authority.
- [ ] TaskService is the only Task completion authority.
- [ ] Existing Documentation Adapter performs defense-in-depth Permission/Budget/Source/Output checks.
- [ ] Success returns Draft, Source References, Confidence, Evidence, and Limitations.
- [ ] Audit records facts and correlation only; it grants no authority and writes no Knowledge.
- [ ] No Provider, LLM, Codex, MCP, network, filesystem, tool, retry, fallback, or document write.
- [ ] No existing Runtime/Workflow/Task/Agent/Guard/Documentation public contract changes.
- [ ] 15 focused tests and 165 full tests pass.
- [ ] Final maturity remains `INTERNAL_ONLY`.
