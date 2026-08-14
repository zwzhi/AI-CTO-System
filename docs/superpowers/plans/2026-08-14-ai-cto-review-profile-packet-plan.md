# AI-CTO Review Profile and Packet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 ZIP 的 Reviewer 分工、Review Packet、预算、隔离等级和集中归并思想，补强 AI-CTO 现有 Code Review 与 Agent Runtime，而不固定启动 Reviewer 数量或声称权限隔离。

**Architecture:** 新增 `runtime/review/` 的 provider-neutral contracts 和确定性 policy。Review Profile 是职责描述，Review Packet 是冻结输入和 Diff/Evidence 指纹，Review Ledger 是状态和预算，不创建 Agent、不调用模型、不执行修复。AI-CTO 现有 Code Review Standard 仍是权威；Runtime 只提供受控调度数据和审计投影。

**Tech Stack:** TypeScript、Node.js 24、内置 `node:test`、现有 Evidence / Audit 类型；不增加第三方依赖。

## Global Constraints

- Reviewer 数量由 AI-CTO 风险、变更范围、证据和预算决定；不得默认 7 个。
- Reviewer 独立上下文不等于系统权限隔离；隔离等级必须单独记录。
- `read-only` 配置声明不能升级为 `system-readonly`。
- Review Packet 绑定精确基线和 Diff 指纹；差异变化后必须 `STALE`。
- Reviewer 只返回结构化发现；不得自行修改文件、提交、部署或派生 Reviewer。
- 所有结果必须能回写 AI-CTO Evidence / Audit，但不产生 APPROVED 或执行授权。
- 现有 `CODE_REVIEW_STANDARD.md` 的六项强制评审和三种唯一结果不改变。

---

### Task 1: Define Review Profile and result contracts

**Files:**
- Create: `runtime/review/review-contract.ts`
- Test: `runtime/tests/review-profile.test.ts`

**Interfaces:**
- Produces: `ReviewProfileId`, `ReviewPhase`, `ReviewEffortTier`, `ReviewIsolationLevel`, `ReviewPlan`, `ReviewFinding`, `ReviewResult`, `ReviewBudget`.

- [ ] **Step 1: Write failing contract tests**

Add tests:

```ts
test('RV-01 freezes a structured review result', () => {
  const result = validateAndFreezeReviewResult(validReviewResult());
  assert.equal(Object.isFrozen(result), true);
  assert.equal(result.findings[0]?.severity, 'MAJOR');
});

test('RV-02 rejects a finding without evidence location and impact', () => {
  assert.throws(() => validateAndFreezeReviewResult(withFinding(validReviewResult(), {
    evidenceRef: '',
    impact: '',
  })), { code: 'INVALID_REVIEW_RESULT' });
});

test('RV-03 preserves logical-readonly as distinct from system-readonly', () => {
  const result = validateAndFreezeReviewResult(withIsolation(validReviewResult(), 'logical-readonly'));
  assert.equal(result.isolationLevel, 'logical-readonly');
});

test('RV-04 rejects a Reviewer result that claims execution or approval', () => {
  assert.throws(() => validateAndFreezeReviewResult(withForbiddenField(validReviewResult(), 'executionAuthorization')), {
    code: 'INVALID_REVIEW_RESULT',
  });
});
```

- [ ] **Step 2: Run focused test to verify failure**

Run: `node --experimental-strip-types --test runtime/tests/review-profile.test.ts`

Expected: FAIL because `runtime/review/review-contract.ts` does not exist.

- [ ] **Step 3: Implement exact contract**

Use these fixed values:

```ts
export type ReviewProfileId =
  | 'FUNCTIONAL_BUSINESS'
  | 'COMPATIBILITY_REGRESSION'
  | 'SECURITY_ACCESS'
  | 'PERFORMANCE_RESOURCES'
  | 'DATA_CONTRACT'
  | 'STATE_CONCURRENCY'
  | 'TEST_DELIVERY';
export type ReviewPhase = 'PRE_IMPLEMENTATION' | 'POST_IMPLEMENTATION';
export type ReviewEffortTier = 'ECONOMY' | 'BALANCED' | 'DEEP';
export type ReviewIsolationLevel = 'SYSTEM_READONLY' | 'LOGICAL_READONLY' | 'SELF_REVIEW' | 'UNKNOWN';
export type ReviewSeverity = 'BLOCKER' | 'MAJOR' | 'MINOR' | 'NOTE';
export type ReviewStatus = 'PASS' | 'NON_BLOCKING_FINDINGS' | 'BLOCKING_FINDINGS' | 'INCOMPLETE';
```

