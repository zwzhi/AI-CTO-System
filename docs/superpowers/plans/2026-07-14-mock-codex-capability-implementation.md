# Mock Codex Capability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在无真实 Codex、网络、MCP、文件系统或 Git 副作用的条件下，实现 `Runtime → Adapter → Mock Codex → Result + Evidence → Audit` 闭环。

**Architecture:** 新增 provider-neutral Codex Contract、Invocation Port、确定性 Local Mock、受控 Adapter 与只追加 Audit 的 Runtime Service。既有 Workflow、Task 与 Planner 不改动；新服务不拥有 Workflow 状态权。

**Tech Stack:** TypeScript、Node.js 24、`node:test`、现有 In-memory Audit Repository；无第三方依赖。

## Global Constraints

- 不接入真实 Codex、API、CLI、SDK、MCP、网络、外部工具或真实项目。
- 不创建 `agents/`、`tools/`、`integrations/`、`api/` 目录。
- Mock 仅支持 `ANALYZE_CODE`、`PROPOSE_CHANGE`；不读取/修改文件、不生成补丁、不创建 Commit。
- `APPLY_CHANGE` 与 `CREATE_COMMIT` 必须被拒绝；Registry 保持 `ABSENT`，不激活 Capability。
- Adapter、Mock 与新增服务不得调用 Workflow transition API、Task repository 或 Planner。
- 每项生产代码必须先有失败测试，并确认失败原因是功能尚未实现。

## File Structure

| File | Responsibility |
|---|---|
| `runtime/capability/codex-execution-contract.ts` | Operation、Permission、Approval、Request、Outcome 与 Changed Files Proposal 类型。 |
| `runtime/capability/codex-invocation-port.ts` | Mock / future provider 的唯一调用边界。 |
| `runtime/capability/mock-codex-capability.ts` | 无副作用、确定性的 analysis/proposal fixture。 |
| `runtime/capability/codex-capability-adapter.ts` | Permission、Budget、Approval、取消与输出合同检查。 |
| `runtime/services/codex-capability-runtime-service.ts` | 调用 Adapter 并通过现有 AuditService 追加事件；不改变 Workflow。 |
| `runtime/tests/mock-codex-capability.test.ts` | Contract、Mock、Adapter、Audit 闭环测试。 |
| `package.json` | 将新测试文件纳入 `npm test`。 |

### Task 1: Contract and Invocation Port

**Files:** Create `runtime/capability/codex-execution-contract.ts`, `runtime/capability/codex-invocation-port.ts`; create `runtime/tests/mock-codex-capability.test.ts`.

**Interfaces:**

- `CodexExecutionRequest` binds exactly one Task, Execution Context, Permission Grant, Budget Snapshot, Approval and operation.
- `CodexExecutionOutcome` returns Result, Evidence, Status, proposed files, usage and optional bounded failure.
- `CodexInvocationPort.invoke(request)` returns a `CodexExecutionOutcome`.

- [ ] Write a failing test that imports `CodexExecutionRequest`, creates `ANALYZE_CODE` with `grant-1` and `CONFIRMED` approval, and asserts the binding fields.
- [ ] Run `node --experimental-strip-types --test runtime/tests/mock-codex-capability.test.ts`; expect import failure because the contract does not exist.
- [ ] Add only the Contract and Port types; include operations `ANALYZE_CODE | PROPOSE_CHANGE | APPLY_CHANGE | CREATE_COMMIT` and status/failure fields.
- [ ] Rerun the focused test; expect pass.
- [ ] Commit: `git commit -m "feat: add codex execution contract"`.

### Task 2: Deterministic Local Mock

**Files:** Create `runtime/capability/mock-codex-capability.ts`; modify `runtime/tests/mock-codex-capability.test.ts`.

**Interfaces:** Consumes `CodexExecutionRequest` through `CodexInvocationPort`; produces deterministic `CodexExecutionOutcome`.

- [ ] Write failing tests asserting: analysis returns `SUCCESS` plus Evidence and no changed files; proposal returns only `PROPOSED` changed-file references; apply/commit return `BLOCKED`.
- [ ] Run the focused test; expect failure because `MockCodexCapability` does not exist.
- [ ] Implement injected-clock, deterministic fixtures only. Do not import filesystem, HTTP, child process, Git or model APIs.
- [ ] Rerun the focused test; expect all Mock behavior tests to pass.
- [ ] Commit: `git commit -m "feat: add deterministic mock codex capability"`.

### Task 3: Guarded Capability Adapter

**Files:** Create `runtime/capability/codex-capability-adapter.ts`; modify `runtime/tests/mock-codex-capability.test.ts`.

**Interfaces:** Consumes `CodexInvocationPort`, existing `PermissionBudgetGuard`, `CodexExecutionRequest`; produces normalized Outcome.

- [ ] Write failing tests for missing operation permission, expired grant, unconfirmed change proposal, exceeded budget, cancellation and invalid returned proposal.
- [ ] Run the focused test; expect failure because `CodexCapabilityAdapter` does not exist.
- [ ] Implement preflight in this order: cancellation, permission scope/expiry, approval binding for proposal/change/commit, existing budget guard, one Port call, output validation. Map failures to `PERMISSION_DENIED`, `APPROVAL_REQUIRED`, `BUDGET_EXCEEDED`, `CANCELLED` or `OUTPUT_INVALID`.
- [ ] Rerun the focused test; expect all preflight paths to pass and no Mock invocation after a rejection.
- [ ] Commit: `git commit -m "feat: add guarded codex capability adapter"`.

### Task 4: Runtime-to-Audit Orchestration

**Files:** Create `runtime/services/codex-capability-runtime-service.ts`; modify `runtime/tests/mock-codex-capability.test.ts` and `package.json`.

**Interfaces:** Consumes `CodexCapabilityAdapter`, `AuditService`, Request; returns Outcome plus one Audit Event. It never imports WorkflowService.

- [ ] Write failing integration tests asserting a valid analysis creates `CODEX_CAPABILITY_COMPLETED` with Result/Evidence references, while budget rejection creates `CODEX_CAPABILITY_REJECTED` with failure reason.
- [ ] Run the focused test; expect failure because `CodexCapabilityRuntimeService` does not exist.
- [ ] Implement minimum orchestration: invoke Adapter once, append immutable Audit Event with task/context/permission references, budget snapshot, output reference, Evidence and failure facts. Update `package.json` test script to include the new suite.
- [ ] Run `npm.cmd test`; expect existing tests plus Codex Mock tests all to pass.
- [ ] Commit: `git commit -m "feat: audit mock codex capability execution"`.

### Task 5: Scope Verification and Gate Evidence

**Files:** Create `docs/runtime/MOCK_CODEX_CAPABILITY_IMPLEMENTATION_REPORT.md`; modify `docs/DEVELOPMENT_PROGRESS.md` and `memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md`.

- [ ] Run `rg -n "fetch\(|https?://|child_process|MCP|Codex API|\.git" runtime/capability runtime/services/codex-capability-runtime-service.ts`; expect no production integration usage.
- [ ] Run `npm.cmd test`; expect all tests pass.
- [ ] Record implemented files, results, boundaries and Development Gate. Keep Registry `ABSENT`; state that the Gate cannot authorize real Codex integration.
- [ ] Commit: `git commit -m "docs: record mock codex capability implementation"`.

## Plan Self-Review

- Coverage: Contract, Adapter, Mock, Permission, Budget, Approval, Audit, failure, Registry boundary and test evidence map to Tasks 1–5.
- Boundary: no task modifies Workflow/Task/Planner Core or invokes a real provider.
- Scope: each task ends with a focused test cycle and a small commit.
