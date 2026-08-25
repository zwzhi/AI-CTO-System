# AI CTO–Codex Operating Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with verification checkpoints.

**Goal:** Make AI CTO System easier to use by giving the Skill a single Codex-native operating model for routing, context loading, host-surface selection and final delivery.

**Architecture:** Extend existing Intent Gateway and Execution Routing entry surfaces with one operating-model document. Reuse Codex native execution surfaces and existing AI CTO governance; do not add Runtime, Agent, Capability, Phase or approval infrastructure.

**Tech Stack:** Markdown, Git and existing Node.js test suite; no code or dependency changes.

**Spec:** `docs/superpowers/specs/2026-08-25-ai-cto-codex-operating-model-design.md`

## Global Constraints

- Codex Host owns actual model, file, shell, Subagent, MCP, Plugin, Worktree, Goal and Scheduled Task execution.
- AI CTO owns route, context scope, project governance, Evidence, Audit, Gates and human control.
- Preserve model-routing advisory status and external Codex Registry `ABSENT / PROHIBITED / NONE`.
- No new Phase, Module, Runtime, Provider, RAG store, model switcher or autonomous execution service.

---

### Task 1: Add the operating model and usage map

**Files:**
- Create: `docs/architecture/AI_CTO_CODEX_OPERATING_MODEL.md`

- [ ] Add the unified request-to-Codex-to-Evidence flow.
- [ ] Add Codex Host surface selection matrix.
- [ ] Add L0–L4 context loading matrix.
- [ ] Add new / existing / continuation / opt-out user operation examples.
- [ ] Add status, finalization and boundary rules.
- [ ] Run `git diff --check` and commit `docs: add AI CTO Codex operating model`.

### Task 2: Make the Skill use the operating model

**Files:**
- Modify: `skills/ai-cto-system/SKILL.md`
- Modify: `SKILL.md`

- [ ] Add operating-model authority lookup for Codex execution tasks.
- [ ] Add host-surface selection rules and minimum context reporting.
- [ ] Add continuation and opt-out behavior without requiring repeated wake-up commands.
- [ ] Preserve existing Finalization Integrity and governance boundaries.
- [ ] Commit `docs: optimize AI CTO Codex skill operation`.

### Task 3: Synchronize user-facing and authority entry points

**Files:**
- Modify: `README.md`
- Modify: `docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md`
- Modify: `docs/architecture/MODULE_REGISTRY.md`

- [ ] Link the operating model and add concise usage examples.
- [ ] Record it as an Intent Gateway / Execution Routing extension, not a new Module.
- [ ] Clarify that daily Codex use is host-native execution, not external Capability activation.
- [ ] Commit `docs: expose AI CTO Codex operating model`.

### Task 4: Synchronize memory and progress

**Files:**
- Modify: `memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md`
- Modify: `DEVELOPMENT_PROGRESS.md`

- [ ] Record the operating model decision, boundaries and Evidence.
- [ ] Record that no Runtime or external Capability changed.
- [ ] Commit `docs: record AI CTO Codex operating model`.

### Task 5: Validate

- [ ] Run `npm.cmd test` and require `212 / 212` passing.
- [ ] Run `git diff --check`.
- [ ] Confirm only documentation / Skill / memory / progress paths changed.
- [ ] Confirm Skill source and user-level Junction hashes match.
- [ ] Confirm external Codex Registry remains `ABSENT`, Selection `PROHIBITED`, Activation `NONE`.
- [ ] Confirm working tree is clean on `main`.

## Completion Gate

The operating model is complete when a new project, existing-project takeover, ordinary feature request, continuation, and opt-out each have a clear Codex-native path without loading the full governance corpus or creating a duplicate AI CTO execution layer.
