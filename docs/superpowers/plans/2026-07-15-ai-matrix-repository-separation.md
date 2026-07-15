# AI Matrix Repository Separation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 AI Matrix 从 AI CTO System 源码仓库拆分为 `D:\AI Project\AI-Matrix` 独立、可测试、保留历史且无源码路径耦合的 Git 仓库。

**Architecture:** 使用 `git subtree split` 提取 `projects/ai-matrix` 历史，再迁移产品专属文档。AI Matrix 内建立最小 AI CTO Contract / Port，替代对源仓库 Runtime 的相对导入；AI CTO System 只保留 ADR-0031、拆分设计和外部项目组合记录。

**Tech Stack:** Git、PowerShell、Node.js 24、TypeScript strip-types、`node:test`、SQLite / `better-sqlite3` 12.10.0。

## Global Constraints

- 目标仓库固定为 `D:\AI Project\AI-Matrix`。
- 新仓库默认分支固定为 `main`，初始不配置 remote。
- 不重写或删除 AI CTO System 历史提交。
- 新仓库禁止引用 `AI-CTO-System/runtime` 或任何源仓库相对源码路径。
- 只迁移最小 Contract / Port，不复制 Core、Workflow Engine、Agent Runtime、Module Registry 或 Self Evolution。
- 不开发新产品功能，不接入模型、Provider、RAG、外部工具或多 Agent。
- 源仓库删除提交只能在新仓库测试、审计和提交均成功后执行。

---

### Task 1: 提取项目历史并建立独立仓库

**Files:**
- Source: `D:\AI Project\AI-CTO-System\projects\ai-matrix\**`
- Create repository: `D:\AI Project\AI-Matrix\.git`

**Interfaces:**
- Consumes: 当前已验证分支 `codex/ai-matrix-mvp`。
- Produces: 独立仓库 `D:\AI Project\AI-Matrix` 的 `main` 分支和保留的项目目录历史。

- [ ] **Step 1: 验证源和目标绝对路径**

Run:

```powershell
$source = [System.IO.Path]::GetFullPath('D:\AI Project\AI-CTO-System')
$target = [System.IO.Path]::GetFullPath('D:\AI Project\AI-Matrix')
if ((git -C $source status --porcelain) -ne $null) { throw 'Source worktree must be clean' }
if (Test-Path -LiteralPath $target) { throw 'Target already exists' }
git -C $source branch --show-current
```

Expected: 源工作树干净、目标不存在、分支为 `codex/ai-matrix-mvp`。

- [ ] **Step 2: 创建 subtree split 引用**

Run:

```powershell
git -C 'D:\AI Project\AI-CTO-System' subtree split --prefix=projects/ai-matrix -b codex/ai-matrix-extract
```

Expected: 创建 `codex/ai-matrix-extract`，输出一个 split commit SHA。

- [ ] **Step 3: 克隆 split 历史并解除本地 remote**

Run:

```powershell
git clone --no-hardlinks --single-branch --branch codex/ai-matrix-extract 'D:\AI Project\AI-CTO-System' 'D:\AI Project\AI-Matrix'
git -C 'D:\AI Project\AI-Matrix' branch -m main
git -C 'D:\AI Project\AI-Matrix' remote remove origin
```

Expected: 新仓库分支为 `main`，`git remote -v` 无输出。

- [ ] **Step 4: 验证历史和项目资产**

Run:

```powershell
git -C 'D:\AI Project\AI-Matrix' log --oneline --all --max-count=15
git -C 'D:\AI Project\AI-Matrix' ls-files
```

Expected: 历史包含 AI Matrix MVP 和 Product Foundation 提交；代码、测试、Knowledge、Pilot、迁移和锁文件均被跟踪。

---

### Task 2: 迁移产品文档和独立治理入口

**Files:**
- Create: `D:\AI Project\AI-Matrix\AGENTS.md`
- Create: `D:\AI Project\AI-Matrix\docs\applications\AI_MATRIX_*.md`
- Create: `D:\AI Project\AI-Matrix\docs\adr\ADR-0026-*.md` through `ADR-0031-*.md`
- Create: `D:\AI Project\AI-Matrix\docs\superpowers\plans\2026-07-15-ai-matrix-*.md`
- Create: `D:\AI Project\AI-Matrix\docs\superpowers\specs\2026-07-15-ai-matrix-repository-separation-design.md`
- Modify: `D:\AI Project\AI-Matrix\PROJECT_MEMORY.md`
- Modify: `D:\AI Project\AI-Matrix\DEVELOPMENT_PROGRESS.md`

