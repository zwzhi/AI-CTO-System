# Execution Profile & Evidence Freshness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不调用模型、工具或外部服务的前提下，实现一个只读、确定性的路由建议服务：对任务输出执行档位、模型类别建议、推理预算、验证义务和相关 Evidence 的当前性判断。

**Architecture:** 新建独立的 `runtime/routing/` 薄层。`EvidenceFreshnessService` 只比较调用方提供的相关范围与指纹；`ExecutionProfilePolicy` 只从复杂度、风险和可逆性计算建议；`AdvisoryExecutionRouter` 将两者合成为不可执行的 `RoutingRecommendation + Evidence`。它不修改 Workflow、Task、Agent、Capability、Permission/Budget Guard 或 Audit Repository。

**Tech Stack:** TypeScript、Node.js 24、内置 `node:test`、无第三方依赖、无数据库。

## Global Constraints

- 只实现建议性路由，不切换真实模型、不调用 Skill/Tool/Git/Codex/MCP/网络，也不创建执行授权。
- 新代码只能消费调用方传入的内存对象；禁止读取目录、文件系统、环境变量、Git 状态或网络。
- 不修改 `runtime/models/runtime-types.ts`、Workflow、Task、Agent、Capability、Permission/Budget Guard、Audit Repository、Registry 或 Knowledge。
- `LIGHT`、`STANDARD`、`STRICT` 只表示执行与验证强度；安全、权限、ADR、Gate、Human Control 和当前用户指令始终优先。
- `CURRENT`、`STALE`、`NOT_CAPTURED` 只描述证据与相关范围的当前性，不是 Knowledge/Capability 生命周期状态。
- 任何风险、范围或指纹不足必须保守输出 `NOT_CAPTURED` 或升级建议，不能伪造 `CURRENT`。
- 每个 Task 先写失败测试、观察失败、完成最小实现、运行目标测试和全量测试，再创建小提交。

---

## File Structure

| 文件 | 职责 |
|---|---|
| `runtime/routing/execution-routing-contract.ts` | 声明路由输入、输出、固定词汇和私有错误类型；不依赖 Runtime Core。 |
| `runtime/routing/evidence-freshness-service.ts` | 比较调用方提供的同一相关范围与指纹，输出不可变 Freshness 结果。 |
| `runtime/routing/execution-profile-policy.ts` | 用复杂度、风险、可逆性和 Gate 计算档位、推理预算、模型类别建议和验证义务。 |
| `runtime/routing/advisory-execution-router.ts` | 组合 Freshness 与 Profile Policy，生成 `RoutingRecommendation + Evidence`；无副作用。 |
| `runtime/tests/execution-routing.test.ts` | 覆盖合同、档位、升级、证据新鲜度、确定性和无副作用。 |
| `package.json` | 仅把新测试文件加入现有 `npm.cmd test` 命令。 |
| `docs/governance/EXECUTION_PROFILE_EVIDENCE_FRESHNESS_STANDARD.md` | 将已批准设计转为运行时实现的规范入口，并重申“仅建议”。 |

## Shared Contract

Task 1 创建的合同必须使用下列名称和值，后续 Task 不得另起同义类型：

