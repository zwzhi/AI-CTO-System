# AI CTO System v2 Codex-Native Simplification Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with verification checkpoints.

**Goal:** Deliver a thinner, Codex-native AI CTO operating version while preserving all v1 history and existing implementation evidence.

**Architecture:** Keep AI CTO Governance Plane and Codex Execution Plane separate. Replace the daily root governance entry with a concise Active Core summary, add explicit Active / Reference / Historical indexing, and preserve detailed standards as routed references.

**Tech Stack:** Markdown, Git and existing Node.js tests; no code or dependency changes.

**Spec:** `docs/superpowers/specs/2026-08-25-ai-cto-v2-codex-native-design.md`

## Global Constraints

- Work only on `v2-codex-native`; v1 baseline is tag `v1.0.0-governance-baseline`.
- Do not delete historical docs, ADRs, tests or Runtime code.
- Do not add a Phase, Layer, Module, Provider, MCP server, model switcher or autonomous Runtime.
- Preserve external Codex `ABSENT / PROHIBITED / NONE` and `Execution Authorization: NONE`.

---

### Task 1: Create v2 Active / Reference index

**Files:**
- Create: `docs/architecture/AI_CTO_V2_DOCUMENT_INDEX.md`
- Modify: `docs/architecture/AI_CTO_ACTIVE_OPERATING_CORE.md`

- [ ] Define Active, Reference and Historical directory / document groups.
- [ ] Define the minimal context pack for L0–L4.
- [ ] Define migration rule: no physical deletion until link and Evidence migration is separately approved.
- [ ] Commit `docs: define AI CTO v2 document index`.

### Task 2: Replace the root governance entry with a concise v2 summary

**Files:**
- Modify: `SKILL.md`

- [ ] Preserve Mission, authority hierarchy, quick contracts, L0–L4 route, Codex Operating Model, Gates, Evidence, Audit, Finalization and non-goals.
- [ ] Move detailed Phase-by-Phase wording to linked standards; do not remove the standards.
- [ ] Keep root Skill under a compact daily-read target and verify all links.
- [ ] Commit `docs: slim AI CTO v2 governance entry`.

### Task 3: Synchronize v2 product entry points

**Files:**
- Modify: `README.md`
- Modify: `docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md`
- Modify: `docs/architecture/MODULE_REGISTRY.md`
- Modify: `skills/ai-cto-system/SKILL.md`

- [ ] Add v2 version and Active Core entry.
- [ ] State that v1 documents remain Reference / Historical and v2 does not delete them.
- [ ] Make the gateway load the v2 index for system status / continuation tasks.
- [ ] Commit `docs: expose AI CTO v2 active core`.

### Task 4: Record v2 review and migration state

**Files:**
- Modify: `memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md`
- Modify: `DEVELOPMENT_PROGRESS.md`

- [ ] Record v1 tag, v2 branch, simplification rationale, boundaries and current evidence.
- [ ] Record remaining Fresh Session / real-project Evidence gaps.
- [ ] Commit `docs: record AI CTO v2 simplification`.

### Task 5: Validate and close v2

- [ ] Run `npm.cmd test` and require `212 / 212` passing.
- [ ] Run `git diff --check`.
- [ ] Confirm no physical deletions and no Runtime / package / Provider / MCP changes.
- [ ] Confirm root `SKILL.md` links and installed Skill hash parity.
- [ ] Confirm v1 tag and v2 branch exist.
- [ ] Commit the plan execution record and leave the branch clean.

## Execution Record (2026-08-25)

- v1 baseline: `v1.0.0-governance-baseline`.
- v2 branch: `v2-codex-native`.
- Root `SKILL.md`: approximately 8.1 KB after the progress-sync addition.
- Active / Reference / Historical index: present.
- Progress Checkpoint Sync standard: present and linked.
- Historical file deletions: `0`.
- Full regression: `212 / 212` passed.
- Forbidden Runtime / package scope: unchanged.
- Skill source / user-level Junction hash parity: passed.
- Working tree: clean.

## Execution Record (2026-08-25)

- v1 baseline tag: `v1.0.0-governance-baseline`.
- v2 branch: `v2-codex-native`.
- Root `SKILL.md`: reduced from approximately 54 KB to 7.8 KB.
- Historical file deletions: `0`.
- Full regression: `212 / 212` passed.
- Required Active Core and review documents: present.
- Forbidden Runtime / package scope: unchanged.
- Skill source / user-level Junction hash parity: passed.
- Working tree: clean.
