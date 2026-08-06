# AI CTO Skill Routing Preflight Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the global AI CTO Skill classify task weight before loading governance context so low-risk requests consistently use the lightest sufficient workflow.

**Architecture:** Extend the existing thin Skill gateway with one inline routing preflight and one process-inflation guard. Keep all detailed routing standards in their current authority documents; add only the entry-time contract that a fresh Codex conversation must know before deciding what to load.

**Tech Stack:** Markdown Skill contract, PowerShell 5.1 contract tests, official `quick_validate.py`, existing Node.js regression suite.

## Global Constraints

- Do not add a Module, Phase, Runtime service, Capability, Provider or external integration.
- Do not implement actual model switching, tool invocation or execution authorization.
- Do not change `agents/openai.yaml` unless validation proves its current metadata inaccurate.
- Keep the Skill under the existing 12,000-character thin-gateway limit.
- Preserve opt-out, safety, Gate, permission, budget and authority behavior.

---

### Task 1: Define the routing entry contract with a failing test

**Files:**
- Create: `tests/ai-cto-skill-routing.test.ps1`
- Read: `skills/ai-cto-system/SKILL.md`

**Interfaces:**
- Consumes: UTF-8 text from the canonical Skill file.
- Produces: a deterministic PowerShell contract test for route ordering, `L0`–`L4` mappings, the `L1` process-inflation guard and one-line route visibility.

- [ ] **Step 1: Create the routing contract test**

Use the repository's existing `Assert-Contains` style. Assert the exact behavioral clauses rather than merely searching for isolated level names:

```powershell
Assert-Contains $skillText 'Classify the route before loading authority documents.' 'Routing must precede authority loading.'
Assert-Contains $skillText '| `L1` | Instant / LIGHT / `R1` / TARGETED |' 'L1 must use the light route.'
Assert-Contains $skillText 'Do not create a new Phase, ADR, design specification, review document, or Gate artifact for L1' 'L1 must resist process inflation.'
Assert-Contains $skillText 'Route: L1 / Instant / LIGHT / R1 | Context: targeted | Validation: targeted' 'Project work must expose one concise route line.'
```

Also assert explicit `L0`, `L2`, `L3` and `L4` route rows, the `L0` no-route-line behavior and the statement that route visibility is informational rather than an approval pause.

- [ ] **Step 2: Run the test and verify RED**

Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests\ai-cto-skill-routing.test.ps1
```

Expected: FAIL because the current Skill lacks the mandatory preflight contract.

### Task 2: Add the minimal routing preflight to the Skill

**Files:**
- Modify: `skills/ai-cto-system/SKILL.md`
- Test: `tests/ai-cto-skill-routing.test.ps1`

**Interfaces:**
- Consumes: current request, explicit opt-out and existing governance authority paths.
- Produces: a non-executing route decision covering complexity, workflow/profile, reasoning, context and validation.

- [ ] **Step 1: Replace the ambiguous route entry with a mandatory preflight**

Before any authority table, add the exact sequence:

```text
Apply opt-out → classify L0-L4 → select workflow/profile/reasoning/context/validation → load only route-required authority → work
```

Add the compact routing table from the approved design. Keep detailed standards as linked authority rather than copying their full contents.

- [ ] **Step 2: Add the L0/L1 behavior contract**

State positively that `L0` uses ordinary handling with no AI CTO context or route line. State that `L1` uses Instant / LIGHT / targeted behavior and does not generate new Phase, ADR, design, review or Gate artifacts.

- [ ] **Step 3: Add concise route visibility**

For governed project work, emit one informational line and continue. Do not pause unless evidence or a meaningful user decision is missing.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests\ai-cto-skill-routing.test.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File tests\ai-cto-skill-package.test.ps1
```

Expected: both PASS.

- [ ] **Step 5: Commit the Skill behavior**

```powershell
git add -- skills/ai-cto-system/SKILL.md tests/ai-cto-skill-routing.test.ps1
git commit -m "feat: route ai cto skill by task weight"
```

### Task 3: Validate deployment metadata and full regression

**Files:**
- Validate: `skills/ai-cto-system/agents/openai.yaml`
- Validate: `scripts/install-ai-cto-skill.ps1`
- Test: `tests/ai-cto-skill-installer.test.ps1`

**Interfaces:**
- Consumes: canonical Skill package and installed Junction contract.
- Produces: validation evidence that schema, discovery metadata, installation behavior and existing Runtime remain unchanged.

- [ ] **Step 1: Validate metadata consistency**

Confirm `default_prompt` still accurately requests classification and the lightest applicable workflow. Do not modify the file if accurate.

- [ ] **Step 2: Run package and installer tests**

```powershell
$env:PYTHONUTF8 = '1'
powershell -NoProfile -ExecutionPolicy Bypass -File tests\ai-cto-skill-package.test.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File tests\ai-cto-skill-installer.test.ps1
```

Expected: PASS with the Junction target still pointing to the canonical main-workspace Skill.

- [ ] **Step 3: Run the full repository test suite**

```powershell
npm.cmd test
```

Expected: 165 tests pass with zero failures.

### Task 4: Record completion without expanding governance

**Files:**
- Modify: `docs/DEVELOPMENT_PROGRESS.md`
- Modify: `memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md`

**Interfaces:**
- Consumes: focused and full verification evidence.
- Produces: concise project continuity records; no new ADR, Module, Phase or Review artifact.

- [ ] **Step 1: Record the completed gateway extension**

Record the problem, chosen minimal change, validation results, unchanged Runtime/model/tool boundary and fresh-conversation verification recommendation.

- [ ] **Step 2: Re-run all affected checks**

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests\ai-cto-skill-routing.test.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File tests\ai-cto-skill-package.test.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File tests\ai-cto-skill-installer.test.ps1
npm.cmd test
git diff --check
git status --short
```

Expected: all tests pass, no whitespace errors, and only the approved files are changed.

- [ ] **Step 3: Commit continuity records**

```powershell
git add -- docs/DEVELOPMENT_PROGRESS.md memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md
git commit -m "docs: record skill routing preflight"
```

- [ ] **Step 4: Merge only after verification**

Fast-forward `feature/skill-routing-preflight` into `main`, push `main`, verify `main...origin/main` is clean, and then remove the isolated worktree and feature branch. If `main` changed concurrently, stop and reconcile without overwriting the other conversation's work.
