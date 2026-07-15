# Phase 10 Optimization Execution MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现仅处理显式授权、内存级非权威 Markdown 文档的受控优化执行闭环，并使用既有 Audit 记录成功、拒绝与回滚 Evidence。

**Architecture:** 新增隔离的 `optimization-execution/` 包，包含专用合同、Eligibility、确定性优化器、验证器和协调服务。它只消费既有 `AuditService`，不修改 `self-evolution/`、Runtime Core、Workflow、Task、Agent、Permission 或 Knowledge；`OptimizationProposal.executionAuthorization` 仍为 `NONE`。

**Tech Stack:** TypeScript、Node.js 24、Node.js Built-in Test Runner、既有 `AuditService` 与 in-memory Audit Repository；无第三方依赖。

## Global Constraints

- 只使用调用方显式传入的内存 Markdown 文本；禁止读取或写入文件系统、扫描目录、访问网络、调用 Provider、LLM、Codex、MCP、Git 或外部工具。
- 只允许 `DEDUPLICATE_EXACT_BLOCKS`、`NORMALIZE_FORMATTING`、`NORMALIZE_HEADINGS` 三种确定性 `SIMPLIFY` 动作。
- 不允许语义、规则、决策、项目状态、标题标记或非空行文本变化。
- `AUTO_EXECUTE` 仅是新请求的测试模拟授权；不修改既有 Proposal 或其 `executionAuthorization: NONE`。
- 权威文档、未授权文档、Runtime、Permission、Capability 删除、Knowledge 与治理文件一律拒绝。
- 验证失败时返回输入基线内容并标记 `ROLLED_BACK`；不保留候选修改。
- 不创建 Module、Agent、Gate、审批系统或持久化机制。

---

## 文件结构

| 文件 | 职责 |
| --- | --- |
| `optimization-execution/optimization-execution-contract.ts` | 定义专用请求、结果、文档、动作、资格、验证和 Port 合同。 |
| `optimization-execution/optimization-eligibility-service.ts` | 在调用优化器前验证白名单、权限、动作、计划与非权威边界。 |
| `optimization-execution/deterministic-markdown-optimizer.ts` | 对单个内存文档执行三种确定性、语义不变动作。 |
| `optimization-execution/optimization-validation-service.ts` | 验证范围、标题、非空行守恒与回滚基线。 |
| `optimization-execution/optimization-execution-service.ts` | 协调资格检查、优化、验证、回滚与既有 Audit。 |
| `optimization-execution/optimization-execution-mvp.test.ts` | 覆盖成功、拒绝、语义验证、回滚、Audit 与无副作用。 |
| `package.json` | 将专用测试文件加入既有 `npm test`。 |

### Task 1: 定义专用合同并实现 Eligibility Check

**Files:**
- Create: `optimization-execution/optimization-execution-contract.ts`
- Create: `optimization-execution/optimization-eligibility-service.ts`
- Create: `optimization-execution/optimization-execution-mvp.test.ts`

**Interfaces:**
- Consumes: `Evidence`, `ConfidenceLevel` from `runtime/models/runtime-types.ts`.
- Produces: `OptimizationExecutionRequest`, `OptimizationExecutionResult`, `OptimizationEligibilityService`, `MarkdownOptimizerPort`, `OptimizationValidationPort`.

- [ ] **Step 1: 写入失败的 Eligibility 测试**

Create the test file with a request factory and these first four assertions:

```ts
test('OE-01 blocks a request without explicit AUTO_EXECUTE test authorization', () => {
  const result = new OptimizationEligibilityService().check({ ...createRequest(), autoExecuteTestAuthorization: false });
  assert.equal(result.allowed, false);
  assert.match(result.reason!, /authorization/i);
});

test('OE-02 blocks an unlisted document before optimization', () => {
  const request = createRequest({ authorizedDocumentRefs: ['doc-allowed'] });
  const result = new OptimizationEligibilityService().check(request);
  assert.equal(result.allowed, false);
  assert.match(result.reason!, /whitelist/i);
});

test('OE-03 blocks an authoritative document before optimization', () => {
  const result = new OptimizationEligibilityService().check(createRequest({ documents: [{ ...document(), authority: 'AUTHORITATIVE' }] }));
  assert.equal(result.allowed, false);
  assert.match(result.reason!, /non-authoritative/i);
});

test('OE-04 blocks an unsupported action or a missing validation or rollback plan', () => {
  assert.equal(new OptimizationEligibilityService().check(createRequest({ allowedActions: ['REWRITE'] as never })).allowed, false);
  assert.equal(new OptimizationEligibilityService().check(createRequest({ validationPlanRef: ' ' })).allowed, false);
  assert.equal(new OptimizationEligibilityService().check(createRequest({ rollbackPlanRef: ' ' })).allowed, false);
});
```

