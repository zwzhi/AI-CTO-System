# Controlled Intent-to-Runtime Handoff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect a caller-supplied structured Intent result to the existing advisory Router and in-memory Runtime, creating one traceable Workflow/Task that always stops at `WAITING_APPROVAL` before any Capability invocation.

**Architecture:** Add a dedicated immutable handoff contract, a strict boundary validator, and a thin `ControlledRuntimeHandoffService`. Reuse `AdvisoryExecutionRouter` and `RuntimeFoundationService`; do not give the integration layer new decision authority.

**Tech Stack:** TypeScript, Node.js 24, `node:test`, no third-party dependencies.

---

## 0. Fixed Scope and Invariants

- Input is a caller-supplied structured `IntentClassificationResult`; raw text classification is out of scope.
- `CLASSIFIED` with confidence `L3` or `L4` is the only input eligible for routing.
- `ROUTE_RECOMMENDED` and `ESCALATE_FOR_REVIEW` may create exactly one Workflow and one Task.
- `OUT_OF_SCOPE` and `INSUFFICIENT_EVIDENCE` must not call Runtime.
- Every created Workflow uses `controlMode: 'CONFIRM'` and must stop at `WAITING_APPROVAL`.
- No `CapabilityInvocation` or `ExecutionRecord` may exist in a successful handoff result.
- The integration layer does not choose a concrete model, Skill, Tool, Provider, or Capability implementation.
- Do not modify Runtime Core, Workflow, Task, Agent, Capability, Permission/Budget Guard, Audit, Router, Registry, Knowledge, or any authority hierarchy.
- Do not add a new Phase, Module, ADR, classifier, graph engine, persistence layer, API, network access, filesystem access, retry loop, or approval-resume implementation.
- The handoff produces recommendation and control-plane evidence only; it never produces execution authorization.

## 1. File Map

### Create

- `runtime/integration/intent-runtime-handoff-contract.ts`
- `runtime/integration/intent-runtime-handoff-validation.ts`
- `runtime/integration/controlled-runtime-handoff-service.ts`
- `runtime/tests/controlled-runtime-handoff.test.ts`

### Modify

- `package.json`
- `docs/DEVELOPMENT_PROGRESS.md`
- `docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md`
- `docs/architecture/MODULE_REGISTRY.md`
- `memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md`
- This plan file, only to check completed boxes and record final evidence.

## 2. Contract Baseline

Implement these public types in `intent-runtime-handoff-contract.ts`:

```ts
import type {
  BudgetSnapshot,
  Evidence,
  ExecutionContext,
  Task,
  WorkflowInstance,
} from '../models/runtime-types.ts';
import type {
  EvidenceFreshnessInput,
  EvidenceFreshnessObservation,
  Reversibility,
  RiskLevel,
  RoutingRecommendation,
  RoutingRequest,
  TaskComplexity,
  TaskKind,
} from '../routing/execution-routing-contract.ts';

export type IntentClassificationStatus =
  | 'CLASSIFIED'
  | 'AMBIGUOUS'
  | 'OUT_OF_SCOPE'
  | 'INSUFFICIENT_EVIDENCE';

export type IntentType =
  | 'NEW_PROJECT'
  | 'FEATURE_REQUEST'
  | 'BUG_FIX'
  | 'INCIDENT'
  | 'REFACTOR'
  | 'ARCHITECTURE_CHANGE'
  | 'RESEARCH_REQUEST'
  | 'KNOWLEDGE_UPDATE'
  | 'PROJECT_STATUS_QUERY'
  | 'GENERAL_CONVERSATION';

export type SuggestedWorkflow = 'INSTANT' | 'ENGINEERING' | 'CTO';

export type HandoffDecision =
  | 'WAITING_APPROVAL'
  | 'INTENT_REJECTED'
  | 'ROUTING_BLOCKED'
  | 'RUNTIME_BLOCKED'
  | 'INTEGRATION_FAILED';

export interface StructuredIntentClassificationResult {
  readonly schemaVersion: '1.0';
  readonly classificationId: string;
  readonly status: IntentClassificationStatus;
  readonly intentType: IntentType;
  readonly confidence: 'L1' | 'L2' | 'L3' | 'L4';
  readonly complexity: TaskComplexity;
  readonly taskKind: TaskKind;
  readonly riskLevel: RiskLevel;
  readonly reversibility: Reversibility;
  readonly hasApplicableGate: boolean;
  readonly requiresCurrentEvidence: boolean;
  readonly suggestedWorkflow: SuggestedWorkflow;
  readonly requiredCapabilityRefs: readonly string[];
  readonly taskObjective: string;
  readonly evidenceInputs: readonly EvidenceFreshnessInput[];
  readonly evidenceObservations: readonly EvidenceFreshnessObservation[];
}

export interface ControlledRuntimeHandoffRequest {
  readonly intentResult: StructuredIntentClassificationResult;
  readonly executionContext: ExecutionContext;
  readonly budget: BudgetSnapshot;
  readonly cancelled?: boolean;
}

export interface ControlledRuntimeHandoffResult {
  readonly handoffDecision: HandoffDecision;
  readonly intentResult: StructuredIntentClassificationResult;
  readonly routingRecommendation?: RoutingRecommendation;
  readonly workflow?: WorkflowInstance;
  readonly task?: Task;
  readonly auditEvents: readonly import('../models/runtime-types.ts').AuditEvent[];
  readonly evidence: readonly Evidence[];
  readonly limitations: readonly string[];
}

export interface HandoffRouterPort {
  route(request: RoutingRequest): RoutingRecommendation;
}

export interface HandoffRuntimePort {
  run(
    workflowInput: import('../workflow/workflow-service.ts').CreateWorkflowInput,
    taskInput: import('../models/runtime-types.ts').TaskInput,
    options?: import('../services/runtime-foundation-service.ts').RunOptions,
  ): import('../services/runtime-foundation-service.ts').RuntimeRunResult;
}
```

Add two controlled error codes in the integration contract rather than expanding `RuntimeErrorCode`:

```ts
export type HandoffErrorCode =
  | 'INVALID_HANDOFF_REQUEST'
  | 'HANDOFF_INVARIANT_VIOLATION';

export class HandoffError extends Error {
  constructor(
    readonly code: HandoffErrorCode,
    message: string,
    readonly details: Readonly<Record<string, unknown>> = Object.freeze({}),
  ) {
    super(message);
    this.name = 'HandoffError';
  }
}
```

## 2A. Isolated Implementation Workspace

- [x] Before changing production code, use the repository's existing worktree convention to create a dedicated branch named `feat/controlled-intent-runtime-handoff`.
- [x] Confirm the new worktree starts clean and `npm.cmd test` reports 137/137 passing tests.
- [x] All code, test, and implementation-status commits below are made on that feature branch; do not merge it into `main` during implementation.

## 3. Task 1 — Immutable Contract and Boundary Validation

**Files:**

- Create: `runtime/integration/intent-runtime-handoff-contract.ts`
- Create: `runtime/integration/intent-runtime-handoff-validation.ts`
- Test: `runtime/tests/controlled-runtime-handoff.test.ts`

### Step 1: Write the failing validation tests

- [x] Add `IH-01` proving a valid request is reconstructed, deeply frozen, and does not mutate the caller input.
- [x] Add `IH-02` table cases for invalid schema version, invalid identifier, blank/overlong objective, duplicate references, invalid ISO timestamp, invalid fingerprint, negative/non-finite budget values, and `executionContext.intentRef !== classificationId`.

Use this valid fixture as the common baseline:

```ts
const NOW = '2026-08-06T00:00:00.000Z';

function validHandoffRequest(): ControlledRuntimeHandoffRequest {
  return {
    intentResult: {
      schemaVersion: '1.0',
      classificationId: 'intent-001',
      status: 'CLASSIFIED',
      intentType: 'FEATURE_REQUEST',
      confidence: 'L3',
      complexity: 'L1',
      taskKind: 'DOCUMENTATION',
      riskLevel: 'LOW',
      reversibility: 'REVERSIBLE',
      hasApplicableGate: false,
      requiresCurrentEvidence: false,
      suggestedWorkflow: 'ENGINEERING',
      requiredCapabilityRefs: ['documentation'],
      taskObjective: 'Create a traceable documentation update plan.',
      evidenceInputs: [{
        evidenceRef: 'evidence-input-001',
        scopeRefs: ['docs/guide.md'],
        fingerprint: { method: 'CONTENT_HASH', value: 'sha256:abc' },
        observedAt: NOW,
      }],
      evidenceObservations: [{
        evidenceRef: 'evidence-input-001',
        scopeRefs: ['docs/guide.md'],
        fingerprint: { method: 'CONTENT_HASH', value: 'sha256:abc' },
      }],
    },
    executionContext: {
      userRef: 'user-001',
      projectRef: 'project-001',
      intentRef: 'intent-001',
      constraintRefs: ['constraint-001'],
      allowedContextRefs: ['docs/guide.md'],
    },
    budget: {
      tokenLimit: 100,
      tokenUsed: 0,
      toolLimit: 0,
      toolUsed: 0,
      timeLimitMs: 1_000,
      timeUsedMs: 0,
      costLimit: 0,
      costUsed: 0,
    },
  };
}
```

### Step 2: Run the tests and observe red

- [x] Temporarily run:

```powershell
node --experimental-strip-types --test runtime/tests/controlled-runtime-handoff.test.ts
```

Expected: module-not-found failure for the new contract or validator.

### Step 3: Implement exact validator behavior

- [x] Implement `validateAndFreezeHandoffRequest(request)` with these explicit rules:

1. Closed vocabularies are checked with frozen `Set<string>` instances for every union in the input.
2. IDs and references must match `^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$`.
3. `taskObjective.trim()` must be 1–1000 characters.
4. Reference arrays may be empty but must contain unique valid values.
5. Evidence references must be unique within each evidence array; evidence input/observation pairs may share the same `evidenceRef`.
6. `observedAt` must be canonical ISO: `new Date(value).toISOString() === value`.
7. Fingerprint method is `CONTENT_HASH` or `GIT_SCOPE`; value is nonblank and at most 512 characters.
8. Every budget number is finite and non-negative.
9. `executionContext.intentRef` must exactly equal `classificationId`.
10. Return a newly reconstructed object; freeze every nested object and array. Never freeze or mutate caller-owned objects.
11. Throw `HandoffError('INVALID_HANDOFF_REQUEST', ...)` on the first invalid field, including only field name and safe scalar metadata in `details`.

Add concrete helpers with these signatures:

```ts
function assertVocabulary(value: string, allowed: ReadonlySet<string>, field: string): void;
function assertReference(value: string, field: string): void;
function assertUniqueReferences(values: readonly string[], field: string): readonly string[];
function assertCanonicalIso(value: string, field: string): void;
function assertBudget(value: number, field: string): void;
function freezeEvidenceInput(input: EvidenceFreshnessInput): EvidenceFreshnessInput;
function freezeEvidenceObservation(input: EvidenceFreshnessObservation): EvidenceFreshnessObservation;
export function validateAndFreezeHandoffRequest(
  request: ControlledRuntimeHandoffRequest,
): ControlledRuntimeHandoffRequest;
```

### Step 4: Verify Task 1

- [x] Run the target test and all tests:

```powershell
node --experimental-strip-types --test runtime/tests/controlled-runtime-handoff.test.ts
npm.cmd test
git diff --check
```

- [x] Commit:

```powershell
git add runtime/integration/intent-runtime-handoff-contract.ts runtime/integration/intent-runtime-handoff-validation.ts runtime/tests/controlled-runtime-handoff.test.ts
git commit -m "feat: add controlled intent handoff contract"
```

## 4. Task 2 — Thin Controlled Handoff Service

**Files:**

