# Finalization Integrity Adoption Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with verification checkpoints.

**Goal:** Resolve current governance-source drift and integrate a concise Finalization Integrity rule into existing AI CTO delivery, Git, Audit, and Skill entry points.

**Architecture:** Keep Finalization Integrity as a cross-cutting governance extension of existing Layer 3 Git / Layer 4 Delivery and Release / Layer 5 Skill entry surfaces. Add one focused standard, then link existing standards to it. Do not create a new Phase, Layer, Module, Capability, Agent, Runtime path, Permission rule, or Gate.

**Tech Stack:** Markdown, Git, PowerShell-based repository checks; no code or dependency changes.

**Spec:** `docs/superpowers/specs/2026-08-24-finalization-integrity-design.md`

## Global Constraints

- Preserve the Mission, Manifesto, Master Plan authority hierarchy, Module Registry facts, ADR history, and lifecycle Gates.
- Do not install or depend on the external `no-negative-echo` Skill.
- Do not hide real baseline changes, security facts, migrations, compatibility changes, audit facts, or executed external events.
- Do not introduce automatic model switching, tool invocation, retries, Runtime changes, permission changes, or new execution authorization.
- Treat text scans as evidence only; they do not prove semantic correctness.
- Keep `Execution Authorization: NONE` for the integration.

---

### Task 1: Normalize governance source status

**Files:**
- Modify: `README.md`
- Modify: `DEVELOPMENT_PROGRESS.md`
- Modify: `docs/DEVELOPMENT_PROGRESS.md`
- Modify: `docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md`

**Interfaces:**
- Consumes: Current Module Registry, Master Plan, Project Memory and existing progress history.
- Produces: One unambiguous current-state description and an explicit legacy-progress pointer.

- [ ] **Step 1: Write the status correction**

Update README so Phase 8.4 is described as completed governance / read-only router design, while automatic model switching, real model routing and execution remain unimplemented.

- [ ] **Step 2: Mark the progress authority**

Add a header to root `DEVELOPMENT_PROGRESS.md` identifying it as the canonical current progress file. Add a legacy notice and link to the root file in `docs/DEVELOPMENT_PROGRESS.md` without deleting historical content.

- [ ] **Step 3: Clarify ADR index scope**

Add ADR index scope in Master Plan and include ADR-0031 as the AI Matrix repository-boundary decision. State that AI Matrix product ADRs remain governed by the external repository record.

- [ ] **Step 4: Verify status consistency**

Run:

```powershell
rg -n "Phase 8\.4.*PROPOSED|尚未启动|Intelligent Resource & Execution Routing Governance" README.md docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md docs/architecture/MODULE_REGISTRY.md
rg -n "canonical|权威|legacy|历史" DEVELOPMENT_PROGRESS.md docs/DEVELOPMENT_PROGRESS.md
git diff --check
```

- [ ] **Step 5: Commit**

```powershell
git add README.md DEVELOPMENT_PROGRESS.md docs/DEVELOPMENT_PROGRESS.md docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md
git commit -m "docs: align governance source status"
```

### Task 2: Add the focused Finalization Integrity standard

