# AI CTO System v2 Document Index

## 1. Version

v2 is the Codex-native operating version on branch `v2-codex-native` and release tag `v2.0.0-codex-native`. The v1 governance baseline is preserved by Git tag `v1.0.0-governance-baseline`.

v2 changes the daily entry and document-loading strategy; it does not delete historical files or change Runtime behavior.

## 2. Active Core

Read these first for current system work:

1. `skills/ai-cto-system/SKILL.md` — automatic entry and route;
2. `SKILL.md` — concise governance summary;
3. `docs/architecture/AI_CTO_ACTIVE_OPERATING_CORE.md` — minimum Context Pack;
4. `docs/architecture/AI_CTO_CODEX_OPERATING_MODEL.md` — Codex Host Surface selection;
5. `docs/strategy/AI_CTO_SYSTEM_MANIFESTO.md` — mission and boundaries;
6. `docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md` — system plan and authority hierarchy;
7. `docs/architecture/MODULE_REGISTRY.md` — current Module facts;
8. Current project `PROJECT_STATE.md` / `PROJECT_MEMORY.md`;
9. The relevant standard, ADR, Gate and Evidence only.

面向新用户的安装、路径配置和首次使用示例见 [`docs/GETTING_STARTED.md`](../GETTING_STARTED.md)。它是用户入口，不覆盖 Manifesto、Master Plan、Module Registry 或项目状态权威。

## 3. Reference Layer

Load only when the task reaches the concern:

- `docs/protocol/`, `docs/evaluation/`, `docs/research/`, `docs/design/`;
- `docs/development/`, `docs/testing/`, `docs/release/`, `docs/delivery/`;
- `docs/onboarding/`, `docs/maintenance/`, `docs/evolution/`, `docs/portfolio/`;
- `docs/capability/`, `docs/knowledge/`, `docs/intent/`, `docs/governance/`;
- `docs/runtime/` and `runtime/` implementation;
- applicable ADRs and templates.

## 4. Historical Layer

Treat these as traceability / Evidence, not default rules:

- old Phase specifications and implementation plans;
- Runtime and Capability Review reports;
- `docs/superpowers/` design and plan history;
- legacy progress records;
- superseded or rejected proposals;
- old project migration and pilot reports.

Never delete a Historical artifact merely to reduce context. If removal is later proposed, first migrate links, Evidence and ADR references and obtain a separate approved change.

## 5. Context Selection

| Route | Load |
|---|---|
| L0 | User request only |
| L1 | Current file, one governing paragraph, necessary Git state |
| L2 | Project State / Memory + related Requirement, Design, Task, Test |
| L3 | L2 + Architecture, ADR, Change Impact, Review / Evidence, Gate |
| L4 | L3 + User Brain, Portfolio, Knowledge, Mission and Module Admission |

The route decides a maximum allowed scope, not a requirement to load every document in that group.

## 6. Migration Rule

During v2, “slim” means:

- change the daily entry;
- add direct links to active standards;
- mark reference and historical boundaries;
- prevent eager loading;
- preserve files, tests, ADRs and Git history.

Physical deletion, mass moves or path renames are not part of v2 until a separate migration plan proves link, Evidence and rollback safety.