Every finding requires `findingId`, `severity`, `evidenceRef`, `location`, `description`, `impact`, `introducedByChange`, `recommendedBoundary`, and `verificationMethod`. ReviewResult includes baseline commit, packet SHA, isolation level, reviewer identity, phase, round, findings, unverified items, and status. It must not include approval, execution, write, commit, deploy or restart authority.

- [ ] **Step 4: Run focused tests**

Run: `node --experimental-strip-types --test runtime/tests/review-profile.test.ts`

Expected: PASS RV-01 through RV-04.

- [ ] **Step 5: Commit**

```powershell
git add runtime/review/review-contract.ts runtime/tests/review-profile.test.ts
git commit -m "feat: define AI CTO review profile contracts"
```

### Task 2: Add risk-based Review Profile policy

**Files:**
- Create: `runtime/review/review-profile-policy.ts`
- Modify: `runtime/tests/review-profile.test.ts`

**Interfaces:**
- Consumes: `TaskComplexity`, `RiskLevel`, `ExecutionProfile`, change flags and budget.
- Produces: `ReviewPlan`, `ReviewProfilePolicy.decide(input)`.

- [ ] **Step 1: Write failing policy tests**

Add exact cases:

```ts
test('RV-05 selects one profile for a low-risk local change', () => {
  const plan = new ReviewProfilePolicy().decide({ complexity: 'L1', riskLevel: 'LOW', changedAreas: ['documentation'], evidenceCurrent: true });
  assert.deepEqual(plan.profiles, ['TEST_DELIVERY']);
  assert.equal(plan.effortTier, 'ECONOMY');
});

test('RV-06 selects focused profiles for a data and async change', () => {
  const plan = new ReviewProfilePolicy().decide({ complexity: 'L2', riskLevel: 'MEDIUM', changedAreas: ['database', 'async'], evidenceCurrent: true });
  assert.deepEqual(plan.profiles, ['DATA_CONTRACT', 'STATE_CONCURRENCY', 'TEST_DELIVERY']);
  assert.equal(plan.effortTier, 'BALANCED');
});

test('RV-07 selects deep security and compatibility review for high risk', () => {
  const plan = new ReviewProfilePolicy().decide({ complexity: 'L4', riskLevel: 'CRITICAL', changedAreas: ['permission', 'production'], evidenceCurrent: false });
  assert.equal(plan.effortTier, 'DEEP');
  assert.ok(plan.profiles.includes('SECURITY_ACCESS'));
  assert.ok(plan.profiles.includes('COMPATIBILITY_REGRESSION'));
  assert.ok(plan.escalationConditions.length > 0);
});

test('RV-08 never exceeds the configured reviewer budget', () => {
  const plan = new ReviewProfilePolicy({ maxProfiles: 3 }).decide({ complexity: 'L4', riskLevel: 'CRITICAL', changedAreas: ['permission', 'database', 'production'], evidenceCurrent: false });
  assert.ok(plan.profiles.length <= 3);
});
```

- [ ] **Step 2: Run focused tests to verify failure**

Run: `node --experimental-strip-types --test runtime/tests/review-profile.test.ts`

Expected: FAIL because `ReviewProfilePolicy` does not exist.

- [ ] **Step 3: Implement deterministic policy**

Map risk and changed areas to the smallest set of profiles. Enforce `maxProfiles`, `maxRounds`, and `maxTotalReviewers` as safety ceilings. If evidence is stale or absent for a required review, return `escalationConditions` and `evidenceRequired: true`; do not silently add profiles beyond the budget. Do not infer `SYSTEM_READONLY` from the requested effort tier.

- [ ] **Step 4: Run focused and full tests**

Run: `node --experimental-strip-types --test runtime/tests/review-profile.test.ts`; then `npm.cmd test`.

Expected: all review tests and existing tests pass.

- [ ] **Step 5: Commit**