**Interfaces:**
- Consumes: 已批准的 AI Matrix 产品文档与 ADR-0026～ADR-0031。
- Produces: 新仓库自包含的设计、决策、记忆和开发规则。

- [ ] **Step 1: 创建目标文档目录并复制明确文件集**

Run with `Copy-Item -LiteralPath` for these exact source groups:

```text
docs/applications/AI_MATRIX_APPLICATION_STRATEGY.md
docs/applications/AI_MATRIX_PILOT_DESIGN.md
docs/applications/AI_MATRIX_MVP_IMPLEMENTATION_DESIGN.md
docs/applications/AI_MATRIX_FULL_PRODUCT_DESIGN.md
docs/applications/AI_MATRIX_REQUIREMENT_TRACEABILITY_MATRIX.md
docs/adr/ADR-0026-AI-MATRIX-APPLICATION-BOUNDARY.md
docs/adr/ADR-0027-AI-MATRIX-SINGLE-CAPABILITY-PILOT.md
docs/adr/ADR-0028-AI-MATRIX-APPLICATION-MVP-IMPLEMENTATION.md
docs/adr/ADR-0029-AI-MATRIX-FULL-PRODUCT-CLOSED-LOOP.md
docs/adr/ADR-0030-AI-MATRIX-PRODUCT-FOUNDATION-STACK.md
docs/adr/ADR-0031-AI-MATRIX-INDEPENDENT-REPOSITORY.md
docs/superpowers/plans/2026-07-15-ai-matrix-product-foundation.md
docs/superpowers/plans/2026-07-15-ai-matrix-repository-separation.md
docs/superpowers/specs/2026-07-15-ai-matrix-repository-separation-design.md
```

Expected: 所有文件位于新仓库对应 `docs/applications`、`docs/adr`、`docs/superpowers/plans`、`docs/superpowers/specs`。

- [ ] **Step 2: 创建独立 AGENTS.md**

Create exactly:

```markdown
# AI Matrix 开发规则

1. AI Matrix 是独立业务产品，使用 AI CTO System 进行开发治理，但不属于 AI CTO System 源码。
2. 所有开发先分析需求，明确目标、范围、约束和验收标准。
3. 禁止直接编码；实现前必须生成并确认设计文档。
4. 重大技术、产品、流程或仓库边界决策必须创建 ADR。
5. 持续维护 PROJECT_MEMORY.md 与 DEVELOPMENT_PROGRESS.md。
6. 业务代码只依赖本仓库 Contract / Port 或正式版本化依赖，禁止引用 AI CTO System 本地源码路径。
7. 不得将工程测试解释为能力复制或真实 Pilot 成功。
```

- [ ] **Step 3: 更新新仓库状态**

Set both memory and progress current state to `INDEPENDENT_REPOSITORY_MIGRATION_IN_PROGRESS`; record target path, split-history strategy, no remote, and pending Contract isolation.

- [ ] **Step 4: 提交治理资产迁移**

Run:

```powershell
git -C 'D:\AI Project\AI-Matrix' add AGENTS.md docs PROJECT_MEMORY.md DEVELOPMENT_PROGRESS.md
git -C 'D:\AI Project\AI-Matrix' commit -m "docs: establish independent AI Matrix governance"
```

Expected: commit succeeds and working tree is clean.

---

### Task 3: 建立独立 AI CTO Contract 并解除源码路径耦合

**Files:**
- Create: `D:\AI Project\AI-Matrix\src\ai-cto\runtime-contracts.ts`
- Create: `D:\AI Project\AI-Matrix\src\ai-cto\audit.ts`
- Create: `D:\AI Project\AI-Matrix\src\ai-cto\permission-budget-guard.ts`
- Create: `D:\AI Project\AI-Matrix\tests\repository-boundary.test.ts`
- Modify: all imports under `D:\AI Project\AI-Matrix\src\**` and `tests\**` that reference `runtime/`
- Modify: `D:\AI Project\AI-Matrix\package.json`