```ts
export type TaskComplexity = 'L0' | 'L1' | 'L2' | 'L3' | 'L4';
export type TaskKind = 'DOCUMENTATION' | 'ENGINEERING' | 'ARCHITECTURE';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Reversibility = 'REVERSIBLE' | 'CONDITIONALLY_REVERSIBLE' | 'IRREVERSIBLE';
export type ExecutionProfile = 'LIGHT' | 'STANDARD' | 'STRICT';
export type ReasoningBudget = 'R0' | 'R1' | 'R2' | 'R3' | 'R4';
export type SuggestedModelCategory = 'NONE' | 'FAST' | 'STANDARD' | 'HIGH_REASONING' | 'CODE';
export type ValidationObligation = 'NONE' | 'TARGETED' | 'CHANGE_IMPACT_AND_TARGETED' | 'FULL_GATE';
export type RoutingDecision = 'OUT_OF_SCOPE' | 'ROUTE_RECOMMENDED' | 'ESCALATE_FOR_REVIEW' | 'INSUFFICIENT_EVIDENCE';
export type EvidenceCurrentness = 'CURRENT' | 'STALE' | 'NOT_CAPTURED';
export type FingerprintMethod = 'CONTENT_HASH' | 'GIT_SCOPE';

export interface EvidenceFreshnessInput {
  readonly evidenceRef: string;
  readonly scopeRefs: readonly string[];
  readonly fingerprint?: { readonly method: FingerprintMethod; readonly value: string };
  readonly observedAt: string;
}

export interface EvidenceFreshnessObservation {
  readonly evidenceRef: string;
  readonly scopeRefs: readonly string[];
  readonly fingerprint?: { readonly method: FingerprintMethod; readonly value: string };
}

export interface RoutingRequest {
  readonly routingId: string;
  readonly taskKind: TaskKind;
  readonly complexity: TaskComplexity;
  readonly riskLevel: RiskLevel;
  readonly reversibility: Reversibility;
  readonly hasApplicableGate: boolean;
  readonly requiresCurrentEvidence: boolean;
  readonly evidenceInputs: readonly EvidenceFreshnessInput[];
  readonly evidenceObservations: readonly EvidenceFreshnessObservation[];
}

export interface EvidenceFreshnessResult {
  readonly evidenceRef: string;
  readonly currentness: EvidenceCurrentness;
  readonly reason: string;
  readonly scopeRefs: readonly string[];
  readonly observedAt: string;
}

export interface ExecutionProfileDecision {
  readonly decision: RoutingDecision;
  readonly profile?: ExecutionProfile;
  readonly reasoningBudget: ReasoningBudget;
  readonly modelCategory: SuggestedModelCategory;
  readonly validationObligation: ValidationObligation;
  readonly escalationConditions: readonly string[];
  readonly limitations: readonly string[];
}

export interface RoutingRecommendation extends ExecutionProfileDecision {
  readonly routingId: string;
  readonly evidenceFreshness: readonly EvidenceFreshnessResult[];
  readonly evidence: readonly Evidence[];
}
```

`RoutingRecommendation` 必须包含 `routingId`、`decision`、可选 `profile`、`reasoningBudget`、`modelCategory`、`validationObligation`、`evidenceFreshness`、`escalationConditions`、`evidence` 和 `limitations`。其 `evidence` 使用既有 `runtime/models/runtime-types.ts` 的 `Evidence`，但路由代码不得调用 `AuditService` 或持久化。

测试文件的固定夹具必须为：

```ts
const NOW = '2026-08-06T00:00:00.000Z';
const INPUT: EvidenceFreshnessInput = Object.freeze({
  evidenceRef: 'test-1', scopeRefs: Object.freeze(['runtime/a.ts']),
  fingerprint: Object.freeze({ method: 'CONTENT_HASH', value: 'abc' }), observedAt: NOW,
});

function request(overrides: Partial<RoutingRequest> = {}): RoutingRequest {
  return Object.freeze({
    routingId: 'route-1', taskKind: 'ENGINEERING', complexity: 'L2', riskLevel: 'LOW',
    reversibility: 'REVERSIBLE', hasApplicableGate: false, requiresCurrentEvidence: false,
    evidenceInputs: Object.freeze([INPUT]),
    evidenceObservations: Object.freeze([Object.freeze({
      evidenceRef: 'test-1', scopeRefs: Object.freeze(['runtime/a.ts']),
      fingerprint: Object.freeze({ method: 'CONTENT_HASH', value: 'abc' }),
    })]),
    ...overrides,
  });
}
```

### Task 1: 建立合同与 Evidence Freshness 比较器

**Files:**

- Create: `runtime/routing/execution-routing-contract.ts`
- Create: `runtime/routing/evidence-freshness-service.ts`
- Create: `runtime/tests/execution-routing.test.ts`
- Modify: `package.json`

**Interfaces:**

- Consumes: `RoutingRequest`、`EvidenceFreshnessInput`、`EvidenceFreshnessObservation`。
- Produces: `EvidenceFreshnessResult[]`，每项含 `evidenceRef`、`currentness`、`reason`、`scopeRefs`、`observedAt`。