```powershell
git add runtime/review/review-profile-policy.ts runtime/tests/review-profile.test.ts
git commit -m "feat: route reviews by risk and evidence budget"
```

### Task 3: Freeze Review Packet and stale behavior

**Files:**
- Create: `runtime/review/review-packet-service.ts`
- Modify: `runtime/tests/review-profile.test.ts`

**Interfaces:**
- Produces: `ReviewPacket`, `ReviewPacketService.create(input)`, `ReviewPacketService.isCurrent(packet, observation)`.

- [ ] **Step 1: Write failing packet tests**

Add:

```ts
test('RV-09 creates a deterministic packet hash from baseline, diff and related files', () => {
  const packet = new ReviewPacketService().create(validPacketInput());
  assert.match(packet.packetSha256, /^sha256:[0-9a-f]{64}$/);
  assert.equal(packet.changedFiles.includes('src/a.ts'), true);
});

test('RV-10 orders file lists deterministically and does not include sensitive untracked files', () => {
  const packet = new ReviewPacketService().create(withUntracked(validPacketInput(), ['.env', 'src/z.ts', 'src/a.ts']));
  assert.deepEqual(packet.untrackedFiles, ['src/a.ts', 'src/z.ts']);
});

test('RV-11 marks a packet stale when the bound diff fingerprint changes', () => {
  const service = new ReviewPacketService();
  const packet = service.create(validPacketInput());
  assert.equal(service.isCurrent(packet, { diffSha256: 'sha256:changed' }).status, 'STALE');
});
```

- [ ] **Step 2: Run focused test to verify failure**

Run: `node --experimental-strip-types --test runtime/tests/review-profile.test.ts`

Expected: FAIL because `ReviewPacketService` does not exist.

- [ ] **Step 3: Implement packet service**

Normalize and sort file lists, exclude known sensitive paths from packet content while recording an exclusion reason, hash the canonical JSON of boundary, phase, profile, baseline commit, head commit, diff hash, changed files, related files, validations and constraints, and freeze the result. `isCurrent()` returns `CURRENT` only on exact baseline and Diff match; otherwise `STALE` or `NOT_CAPTURED`. The service must not read the repository; callers provide the snapshot.

- [ ] **Step 4: Run focused and full tests**

Run: `node --experimental-strip-types --test runtime/tests/review-profile.test.ts`; then `npm.cmd test`.

Expected: packet tests pass and no existing behavior changes.

- [ ] **Step 5: Commit**

```powershell
git add runtime/review/review-packet-service.ts runtime/tests/review-profile.test.ts
git commit -m "feat: bind review packets to immutable evidence fingerprints"
```

### Task 4: Document and map Review Capability to existing Code Review

**Files:**
- Create: `docs/development/AI_CTO_REVIEW_PROFILE_STANDARD.md`
- Modify: `docs/development/CODE_REVIEW_STANDARD.md`
- Modify: `docs/architecture/MODULE_REGISTRY.md`
- Modify: `memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md`
- Modify: `DEVELOPMENT_PROGRESS.md`

- [ ] **Step 1: Write the standard**

Document the seven candidate profiles, selection rules, effort tiers, packet fields, isolation levels, stale behavior, structured result, stop conditions and the unchanged `APPROVED / CHANGES_REQUIRED / REJECTED` Code Review result.

- [ ] **Step 2: Update existing Code Review boundaries**

State that Review Profile and Packet extend the existing Code Review Module; they do not replace the six mandatory review items, create a new Gate, or grant an Agent write / approval authority.

- [ ] **Step 3: Run validation**

Run: `npm.cmd test`; `git diff --check`; `rg -n "APPROVED|CHANGES_REQUIRED|REJECTED|SYSTEM_READONLY|LOGICAL_READONLY" docs/development/AI_CTO_REVIEW_PROFILE_STANDARD.md`.

Expected: the standard contains the fixed result vocabulary and the isolation distinction.

- [ ] **Step 4: Commit**

```powershell
git add docs/development/AI_CTO_REVIEW_PROFILE_STANDARD.md docs/development/CODE_REVIEW_STANDARD.md docs/architecture/MODULE_REGISTRY.md memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md DEVELOPMENT_PROGRESS.md
git commit -m "docs: govern AI CTO review profiles and packets"
```