**Interfaces:**
- Produces `AuditService`, `AuditRepositoryPort`, `InMemoryAuditRepository`, `PermissionBudgetGuard`.
- Produces types `BudgetSnapshot`, `ControlMode`, `CapabilityStatus`, `ConfidenceLevel`, `Evidence`, `ExecutionContext`, `AuditEvent`, `AgentPermissionScope`, `ApprovalStatus`, `AgentFailureStage`.

- [ ] **Step 1: 新增失败的仓库边界测试**

Create `tests/repository-boundary.test.ts` that recursively reads `src/**/*.ts` and asserts:

```ts
assert.doesNotMatch(source, /(?:\.\.\/){2,}runtime\//);
assert.doesNotMatch(source, /AI-CTO-System/i);
```

Also assert `git remote -v` is not used by production code and `package.json` has no `file:../AI-CTO-System` dependency.

- [ ] **Step 2: 运行 RED**

Run:

```powershell
npm test
```

Expected: FAIL because existing imports resolve outside the independent repository or boundary test detects them.

- [ ] **Step 3: 创建最小 Runtime Contract**

`runtime-contracts.ts` must define immutable structural types only:

```ts
export type ConfidenceLevel = 'L1' | 'L2' | 'L3' | 'L4';
export type CapabilityStatus = 'SUCCESS' | 'FAILURE' | 'CANCELLED' | 'BLOCKED';
export type ControlMode = 'AUTO' | 'CONFIRM' | 'BLOCK';
export interface BudgetSnapshot {
  readonly tokenLimit: number; readonly tokenUsed: number;
  readonly toolLimit: number; readonly toolUsed: number;
  readonly timeLimitMs: number; readonly timeUsedMs: number;
  readonly costLimit: number; readonly costUsed: number;
}
export interface ExecutionContext {
  readonly userRef?: string; readonly projectRef?: string;
  readonly intentRef: string; readonly constraintRefs: readonly string[];
  readonly allowedContextRefs: readonly string[];
}
export interface Evidence {
  readonly evidenceId: string; readonly source: string; readonly summary: string;
  readonly confidence: ConfidenceLevel; readonly timestamp: string; readonly reference?: string;
}
```

Add the Audit optional structures used by `sqlite-audit-repository.ts` and existing tests: agent identity, approval, execution duration, input/output refs, permission snapshot, budget snapshot and failure fields. `AuditEvent.status` remains a string union compatible with existing `SUCCESS`, `BLOCKED`, workflow and task states.

- [ ] **Step 4: 创建 Audit Contract / Service**

`audit.ts` must expose:

```ts
export interface AuditRepositoryPort {
  append(event: AuditEvent): AuditEvent;
  listByWorkflowId(workflowId: string): AuditEvent[];
}
export class AuditService {
  constructor(repository: AuditRepositoryPort);
  append(event: AuditEvent): AuditEvent;
  listByWorkflowId(workflowId: string): AuditEvent[];
}
export class InMemoryAuditRepository implements AuditRepositoryPort {
  append(event: AuditEvent): AuditEvent;
  listByWorkflowId(workflowId: string): AuditEvent[];
}
```

All returned events use `structuredClone`; append-only behavior must remain unchanged.

- [ ] **Step 5: 创建 Permission / Budget Guard**

`permission-budget-guard.ts` must preserve these decisions:

```text
cancelled -> DENY / OPERATION_CANCELLED
usage above any limit -> DENY / BUDGET_EXCEEDED
BLOCK -> DENY / GUARD_DENIED
CONFIRM -> CONFIRM_REQUIRED / CONFIRMATION_REQUIRED
AUTO -> ALLOW
```

Expose `evaluate(request)` and `evaluatePlannerPreflight(request)` with the same behavior as the previously consumed AI CTO contract.

- [ ] **Step 6: 替换所有源码与测试导入**

Use these mappings:

```text
src/*.ts runtime models -> ./ai-cto/runtime-contracts.ts
src/*.ts PermissionBudgetGuard -> ./ai-cto/permission-budget-guard.ts
src/*.ts AuditService -> ./ai-cto/audit.ts
src/product/*.ts runtime models -> ../ai-cto/runtime-contracts.ts
src/product/*.ts Audit types/services -> ../ai-cto/audit.ts
tests/*.ts Audit/Guard imports -> ../src/ai-cto/audit.ts and ../src/ai-cto/permission-budget-guard.ts
```

