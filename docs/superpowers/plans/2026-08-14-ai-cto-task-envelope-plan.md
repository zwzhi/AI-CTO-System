# AI-CTO Task Execution Envelope Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 ZIP 的 Task Execution Envelope 机制提炼为 AI-CTO Runtime 的版本化、可验证、不可执行授权合同，并接入 Controlled Intent-to-Runtime Handoff 的前置校验。

**Architecture:** 新增独立 `runtime/task/task-execution-envelope-*` 合同与确定性校验服务。Envelope 描述任务目标、非目标、项目基线、执行档位、阶段、授权、范围、Gate、停止条件、回滚条件、验收标准和 Evidence 基线；它不创建权限、不推进 Workflow、不调用 Capability。对 L2–L4 Handoff，Envelope 在 Runtime 创建 Workflow / Task 前完成校验；L1 可使用最小 Envelope 或沿用现有 Instant 规则。

**Tech Stack:** TypeScript、Node.js 24、内置 `node:test`、现有 Runtime Contract / Repository / Audit 模式；不增加第三方依赖。

## Global Constraints

- AI-CTO 仍是唯一权限、Gate、Workflow、Evidence 和 Audit 权威。
- `LIGHT / STANDARD / STRICT` 继续复用 `runtime/routing/execution-routing-contract.ts`，不创建第二套路由枚举。
- Envelope 校验失败必须在 Workflow / Task 创建前返回受控失败；不得自动降级、重试或补造授权。
- Envelope 是约束合同，不是 `AUTO_EXECUTE` 或 Capability Invocation 授权。
- 不读取文件、Git、网络或环境；基线和 Evidence 由调用方显式提供。
- 每个任务先写失败测试，再写最小实现；每个独立任务单独提交。
- 现有 `npm.cmd test` 165 项回归必须保持通过。

---

### Task 1: Define the immutable Task Execution Envelope contract

**Files:**
- Create: `runtime/task/task-execution-envelope-contract.ts`
- Test: `runtime/tests/task-execution-envelope.test.ts`

**Interfaces:**
- Consumes: `TaskComplexity`, `ExecutionProfile`, `EvidenceFingerprint` from `runtime/routing/execution-routing-contract.ts`.
- Produces: `TaskExecutionEnvelope`, `TaskEnvelopeProject`, `TaskEnvelopeExecution`, `TaskEnvelopeAuthorization`, `TaskEnvelopeScope`, `TaskEnvelopeGate`, `TaskEnvelopeEvidence`, `TaskEnvelopeErrorCode`.

- [ ] **Step 1: Write failing contract tests**

Add tests with these exact cases:

```ts
test('TE-01 accepts a complete immutable envelope', () => {
  const envelope = validEnvelope();
  const frozen = validateAndFreezeTaskExecutionEnvelope(envelope);
  assert.equal(frozen.schemaVersion, '1.0');
  assert.equal(Object.isFrozen(frozen), true);
});

test('TE-02 rejects a blank goal, missing project baseline, or empty acceptance criteria', () => {
  for (const mutate of [blankGoal, missingBaselineCommit, emptyAcceptance]) {
    assert.throws(() => validateAndFreezeTaskExecutionEnvelope(mutate(validEnvelope())), {
      code: 'INVALID_TASK_ENVELOPE',
    });
  }
});

test('TE-03 rejects authorization that exceeds the declared mode', () => {
  assert.throws(() => validateAndFreezeTaskExecutionEnvelope(
    withAuthorization(validEnvelope(), { modifyFiles: true, mode: 'analysis' }),
  ), { code: 'INVALID_TASK_ENVELOPE' });
});

test('TE-04 rejects forbidden paths overlapping allowed paths', () => {
  assert.throws(() => validateAndFreezeTaskExecutionEnvelope(
    withScope(validEnvelope(), { allowedPaths: ['src'], forbiddenPaths: ['src/private'] }),
  ), { code: 'INVALID_TASK_ENVELOPE' });
});

test('TE-05 preserves caller input and freezes nested arrays', () => {
  const input = validEnvelope();
  const frozen = validateAndFreezeTaskExecutionEnvelope(input);
  assert.notEqual(frozen, input);
  assert.equal(Object.isFrozen(frozen.scope.goals), true);
  assert.deepEqual(input, validEnvelope());
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `node --experimental-strip-types --test runtime/tests/task-execution-envelope.test.ts`

Expected: FAIL because `runtime/task/task-execution-envelope-contract.ts` does not exist.

- [ ] **Step 3: Implement the contract and freeze/validate function**

Define these exact types:

```ts
export type EnvelopeMode = 'analysis' | 'local-modification' | 'nonproduction' | 'production';
export type EnvelopePhase = 'IDENTIFY' | 'PLAN' | 'IMPLEMENT' | 'VALIDATE' | 'REVIEW' | 'DELIVER';

