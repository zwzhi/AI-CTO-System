# Codex Execution Plane Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with verification checkpoints.

**Goal:** Reclassify AI CTO System and Codex responsibilities so the AI CTO governs Codex instead of duplicating Codex execution infrastructure.

**Architecture:** Keep AI CTO as Governance Plane and Codex as default Execution Plane. Retain existing Runtime / Agent / Codex documents as internal evidence or optional external-runtime references. Synchronize authority files and routing policies without deleting history or changing Runtime code.

**Tech Stack:** Markdown, Git and existing Node.js test suite; no code, package or external integration changes.

**Spec:** `docs/superpowers/specs/2026-08-25-codex-execution-plane-alignment-design.md`

## Global Constraints

- No new Runtime implementation, Provider, MCP server, model switcher or autonomous execution service.
- No deletion of existing Runtime documents, source code, tests, ADRs or capability evidence.
- Preserve human approval for production, core governance, module deletion, permission elevation and irreversible data actions.
- Keep Codex Capability Registry external-provider status unchanged.
- Keep current AI CTO Skill, Finalization Integrity, Evidence, Audit and Gate rules.

---

### Task 1: Add the alignment architecture and ADR

**Files:**
- Create: `docs/architecture/CODEX_EXECUTION_PLANE_ALIGNMENT.md`
- Create: `docs/adr/ADR-0033-AI-CTO-CODEX-EXECUTION-PLANE-ALIGNMENT.md`

- [ ] Write the two-plane model, twelve-capability ownership matrix, Runtime document reclassification and safety boundaries.
- [ ] Record the decision and consequences in ADR-0033.
- [ ] Run `git diff --check` and commit `docs: align AI CTO with Codex execution plane`.

### Task 2: Synchronize system entry points

**Files:**
- Modify: `README.md`
- Modify: `docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md`
- Modify: `docs/architecture/MODULE_REGISTRY.md`
- Modify: `SKILL.md`
- Modify: `skills/ai-cto-system/SKILL.md`

- [ ] Add the Governance Plane / Codex Execution Plane relationship and usage guidance.
- [ ] Clarify Module statuses as governance / internal MVP / host-native / planned without changing status vocabulary.
- [ ] Add ADR-0033 to the core ADR index.
- [ ] State that ordinary Codex use is not external Capability activation.
- [ ] Commit `docs: synchronize Codex execution plane entry points`.

### Task 3: Synchronize routing and Runtime boundaries

**Files:**
- Modify: `docs/governance/EXECUTION_ROUTING_GOVERNANCE_STANDARD.md`
- Modify: `docs/governance/MODEL_ROUTING_POLICY.md`
- Modify: `docs/runtime/AI_CTO_RUNTIME_ARCHITECTURE.md`
- Modify: `docs/runtime/CODEX_CAPABILITY_ARCHITECTURE.md`
- Modify: `docs/runtime/CODEX_CAPABILITY_CONTRACT.md`

- [ ] State that Execution Routing recommends a host execution plan and does not duplicate Codex execution.
- [ ] State that AI CTO model routing is advisory until a separately authorized host integration exists.
- [ ] Reclassify Runtime docs as Governance Contract / Internal MVP Evidence / Optional External Runtime Reference.
- [ ] Preserve Registry, Permission, Approval, Audit and external-provider boundaries.
- [ ] Commit `docs: clarify Codex host and AI CTO runtime boundaries`.

### Task 4: Synchronize memory and progress

**Files:**
- Modify: `memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md`
- Modify: `DEVELOPMENT_PROGRESS.md`

- [ ] Record ADR-0033, the two-plane decision and the 12-capability classification.
- [ ] Record that no Runtime code or external capability was changed.
- [ ] Commit `docs: record Codex execution plane alignment`.

### Task 5: Validate the simplification

- [ ] Run `npm.cmd test` and require 212 passing tests with 0 failures.
- [ ] Run `git diff --check`.
- [ ] Confirm no changes under `runtime/`, `agents/`, `capabilities/`, `optimization-execution/`, `self-evolution/` or package files.
- [ ] Confirm `Registry Record: ABSENT` for external Codex and `Execution Authorization: NONE`.
- [ ] Confirm repository Skill and user-level Junction hashes match.
- [ ] Confirm working tree is clean on `main`.

## Completion Gate

The alignment is complete only when the ownership matrix, ADR, Module Registry, Master Plan, Skill entry points, routing boundaries, Project Memory and Progress agree, while all existing implementation tests remain green and no duplicate execution layer is authorized.
