# Code Modification Capability MVP Design

**Goal:** Build a deterministic, evidence-first Code Modification Capability that creates a human-reviewable change proposal and display-only unified diff from explicitly authorised in-memory inputs. It never applies a change.

## 1. Position and Scope

This is a high-risk Engineering Capability. The MVP provides controlled modification suggestions only:

```text
Authorized Change Request
  -> Modification Adapter
  -> Deterministic Modification Assistant
  -> Change Proposal + Proposed Diff + Evidence
  -> Audit Event
  -> CONFIRM_REQUIRED
```

The capability is not an Agent, Workflow controller, file editor, patch applier, commit creator, deployment mechanism, Provider integration, or project state updater.

Registry Record remains `ABSENT`; Activation remains `NONE`. The implementation must not modify Runtime Core, Workflow, Task, Agent, Registry, Knowledge, Manifesto, ADR, Master Plan, Gate, or any project file.

## 2. Authorised Inputs

`AuthorizedChangeRequest` binds:

- `taskId`, `workflowId`, and a non-empty `changeGoal`;
- explicit in-memory `AuthorizedChangeContext` values: `sourceRef`, `location`, `content`, and optional `versionRef`;
- an `ExecutionContext` whose `allowedContextRefs` contains every change-context reference;
- explicit `codeAnalysisEvidence` and `testEvidence` supplied by the caller;
- a proposal-only permission grant, budget snapshot, and optional cancellation flag.

The sole operation is `PROPOSE_CHANGE`. No request type may contain a file path resolver, glob, URL, file-system callback, executor, patch applier, repository handle, commit handle, or deployment handle.

Both evidence groups are mandatory. Every item must be locatable through an explicitly allowed reference, non-empty, and attributable to its declared source. Missing, duplicated, or unauthorised Code Analysis Evidence or Test Evidence is rejected before assistant invocation. This enforces the dependency chain:

```text
Authorised code context + Code Analysis Evidence + Test Evidence
  -> evidence preflight
  -> change proposal
```

## 3. Output Contract

A successful `ModificationResult` contains:

1. `ChangeProposal` as the primary output:
   - `changeId`
   - `goal`
   - `scope`
   - `originalSummary`
   - `proposedChange`
   - `risk`
   - `impact`
   - `rollback`
   - `evidence`
   - `confidence`
   - `limitations`
   - `approvalStatus: 'CONFIRM_REQUIRED'`
2. `ProposedDiff` as the auxiliary display output:
   - `diffId`
   - `targetRef`
   - a display-only unified-diff text
   - evidence references
   - no apply operation, patch payload, or executable command.
3. Result-level canonical evidence, confidence, and limitations.

The proposal is a recommendation, not a permission grant. `CONFIRM_REQUIRED` is fixed for this MVP. A confirmation can be recorded in a future control workflow, but it cannot cause application of a diff here.

## 4. Deterministic Assistant Semantics

`DeterministicModificationAssistant` receives only a frozen invocation request and frozen canonical evidence. It reads only request-provided strings.

The first implementation may generate one predictable suggestion that replaces an explicitly identified, supported in-memory marker with a predetermined safer alternative. It must produce a paired original summary and display-only unified diff. The diff may show only the minimum target excerpt needed for one hunk (one removed line and one added line); it must not reproduce the full authorised context or unrelated surrounding source body.

It must not:

- run a test, execute user code, access the filesystem, network, database, or repository;
- call a Provider, LLM, Codex, MCP, or external tool;
- apply a diff, edit a file, create a commit, push, deploy, or change runtime/project state;
- claim that a proposal was applied, compiled, tested, merged, or deployed;
- generate a proposal when no supported marker is present.

Output must state that the suggested change requires human confirmation and downstream validation before any future application.

## 5. Adapter Responsibilities and Failure Model

`ModificationCapabilityAdapter` owns:

1. preflight rejection for cancellation, wrong operation, missing/expired proposal permission, blank goal, empty/duplicate/blank/out-of-scope code contexts, missing/invalid evidence, and exceeded budget;
2. strict ISO UTC timestamp validation including calendar validity;
3. deep-frozen request, evidence, permission, and budget snapshots;
4. canonical evidence construction before assistant invocation;
5. normalisation of invocation exceptions and non-success ports to controlled failures;
6. validation of every dynamic output field, proposal evidence links, fixed `CONFIRM_REQUIRED` status, confidence bound, zero resource usage, valid unified-diff format, and no source-body leakage;
7. controlled outcomes using `PERMISSION_DENIED`, `BUDGET_EXCEEDED`, `CANCELLED`, `SOURCE_SCOPE_INVALID`, `EVIDENCE_INSUFFICIENT`, `OUTPUT_INVALID`, or `EXECUTION_FAILED`.

Confidence is `L3` only when all code contexts are versioned and all required evidence is present; otherwise it is capped at `L2`. The MVP never returns `L4`.

## 6. Evidence and Audit

Canonical evidence is created before invocation and contains one source-evidence record per authorised code context plus preserved, validated Code Analysis Evidence and Test Evidence references. A proposal or diff may cite only this canonical set.

`CodeModificationCapabilityRuntimeService` invokes the adapter once and appends one audit event. It records:

- input references, operation, permission snapshot, and budget snapshot;
- primary proposal reference, proposed diff reference, approval status, result status, evidence, confidence, and limitations;
- failure reason/stage if the call is blocked or fails.

Audit records evidence only; they do not authorise, apply, or roll back a change.

## 7. Rollback Boundary

The MVP’s rollback boundary is proposal-only. Because it cannot apply a change, its rollback instruction is an explicit human-readable reversal path for any future approved application. It must state that:

- no repository mutation occurred in this invocation;
- no automatic rollback is available or required;
- any future application must create its own change record, testing evidence, approval, and rollback procedure.

## 8. Test Plan

Use fixed timestamps and request-provided in-memory inputs only. Automated tests must cover:

- valid proposal and display-only unified diff with all required proposal fields;
- Code Analysis Evidence and Test Evidence completeness, source association, canonical ordering, and immutable snapshots;
- fixed `CONFIRM_REQUIRED` status and no application surface;
- missing/unauthorised evidence, permission denial, budget denial, cancellation, blank goal, and invalid context rejection before port invocation;
- invalid proposal/diff, confidence above evidence bound, non-zero usage, duplicate/tampered evidence, and source leakage rejection;
- invocation exception and non-success normalisation;
- audit completeness for success and controlled rejection;
- absence of filesystem, network, external Provider, test execution, patch application, commit, deployment, Runtime Core, Workflow, Task, Agent, Registry, and Knowledge side effects.

## 9. Planned File Boundary

```text
runtime/
  capability/
    code-modification-execution-contract.ts
    code-modification-invocation-port.ts
    deterministic-code-modification-assistant.ts
    code-modification-capability-adapter.ts
  services/
    code-modification-capability-runtime-service.ts
  tests/
    code-modification-capability.test.ts
```

`package.json` may only add the focused Node built-in test file. No `agents/`, `tools/`, `integrations/`, `api/`, Provider SDK, database, filesystem adapter, test runner integration, patch application endpoint, commit operation, or deployment component may be added.