- [ ] **Step 2: 运行测试，确认因合同与服务不存在而失败**

Run:

```powershell
node --experimental-strip-types --test optimization-execution/optimization-execution-mvp.test.ts
```

Expected: FAIL because the optimization-execution contract and `OptimizationEligibilityService` do not exist.

- [ ] **Step 3: 创建合同与最小 Eligibility 实现**

Create `optimization-execution-contract.ts` with these exact public types:

```ts
import type { ConfidenceLevel, Evidence } from '../runtime/models/runtime-types.ts';

export type DocumentAuthority = 'NON_AUTHORITATIVE' | 'AUTHORITATIVE';
export type OptimizationAction = 'DEDUPLICATE_EXACT_BLOCKS' | 'NORMALIZE_FORMATTING' | 'NORMALIZE_HEADINGS';
export type OptimizationAutonomyDecision = 'AUTO_EXECUTE' | 'AUTO_WITH_VALIDATION' | 'NOTIFY' | 'CONFIRM_REQUIRED' | 'MANDATORY_APPROVAL';
export type OptimizationExecutionStatus = 'COMPLETED' | 'BLOCKED' | 'ROLLED_BACK';

export interface InMemoryMarkdownDocument { readonly documentRef: string; readonly content: string; readonly baselineContent: string; readonly authority: DocumentAuthority; }
export interface OptimizationExecutionRequest {
  readonly workflowId: string; readonly taskId: string; readonly proposalRef: string; readonly riskAssessmentRef: string;
  readonly autonomyDecision: OptimizationAutonomyDecision; readonly autoExecuteTestAuthorization: boolean;
  readonly documents: readonly InMemoryMarkdownDocument[]; readonly authorizedDocumentRefs: readonly string[];
  readonly allowedActions: readonly OptimizationAction[]; readonly validationPlanRef: string; readonly rollbackPlanRef: string; readonly timestamp: string;
}
export interface EligibilityResult { readonly allowed: boolean; readonly evidence: readonly Evidence[]; readonly reason?: string; }
export interface OptimizedDocument { readonly documentRef: string; readonly content: string; readonly changed: boolean; }
export interface ValidationResult { readonly valid: boolean; readonly evidence: readonly Evidence[]; readonly reason?: string; }
export interface MarkdownOptimizerPort { optimize(document: InMemoryMarkdownDocument, actions: readonly OptimizationAction[]): OptimizedDocument; }
export interface OptimizationValidationPort { validate(request: OptimizationExecutionRequest, candidates: readonly OptimizedDocument[]): ValidationResult; }
export interface OptimizationExecutionResult { readonly status: OptimizationExecutionStatus; readonly documents: readonly OptimizedDocument[]; readonly changedScope: readonly string[]; readonly validationEvidence: readonly Evidence[]; readonly auditEvidence: readonly Evidence[]; readonly limitations: readonly string[]; readonly failureReason?: string; }
export type { ConfidenceLevel, Evidence };
```

Implement `OptimizationEligibilityService.check(request)` so it returns `allowed: true` only when the decision is `AUTO_EXECUTE`, the test authorization is true, all required string references are non-blank, documents and whitelist are non-empty, every document is non-authoritative and listed exactly once, allowed actions are non-empty and in the three-action allowlist. Construct an `Evidence` record with source `optimization-execution`, confidence `L2`, request timestamp, and a reason-specific summary for every result.

- [ ] **Step 4: 运行 Eligibility 测试，确认通过**

Run:

```powershell
node --experimental-strip-types --test optimization-execution/optimization-execution-mvp.test.ts
```

Expected: OE-01 through OE-04 PASS.

- [ ] **Step 5: Commit the contract and preflight guard**

```powershell
git add optimization-execution/optimization-execution-contract.ts optimization-execution/optimization-eligibility-service.ts optimization-execution/optimization-execution-mvp.test.ts
git commit -m "feat: add optimization execution eligibility"
```

### Task 2: 实现确定性 Markdown 优化器与验证器

**Files:**
- Create: `optimization-execution/deterministic-markdown-optimizer.ts`
- Create: `optimization-execution/optimization-validation-service.ts`
- Modify: `optimization-execution/optimization-execution-mvp.test.ts`

**Interfaces:**
- Consumes: `InMemoryMarkdownDocument`, `OptimizationAction`, `MarkdownOptimizerPort`, `OptimizationExecutionRequest`, `OptimizedDocument`, `OptimizationValidationPort`.
- Produces: `DeterministicMarkdownOptimizer.optimize()` and `OptimizationValidationService.validate()`.

