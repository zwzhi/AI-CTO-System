# Phase 10 Optimization Execution MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为未来受控低风险优化执行建立单一边界设计文档，而不改变任何 Runtime 或 Self Evolution MVP 实现。

**Architecture:** 在 `docs/evolution/OPTIMIZATION_EXECUTION_MVP_DESIGN.md` 中定义一个嵌入现有 Phase 10 的执行资格边界：既有 Proposal、Risk Assessment 与 Autonomy Decision 作为输入，未来 Runtime 仅在授权范围、验证与回滚全部明确时执行。该文档不创建 Module、Phase、Gate 或审批系统，也不改变当前 `executionAuthorization: NONE`。

**Tech Stack:** Markdown 文档；现有 Phase 10、Runtime Safety Boundary、Audit 与 Human Control 治理规范。

## Global Constraints

- 仅设计，禁止实现自动优化、自动写入、自动删除或执行授权代码。
- 不修改 `self-evolution/`、Runtime Core、Permission Model、Manifesto、ADR、核心生命周期或系统边界。
- 不新建 Module、Phase、Agent、Gate 或审批系统。
- 当前 Self Evolution MVP 必须继续保持分析与提案模式，`executionAuthorization` 保持 `NONE`。
- 第一版未来执行仅限调用方显式授权的非权威 Markdown 文档；禁止目录扫描、范围扩张、网络、Provider、Git、代码、配置、数据或外部工具操作。

---

### Task 1: 编写受控优化执行边界文档

**Files:**
- Create: `docs/evolution/OPTIMIZATION_EXECUTION_MVP_DESIGN.md`
- Reference: `docs/superpowers/specs/2026-07-15-optimization-execution-mvp-design.md`
- Reference: `docs/evolution/SELF_EVOLUTION_ARCHITECTURE.md`
- Reference: `docs/runtime/RUNTIME_SAFETY_BOUNDARY.md`

**Interfaces:**
- Consumes: 既有 `Optimization Proposal`、`Risk Assessment`、`Autonomy Decision`、Audit、Evidence、Human Control 与 Runtime Safety Boundary 定义。
- Produces: 未来低风险优化执行的文档化边界，明确执行资格、支持动作、验证证据、回滚与人工控制规则。

- [ ] **Step 1: 核对前置边界与目标文件状态**

Run:

```powershell
$root = 'D:\AI Project\AI-CTO-System'
Test-Path "$root\docs\evolution\OPTIMIZATION_EXECUTION_MVP_DESIGN.md"
Get-Content -Raw -Encoding UTF8 "$root\docs\superpowers\specs\2026-07-15-optimization-execution-mvp-design.md"
Get-Content -Raw -Encoding UTF8 "$root\docs\evolution\SELF_EVOLUTION_ARCHITECTURE.md"
```

Expected: 目标文件尚不存在；规格明确当前 MVP 仍为 `executionAuthorization: NONE`，并将自动执行限制在未来授权 Runtime。

- [ ] **Step 2: 创建未来执行边界文档**

Use `apply_patch` to create `docs/evolution/OPTIMIZATION_EXECUTION_MVP_DESIGN.md` with exactly these responsibility sections:

```markdown
# Phase 10 Optimization Execution MVP Design

## 1. Execution Scope
## 2. Supported Optimization Types
## 3. Risk Boundary
## 4. Execution Contract
## 5. Validation Model
## 6. Rollback Strategy
## 7. Human Control Boundary
```

The document must define this future-only path:

```text
Optimization Proposal
  → Risk Assessment
  → Autonomy Decision
  → Execution Eligibility Check
  → Bounded Documentation Optimization
  → Validation Evidence
  → Audit / Rollback
```

Make the action allowlist explicit: semantic-preserving Markdown structure organization, duplicate-information consolidation, and presentation-format normalization only. Make the denylist explicit: authority files, project-state files, rules, decisions, code, configuration, data, permissions, external effects, module deletion, Runtime/Core governance changes, and any target not explicitly authorized.

- [ ] **Step 3: 定义资格、验证、停止与回滚规则**

Add exact future contract fields and their meanings:

```text
proposalReference
riskAssessmentReference
authorizedTargetReferences
baselineReferences
actionBoundary
validationPlan
rollbackPlan
evidenceRequirements
```

Require all of the following Validation Evidence before an action can be considered successful: authorized-scope validation, Markdown structure validation, semantic-preservation validation, allowlisted-action validation, and rollback-availability validation. State that any unknown scope, insufficient/conflicting Evidence, semantic ambiguity, validation failure, or unavailable rollback stops the operation and escalates it to `CONFIRM_REQUIRED`.

State that `AUTO_EXECUTE` is only for deterministic reversible formatting or exact duplicate cleanup; `AUTO_WITH_VALIDATION` is for bounded structure/duplicate consolidation with explicit semantic-preservation validation. Both remain future design policies, not current authorization.

- [ ] **Step 4: 文档验证**

Run:

```powershell
$file = 'D:\AI Project\AI-CTO-System\docs\evolution\OPTIMIZATION_EXECUTION_MVP_DESIGN.md'
$required = @(
  '## 1. Execution Scope',
  '## 2. Supported Optimization Types',
  '## 3. Risk Boundary',
  '## 4. Execution Contract',
  '## 5. Validation Model',
  '## 6. Rollback Strategy',
  '## 7. Human Control Boundary',
  'AUTO_EXECUTE',
  'AUTO_WITH_VALIDATION',
  'executionAuthorization',
  'NONE'
)
$content = Get-Content -Raw -Encoding UTF8 $file
$missing = $required | Where-Object { -not $content.Contains($_) }
if ($missing) { throw "Missing required design terms: $($missing -join ', ')" }
rg -n '[T]ODO|[T]BD|自动执行已授权|修改 self-evolution/' $file
git -C 'D:\AI Project\AI-CTO-System' diff --check
```

Expected: no missing required design terms, no placeholders or contradictory authorization wording, and no whitespace errors.

- [ ] **Step 5: Commit the documentation-only design**

Run:

```powershell
git -C 'D:\AI Project\AI-CTO-System' add -- docs/evolution/OPTIMIZATION_EXECUTION_MVP_DESIGN.md
git -C 'D:\AI Project\AI-CTO-System' commit -m "docs: design optimization execution mvp"
git -C 'D:\AI Project\AI-CTO-System' status --short
```

Expected: one documentation commit; clean working tree; no code, contract, Runtime, Registry, or governance-entry modifications.