export interface TaskExecutionEnvelope {
  readonly schemaVersion: '1.0';
  readonly envelopeId: string;
  readonly taskRef: string;
  readonly title: string;
  readonly project: TaskEnvelopeProject;
  readonly execution: TaskEnvelopeExecution;
  readonly authorization: TaskEnvelopeAuthorization;
  readonly scope: TaskEnvelopeScope;
  readonly gates: TaskEnvelopeGate;
  readonly stopConditions: readonly string[];
  readonly rollbackConditions: readonly string[];
  readonly acceptanceCriteria: readonly string[];
  readonly evidence: TaskEnvelopeEvidence;
  readonly nextAction: string;
}

export function validateAndFreezeTaskExecutionEnvelope(
  input: TaskExecutionEnvelope,
): TaskExecutionEnvelope;
```

Validation must reject blank identity, invalid profile/phase/mode values, missing baseline commit for non-analysis modes, empty goals/non-goals/stop/rollback/acceptance lists, write authorization in `analysis`, `production` without explicit deploy/restart/database/cache flags, duplicate paths, and allowed/forbidden path overlap. It must deep-freeze arrays and nested records and never inspect the filesystem.

- [ ] **Step 4: Run focused tests**

Run: `node --experimental-strip-types --test runtime/tests/task-execution-envelope.test.ts`

Expected: PASS for TE-01 through TE-05.

- [ ] **Step 5: Commit**

```powershell
git add runtime/task/task-execution-envelope-contract.ts runtime/tests/task-execution-envelope.test.ts
git commit -m "feat: add AI CTO task execution envelope contract"
```

### Task 2: Add deterministic envelope policy validation

**Files:**
- Create: `runtime/task/task-execution-envelope-service.ts`
- Modify: `runtime/tests/task-execution-envelope.test.ts`

**Interfaces:**
- Consumes: `TaskExecutionEnvelope` and existing `RoutingRecommendation`.
- Produces: `TaskEnvelopeValidationResult`, `TaskExecutionEnvelopeService.validate()`.

- [ ] **Step 1: Write failing policy tests**

Add:

```ts
test('TE-06 rejects L2-L4 handoff envelopes without current baseline evidence', () => {
  const result = new TaskExecutionEnvelopeService().validate(
    withExecution(validEnvelope(), { complexity: 'L2' }),
    undefined,
  );
  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.reasonCode, 'EVIDENCE_REQUIRED');
});

test('TE-07 rejects a profile below the routing minimum', () => {
  const result = new TaskExecutionEnvelopeService().validate(
    withExecution(validEnvelope(), { complexity: 'L3', profile: 'LIGHT' }),
    routingFor('STANDARD'),
  );
  assert.equal(result.reasonCode, 'PROFILE_BELOW_MINIMUM');
});

test('TE-08 accepts a matching profile, baseline and authorization', () => {
  const result = new TaskExecutionEnvelopeService().validate(
    validEnvelope(),
    routingFor('STANDARD'),
  );
  assert.deepEqual(result, { status: 'VALID', evidence: result.evidence });
});

test('TE-09 never returns execution authorization', () => {
  const result = new TaskExecutionEnvelopeService().validate(validEnvelope(), routingFor('LIGHT'));
  assert.equal('executionAuthorization' in result, false);
});
```

- [ ] **Step 2: Run focused tests to verify failure**

Run: `node --experimental-strip-types --test runtime/tests/task-execution-envelope.test.ts`

Expected: FAIL because `TaskExecutionEnvelopeService` is not defined.

- [ ] **Step 3: Implement the policy service**

Use these exact result types:

```ts
export type TaskEnvelopeValidationStatus = 'VALID' | 'BLOCKED';
export type TaskEnvelopeReasonCode =
  | 'EVIDENCE_REQUIRED'
  | 'PROFILE_BELOW_MINIMUM'
  | 'GATE_REQUIRED'
  | 'AUTHORIZATION_MISMATCH'
  | 'ENVELOPE_INVALID';

export interface TaskEnvelopeValidationResult {
  readonly status: TaskEnvelopeValidationStatus;
  readonly reasonCode?: TaskEnvelopeReasonCode;
  readonly evidence: readonly Evidence[];
}

