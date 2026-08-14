# AI-CTO Project Memory Checkpoint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 ZIP 的 Checkpoint、Handoff 和 Recovery 机制补强到 AI-CTO Project Memory，支持跨会话恢复而不创建第二个项目事实源或自动写入未经验证的记忆。

**Architecture:** 新增 `runtime/checkpoint/` 的不可变 Checkpoint Contract 和 In-memory Repository / Service，先作为 Runtime 可测试的状态快照；通过显式 Projection 将已确认的摘要回写 Project Memory 所需字段，默认不读写文件。Checkpoint 只记录可验证事实、授权、Evidence、阻塞和下一步，不保存完整聊天上下文或隐性推理。

**Tech Stack:** TypeScript、Node.js 24、内置 `node:test`、现有 `Evidence` 和 `AuditEvent` 类型；本阶段不引入 SQLite、文件写入、云同步或后台监控。

## Global Constraints

- Project Memory 仍是单项目连续性的权威；Knowledge Base 仍是跨项目知识权威。
- Checkpoint 不能覆盖历史，只能追加新版本并保留前序引用。
- Checkpoint 不记录秘密、完整 Prompt、完整工具日志或未经验证的推断。
- Runtime Checkpoint Service 不自动写入仓库文件；Projection 只生成待写入摘要。
- 任何恢复都必须核对当前代码、配置、Git、授权和旧 Evidence，不能相信旧快照替代当前事实。
- Checkpoint 不改变 Workflow / Task 状态，不授予执行权限。
- 现有 `npm.cmd test` 165 项回归必须保持通过。

---

### Task 1: Define immutable checkpoint contract

**Files:**
- Create: `runtime/checkpoint/checkpoint-contract.ts`
- Test: `runtime/tests/checkpoint.test.ts`

**Interfaces:**
- Produces: `CheckpointKind`, `CheckpointStatus`, `CheckpointEvidenceRef`, `TaskCheckpoint`, `validateAndFreezeCheckpoint`.

- [ ] **Step 1: Write failing contract tests**

Add:

```ts
test('CP-01 accepts and freezes a confirmed task checkpoint', () => {
  const checkpoint = validateAndFreezeCheckpoint(validCheckpoint());
  assert.equal(checkpoint.kind, 'VALIDATION');
  assert.equal(Object.isFrozen(checkpoint), true);
  assert.equal(Object.isFrozen(checkpoint.confirmedFacts), true);
});

test('CP-02 rejects a checkpoint without task, phase, status, evidence or next action', () => {
  for (const mutate of [blankTask, blankPhase, emptyEvidence, blankNextAction]) {
    assert.throws(() => validateAndFreezeCheckpoint(mutate(validCheckpoint())), {
      code: 'INVALID_CHECKPOINT',
    });
  }
});

test('CP-03 rejects a checkpoint that stores secret-like content', () => {
  assert.throws(() => validateAndFreezeCheckpoint(withFact(validCheckpoint(), 'api_key=secret')), {
    code: 'SENSITIVE_CHECKPOINT_CONTENT',
  });
});

test('CP-04 preserves append-only predecessor linkage', () => {
  const checkpoint = validateAndFreezeCheckpoint(withPredecessor(validCheckpoint(), 'cp-001'));
  assert.equal(checkpoint.predecessorCheckpointId, 'cp-001');
});
```

- [ ] **Step 2: Run focused test to verify failure**

Run: `node --experimental-strip-types --test runtime/tests/checkpoint.test.ts`

Expected: FAIL because `runtime/checkpoint/checkpoint-contract.ts` does not exist.

- [ ] **Step 3: Implement exact contract**

Use these values:

```ts
export type CheckpointKind = 'ANALYSIS' | 'DECISION' | 'MODIFICATION' | 'VALIDATION' | 'REVIEW' | 'HANDOFF' | 'RECOVERY';
export type CheckpointStatus = 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'FAILED' | 'ROLLED_BACK';

export interface TaskCheckpoint {
  readonly schemaVersion: '1.0';
  readonly checkpointId: string;
  readonly taskRef: string;
  readonly projectRef: string;
  readonly phase: string;
  readonly kind: CheckpointKind;
  readonly status: CheckpointStatus;
  readonly createdAt: string;
  readonly predecessorCheckpointId?: string;
  readonly confirmedFacts: readonly string[];
  readonly decisions: readonly string[];
  readonly evidence: readonly CheckpointEvidenceRef[];
  readonly blockers: readonly string[];
  readonly risks: readonly string[];
  readonly nextAction: string;
  readonly ownerRef: string;
}
```

Reject blanks, duplicate evidence IDs, predecessor self-reference, invalid timestamps, secret-like strings (`api_key`, `password`, `token`, `secret`, private key headers), and facts that are empty or not evidence-linked. Deep-freeze the returned object.

- [ ] **Step 4: Run focused tests**

Run: `node --experimental-strip-types --test runtime/tests/checkpoint.test.ts`

Expected: PASS CP-01 through CP-04.

- [ ] **Step 5: Commit**

```powershell
git add runtime/checkpoint/checkpoint-contract.ts runtime/tests/checkpoint.test.ts
git commit -m "feat: add AI CTO task checkpoint contract"
```

### Task 2: Add append-only repository and recovery service

**Files:**
- Create: `runtime/checkpoint/checkpoint-repository-port.ts`
- Create: `runtime/checkpoint/in-memory-checkpoint-repository.ts`
- Create: `runtime/checkpoint/checkpoint-service.ts`
- Modify: `runtime/tests/checkpoint.test.ts`

**Interfaces:**
- Produces: `CheckpointRepositoryPort.append()`, `listByTaskRef()`, `getLatest()`, `CheckpointService.append()`, `CheckpointService.recover()`.

- [ ] **Step 1: Write failing service tests**

Add:

```ts
test('CP-05 appends checkpoints without replacing predecessors', () => {
  const service = checkpointService();
  service.append(validCheckpoint({ checkpointId: 'cp-001' }));
  service.append(validCheckpoint({ checkpointId: 'cp-002', predecessorCheckpointId: 'cp-001' }));
  assert.deepEqual(service.listByTaskRef('task-1').map(item => item.checkpointId), ['cp-001', 'cp-002']);
});

test('CP-06 rejects a duplicate checkpoint ID', () => {
  const service = checkpointService();
  service.append(validCheckpoint({ checkpointId: 'cp-001' }));
  assert.throws(() => service.append(validCheckpoint({ checkpointId: 'cp-001' })), {
    code: 'CHECKPOINT_ALREADY_EXISTS',
  });
});

test('CP-07 recovery returns latest checkpoint plus revalidation obligations', () => {
  const service = checkpointService();
  service.append(validCheckpoint({ checkpointId: 'cp-001', status: 'COMPLETED' }));
  const recovery = service.recover('task-1');
  assert.equal(recovery.latestCheckpoint?.checkpointId, 'cp-001');
  assert.ok(recovery.revalidationObligations.includes('recheck current Git and authorization state'));
});

test('CP-08 recovery never returns an execution authorization', () => {
  const recovery = checkpointService().recover('missing-task');
  assert.equal('executionAuthorization' in recovery, false);
});
```

- [ ] **Step 2: Run focused tests to verify failure**

Run: `node --experimental-strip-types --test runtime/tests/checkpoint.test.ts`

Expected: FAIL because repository and service do not exist.

- [ ] **Step 3: Implement append-only in-memory storage and recovery**

`InMemoryCheckpointRepository` must clone and freeze stored checkpoints, reject duplicate IDs, and return immutable copies. `CheckpointService.recover()` must return the latest checkpoint, predecessor chain IDs, and fixed revalidation obligations: current project state, current Git/baseline, current authorization, current Evidence freshness, current blockers, and current next action. It must not infer that an old checkpoint is still valid.

- [ ] **Step 4: Run focused and full tests**

Run: `node --experimental-strip-types --test runtime/tests/checkpoint.test.ts`; then `npm.cmd test`.

Expected: checkpoint tests pass and existing tests remain green.

- [ ] **Step 5: Commit**