No other behavior or public business contract changes are permitted.

- [ ] **Step 7: 将边界测试加入 npm test**

Append `tests/repository-boundary.test.ts` to the explicit `node --test` file list in `package.json`.

- [ ] **Step 8: 运行 GREEN**

Run:

```powershell
npm test
npm audit --audit-level=high
rg -n -e "(?:\.\./){2,}runtime/" -e "AI-CTO-System" src tests package.json
```

Expected: all tests pass, audit reports 0 vulnerabilities, `rg` returns no matches except the boundary test pattern itself.

- [ ] **Step 9: 提交独立 Contract**

Run:

```powershell
git add src tests package.json PROJECT_MEMORY.md DEVELOPMENT_PROGRESS.md
git commit -m "refactor: isolate AI Matrix from AI CTO source paths"
```

---

### Task 4: 验证并冻结独立仓库迁移基线

**Files:**
- Modify: `D:\AI Project\AI-Matrix\PROJECT_MEMORY.md`
- Modify: `D:\AI Project\AI-Matrix\DEVELOPMENT_PROGRESS.md`
- Modify: `D:\AI Project\AI-Matrix\docs\applications\AI_MATRIX_REQUIREMENT_TRACEABILITY_MATRIX.md`

**Interfaces:**
- Consumes: 独立仓库通过的应用测试和边界扫描。
- Produces: `INDEPENDENT_REPOSITORY_READY` 治理状态。

- [ ] **Step 1: 执行完整独立仓库验证**

Run:

```powershell
npm test
npm audit --audit-level=high
git diff --check
git status --short
git remote -v
git branch --show-current
```

Expected: tests 0 failures、audit 0 vulnerabilities、branch `main`、remote empty。

- [ ] **Step 2: 验证无源仓库依赖**

Run:

```powershell
rg -n -g "*.ts" -g "package.json" -e "AI-CTO-System" -e "(?:\.\./){2,}runtime/" .
```

Expected: 只有边界测试中的禁止模式文本；生产源码和依赖无匹配。

- [ ] **Step 3: 更新治理状态**

Record repository root, `main`, no remote, preserved history, exact test count, 0 vulnerabilities, and `INDEPENDENT_REPOSITORY_READY`. Add repository separation Evidence to the traceability matrix without marking cold-start, generation, scoring or Pilot requirements implemented.

- [ ] **Step 4: 提交迁移基线**

Run:

```powershell
git add PROJECT_MEMORY.md DEVELOPMENT_PROGRESS.md docs/applications/AI_MATRIX_REQUIREMENT_TRACEABILITY_MATRIX.md
git commit -m "docs: record independent repository baseline"
```

Expected: new repository clean and self-contained.

---

### Task 5: 从 AI CTO System 移出业务项目并建立外部项目记录

**Files:**
- Delete: `projects/ai-matrix/**`
- Delete: `docs/applications/AI_MATRIX_*.md`
- Delete: `docs/adr/ADR-0026-*.md` through `docs/adr/ADR-0030-*.md`
- Delete: `docs/superpowers/plans/2026-07-15-ai-matrix-product-foundation.md`
- Create: `docs/portfolio/AI_MATRIX_EXTERNAL_PROJECT_RECORD.md`
- Modify: `docs/DEVELOPMENT_PROGRESS.md`
- Modify: `memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md`

**Interfaces:**
- Consumes: 已提交且通过验证的独立 AI Matrix 仓库。
- Produces: 不含 AI Matrix 业务实现的 AI CTO System 仓库和外部治理引用。

- [ ] **Step 1: 再次确认目标仓库 Gate**

Run:

```powershell
if ((git -C 'D:\AI Project\AI-Matrix' status --porcelain) -ne $null) { throw 'Target repository is not clean' }
if ((git -C 'D:\AI Project\AI-Matrix' branch --show-current) -ne 'main') { throw 'Target branch is not main' }
npm --prefix 'D:\AI Project\AI-Matrix' test
```

Expected: target clean and tests pass.