- [ ] **Step 1: 写入失败的确定性整理与语义保持测试**

Append these tests:

```ts
test('OE-05 deterministically simplifies an authorised document without changing headings or non-empty text', () => {
  const source = '# Title\n\nRepeat\n\nRepeat\n\n\n\n  - item';
  const optimized = new DeterministicMarkdownOptimizer().optimize(document({ content: source, baselineContent: source }), ['DEDUPLICATE_EXACT_BLOCKS', 'NORMALIZE_FORMATTING', 'NORMALIZE_HEADINGS']);
  assert.equal(optimized.content, '# Title\n\nRepeat\n\n  - item');
  assert.equal(optimized.changed, true);
  assert.match(optimized.content, /^# Title/m);
  assert.match(optimized.content, /^  - item/m);
});

test('OE-06 returns complete validation evidence for authorised semantic-preserving output', () => {
  const request = createRequest();
  const candidate = new DeterministicMarkdownOptimizer().optimize(request.documents[0]!, request.allowedActions);
  const validation = new OptimizationValidationService().validate(request, [candidate]);
  assert.equal(validation.valid, true);
  assert.equal(validation.evidence.length, 5);
  assert.ok(validation.evidence.every((item) => item.source === 'optimization-execution'));
});
```

- [ ] **Step 2: 运行测试，确认优化器与验证器尚不存在**

Run:

```powershell
node --experimental-strip-types --test optimization-execution/optimization-execution-mvp.test.ts
```

Expected: OE-05 and OE-06 FAIL because the optimizer and validator are not defined.

- [ ] **Step 3: 实现最小确定性规则与验证器**

Implement `DeterministicMarkdownOptimizer` with no imports other than contract types. Apply actions in this fixed order: exact-block deduplication, formatting normalization, heading normalization. Treat a block as paragraphs split by one or more blank lines; remove only an immediately repeated, byte-for-byte equal non-empty block. Normalize three or more consecutive line breaks to two. Remove only leading blank lines before a first `#` heading. Never change non-empty line characters or heading marker count.

Implement `OptimizationValidationService.validate()` with exactly five Evidence records: scope, structure, semantic-preservation, action-boundary, rollback-availability. It must reject candidates whose references are not in the request whitelist, whose heading lines differ from the baseline, whose normalized non-empty baseline lines are not an ordered subsequence of candidate non-empty lines, or whose candidate count differs from request documents. For valid candidates, return `valid: true`; otherwise return `valid: false` with a reason and the same five evidence categories.

- [ ] **Step 4: 运行所有专用测试，确认通过**

Run:

```powershell
node --experimental-strip-types --test optimization-execution/optimization-execution-mvp.test.ts
```

Expected: OE-01 through OE-06 PASS.

- [ ] **Step 5: Commit deterministic transformation and validation**

```powershell
git add optimization-execution/deterministic-markdown-optimizer.ts optimization-execution/optimization-validation-service.ts optimization-execution/optimization-execution-mvp.test.ts
git commit -m "feat: add deterministic optimization validation"
```

### Task 3: 协调执行、回滚与既有 Audit

**Files:**
- Create: `optimization-execution/optimization-execution-service.ts`
- Modify: `optimization-execution/optimization-execution-mvp.test.ts`

**Interfaces:**
- Consumes: `OptimizationEligibilityService`, `MarkdownOptimizerPort`, `OptimizationValidationPort`, `AuditService`, `InMemoryMarkdownDocument`.
- Produces: `OptimizationExecutionService.execute(request): OptimizationExecutionResult`.

- [ ] **Step 1: 写入失败的成功、回滚、Audit 和无副作用测试**

Append the following tests using `InMemoryAuditRepository` and `AuditService`:

