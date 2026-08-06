# Global AI CTO Skill Gateway Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make AI CTO System automatically discoverable as a user-level Codex Skill in new conversations while preserving this repository as the single authority source and honoring explicit opt-out instructions.

**Architecture:** Add one thin Skill package at `skills/ai-cto-system/` and expose it through an NTFS Junction at `%USERPROFILE%\.codex\skills\ai-cto-system`. The Skill only classifies intent, selects the smallest relevant AI CTO authority set, and routes into existing protocols; it does not duplicate governance, become Runtime, or imply that an unavailable internal service is callable.

**Tech Stack:** Markdown, YAML, Windows PowerShell, NTFS Junctions, Python-based official Skill validation, Git; no Plugin, MCP, Provider, external model, network dependency, or Runtime code.

## Global Constraints

- Design authority: `docs/superpowers/specs/2026-08-06-global-ai-cto-skill-gateway-design.md`, Design ID `SYS-L5-SKILL-GATEWAY-001`.
- Canonical repository: `D:\AI Project\AI-CTO-System`.
- Canonical Skill source after merge: `D:\AI Project\AI-CTO-System\skills\ai-cto-system`.
- User discovery path: `C:\Users\白名单\.codex\skills\ai-cto-system`.
- The repository remains the single source of truth; do not copy the Skill into the user Skill directory.
- The global Skill is a thin Layer 5 entry gateway extending the existing Intent Gateway/Runtime entry surface; do not add a Phase, Module, Runtime contract, Agent, Capability record, Plugin, Provider, MCP integration, model call, network call, or production behavior.
- Explicit opt-out overrides inferred activation. Support request-scoped and conversation-scoped opt-out plus explicit re-enable with `AI_CTO_MODE: ON`.
- Ordinary conversation, simple explanation, and low-risk direct work must not start the full AI CTO lifecycle.
- Context loading must be progressive and task-specific. Never eagerly load the full governance corpus.
- Installation must be idempotent and conflict-safe. Never delete an unverified destination or the canonical source.
- Do not upload to GitHub. The repository currently has no configured Git remote.
- Do not claim fresh-session discovery until a newly opened Codex conversation has completed the pilot matrix.

---

## 0. File Map and Responsibility Lock

### Create

- `skills/ai-cto-system/SKILL.md` — implicit-trigger and opt-out contract, authority routing, progressive loading, and execution boundary.
- `skills/ai-cto-system/agents/openai.yaml` — Codex UI metadata and implicit invocation policy.
- `scripts/install-ai-cto-skill.ps1` — idempotent Junction install and explicitly requested verified rollback.
- `tests/ai-cto-skill-package.test.ps1` — dependency-free static/schema tests for the Skill package.
- `tests/ai-cto-skill-installer.test.ps1` — dependency-free install, idempotency, conflict, and rollback tests using an isolated temporary Skill root.

### Modify

- `docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md` — record the existing Layer 5 entry gateway implementation without adding a module.
- `docs/architecture/MODULE_REGISTRY.md` — update the existing Intent Gateway/Runtime entry row only.
- `docs/DEVELOPMENT_PROGRESS.md` — record implementation, automated evidence, installation state, and fresh-session pilot state.
- `memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md` — record the repository-authority/Junction decision and known limitation.
- This plan file — check completed steps and record exact commands/results during implementation.

### Explicitly forbidden modifications

- Root `README.md`, root `SKILL.md`, Manifesto, ADRs, Gates, lifecycle definitions, Capability Registry, Knowledge Base, Runtime Core, Workflow, Task, Agent, Permission, and Budget code.
- Any file under `C:\Users\白名单\.codex\skills` except the single verified Junction named `ai-cto-system` created after merge.
- Any Git remote configuration or GitHub repository.

---

## 1. Skill Gateway Contract

The new `skills/ai-cto-system/SKILL.md` must use this frontmatter shape:

