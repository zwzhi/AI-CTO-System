# Knowledge Governance Pilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Validate that Phase 8.3 can admit, record, register, lifecycle-manage and reuse three evidence-backed knowledge candidates without overgeneralizing or directly activating them.

**Architecture:** AI-CTO-System is the sole source project. Three focused Markdown Knowledge Records hold authoritative content; one Registry indexes them; one reuse simulation consumes them; one Pilot Report evaluates the governance workflow. Admission Review precedes migration, and lifecycle state is determined by evidence rather than file creation.

**Tech Stack:** Markdown, Git, PowerShell structural checks, existing AI CTO Knowledge Governance standards.

## Global Constraints

- Do not develop an Agent, RAG, Embedding pipeline or vector database.
- Do not enter Phase 8.4.
- Migrate exactly three Knowledge Records from AI-CTO-System; do not infer histories from absent external projects.
- Every candidate starts at `CAPTURED`, then enters `VALIDATING`; only evidence-complete candidates may reach `VALIDATED`.
- No candidate enters `ACTIVE` in this pilot.
- One-project evidence must remain scoped to AI CTO System-like, document-driven governance projects.
- Registry, Record, Reuse Result, Project Memory and Development Progress must remain consistent.

---

### Task 1: Knowledge Record Contract

**Files:**
- Create: `templates/KNOWLEDGE_RECORD_TEMPLATE.md`
- Modify: `docs/knowledge/KNOWLEDGE_REGISTRY_STANDARD.md`

**Interfaces:**
- Consumes: Phase 8.3 lifecycle, confidence, quality, extraction and registry standards.
- Produces: a reusable record schema with mandatory Admission Review, lifecycle history and reuse history sections.

- [ ] **Step 1: Run the precondition check**

Run:

```powershell
if (Test-Path templates/KNOWLEDGE_RECORD_TEMPLATE.md) { throw 'Template unexpectedly exists' }
```

Expected: command exits successfully because the template does not exist.

- [ ] **Step 2: Create the template**

Include the required fields `Knowledge ID`, `Title`, `Type`, `Source Project`, `Background`, `Problem`, `Solution`, `Evidence`, `Confidence Level`, `Quality Score`, `Applicable Scenario`, `Limitations`, `Lifecycle Status`, `Created Time`, and `Related ADR`. Add `Non Applicable Scenario`, `Risk If Misapplied`, `Validation Requirement`, quality dimension breakdown, Admission Review, Transition History, Reuse History, Owner, Version, Last Validated, Next Review, privacy / license and Change History.

- [ ] **Step 3: Align the Registry standard**

Document that `knowledge_base/knowledge_registry/` is registry metadata, not a tenth Knowledge Type, and that records must follow the template.

- [ ] **Step 4: Verify the contract**

Run a PowerShell assertion over the 15 required user fields and the 8 Admission Review fields. Expected: all fields found, exit code 0.

### Task 2: Admission Review and Controlled Records

**Files:**
- Create: `knowledge_base/architecture_patterns/KN-ARC-0001-layer-module-governance.md`
- Create: `knowledge_base/engineering_patterns/KN-ENG-0001-closed-status-output-contract.md`
- Create: `knowledge_base/failures/KN-FAIL-0001-status-scope-premature-decision.md`

**Interfaces:**
- Consumes: template from Task 1; ADR-0009, SKILL, Module Registry, Development Progress and Git commits `8666495`, `201b446`, `2ea04e2`.
- Produces: three authoritative, scoped Knowledge Records.

- [ ] **Step 1: Verify every source before writing records**

Run `git cat-file -e <commit>^{commit}` for each commit and `Test-Path` for every cited file. Expected: all sources exist.

- [ ] **Step 2: Create `KN-ARC-0001`**

Admission scope: long-lived, document-driven governance systems whose stable responsibilities outlive roadmap batches. Non-applicable to small single-purpose applications or systems without multiple stable responsibility domains. Evidence `L3`, Confidence `L3`, Quality `86` with breakdown `22+16+17+14+8+9`. Record `CAPTURED → VALIDATING → VALIDATED`; do not enter `ACTIVE`.

- [ ] **Step 3: Create `KN-ENG-0001`**