```ts
test('OE-07 completes an explicit AUTO_EXECUTE request and writes complete audit evidence', () => {
  const repository = new InMemoryAuditRepository();
  const service = createService(new AuditService(repository));
  const result = service.execute(createRequest());
  assert.equal(result.status, 'COMPLETED');
  assert.deepEqual(result.changedScope, ['doc-allowed']);
  assert.equal(result.validationEvidence.length, 5);
  const [audit] = repository.listByWorkflowId('workflow-optimization');
  assert.equal(audit?.status, 'SUCCESS');
  assert.match(audit?.result ?? '', /proposal-optimization/i);
  assert.ok((audit?.inputRefs ?? []).includes('doc-allowed'));
});

test('OE-08 rolls back to the baseline when validation rejects an optimizer output', () => {
  const destructiveOptimizer: MarkdownOptimizerPort = { optimize: (doc) => ({ documentRef: doc.documentRef, content: '# Changed', changed: true }) };
  const repository = new InMemoryAuditRepository();
  const service = createService(new AuditService(repository), destructiveOptimizer);
  const request = createRequest();
  const result = service.execute(request);
  assert.equal(result.status, 'ROLLED_BACK');
  assert.equal(result.documents[0]?.content, request.documents[0]?.baselineContent);
  assert.equal(repository.listByWorkflowId(request.workflowId)[0]?.status, 'FAILURE');
});

test('OE-09 does not mutate request input or expose filesystem, network, provider, or runtime operations', () => {
  const request = createRequest();
  const expected = structuredClone(request);
  const service = createService(new AuditService(new InMemoryAuditRepository())) as unknown as Record<string, unknown>;
  (service as { execute(request: typeof request): unknown }).execute(request);
  assert.deepEqual(request, expected);
  assert.equal(typeof service.readFile, 'undefined');
  assert.equal(typeof service.writeFile, 'undefined');
  assert.equal(typeof service.fetch, 'undefined');
  assert.equal(typeof service.modifyRuntime, 'undefined');
});
```

- [ ] **Step 2: 运行测试，确认协调服务尚不存在**

Run:

```powershell
node --experimental-strip-types --test optimization-execution/optimization-execution-mvp.test.ts
```

Expected: OE-07 through OE-09 FAIL because `OptimizationExecutionService` is not defined.

- [ ] **Step 3: 实现协调服务及审计映射**

Create `OptimizationExecutionService` with injected `AuditService`, `OptimizationEligibilityService`, `MarkdownOptimizerPort`, and `OptimizationValidationPort`; default the latter three to their deterministic implementations. `execute()` must:

1. run eligibility and, when denied, append one Audit Event with `status: 'BLOCKED'`, return `BLOCKED`, original input content, empty `changedScope`, and guard Evidence;
2. optimize only after eligibility allows it;
3. validate candidates and, when invalid, append one Audit Event with `status: 'FAILURE'`, return `ROLLED_BACK`, each document's `baselineContent`, empty `changedScope`, validator Evidence, and a failure reason;
4. when valid, append one Audit Event with `status: 'SUCCESS'`, return `COMPLETED`, candidate documents, changed document refs only, and validator Evidence.

Every Audit Event must use request workflow/task IDs, `eventType: 'OPTIMIZATION_EXECUTION'`, request timestamp, `inputRefs: [proposalRef, riskAssessmentRef, ...authorizedDocumentRefs]`, a result string containing status and proposal reference, and evidence from the executed path. Do not alter any other repository or runtime state.

- [ ] **Step 4: 运行专用测试，确认所有路径通过**

Run:

```powershell
node --experimental-strip-types --test optimization-execution/optimization-execution-mvp.test.ts
```

Expected: OE-01 through OE-09 PASS.

- [ ] **Step 5: Commit the controlled execution loop**

```powershell
git add optimization-execution/optimization-execution-service.ts optimization-execution/optimization-execution-mvp.test.ts
git commit -m "feat: add optimization execution loop"
```

### Task 4: 接入全量测试并执行范围扫描

**Files:**
- Modify: `package.json`
- Modify: `optimization-execution/optimization-execution-mvp.test.ts` only if the npm command exposes an import or test failure.

**Interfaces:**
- Consumes: the test file created in Tasks 1–3.
- Produces: full-project test command that includes Optimization Execution MVP coverage.

- [ ] **Step 1: 将专用测试加入现有测试命令**

Modify the single `test` script so it appends exactly this test path after the existing Self Evolution test:

```text
optimization-execution/optimization-execution-mvp.test.ts
```

- [ ] **Step 2: 运行完整回归测试**

Run:

```powershell
npm.cmd test
```

Expected: all existing tests and OE-01 through OE-09 PASS, with zero failures.

- [ ] **Step 3: 执行范围与核心合同扫描**

Run:

```powershell
git diff --name-only main...HEAD
git diff -- self-evolution/self-evolution-contract.ts self-evolution/self-evolution-mvp-service.ts runtime/models/runtime-types.ts runtime/workflow runtime/task runtime/agent
rg -n 'readFile|writeFile|fetch\(|https?://|Codex|MCP|Provider|executionAuthorization' optimization-execution package.json
```

Expected: changed files are limited to `optimization-execution/` and `package.json`; the core-contract diff is empty; scan finds no file/network/provider integration and no attempt to modify existing `executionAuthorization` behavior.

- [ ] **Step 4: Commit test-runner integration**

```powershell
git add package.json optimization-execution/optimization-execution-mvp.test.ts
git commit -m "test: cover optimization execution mvp"
```