- [ ] **Step 1: 写入失败测试，固定三种当前性语义。**

```ts
test('ER-01 marks matching authorised scope and fingerprint CURRENT', () => {
  const result = new EvidenceFreshnessService().evaluate([{ 
    evidenceRef: 'test-1', scopeRefs: ['runtime/a.ts'],
    fingerprint: { method: 'CONTENT_HASH', value: 'abc' }, observedAt: NOW,
  }], [{
    evidenceRef: 'test-1', scopeRefs: ['runtime/a.ts'],
    fingerprint: { method: 'CONTENT_HASH', value: 'abc' },
  }]);
  assert.equal(result[0]?.currentness, 'CURRENT');
});

test('ER-02 marks only a changed relevant scope STALE', () => {
  const result = new EvidenceFreshnessService().evaluate([INPUT], [{
    evidenceRef: 'test-1', scopeRefs: ['runtime/a.ts'],
    fingerprint: { method: 'CONTENT_HASH', value: 'changed' },
  }]);
  assert.equal(result[0]?.currentness, 'STALE');
});

test('ER-03 never infers CURRENT when input or observation has no fingerprint', () => {
  const result = new EvidenceFreshnessService().evaluate([{ ...INPUT, fingerprint: undefined }], []);
  assert.equal(result[0]?.currentness, 'NOT_CAPTURED');
});
```

- [ ] **Step 2: 运行目标测试，确认它因模块不存在而失败。**

Run: `node --experimental-strip-types --test runtime/tests/execution-routing.test.ts`

Expected: FAIL，错误指向 `runtime/routing/evidence-freshness-service.ts` 尚不存在。

- [ ] **Step 3: 实现最小的不可变比较器。**

```ts
export class EvidenceFreshnessService {
  evaluate(inputs: readonly EvidenceFreshnessInput[], observations: readonly EvidenceFreshnessObservation[]): readonly EvidenceFreshnessResult[] {
    return Object.freeze(inputs.map((input) => {
      const observation = observations.find((item) => item.evidenceRef === input.evidenceRef);
      if (input.fingerprint === undefined || observation?.fingerprint === undefined) {
        return freezeResult(input, 'NOT_CAPTURED', 'Fingerprint is not captured for an authorised comparison.');
      }
      if (!sameScope(input.scopeRefs, observation.scopeRefs) || !sameFingerprint(input.fingerprint, observation.fingerprint)) {
        return freezeResult(input, 'STALE', 'Relevant authorised scope or fingerprint changed.');
      }
      return freezeResult(input, 'CURRENT', 'Relevant authorised scope and fingerprint match.');
    }));
  }
}
```

实现中必须包含以下确定性辅助语义：

```ts
function sameScope(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && [...left].sort().every((item, index) => item === [...right].sort()[index]);
}
function sameFingerprint(left: NonNullable<EvidenceFreshnessInput['fingerprint']>, right: NonNullable<EvidenceFreshnessObservation['fingerprint']>): boolean {
  return left.method === right.method && left.value === right.value;
}
```

`freezeResult` 必须创建并 `Object.freeze` 一个 `EvidenceFreshnessResult`；比较器只比较调用方传入的 `scopeRefs`，不得枚举任何目录或调用 Git。

- [ ] **Step 4: 运行目标与全量测试。**

Run: `node --experimental-strip-types --test runtime/tests/execution-routing.test.ts`；再运行 `npm.cmd test`。

Expected: 新增 ER-01 至 ER-03 通过，既有测试无回归。

- [ ] **Step 5: 提交合同与 Freshness 比较器。**

```powershell
git add runtime/routing/execution-routing-contract.ts runtime/routing/evidence-freshness-service.ts runtime/tests/execution-routing.test.ts package.json
git commit -m "feat: add evidence freshness routing contract"
```

### Task 2: 实现档位、推理与验证义务政策

**Files:**

- Create: `runtime/routing/execution-profile-policy.ts`
- Modify: `runtime/tests/execution-routing.test.ts`

**Interfaces:**