export class TaskExecutionEnvelopeService {
  validate(
    envelope: TaskExecutionEnvelope,
    routing: RoutingRecommendation | undefined,
  ): TaskEnvelopeValidationResult;
}
```

The policy must require a routing decision for complexity L2–L4, reject an envelope profile below the routing profile, reject stale/absent current Evidence when `execution.profile` or the route requires it, require completed Gate references when `hasApplicableGate` is true, and return only validation Evidence. It must not call a validator, Capability, filesystem, Git or network.

- [ ] **Step 4: Run focused and full tests**

Run: `node --experimental-strip-types --test runtime/tests/task-execution-envelope.test.ts`; then `npm.cmd test`.

Expected: all new tests pass and the existing 165 tests remain green.

- [ ] **Step 5: Commit**

```powershell
git add runtime/task/task-execution-envelope-service.ts runtime/tests/task-execution-envelope.test.ts
git commit -m "feat: validate task envelope against routing evidence"
```

### Task 3: Gate Controlled Handoff with the envelope

**Files:**
- Modify: `runtime/integration/intent-runtime-handoff-contract.ts`
- Modify: `runtime/integration/controlled-runtime-handoff-service.ts`
- Modify: `runtime/integration/intent-runtime-handoff-validation.ts`
- Modify: `runtime/tests/controlled-runtime-handoff.test.ts`

**Interfaces:**
- Consumes: `TaskExecutionEnvelope` and `TaskExecutionEnvelopeService`.
- Produces: `ControlledRuntimeHandoffRequest.executionEnvelope?: TaskExecutionEnvelope` and a new `HandoffDecision` value `ENVELOPE_BLOCKED`.

- [ ] **Step 1: Write failing integration tests**

Add:

```ts
test('IH-14 blocks an L2 handoff before Workflow creation when the envelope is missing', () => {
  const result = realService().handoff(l2RequestWithoutEnvelope());
  assert.equal(result.handoffDecision, 'ENVELOPE_BLOCKED');
  assert.equal(result.workflow, undefined);
  assert.equal(result.task, undefined);
});

test('IH-15 blocks a profile below the routing minimum before Workflow creation', () => {
  const result = realService().handoff(l3RequestWithLightEnvelope());
  assert.equal(result.handoffDecision, 'ENVELOPE_BLOCKED');
  assert.equal(result.workflow, undefined);
});

test('IH-16 keeps an approved valid envelope at WAITING_APPROVAL', () => {
  const result = realService().handoff(validL2RequestWithEnvelope());
  assert.equal(result.handoffDecision, 'WAITING_APPROVAL');
  assert.equal(result.workflow?.state, 'WAITING_APPROVAL');
});
```

- [ ] **Step 2: Run the integration test to verify failure**

Run: `node --experimental-strip-types --test runtime/tests/controlled-runtime-handoff.test.ts`

Expected: FAIL because the handoff contract does not accept or validate an envelope.

- [ ] **Step 3: Implement the pre-runtime gate**

Add the optional request field for backward-compatible L1 use. Before the existing runtime port is called, validate the envelope when the classification is L2–L4; if blocked, return `ENVELOPE_BLOCKED`, append only integration Evidence, and do not create Workflow or Task. Keep the existing route, permission, budget, cancellation and `WAITING_APPROVAL` invariants unchanged.

- [ ] **Step 4: Run focused and full tests**

Run: `node --experimental-strip-types --test runtime/tests/controlled-runtime-handoff.test.ts`; then `npm.cmd test`.

Expected: IH-14 through IH-16 and all prior handoff tests pass; total remains 165 plus the new tests.

- [ ] **Step 5: Commit**

```powershell
git add runtime/integration/intent-runtime-handoff-contract.ts runtime/integration/controlled-runtime-handoff-service.ts runtime/integration/intent-runtime-handoff-validation.ts runtime/tests/controlled-runtime-handoff.test.ts
git commit -m "feat: gate runtime handoff with task execution envelope"
```

### Task 4: Document the contract and update project evidence

**Files:**
- Create: `docs/runtime/TASK_EXECUTION_ENVELOPE_STANDARD.md`
- Modify: `docs/runtime/AI_CTO_RUNTIME_ARCHITECTURE.md`
- Modify: `docs/architecture/MODULE_REGISTRY.md`
- Modify: `memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md`
- Modify: `DEVELOPMENT_PROGRESS.md`

- [ ] **Step 1: Write the standard**

Document the envelope fields, L1/L2-L4 requirement, validation result, non-authorizing boundary, stale evidence behavior, stop conditions, rollback conditions and `ENVELOPE_BLOCKED` behavior. State that the contract extends existing Runtime Architecture and does not create a new Module or Phase.

- [ ] **Step 2: Update Registry and Memory**

Record `EXTEND_EXISTING_MODULE` under `AI CTO Runtime Architecture`, link the contract and tests, record actual test counts and preserve `Runtime Code: unchanged` only for the design phase; after implementation record the exact commit and validation results.

- [ ] **Step 3: Run validation**

Run: `npm.cmd test`; `git diff --check`; `rg -n "executionAuthorization|ENVELOPE_BLOCKED|TaskExecutionEnvelope" docs/runtime/TASK_EXECUTION_ENVELOPE_STANDARD.md`.

Expected: tests pass, no whitespace errors, and the standard explicitly denies execution authorization.

- [ ] **Step 4: Commit**

```powershell
git add docs/runtime/TASK_EXECUTION_ENVELOPE_STANDARD.md docs/runtime/AI_CTO_RUNTIME_ARCHITECTURE.md docs/architecture/MODULE_REGISTRY.md memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md DEVELOPMENT_PROGRESS.md
git commit -m "docs: govern AI CTO task execution envelope"
```