```yaml
---
name: ai-cto-system
description: Use when a user presents a new product or AI project idea, asks to review or take over an existing project, requests a material feature, architecture, delivery, maintenance, or portfolio decision, or explicitly asks for AI CTO System. Do not apply when the user says AI_CTO_MODE: OFF, 不要使用 AI CTO System, 普通模式处理, or 本次禁用 AI CTO Skill.
---
```

The body must define these exact behavioral units without copying the full root governance Skill:

1. **Authority root:** `D:\AI Project\AI-CTO-System`; report a missing root instead of inventing policy.
2. **Opt-out first:** request-scoped by default, conversation-scoped only when explicitly stated, and re-enabled by `AI_CTO_MODE: ON`.
3. **Lightest sufficient route:** ordinary request, new project, existing project, system change, or project continuation.
4. **Progressive authority loading:** load only the entry documents listed in the approved design.
5. **Governed execution:** analyze/design before code where AI CTO applies, preserve existing Gates, and ask for confirmation only when existing Human Control requires it.
6. **Honest boundary:** the Skill guides Codex; it does not make design-only Runtime/Capability paths callable.

The `agents/openai.yaml` contract is:

```yaml
interface:
  display_name: "AI CTO System"
  short_description: "Route projects through governed AI CTO workflows"
  default_prompt: "Use $ai-cto-system to classify this request and enter the lightest applicable AI CTO workflow."
policy:
  allow_implicit_invocation: true
```

Do not add icons, MCP dependencies, or other metadata in this iteration.

---

## 2. Isolated Workspace and Baseline

- [x] **Step 1: Create an isolated worktree**

Use `superpowers:using-git-worktrees` at execution time. Create branch `feat/global-ai-cto-skill-gateway` and worktree `.worktrees/global-ai-cto-skill-gateway` from `main`.

- [x] **Step 2: Confirm the repository baseline**

Run:

```powershell
git status --short --branch
git remote -v
npm.cmd test
```

Expected:

- branch starts clean from `main`;
- `git remote -v` prints no configured remote;
- the existing Node test suite passes with 165 tests;
- no production or governance file is changed by the test run.

- [x] **Step 3: Capture discovery RED evidence**

Run:

```powershell
$source = 'D:\AI Project\AI-CTO-System\skills\ai-cto-system'
$destination = Join-Path $env:USERPROFILE '.codex\skills\ai-cto-system'
Test-Path -LiteralPath $source
Test-Path -LiteralPath $destination
```

Expected before implementation: both values are `False`. If the destination already exists, stop and inspect it; do not overwrite or remove it.

---

## 3. Skill Package — TDD

### Task 1: Add a failing package acceptance test

**Files:**

- Create: `tests/ai-cto-skill-package.test.ps1`

**Consumes:** repository root derived from the test script location; official validator at `%USERPROFILE%\.codex\skills\.system\skill-creator\scripts\quick_validate.py`.

**Produces:** a dependency-free test process that exits `0` only when the package contract is valid.

- [x] **Step 1: Write the failing test**

The test must assert:

```powershell
$skillRoot = Join-Path $repoRoot 'skills\ai-cto-system'
$skillFile = Join-Path $skillRoot 'SKILL.md'
$metadataFile = Join-Path $skillRoot 'agents\openai.yaml'

Assert-True (Test-Path -LiteralPath $skillFile) 'SKILL.md must exist'
Assert-True (Test-Path -LiteralPath $metadataFile) 'agents/openai.yaml must exist'
Assert-Match $skillText '^---\r?\nname: ai-cto-system\r?\n' 'Skill name must be canonical'
Assert-Contains $skillText 'AI_CTO_MODE: OFF' 'Explicit OFF must be documented'
Assert-Contains $skillText 'AI_CTO_MODE: ON' 'Explicit ON must be documented'
Assert-Contains $skillText '不要使用 AI CTO System' 'Chinese opt-out must be documented'
Assert-Contains $skillText '普通模式处理' 'Ordinary-mode opt-out must be documented'
Assert-Contains $skillText '本次禁用 AI CTO Skill' 'Request opt-out must be documented'
Assert-Contains $skillText 'D:\AI Project\AI-CTO-System' 'Authority root must be explicit'
Assert-Contains $skillText 'IDEA_INTAKE_PROTOCOL.md' 'New-project route must be present'
Assert-Contains $skillText 'PROJECT_ONBOARDING_PROTOCOL.md' 'Existing-project route must be present'
Assert-Contains $metadataText 'allow_implicit_invocation: true' 'Implicit invocation must be enabled'
Assert-Contains $metadataText '$ai-cto-system' 'Default prompt must name the Skill'
Assert-True ($skillText.Length -lt 12000) 'Gateway must remain thin'
```