- [ ] **Step 2: 删除源仓库业务资产**

Run `git rm -r` only for the exact paths declared in this task. Do not delete ADR-0031 or the repository-separation spec / plan.

- [ ] **Step 3: 创建外部项目组合记录**

Create `docs/portfolio/AI_MATRIX_EXTERNAL_PROJECT_RECORD.md` with:

```markdown
# AI Matrix 外部项目记录

- Project ID: `PRJ-AI-MATRIX-0001`
- Project Name: AI Matrix 能力复制系统
- Repository: `D:\AI Project\AI-Matrix`
- Repository Ownership: Independent
- Governance System: AI CTO System
- Current Stage: DEVELOPMENT
- Status: ACTIVE
- Owner: AI Matrix 发起人
- Integration Boundary: Contract / Port only; no source-path dependency
- Current Gate: INDEPENDENT_REPOSITORY_READY / PILOT_DATA_REQUIRED
- Remote: NOT_CONFIGURED
- Next Action: 冷启动训练与 Knowledge / Judgment Rule 确认
- Last Updated: 2026-07-15
```

- [ ] **Step 4: 同步源仓库记忆与进度**

Set status to `AI_MATRIX_EXTERNAL_REPOSITORY_GOVERNED`; link ADR-0031, separation spec and external project record. Remove statements claiming AI Matrix code lives under `projects/ai-matrix` or that combined test counts are one repository suite.

- [ ] **Step 5: 扫描残留引用**

Run:

```powershell
rg -n -e "projects/ai-matrix" -e "AI_MATRIX_" -e "ADR-0026|ADR-0027|ADR-0028|ADR-0029|ADR-0030" README.md AGENTS.md docs memory
```

Expected: remaining matches are explicit historical facts or ADR-0031 / external-record references; no broken links to deleted product files.

- [ ] **Step 6: 运行 AI CTO System 回归**

Run:

```powershell
npm test
git diff --check
git status --short
```

Expected: 126 / 126 tests pass; changes limited to product removal and governance records.

- [ ] **Step 7: 提交源仓库拆分**

Run:

```powershell
git add docs memory
git commit -m "refactor: move AI Matrix to independent repository"
```

---

### Task 6: 最终双仓库验收与临时引用清理

**Files:**
- No production changes unless verification finds an issue.
- Delete temporary branch reference: `codex/ai-matrix-extract` in AI CTO System after both repositories are committed.

**Interfaces:**
- Produces: 两个干净仓库、独立历史和最终 Evidence。

- [ ] **Step 1: 并行运行两个仓库测试**

Run AI Matrix `npm test` and AI CTO System `npm test` independently.

Expected: AI Matrix all tests pass; AI CTO System 126 / 126 pass.

- [ ] **Step 2: 验证仓库所有权**

Run:

```powershell
git -C 'D:\AI Project\AI-Matrix' rev-parse --show-toplevel
git -C 'D:\AI Project\AI-CTO-System' rev-parse --show-toplevel
git -C 'D:\AI Project\AI-Matrix' remote -v
git -C 'D:\AI Project\AI-Matrix' status --short
git -C 'D:\AI Project\AI-CTO-System' status --short
```

Expected: roots differ, AI Matrix remote empty, both status outputs empty.

- [ ] **Step 3: 删除临时 split 分支引用**

Run:

```powershell
git -C 'D:\AI Project\AI-CTO-System' branch -D codex/ai-matrix-extract
```

Expected: 只删除临时引用，不影响独立仓库或已有提交。

- [ ] **Step 4: 记录最终提交 SHA**

Capture `git rev-parse HEAD` and `git log -1 --oneline` in both repositories for handoff. Do not merge, push, configure remote or delete `codex/ai-matrix-mvp` without a separate user decision.

## Completion Gate

- `D:\AI Project\AI-Matrix\.git` exists and is independent;
- AI Matrix `main` has preserved project history and no remote;
- AI Matrix production code has zero AI CTO source-path imports;
- AI Matrix tests and audit pass;
- AI CTO System has no AI Matrix business source, Knowledge or Pilot data;
- AI CTO System tests pass and retains ADR-0031 / external project record;
- both working trees are clean;
- no product feature, Core, Phase, Module or multi-Agent expansion occurred.