- Consumes: `RoutingRequest` 与 `EvidenceFreshnessResult[]`。
- Produces: `ExecutionProfileDecision`，含 `decision`、`profile?`、`reasoningBudget`、`modelCategory`、`validationObligation`、`escalationConditions` 与 `limitations`。

- [ ] **Step 1: 写入失败测试，先表达复杂度与风险分离。**

```ts
test('ER-04 maps L1 low-risk reversible documentation to LIGHT and R1', () => {
  const decision = new ExecutionProfilePolicy().decide(request({
    taskKind: 'DOCUMENTATION', complexity: 'L1', riskLevel: 'LOW', reversibility: 'REVERSIBLE',
  }), []);
  assert.deepEqual(pick(decision), {
    decision: 'ROUTE_RECOMMENDED', profile: 'LIGHT', reasoningBudget: 'R1',
    modelCategory: 'FAST', validationObligation: 'TARGETED',
  });
});

test('ER-05 escalates a simple irreversible task to STRICT without raising R1', () => {
  const decision = new ExecutionProfilePolicy().decide(request({
    complexity: 'L1', riskLevel: 'HIGH', reversibility: 'IRREVERSIBLE',
  }), []);
  assert.equal(decision.profile, 'STRICT');
  assert.equal(decision.reasoningBudget, 'R1');
  assert.equal(decision.validationObligation, 'FULL_GATE');
});

test('ER-06 keeps stale evidence non-executable and requests review when current evidence is required', () => {
  const decision = new ExecutionProfilePolicy().decide(request({ requiresCurrentEvidence: true }), [staleEvidence]);
  assert.equal(decision.decision, 'ESCALATE_FOR_REVIEW');
  assert.equal(decision.profile, 'STRICT');
});
```

- [ ] **Step 2: 运行目标测试，确认政策类尚不存在。**

Run: `node --experimental-strip-types --test runtime/tests/execution-routing.test.ts`

Expected: FAIL，错误指向 `ExecutionProfilePolicy` 不存在。

- [ ] **Step 3: 写入固定映射和保守升级规则。**

```ts
const reasoningByComplexity = { L0: 'R0', L1: 'R1', L2: 'R2', L3: 'R3', L4: 'R4' } as const;

function minimumProfile(request: RoutingRequest): ExecutionProfile {
  if (request.complexity === 'L4' || request.riskLevel === 'CRITICAL' || request.reversibility === 'IRREVERSIBLE' || request.hasApplicableGate) {
    return 'STRICT';
  }
  if (request.complexity === 'L1' && request.riskLevel === 'LOW' && request.reversibility === 'REVERSIBLE') return 'LIGHT';
  return 'STANDARD';
}
```

对于 L0，返回 `OUT_OF_SCOPE`、`R0`、`NONE`、`NONE`，且不返回 Profile。对于 `requiresCurrentEvidence: true` 且有任一非 `CURRENT` 结果，返回 `ESCALATE_FOR_REVIEW`，并使用 `STRICT` 与 `FULL_GATE`；这只是建议，不是执行授权。

模型类别的固定建议为：L0 → `NONE`，L1 → `FAST`，L2 → `STANDARD`，L3 工程任务 → `CODE`、L3 其他任务 → `HIGH_REASONING`，L4 → `HIGH_REASONING`。该字段只说明推荐类别，绝不选择或调用实际模型。

- [ ] **Step 4: 运行目标与全量测试。**

Run: `node --experimental-strip-types --test runtime/tests/execution-routing.test.ts`；再运行 `npm.cmd test`。

Expected: ER-01 至 ER-06 通过；现有能力测试全通过。

- [ ] **Step 5: 提交档位政策。**

```powershell
git add runtime/routing/execution-profile-policy.ts runtime/tests/execution-routing.test.ts
git commit -m "feat: add advisory execution profile policy"
```

### Task 3: 组合为只读 Advisory Execution Router 与可追溯 Evidence

**Files:**

- Create: `runtime/routing/advisory-execution-router.ts`
- Modify: `runtime/tests/execution-routing.test.ts`

**Interfaces:**