- Create: `runtime/integration/controlled-runtime-handoff-service.ts`
- Modify: `runtime/tests/controlled-runtime-handoff.test.ts`

### Step 1: Write service boundary tests with counting fakes

- [x] Add test-local `CountingRouter` and `CountingRuntime` implementing the two ports. Each increments `calls`, stores its last request, and returns a constructor-supplied result.
- [x] Add `IH-03`: each non-`CLASSIFIED` status and `CLASSIFIED` confidence `L1`/`L2` returns `INTENT_REJECTED`; Router calls = 0; Runtime calls = 0.
- [x] Add `IH-04`: Router decisions `OUT_OF_SCOPE` and `INSUFFICIENT_EVIDENCE` return `ROUTING_BLOCKED`; Runtime calls = 0.
- [x] Add `IH-05`: eligible intent maps exactly to a `RoutingRequest` whose `routingId` is `routing-intent-001` and whose risk, complexity, gate, reversibility, and evidence fields are copied without reinterpretation.

Use a fully specified fake Runtime result:

```ts
function waitingRuntimeResult(): RuntimeRunResult {
  return {
    workflow: {
      workflowId: 'workflow-1',
      intentRef: 'intent-001',
      executionContext: validHandoffRequest().executionContext,
      controlMode: 'CONFIRM',
      budget: validHandoffRequest().budget,
      state: 'WAITING_APPROVAL',
      createdAt: NOW,
      updatedAt: NOW,
    },
    task: {
      taskId: 'task-1',
      workflowId: 'workflow-1',
      input: { request: 'handoff:v1:{\"routingId\":\"routing-intent-001\",\"objective\":\"Create a traceable documentation update plan.\"}' },
      state: 'CREATED',
    },
    auditEvents: [],
  };
}
```

### Step 2: Run and observe red

- [x] Run the target test. Expected: missing service export or failed assertions.

### Step 3: Implement the service

- [x] Implement `ControlledRuntimeHandoffService` with constructor dependencies `{ router, runtime, now? }`.
- [x] Its `handoff(request)` must:

1. Call `validateAndFreezeHandoffRequest` first.
2. Reject non-`CLASSIFIED` and confidence below `L3` without calling Router.
3. Build this exact Routing request:

```ts
const routingRequest: RoutingRequest = {
  routingId: `routing-${intent.classificationId}`,
  taskKind: intent.taskKind,
  complexity: intent.complexity,
  riskLevel: intent.riskLevel,
  reversibility: intent.reversibility,
  hasApplicableGate: intent.hasApplicableGate,
  requiresCurrentEvidence: intent.requiresCurrentEvidence,
  evidenceInputs: intent.evidenceInputs,
  evidenceObservations: intent.evidenceObservations,
};
```

4. Return `ROUTING_BLOCKED` for Router `OUT_OF_SCOPE` or `INSUFFICIENT_EVIDENCE` without calling Runtime.
5. For `ROUTE_RECOMMENDED` or `ESCALATE_FOR_REVIEW`, call Runtime exactly once:

```ts
const runtimeResult = this.runtime.run(
  {
    intentRef: intent.classificationId,
    executionContext: snapshot.executionContext,
    controlMode: 'CONFIRM',
    budget: snapshot.budget,
  },
  {
    request: `handoff:v1:${JSON.stringify({
      routingId: routing.routingId,
      objective: intent.taskObjective,
    })}`,
  },
  { cancelled: snapshot.cancelled },
);
```