Implement local `Assert-True`, `Assert-Match`, and `Assert-Contains` helpers that throw terminating errors with the supplied message. Invoke the official validator and fail if its exit code is non-zero:

```powershell
& python $quickValidate $skillRoot
if ($LASTEXITCODE -ne 0) {
  throw "Official Skill validation failed with exit code $LASTEXITCODE"
}
```

- [x] **Step 2: Run the test and prove RED**

Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests\ai-cto-skill-package.test.ps1
```

Expected: FAIL because `skills\ai-cto-system\SKILL.md` does not exist.

- [x] **Step 3: Commit the RED test**

```powershell
git add tests\ai-cto-skill-package.test.ps1
git commit -m "test: define global ai cto skill contract"
```

### Task 2: Scaffold and implement the minimal Skill package

**Files:**

- Create: `skills/ai-cto-system/SKILL.md`
- Create: `skills/ai-cto-system/agents/openai.yaml`

**Consumes:** the contract in Section 1 and the approved progressive-loading table.

**Produces:** one locally valid Codex Skill named `ai-cto-system` with implicit discovery enabled.

- [x] **Step 1: Run the official scaffold generator**

Run from the worktree root:

```powershell
python "$env:USERPROFILE\.codex\skills\.system\skill-creator\scripts\init_skill.py" ai-cto-system `
  --path skills `
  --interface 'display_name=AI CTO System' `
  --interface 'short_description=Route projects through governed AI CTO workflows' `
  --interface 'default_prompt=Use $ai-cto-system to classify this request and enter the lightest applicable AI CTO workflow.'
```

Expected: `skills\ai-cto-system\SKILL.md` and `skills\ai-cto-system\agents\openai.yaml` are created, with no resource directories requested.

- [x] **Step 2: Replace the scaffold with the approved thin gateway**

Use `apply_patch`. Keep the body focused on:

```markdown
# AI CTO System Gateway

## Apply opt-out first

If the current request says `AI_CTO_MODE: OFF`, “不要使用 AI CTO System”, “普通模式处理”, or “本次禁用 AI CTO Skill”, handle it without AI CTO lifecycle, memory, or Runtime routing. A request-scoped opt-out ends with that request. A conversation-scoped opt-out remains until the user says `AI_CTO_MODE: ON`.

## Select the lightest route

| Request | First authority |
|---|---|
| New project or product idea | `docs/protocol/IDEA_INTAKE_PROTOCOL.md` and `docs/evaluation/IDEA_CANDIDATE_STANDARD.md` |
| Existing project review or takeover | `docs/onboarding/PROJECT_ONBOARDING_PROTOCOL.md` |
| AI CTO System change | Manifesto, Master Plan, and Module Admission Criteria |
| Project status or continuation | Target project state and Project Memory |
| Ordinary conversation or simple explanation | No AI CTO governance context |

Load authority documents from `D:\AI Project\AI-CTO-System`. Load additional standards only when the request advances to that lifecycle stage. If the authority root is unavailable, report it and do not invent replacement rules.

## Preserve authority and execution boundaries