- Consumes: `RoutingRequest`、`EvidenceFreshnessService`、`ExecutionProfilePolicy` 与注入的 `now(): string`。
- Produces: `RoutingRecommendation`；`evidence` 仅使用既有 `Evidence` 类型，且不调用 `AuditService`、Repository、Workflow 或任何 Adapter。

- [ ] **Step 1: 写入失败测试，约束输出、确定性与零副作用。**

```ts
test('ER-07 returns recommendation evidence without creating an execution authorisation', () => {
  const result = new AdvisoryExecutionRouter(() => NOW).route(request());
  assert.equal(result.decision, 'ROUTE_RECOMMENDED');
  assert.equal(result.profile, 'STANDARD');
  assert.equal(result.evidence[0]?.source, 'execution-routing');
  assert.ok(result.limitations.includes('Recommendation only; no execution authorisation is created.'));
});

test('ER-08 returns equal output for equal frozen input and never mutates it', () => {
  const input = deepFreeze(request());
  const router = new AdvisoryExecutionRouter(() => NOW);
  assert.deepEqual(router.route(input), router.route(input));
  assert.deepEqual(input, request());
});

test('ER-09 marks stale evidence but does not invoke a validator, tool, audit repository, or model', () => {
  const result = new AdvisoryExecutionRouter(() => NOW).route(request({ requiresCurrentEvidence: false, evidenceObservations: [changedObservation] }));
  assert.equal(result.evidenceFreshness[0]?.currentness, 'STALE');
  assert.equal(result.validationObligation, 'CHANGE_IMPACT_AND_TARGETED');
});
```

- [ ] **Step 2: 运行目标测试，确认路由器尚不存在。**

Run: `node --experimental-strip-types --test runtime/tests/execution-routing.test.ts`

Expected: FAIL，错误指向 `AdvisoryExecutionRouter` 尚不存在。

- [ ] **Step 3: 实现组合器。**

```ts
export class AdvisoryExecutionRouter {
  constructor(private readonly now: () => string = () => new Date().toISOString()) {}

  route(request: RoutingRequest): RoutingRecommendation {
    const snapshot = freezeRequest(request);
    const evidenceFreshness = this.freshness.evaluate(snapshot.evidenceInputs, snapshot.evidenceObservations);
    const decision = this.policy.decide(snapshot, evidenceFreshness);
    return Object.freeze({
      routingId: snapshot.routingId,
      ...decision,
      evidenceFreshness,
      evidence: Object.freeze([routingEvidence(snapshot.routingId, decision, this.now())]),
      limitations: Object.freeze([...decision.limitations, 'Recommendation only; no execution authorisation is created.']),
    });
  }
}
```

`routingEvidence` 的 `confidence` 只能为 `L2`：它证明的是确定性政策评估，不证明任务成功、模型质量或真实验证完成。

非必需但已过期的证据只把验证义务提高一级：`TARGETED` 提升为 `CHANGE_IMPACT_AND_TARGETED`，`CHANGE_IMPACT_AND_TARGETED` 提升为 `FULL_GATE`，`FULL_GATE` 保持不变；它不自动运行任何验证。

- [ ] **Step 4: 运行完整验证与范围检查。**

Run: `npm.cmd test`，随后运行：

```powershell
git diff --check
rg -n "fetch\(|https?://|child_process|node:fs|AuditService|WorkflowService|Capability" runtime/routing runtime/tests/execution-routing.test.ts
```

Expected: 全量测试通过；`git diff --check` 无输出；范围扫描不出现外部访问、持久化或执行服务依赖。

- [ ] **Step 5: 提交建议性路由器。**

```powershell
git add runtime/routing/advisory-execution-router.ts runtime/tests/execution-routing.test.ts
git commit -m "feat: add advisory execution routing service"
```

### Task 4: 同步治理入口并执行 Development Gate

**Files:**

- Create: `docs/governance/EXECUTION_PROFILE_EVIDENCE_FRESHNESS_STANDARD.md`
- Modify: `docs/governance/EXECUTION_ROUTING_GOVERNANCE_STANDARD.md`
- Modify: `docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md`
- Modify: `docs/architecture/MODULE_REGISTRY.md`
- Modify: `SKILL.md`
- Modify: `memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md`
- Modify: `docs/DEVELOPMENT_PROGRESS.md`