6. If the Runtime returns `CANCELLED`, return `RUNTIME_BLOCKED` with Runtime audit evidence.
7. If Runtime returns any state other than `WAITING_APPROVAL` or returns a `capabilityInvocation`/`executionRecord`, throw `HandoffError('HANDOFF_INVARIANT_VIOLATION', ...)`.
8. Otherwise return `WAITING_APPROVAL`, the Routing recommendation, Workflow, Task, Runtime audit events, combined Routing + handoff evidence, and immutable limitations.
9. Handoff evidence uses confidence `L2`, source `controlled-runtime-handoff`, timestamp from `now`, and reference equal to `routingId`.
10. Limitations must include: `No execution authorization was created.` and `No capability, tool, model, or agent was invoked.`
11. Every branch returns through one private `freezeResult` helper that reconstructs and freezes the result, nested Intent snapshot, Routing recommendation, Workflow, Task, audit events, evidence, and limitations. It must not freeze objects returned by dependencies in place.
12. `INTENT_REJECTED` carries no Routing, Workflow, or Task; `ROUTING_BLOCKED` carries Routing only; `RUNTIME_BLOCKED` carries Routing plus the cancelled Workflow/Task and Runtime audit; `WAITING_APPROVAL` carries all controlled artifacts.

### Step 4: Verify Task 2

- [x] Run target tests, all tests, and `git diff --check`.
- [x] Commit:

```powershell
git add runtime/integration/controlled-runtime-handoff-service.ts runtime/tests/controlled-runtime-handoff.test.ts
git commit -m "feat: connect intent routing to controlled runtime"
```

## 5. Task 3 — Real In-Memory Integration and Negative Invariants

**Files:**

- Modify: `runtime/tests/controlled-runtime-handoff.test.ts`
- Modify: `package.json`

### Step 1: Build a real test composition

- [x] In the test file, compose:

```ts
const workflowRepository = new InMemoryWorkflowRepository();
const taskRepository = new InMemoryTaskRepository();
const auditRepository = new InMemoryAuditRepository();
const executionRepository = new InMemoryExecutionRepository();
const auditService = new AuditService(auditRepository);
const runtime = new RuntimeFoundationService({
  workflowService: new WorkflowService(workflowRepository, () => NOW),
  taskService: new TaskService(taskRepository),
  guard: new PermissionBudgetGuard(),
  capabilityAdapter: new MockCapabilityAdapter(() => NOW),
  executionRepository,
  auditService,
  now: () => NOW,
});
const service = new ControlledRuntimeHandoffService({
  router: new AdvisoryExecutionRouter(() => NOW),
  runtime,
  now: () => NOW,
});
```

### Step 2: Add the integration tests

- [x] `IH-06`: L1 low-risk reversible documentation maps to `LIGHT`/`R1`/`FAST`; Workflow is `CONFIRM` + `WAITING_APPROVAL`; Task is `CREATED`; no `CAPABILITY_COMPLETED` audit event.
- [x] `IH-07`: L3 high-risk architecture intent maps to `STRICT` + `ESCALATE_FOR_REVIEW` and still stops at `WAITING_APPROVAL`.
- [x] `IH-08`: current evidence required with no evidence returns `ROUTING_BLOCKED`; a counting Runtime port reports zero calls, and the result contains no Workflow or Task.
- [x] `IH-09`: cancelled or over-budget request returns `RUNTIME_BLOCKED`, Workflow is `CANCELLED`, and no Capability event exists.
- [x] `IH-10`: correlation chain is exact: `classificationId -> routingId -> workflow.intentRef -> task.workflowId`; Task request contains the Routing ID; handoff evidence references the Routing ID.
- [x] `IH-11`: input remains deeply equal to its pre-call clone; nested result arrays/objects are frozen.
- [x] `IH-12`: fake Runtime results containing a Capability invocation, an Execution record, or state `COMPLETED` each throw `HANDOFF_INVARIANT_VIOLATION`.
- [x] `IH-13`: result has no `executionAuthorization` property and contains both non-authorization limitations.

### Step 3: Add the test file to the suite

- [x] Append `runtime/tests/controlled-runtime-handoff.test.ts` to the `npm test` command in `package.json`.

### Step 4: Verify behavior and scope

- [x] Run:

```powershell
node --experimental-strip-types --test runtime/tests/controlled-runtime-handoff.test.ts
npm.cmd test
git diff --check
rg -n "fetch\(|node:http|node:https|node:fs|child_process|AUTO_EXECUTE|\.invoke\(" runtime/integration
```

Expected:

- 13 handoff tests pass.
- Existing 137 tests plus 13 new tests = 150 total passing tests.
- Static scan returns no matches in production integration files.

