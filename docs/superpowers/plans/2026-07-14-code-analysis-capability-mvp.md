# Code Analysis Capability MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the smallest deterministic, read-only Code Analysis Capability invocation-to-audit loop.

**Architecture:** A specialised request/result contract flows through a preflight adapter to a replaceable deterministic port and then to an append-only audit service. The generic Runtime Core remains untouched.

**Tech Stack:** TypeScript, Node.js 24, Node built-in test runner, in-memory repositories.

## Global Constraints

- Input is restricted to explicitly authorised in-memory code contexts.
- No filesystem/network/provider/LLM/Codex/MCP/tool access, patches, commits, deployment, Registry activation, or Knowledge write.
- Do not modify Runtime Core, Workflow, Task, Agent, Registry, or generic runtime types.
- Reuse `PermissionBudgetGuard` and `AuditService`; evidence is created before deterministic analysis.

---

### Task 1: Freeze the specialised Contract and Red Tests

**Files:**
- Create: `runtime/tests/code-analysis-capability.test.ts`
- Create: `runtime/capability/code-analysis-execution-contract.ts`
- Create: `runtime/capability/code-analysis-invocation-port.ts`

**Produces:** `CodeAnalysisExecutionRequest`, `CodeAnalysisResult`, `CodeAnalysisInvocationPort`, one `ANALYZE_READ_ONLY_CODE` operation, and executable failing tests for success, preflight rejection, invalid output, confidence, audit, and immutable scope.

- [ ] Write the test file first, importing the not-yet-created specialised modules and asserting the CA-01 through CA-10 behaviours.
- [ ] Run `node --experimental-strip-types --test runtime/tests/code-analysis-capability.test.ts`; expect module-not-found failure because the capability does not exist.
- [ ] Add only the exported contract/port types necessary for tests to compile.
- [ ] Run the targeted test again; expect failures because implementations do not exist.

### Task 2: Implement Deterministic Analysis and Adapter

**Files:**
- Create: `runtime/capability/deterministic-code-analysis-assistant.ts`
- Create: `runtime/capability/code-analysis-capability-adapter.ts`
- Test: `runtime/tests/code-analysis-capability.test.ts`

**Consumes:** Contract, port, `PermissionBudgetGuard`.

**Produces:** Deterministic output and controlled `BLOCKED`/`FAILURE` outcomes.

- [ ] Run the failing targeted tests before each implementation increment.
- [ ] Implement only scope/permission/budget/cancellation preflight, immutable request snapshots, prebuilt source evidence, deterministic non-content-revealing findings, and strict output validation.
- [ ] Run the targeted test after each increment; expect green only for the behaviour just implemented.

### Task 3: Add Runtime-to-Audit Integration

**Files:**
- Create: `runtime/services/code-analysis-capability-runtime-service.ts`
- Modify: `package.json`
- Test: `runtime/tests/code-analysis-capability.test.ts`

**Consumes:** Adapter and existing `AuditService`.

**Produces:** one audit event per attempted analysis, without a Workflow/Task state transition.

- [ ] Add the audit integration test before the service implementation and run it; expect a missing-service failure.
- [ ] Implement append-only result/failure audit mapping and add the test file to `npm.cmd test`.
- [ ] Run the targeted test and full `npm.cmd test`; expect all tests green.

### Task 4: Verify Scope and Commit

**Files:** only the files named in Tasks 1-3 plus the approved design/test/plan documents and required progress records.

- [ ] Run full `npm.cmd test` and inspect the exit code and test count.
- [ ] Run `git diff --check`, `git status --short`, and a scoped `rg` scan for filesystem/network/Provider/LLM/Codex/MCP/patch/commit/deployment APIs in the new implementation files.
- [ ] Confirm no forbidden Core, Workflow, Task, Agent, Registry, or Knowledge paths changed.
- [ ] Commit the verified capability on `feat/code-analysis-capability-mvp` with a focused message.