**Files:**
- Create: `docs/governance/FINALIZATION_INTEGRITY_STANDARD.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: The approved design spec and existing Delivery, Git, Audit, Release and Evidence standards.
- Produces: A single reusable policy for Accepted Final State, surface review, real-fact preservation, high-assurance readback and limitations.

- [ ] **Step 1: Define the standard**

Write sections for purpose, scope, Accepted Final State, session residue versus real change, surface matrix, positive regeneration, high-assurance flow, required facts, evidence/confidence and explicit non-goals.

- [ ] **Step 2: Link the standard from README**

Add the standard under governance entry points without describing it as a Module or Capability.

- [ ] **Step 3: Verify scope**

Confirm the new document contains no new Phase, Module, Agent, Runtime, Permission or automatic execution claim.

- [ ] **Step 4: Commit**

```powershell
git add docs/governance/FINALIZATION_INTEGRITY_STANDARD.md README.md
git commit -m "docs: add finalization integrity standard"
```

### Task 3: Integrate the existing Skill entry points

**Files:**
- Modify: `SKILL.md`
- Modify: `skills/ai-cto-system/SKILL.md`

**Interfaces:**
- Consumes: `FINALIZATION_INTEGRITY_STANDARD.md` and existing route / authority rules.
- Produces: Skill-level instructions that generate final surfaces from accepted state and preserve required facts.

- [ ] **Step 1: Add root governance rules**

Add a compact section covering Accepted Final State, surface-by-surface checks, positive regeneration, baseline facts and Readback for high-assurance surfaces.

- [ ] **Step 2: Add gateway routing guidance**

Add a targeted reference so the gateway loads the finalization standard only for delivery, Git, Release, Handoff, audit or explicit finalization tasks.

- [ ] **Step 3: Preserve model-routing boundary**

State that this integration does not implement or trigger model switching; Phase 8.4 remains separate.

- [ ] **Step 4: Verify installed source parity**

Run:

```powershell
Get-FileHash C:\Users\白名单\.codex\skills\ai-cto-system\SKILL.md,D:\AI Project\AI-CTO-System\skills\ai-cto-system\SKILL.md -Algorithm SHA256
```

- [ ] **Step 5: Commit**

```powershell
git add SKILL.md skills/ai-cto-system/SKILL.md
git commit -m "docs: add finalization integrity skill guidance"
```

### Task 4: Integrate Delivery, Git, Audit and Evidence surfaces

**Files:**
- Modify: `docs/delivery/DELIVERY_GOVERNANCE_STANDARD.md`
- Modify: `docs/development/GIT_WORKFLOW_STANDARD.md`
- Modify: `docs/runtime/EXECUTION_AUDIT_STANDARD.md`
- Modify: `docs/governance/EXECUTION_FEEDBACK_RECORD_STANDARD.md`
- Modify: `docs/release/RELEASE_APPROVAL_GATE.md`

**Interfaces:**
- Consumes: Finalization Integrity standard and existing Gate / Audit contracts.
- Produces: Cross-references and minimal checks without changing Gate results or Audit authority.

- [ ] **Step 1: Add Delivery surface checks**

Require final-state consistency across delivery package, user documentation, startup guide, troubleshooting guide and known-issues communication.

- [ ] **Step 2: Add Git packaging checks**

Require Commit / PR text to derive from the approved scope and actual diff; preserve real deletions and external actions; exclude session-only alternatives.

- [ ] **Step 3: Add Audit distinction**

Record real actions and required facts; do not serialize discarded drafts as final facts, and do not erase audit history.

- [ ] **Step 4: Add Evidence field guidance**

Allow finalization residue as a Quality Outcome / Evidence observation without changing routing or authorization.

- [ ] **Step 5: Add Release finalization check**

Require release title, report, known-risk communication and rollback statement to match the frozen Release Version Baseline and actual validation evidence.

- [ ] **Step 6: Verify no Gate changes**

Run:

```powershell
rg -n "READY_FOR_RELEASE|CHANGES_REQUIRED|BLOCKED|APPROVED|Finalization|Readback|Accepted Final State" docs/delivery docs/release docs/development/GIT_WORKFLOW_STANDARD.md docs/runtime/EXECUTION_AUDIT_STANDARD.md docs/governance/EXECUTION_FEEDBACK_RECORD_STANDARD.md
git diff --check
```

- [ ] **Step 7: Commit**

```powershell
git add docs/delivery/DELIVERY_GOVERNANCE_STANDARD.md docs/development/GIT_WORKFLOW_STANDARD.md docs/runtime/EXECUTION_AUDIT_STANDARD.md docs/governance/EXECUTION_FEEDBACK_RECORD_STANDARD.md docs/release/RELEASE_APPROVAL_GATE.md
git commit -m "docs: integrate finalization integrity checks"
```

### Task 5: Synchronize memory, progress and validate the adoption

**Files:**
- Modify: `memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md`
- Modify: `DEVELOPMENT_PROGRESS.md`
- Modify: `docs/superpowers/specs/2026-08-24-finalization-integrity-design.md`

**Interfaces:**
- Consumes: All prior task commits and verification outputs.
- Produces: Current decision, scope, evidence, limitations and next action.

- [ ] **Step 1: Record the adopted policy**

Add a dated Project Memory entry that records the cross-cutting extension, no-new-module decision, model-routing separation and evidence limitations.

- [ ] **Step 2: Record implementation status**

Update Development Progress with changed files, validation, current state, confidence and `Execution Authorization: NONE`.

- [ ] **Step 3: Run final checks**

Run:

```powershell
git diff --check
rg -n "Phase 8\.4.*PROPOSED|尚未启动" README.md docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md docs/architecture/MODULE_REGISTRY.md
rg -n "FINALIZATION_INTEGRITY_STANDARD|Accepted Final State|Readback" SKILL.md skills/ai-cto-system/SKILL.md README.md docs/delivery docs/development docs/release docs/runtime docs/governance
git status --short
```

- [ ] **Step 4: Commit**

```powershell
git add memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md DEVELOPMENT_PROGRESS.md docs/superpowers/specs/2026-08-24-finalization-integrity-design.md
git commit -m "docs: record finalization integrity adoption"
```

## Completion Gate

Adoption is complete only when all five tasks pass, the working tree is clean, source status is synchronized, no Runtime / package / dependency file changed, and the final report states the remaining limitation: this is a prompt-and-governance mitigation, not a deterministic semantic guarantee.

## Execution Record (2026-08-24)

- Task 1–5: completed.
- Full regression: `212 / 212` passed.
- `git diff --check`: passed.
- Forbidden runtime / package scope scan: passed.
- Working tree: clean on `main`.
- Execution Authorization: `NONE`.