- [x] Commit:

```powershell
git add package.json runtime/tests/controlled-runtime-handoff.test.ts
git commit -m "test: verify controlled intent runtime handoff"
```

## 6. Task 4 — Governance Status and Development Gate

**Files:**

- Modify: `docs/DEVELOPMENT_PROGRESS.md`
- Modify: `docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md`
- Modify: `docs/architecture/MODULE_REGISTRY.md`
- Modify: `memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md`
- Modify: this plan file

### Step 1: Record only the implemented state

- [x] Record candidate `SYS-L5-HANDOFF-001` as implemented under the existing Layer 5 Runtime module.
- [x] Record status `INTERNAL_ONLY`; explicitly state it is not `PILOT_READY`, `USER_READY`, or `STABLE`.
- [x] Record the verified flow: structured Intent → Advisory Router → CONFIRM Runtime → Workflow/Task → `WAITING_APPROVAL`.
- [x] Record the verified absence of Capability/Tool/Model/Agent invocation and execution authorization.
- [x] Preserve all existing authority hierarchy and Module statuses; update only the existing Runtime module's related document/test references.
- [x] Record remaining usability blockers:
  - user-facing input adapter;
  - approval-resume path;
  - at least one admitted, registered, and activated real Engineering Capability;
  - target workspace safety, rollback, validation, and persistent audit;
  - isolated real-project end-to-end pilot.

### Step 2: Run final gate evidence

- [x] Run:

```powershell
npm.cmd test
git diff --check
rg -n "fetch\(|node:http|node:https|node:fs|child_process|AUTO_EXECUTE|\.invoke\(" runtime/integration
git status --short
```

- [x] Gate result is only one of:
  - `APPROVED_FOR_TESTING`: all 150 tests pass, scan is clean, state stops at `WAITING_APPROVAL`, and no forbidden scope is present.
  - `CHANGES_REQUIRED`: any condition above fails.

This Gate does not mean production-ready, user-ready, model-integrated, or authorized for real project execution.

### Step 3: Commit documentation evidence

- [x] Commit:

```powershell
git add docs/DEVELOPMENT_PROGRESS.md docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md docs/architecture/MODULE_REGISTRY.md memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md docs/superpowers/plans/2026-08-06-controlled-intent-runtime-handoff-implementation.md
git commit -m "docs: record controlled handoff implementation"
```

### Step 4: Final branch handoff

- [x] Confirm the feature branch contains four focused commits and has no uncommitted changes.
- [x] Do not merge automatically. Report branch name, commit list, tests, scan result, Gate result, and the explicit non-user-ready limitations.

## 7. Requirement-to-Test Matrix

| Requirement | Test |
|---|---|
| Immutable, validated structured Intent input | IH-01, IH-02 |
| Low-confidence/non-classified inputs stop before Router | IH-03 |
| Blocked Routing decisions stop before Runtime | IH-04, IH-08 |
| Intent fields map without reinterpretation | IH-05 |
| Normal recommendation enters controlled Runtime | IH-06 |
| High-risk route escalates but does not execute | IH-07 |
| Cancellation/budget denial remains non-executing | IH-09 |
| Complete correlation chain | IH-10 |
| No caller mutation and frozen result | IH-11 |
| Capability/execution/state invariant is enforced | IH-12 |
| No execution authorization | IH-13 |

## 8. Implementation Review Checklist

- [x] No new Module, Phase, ADR, Agent, Capability, provider, persistence, API, filesystem, or network integration.
- [x] No change to existing Runtime, Router, Guard, Workflow, Task, Agent, Capability, Audit, Registry, or Knowledge contracts.
- [x] Every Runtime call uses `CONFIRM`.
- [x] Every successful handoff stops at `WAITING_APPROVAL`.
- [x] No Capability invocation or Execution record exists.
- [x] Handoff evidence is traceable but not authorization.
- [x] Full regression suite passes.
- [x] Governance records remain honest about `INTERNAL_ONLY` maturity.