Use existing analysis, design, ADR, Gate, Human Control, memory, and execution-routing rules. Choose the lightest sufficient workflow. This Skill is an entry gateway, not Runtime, Workflow, Agent, Capability, Provider, or tool integration. Do not claim an internal path is callable unless a stable authorized invocation exists.
```

The final body may improve phrasing but must preserve every contract in Section 1 and remain below 12,000 characters.

- [x] **Step 3: Normalize `agents/openai.yaml`**

Use exactly the metadata contract from Section 1. Quote every string and do not add dependencies or icons.

- [x] **Step 4: Run package validation**

Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests\ai-cto-skill-package.test.ps1
python "$env:USERPROFILE\.codex\skills\.system\skill-creator\scripts\quick_validate.py" skills\ai-cto-system
```

Expected: both commands PASS; official validation prints `Skill is valid!`.

- [x] **Step 5: Commit the package**

```powershell
git add skills\ai-cto-system tests\ai-cto-skill-package.test.ps1
git commit -m "feat: add global ai cto skill gateway"
```

---

## 4. Safe Junction Installer — TDD

### Task 3: Add a failing installer acceptance test

**Files:**

- Create: `tests/ai-cto-skill-installer.test.ps1`

**Consumes:** future script `scripts/install-ai-cto-skill.ps1`; canonical source at the current worktree's `skills/ai-cto-system`.

**Produces:** isolated evidence for create, idempotency, conflict refusal, and verified rollback.

- [x] **Step 1: Write the failing test harness**

The script must create a unique test root under `$env:TEMP`, verify its absolute path begins with the resolved temp directory, and clean up only that verified root in `finally`.

Test these cases:

```powershell
# INSTALL-01: absent destination creates a Junction to the current repo source.
& $installer -SkillRoot $testSkillRoot
Assert-Equal $LASTEXITCODE 0 'First installation must succeed'
Assert-JunctionTarget $destination $expectedSource

# INSTALL-02: rerunning against the same correct Junction is idempotent.
& $installer -SkillRoot $testSkillRoot
Assert-Equal $LASTEXITCODE 0 'Second installation must succeed'
Assert-JunctionTarget $destination $expectedSource

# INSTALL-03: explicit rollback removes only the verified Junction.
& $installer -SkillRoot $testSkillRoot -Remove
Assert-Equal $LASTEXITCODE 0 'Verified rollback must succeed'
Assert-True (-not (Test-Path -LiteralPath $destination)) 'Rollback must remove the Junction only'
Assert-True (Test-Path -LiteralPath $expectedSource) 'Rollback must preserve the canonical source'

# INSTALL-04: a conflicting ordinary directory is rejected and preserved.
New-Item -ItemType Directory -Path $destination | Out-Null
$sentinel = Join-Path $destination 'preserve-me.txt'
Set-Content -LiteralPath $sentinel -Value 'preserve'
& $installer -SkillRoot $testSkillRoot
Assert-True ($LASTEXITCODE -ne 0) 'Conflict installation must fail'
Assert-True (Test-Path -LiteralPath $sentinel) 'Conflict contents must remain untouched'

# INSTALL-05: rollback also rejects an unverified ordinary directory.
& $installer -SkillRoot $testSkillRoot -Remove
Assert-True ($LASTEXITCODE -ne 0) 'Unverified rollback must fail'
Assert-True (Test-Path -LiteralPath $sentinel) 'Unverified target must remain untouched'
```

Invoke the installer in a child PowerShell process so a deliberate non-zero exit does not terminate the test process:

```powershell
function Invoke-Installer {
  param([string[]]$Arguments)
  & powershell -NoProfile -ExecutionPolicy Bypass -File $installer @Arguments
  return $LASTEXITCODE
}
```