Admission scope: document-driven governance with machine-checked enumerations and fixed decision output fields. Non-applicable to unconstrained prose where no consumer depends on closed status vocabulary. Evidence `L3`, Confidence `L3`, Quality `84` with breakdown `22+17+16+14+8+7`. Record `CAPTURED → VALIDATING → VALIDATED`; do not enter `ACTIVE`.

- [ ] **Step 4: Create `KN-FAIL-0001`**

Admission scope: AI-assisted governance decisions where status vocabulary, applicable scope and evidence strength control downstream authorization. Non-applicable as a universal claim that every vocabulary variation causes failure. Evidence `L3` for the observed project events, Confidence `L2` for the causal generalization, Quality `73` with breakdown `19+15+13+13+7+6`. Record `CAPTURED → VALIDATING` and remain `VALIDATING` pending independent reproduction.

- [ ] **Step 5: Validate admission safety**

Assert that every record contains Applicable and Non Applicable Scenario, Risk If Misapplied and Validation Requirement; assert no record has `Lifecycle Status: ACTIVE`; assert each Type matches its directory.

### Task 3: Registry and Reuse Simulation

**Files:**
- Create: `knowledge_base/knowledge_registry/README.md`
- Create: `knowledge_base/knowledge_registry/KNOWLEDGE_REGISTRY.md`
- Create: `docs/knowledge/KNOWLEDGE_REUSE_PILOT.md`
- Modify: `knowledge_base/README.md`
- Modify: `docs/knowledge/KNOWLEDGE_CLASSIFICATION_STANDARD.md`

**Interfaces:**
- Consumes: three Knowledge Records from Task 2.
- Produces: searchable registry metadata and one auditable reuse decision for each record.

- [ ] **Step 1: Create registry metadata**

State that `knowledge_registry/` indexes Knowledge but is not a Knowledge Type. Register ID, Type, Source, Evidence, Confidence, Quality, Status, record path and Next Review for all three records.

- [ ] **Step 2: Update root directory documentation**

Add `knowledge_registry/` as metadata beside the nine type directories; retain the rule that the nine types remain closed.

- [ ] **Step 3: Simulate the new project**

Use `AI Content Workflow Platform`, a proposed long-lived document-driven AI product governance system. Record query, status filter, scope comparison, limitations and required gates.

- [ ] **Step 4: Record decisions**

Set `KN-ARC-0001` to `ADAPT`, `KN-ENG-0001` to controlled `ADOPT`, and `KN-FAIL-0001` to `REFERENCE_ONLY`. State that these are reuse recommendations, not Architecture, Development or Release authorization.

- [ ] **Step 5: Cross-check registry consistency**

Extract each record's Type, Evidence, Confidence, Quality and Status and compare with Registry values. Expected: zero mismatches.

### Task 4: Pilot Report, Governance State and Final Verification

**Files:**
- Create: `docs/knowledge/KNOWLEDGE_GOVERNANCE_PILOT_REPORT.md`
- Modify: `memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md`
- Modify: `docs/DEVELOPMENT_PROGRESS.md`

**Interfaces:**
- Consumes: template, Admission Reviews, three records, registry and reuse simulation.
- Produces: acceptance decision and auditable project state.

- [ ] **Step 1: Create the Pilot Report**

Report the selected project, three migrated candidates, Admission Review, lifecycle outcomes, Registry maintenance, reuse outcomes, problems, improvements and the five requested acceptance checks.

- [ ] **Step 2: Set the acceptance result**

Use `PASSED_WITH_CONSTRAINTS` only if all five acceptance checks have file evidence. Constraints must state: no `ACTIVE` knowledge, one record remains `VALIDATING`, evidence is single-project scoped, and real cross-project reuse is still unverified.

- [ ] **Step 3: Update Project Memory and Progress**

Record the pilot decision, exact statuses, reuse results, remaining risks and the explicit boundary that Phase 8.4 was not entered.

- [ ] **Step 4: Run final verification**

Run template-field, source-evidence, lifecycle-order, registry-consistency, quality-sum, Markdown-link, `quick_validate.py`, `git diff --check`, no-`ACTIVE`, and no-Phase-8.4-implementation checks. Expected: all pass.

- [ ] **Step 5: Commit the pilot**

Stage only the files listed in this plan and commit with:

```text
docs: complete knowledge governance pilot
```