**Interfaces:**

- Consumes: 已批准设计规格、ADR-0032 与 Task 1–3 的 `RoutingRecommendation`。
- Produces: 与实际实现一致的治理说明与 Development Gate 证据；不扩大为自动模型切换、工具调用或执行授权。

- [ ] **Step 1: 先写治理验收清单。**

在新标准中逐项写明以下可核对条件：

```markdown
- `AdvisoryExecutionRouter` 只返回建议和 L2 路由 Evidence。
- `EvidenceFreshnessService` 只比较传入范围与指纹；没有文件、Git 或网络访问。
- `LIGHT` / `STANDARD` / `STRICT` 不替代任何 Gate、Approval、Permission 或 Human Control。
- 推荐的 `SuggestedModelCategory` 不会触发实际模型选择或调用。
```

- [ ] **Step 2: 运行文档与实现一致性验证。**

Run:

```powershell
rg -n "AUTO_EXECUTE|activate|invoke\(|fetch\(|node:fs|child_process" runtime/routing
npm.cmd test
git diff --check
```

Expected: 路由目录不含自动执行、激活、外部访问或文件系统调用；全量测试通过；diff 无空白错误。

- [ ] **Step 3: 按 Development Gate 记录结果。**

记录：Task 1–3 测试已通过、合同与 ADR 对齐、无高优先级缺陷、文档同步完成、Git 状态正常。Gate 只能给出 `APPROVED_FOR_TESTING` 或 `CHANGES_REQUIRED`；此 Gate 不授权真实模型、工具或自动执行。

- [ ] **Step 4: 提交治理同步。**

```powershell
git add docs/governance/EXECUTION_PROFILE_EVIDENCE_FRESHNESS_STANDARD.md docs/governance/EXECUTION_ROUTING_GOVERNANCE_STANDARD.md docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md docs/architecture/MODULE_REGISTRY.md SKILL.md memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md docs/DEVELOPMENT_PROGRESS.md
git commit -m "docs: govern advisory execution routing"
```

## Test Matrix

| 测试 | 断言 |
|---|---|
| ER-01 | 相同的相关范围与指纹为 `CURRENT`。 |
| ER-02 | 相关范围或指纹变化为 `STALE`。 |
| ER-03 | 缺失指纹或观察为 `NOT_CAPTURED`。 |
| ER-04 | L1、低风险、可逆任务为 `LIGHT`、R1、`FAST`、定向验证。 |
| ER-05 | 简单但不可逆/高风险任务升为 `STRICT`，但不虚增推理等级。 |
| ER-06 | 要求当前证据而证据非当前时升级为审查建议。 |
| ER-07 | 输出有路由 Evidence 与“无执行授权”限制。 |
| ER-08 | 输入和输出不可变，等输入得到等输出。 |
| ER-09 | 证据过期只提高验证义务，不触发验证、工具、模型或审计持久化。 |

## Self-Review

- **Spec coverage:** Task 1 覆盖 Freshness 合同；Task 2 覆盖复杂度、风险、档位、Reasoning、模型类别建议与验证义务；Task 3 覆盖建议性 Execution Plan/Evidence 和无副作用；Task 4 覆盖治理入口、Gate 和边界。没有遗漏“不得自动选择/调用模型、不得自动执行”的约束。
- **Placeholder scan:** 未发现占位标记、模糊错误处理描述或引用未声明接口的步骤。
- **Type consistency:** 所有 Task 共用 `RoutingRequest`、`EvidenceFreshnessResult`、`ExecutionProfileDecision`、`RoutingRecommendation`、`EvidenceFreshnessService`、`ExecutionProfilePolicy`、`AdvisoryExecutionRouter`；名称在任务间不变。

## Execution Handoff

计划已保存。执行时应在独立分支中按 Task 1–4 逐项 TDD，且每项都必须通过其目标测试与全量 `npm.cmd test`。当前计划不授权真实模型/工具接入、自动模型切换或任何执行权限。