- [x] **Step 2: Run the test and prove RED**

Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests\ai-cto-skill-installer.test.ps1
```

Expected: FAIL because `scripts\install-ai-cto-skill.ps1` does not exist.

- [x] **Step 3: Commit the RED test**

```powershell
git add tests\ai-cto-skill-installer.test.ps1
git commit -m "test: define ai cto skill installation safety"
```

### Task 4: Implement the idempotent installer and rollback guard

**Files:**

- Create: `scripts/install-ai-cto-skill.ps1`

**Consumes:** canonical Skill path derived from the script's repository root; optional `-SkillRoot` for isolated testing; explicit `-Remove` switch.

**Produces:** a single verified NTFS Junction or a non-destructive failure.

- [x] **Step 1: Define the public script parameters and fixed source**

```powershell
[CmdletBinding()]
param(
  [string]$SkillRoot = (Join-Path $env:USERPROFILE '.codex\skills'),
  [switch]$Remove
)

$ErrorActionPreference = 'Stop'
$repositoryRoot = Split-Path -Parent $PSScriptRoot
$source = Join-Path $repositoryRoot 'skills\ai-cto-system'
$destination = Join-Path $SkillRoot 'ai-cto-system'
```

The script must verify that the source contains both `SKILL.md` and `agents\openai.yaml` before creating or removing anything.

- [x] **Step 2: Add canonical path helpers**

Implement:

```powershell
function Get-NormalizedPath([string]$Path) {
  return [System.IO.Path]::GetFullPath($Path).TrimEnd('\')
}

function Test-PathInside([string]$Child, [string]$Parent) {
  $normalizedChild = Get-NormalizedPath $Child
  $normalizedParent = (Get-NormalizedPath $Parent) + '\'
  return $normalizedChild.StartsWith(
    $normalizedParent,
    [System.StringComparison]::OrdinalIgnoreCase
  )
}

function Get-JunctionTarget([System.IO.FileSystemInfo]$Item) {
  if ($Item.LinkType -ne 'Junction' -or -not $Item.Target) { return $null }
  $target = if ($Item.Target -is [System.Array]) { $Item.Target[0] } else { $Item.Target }
  return Get-NormalizedPath $target
}
```

Require the destination to be inside the normalized `SkillRoot`. Reject any path relationship that fails this check.

- [x] **Step 3: Implement install behavior**

1. Create `SkillRoot` if absent.
2. If destination is absent, create `New-Item -ItemType Junction -Path $destination -Target $source`.
3. If destination exists and is a Junction to the exact normalized source, report `ALREADY_INSTALLED` and exit `0`.
4. If destination exists in any other form or points elsewhere, write an error, do not delete it, and exit non-zero.
5. Print normalized `Source:` and `Discovery:` paths on success.

- [x] **Step 4: Implement explicit rollback behavior**

When `-Remove` is supplied:

1. If destination is absent, report `NOT_INSTALLED` and exit `0`.
2. Resolve the existing item and its Junction target.
3. Remove it only when `LinkType` is `Junction` and the normalized target equals the canonical source.
4. Use `[System.IO.Directory]::Delete($destination, $false)` without recursive deletion. This avoids the Windows PowerShell 5.1 Junction `Remove-Item` null-reference defect observed during the RED→GREEN cycle.
5. Confirm the canonical source still exists.
6. Reject every unverified destination without modification.

- [x] **Step 5: Run installer tests**

Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests\ai-cto-skill-installer.test.ps1
```

Expected: all five installer cases PASS and the temporary test root is removed after path containment verification.

- [x] **Step 6: Commit the installer**

```powershell
git add scripts\install-ai-cto-skill.ps1 tests\ai-cto-skill-installer.test.ps1
git commit -m "feat: add safe global skill installer"
```

---

## 5. Governance Synchronization

### Task 5: Record implementation without creating new architecture

**Files:**

- Modify: `docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md`
- Modify: `docs/architecture/MODULE_REGISTRY.md`
- Modify: `docs/DEVELOPMENT_PROGRESS.md`
- Modify: `memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md`

**Consumes:** automated package and installer evidence from Tasks 1–4.

**Produces:** an accurate Layer 5 implementation record and a visible fresh-session validation limitation.

- [x] **Step 1: Update Master Plan**

In the existing Layer 5 / Intent Gateway section, add one concise entry:

```text
Global AI CTO Skill Gateway — Implemented locally; repository-authoritative Skill package with user-level Junction discovery. Fresh-conversation pilot remains the final discovery acceptance check.
```

Do not add a Module, Phase, Runtime power, or automated execution claim.

- [x] **Step 2: Update Module Registry**

Update the existing Intent Gateway or Runtime entry-surface row so `Related Documents` includes the approved design, the implementation plan, and `skills/ai-cto-system/SKILL.md`. Record status as `Implemented / Fresh-session validation pending` until the pilot passes.

- [x] **Step 3: Update Development Progress**

Record:

- package schema validation result;
- package and installer test commands/results;
- existing Node regression result;
- branch and commits;
- final installation state separately from implementation state;
- fresh-session pilot as pending until performed.

- [x] **Step 4: Update Project Memory**

Record:

- repository source + Junction is the approved distribution model;
- explicit opt-out outranks implicit invocation;
- context loading is progressive;
- current-session Skill catalog cannot prove new-session discovery;
- no GitHub remote exists and no upload occurred.

- [x] **Step 5: Commit governance synchronization**

```powershell
git add docs\strategy\AI_CTO_SYSTEM_MASTER_PLAN.md `
  docs\architecture\MODULE_REGISTRY.md `
  docs\DEVELOPMENT_PROGRESS.md `
  memory\project_memory\AI_CTO_SYSTEM_PROJECT_MEMORY.md `
  docs\superpowers\plans\2026-08-06-global-ai-cto-skill-gateway-implementation.md
git commit -m "docs: record global ai cto skill gateway"
```

---

## 6. Verification Gate Before Integration

### Task 6: Run complete automated verification

- [x] **Step 1: Validate the Skill package**

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests\ai-cto-skill-package.test.ps1
python "$env:USERPROFILE\.codex\skills\.system\skill-creator\scripts\quick_validate.py" skills\ai-cto-system
```

Expected: PASS and `Skill is valid!`.

- [x] **Step 2: Validate the installer in isolation**

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests\ai-cto-skill-installer.test.ps1
```

Expected: create, idempotency, verified rollback, conflict refusal, and unverified rollback refusal all PASS.

- [x] **Step 3: Run the existing project regression suite**

```powershell
npm.cmd test
```

Expected: 165 tests pass, 0 fail.

- [x] **Step 4: Run forbidden-scope scans**

```powershell
git diff --name-only main...HEAD
git diff --check main...HEAD
git status --short
```

Expected changed paths are limited to the file map in Section 0; diff check is clean; no generated cache or Junction is tracked.

- [x] **Step 5: Set the implementation Gate**

Gate result is `APPROVED_FOR_LOCAL_INSTALLATION` only when all automated checks pass. This result does not mean fresh-session discovery has passed.

---

## 7. Main Integration and Local Installation

### Task 7: Merge first, then create the persistent Junction

The persistent user-level Junction must never point to the disposable feature worktree.

- [ ] **Step 1: Integrate the verified branch into `main`**

Use `superpowers:finishing-a-development-branch`. Re-run the complete verification before integration, merge locally, and confirm `main` contains `skills\ai-cto-system`.

- [ ] **Step 2: Install from the canonical main repository**

Run from `D:\AI Project\AI-CTO-System` on `main`:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\install-ai-cto-skill.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\install-ai-cto-skill.ps1
```

Expected:

- first call creates the Junction;
- second call reports `ALREADY_INSTALLED` and exits `0`;
- both calls print the same canonical source and discovery path.

- [ ] **Step 3: Verify the persistent target**

```powershell
$destination = Join-Path $env:USERPROFILE '.codex\skills\ai-cto-system'
$item = Get-Item -LiteralPath $destination -Force
$item | Select-Object FullName, LinkType, Target
```

Expected:

- `LinkType` is `Junction`;
- target resolves to `D:\AI Project\AI-CTO-System\skills\ai-cto-system`;
- the target's `SKILL.md` and `agents\openai.yaml` are readable;
- `git status --short --branch` on `main` remains clean.

- [ ] **Step 4: Record local installation evidence**

Update Development Progress and Project Memory only if the plan is still on a branch that can be safely integrated. If main was already integrated, create one final documentation commit on main containing the exact installation time, source, destination, and `INSTALLED_AWAITING_FRESH_SESSION_PILOT` state. Do not claim `VALIDATED` yet.

---

## 8. Fresh-Conversation Pilot

### Task 8: Prove discovery and routing in a newly opened Codex conversation

Current-session behavior is not valid evidence because the available Skill catalog is determined at session startup.

- [ ] **Step 1: Open a new Codex conversation with any ordinary project workspace**

Confirm the available Skill catalog includes `ai-cto-system`. If it does not, record `DISCOVERY_FAILED`, inspect the Junction and metadata, and do not weaken the trigger contract to hide the failure.

- [ ] **Step 2: Run the new-project trigger pilot**

Prompt:

```text
我想做一个新项目：为本地商家生成短视频脚本。先帮我判断值不值得做。
```

Expected:

- `ai-cto-system` is selected implicitly;
- response enters Idea analysis and does not jump directly to coding;
- only Idea Intake and Idea Candidate authority is loaded first.

- [ ] **Step 3: Run the existing-project trigger pilot**

Prompt:

```text
我有一个已有代码项目，想让你先接管并评估健康状态，不要立刻修改代码。
```

Expected:

- existing-project onboarding route is selected;
- project scan/understanding/document recovery/health assessment is proposed;
- no new-project Idea route is forced.

- [ ] **Step 4: Run the explicit opt-out pilot**

Prompt:

```text
AI_CTO_MODE: OFF。普通模式处理：只解释 TypeScript 中 readonly 和 const 的区别。
```

Expected:

- no AI CTO lifecycle, Project Memory, Gate, Runtime, or architecture workflow is started;
- the question is answered directly;
- Codex safety and permission rules still apply.

- [ ] **Step 5: Run the ordinary non-trigger pilot**

Prompt:

```text
为什么天空看起来是蓝色的？
```

Expected: direct ordinary answer without AI CTO governance context.

- [ ] **Step 6: Set the final Gate**

Final status:

- `GLOBAL_SKILL_GATEWAY_VALIDATED` only when discovery and all four pilot cases pass;
- otherwise `INSTALLED_WITH_PILOT_GAPS`, with exact failed cases and evidence.

The pilot is behavioral validation only. It does not activate Runtime services, Capabilities, Providers, external tools, or automatic model switching.

---

## 9. Rollback Procedure

Rollback requires an explicit user request and must run only from the canonical main repository:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\install-ai-cto-skill.ps1 -Remove
```

Expected: only the verified Junction is removed. The repository source remains intact. If the destination is not a Junction to the canonical source, the script must fail without modifying it.

---

## 10. Self-Review Checklist

- [x] Every approved trigger has a package test assertion.
- [x] Every approved opt-out phrase has a package test assertion.
- [x] Request-scoped opt-out, conversation-scoped opt-out, and `AI_CTO_MODE: ON` are documented.
- [x] New-project and existing-project routes use existing authority documents.
- [x] The Skill does not copy the root governance corpus or claim Runtime invocation.
- [x] The installer derives its source from the repository and creates only a Junction.
- [x] Conflict and rollback tests prove non-destructive behavior.
- [ ] The persistent Junction is created only after merge to main.
- [x] No new Phase, Module, ADR, Capability, Plugin, Provider, MCP, Runtime contract, or Git remote is created.
- [x] Automated verification and fresh-session pilot are reported as separate Gates.