```powershell
git add runtime/checkpoint/checkpoint-repository-port.ts runtime/checkpoint/in-memory-checkpoint-repository.ts runtime/checkpoint/checkpoint-service.ts runtime/tests/checkpoint.test.ts
git commit -m "feat: add append-only checkpoint recovery service"
```

### Task 3: Add Project Memory projection without automatic file writes

**Files:**
- Create: `runtime/checkpoint/project-memory-projection.ts`
- Modify: `runtime/tests/checkpoint.test.ts`
- Modify: `docs/protocol/MEMORY_MANAGEMENT.md`

**Interfaces:**
- Produces: `ProjectMemoryProjection`, `ProjectMemoryProjectionService.project(checkpoint)`.

- [ ] **Step 1: Write failing projection tests**

Add:

```ts
test('CP-09 projects confirmed facts, evidence and next action without raw logs', () => {
  const projection = new ProjectMemoryProjectionService().project(validCheckpoint());
  assert.equal(projection.taskRef, 'task-1');
  assert.equal(projection.evidence.length, 1);
  assert.equal(projection.rawConversationIncluded, false);
  assert.equal(projection.suggestedSection, '当前状态');
});

test('CP-10 refuses a projection with unverified facts', () => {
  assert.throws(() => new ProjectMemoryProjectionService().project(
    withFactEvidence(validCheckpoint(), { confidence: 'UNVERIFIED' }),
  ), { code: 'PROJECTION_REQUIRES_CONFIRMED_EVIDENCE' });
});
```

- [ ] **Step 2: Run focused tests to verify failure**

Run: `node --experimental-strip-types --test runtime/tests/checkpoint.test.ts`

Expected: FAIL because the projection service does not exist.

- [ ] **Step 3: Implement projection**

Return an immutable, metadata-only projection containing task/project refs, checkpoint ID, confirmed facts, decisions, Evidence refs, blockers, risks, next action, suggested Project Memory section and `rawConversationIncluded: false`. Do not write Markdown, Git, external memory or Knowledge. Preserve `UNKNOWN` and `NOT_CAPTURED` instead of upgrading them.

- [ ] **Step 4: Update Memory Management documentation**

Add the distinction between runtime checkpoint, Project Memory projection and Knowledge Base entry. State that projection requires human or governed process confirmation before it becomes an authoritative Project Memory update.

- [ ] **Step 5: Run validation and commit**

Run: `node --experimental-strip-types --test runtime/tests/checkpoint.test.ts`; `npm.cmd test`; `git diff --check`.

```powershell
git add runtime/checkpoint/project-memory-projection.ts runtime/tests/checkpoint.test.ts docs/protocol/MEMORY_MANAGEMENT.md
git commit -m "feat: project verified checkpoints into AI CTO memory"
```

### Task 4: Document and record the Module extension

**Files:**
- Create: `docs/protocol/TASK_CHECKPOINT_STANDARD.md`
- Modify: `docs/architecture/MODULE_REGISTRY.md`
- Modify: `memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md`
- Modify: `DEVELOPMENT_PROGRESS.md`

- [ ] **Step 1: Write the standard**

Document append-only checkpoints, evidence requirements, secret scanning, recovery revalidation, projection boundaries, retention decision ownership and the prohibition on automatic Project Memory writes.

- [ ] **Step 2: Update Registry and Memory**

Record `EXTEND_EXISTING_MODULE` for Project Memory / Memory Management, link tests and exact implementation commits, and preserve the distinction between Runtime in-memory MVP and durable production persistence.

- [ ] **Step 3: Run final validation**

Run: `npm.cmd test`; `git diff --check`; `rg -n "rawConversationIncluded|executionAuthorization|automatic.*write|revalidation" docs/protocol/TASK_CHECKPOINT_STANDARD.md`.

- [ ] **Step 4: Commit**

```powershell
git add docs/protocol/TASK_CHECKPOINT_STANDARD.md docs/architecture/MODULE_REGISTRY.md memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md DEVELOPMENT_PROGRESS.md
git commit -m "docs: govern AI CTO project memory checkpoints"
```

