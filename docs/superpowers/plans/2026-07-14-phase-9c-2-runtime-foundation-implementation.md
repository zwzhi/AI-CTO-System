# Phase 9C-2 Runtime Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 使用 TypeScript 和 Node.js 24 实现单 Workflow、单 Task、Mock Capability、Guard 与 Audit Evidence 的 Runtime Foundation MVP。

**Architecture:** Thin Core + Contract First。Workflow、Task、Capability、Audit 与 Permission 仅依赖 `models/` 中的 Entity、Port 与错误合同；Repository Port 在领域内声明，In-memory Adapter 仅供当前 MVP 组合。`RuntimeFoundationService` 只协调领域服务，所有状态变更都通过领域服务公开方法完成。

**Tech Stack:** TypeScript（Node.js 24 类型剥离执行）、Node.js 24、`node:test`、`node:assert/strict`；零第三方运行时、测试、Web、数据库、ORM 或工具 SDK 依赖。

## Global Constraints

- 只实现单 Workflow、单 Task、单次 Mock Capability Invocation 和内存级 Repository；不得扩大为多 Task、多 Agent、生产 Runtime 或持久化。
- 不创建或修改 `agents/`、`tools/`、`integrations/`、`api/`；不接入 Codex、MCP、真实 Agent、真实工具、网络、Web 框架、数据库、ORM、消息队列或自动执行。
- Core 只能依赖 Entity、Interface Contract、Repository Port 和领域服务；不得依赖 In-memory Adapter 的内部实现。
- Workflow 只负责状态与协调；Task 只负责输入输出；Capability 只负责 Contract 与 Mock Result；Audit 只负责 Evidence；Guard 只负责约束判断。
- 所有状态变化只能经 WorkflowService 或 TaskService 的公开方法；禁止跨领域直接修改实体或 Repository 中的状态。
- Evidence 必须包含来源、脱敏摘要、Confidence 和 Timestamp；只写 Result / Audit，不自动写入 Knowledge Base。
- 使用 `ROLLING_BACK` 作为状态与审计语义；不实现真实外部回滚。源代码回滚只通过小型 Git 提交处理。

---

### Task 1: 建立 Node 24 TypeScript 入口、核心模型与统一错误模型

**Files:**
- Create: `package.json`
- Create: `runtime/models/runtime-types.ts`
- Create: `runtime/models/runtime-error.ts`
- Create: `runtime/tests/runtime-foundation.test.ts`

**Consumes:** `docs/runtime/RUNTIME_DATA_MODEL_IMPLEMENTATION.md`、`docs/runtime/RUNTIME_API_CONTRACT.md`。

**Produces:** 无依赖的 Node 24 测试命令、全部核心 Pseudo Type 的 TypeScript 表达，以及可由所有领域使用的 `RuntimeError`。

- [ ] **Step 1: 写入第一个失败测试，证明错误模型尚不存在**

在 `runtime/tests/runtime-foundation.test.ts` 写入：

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { RuntimeError } from '../models/runtime-error.ts';

test('RuntimeError preserves code, message, and safe details', () => {
  const error = new RuntimeError('INVALID_TRANSITION', 'cannot transition', { from: 'CREATED', to: 'COMPLETED' });
  assert.equal(error.code, 'INVALID_TRANSITION');
  assert.equal(error.message, 'cannot transition');
  assert.deepEqual(error.details, { from: 'CREATED', to: 'COMPLETED' });
});
```

- [ ] **Step 2: 运行失败测试**

运行：

```powershell
node --experimental-strip-types --test runtime/tests/runtime-foundation.test.ts
```

预期：失败，原因是 `runtime-error.ts` 不存在。

- [ ] **Step 3: 实现模型与错误合同**

在 `runtime/models/runtime-types.ts` 定义字符串联合类型：`WorkflowState`、`TaskState`、`CapabilityStatus`、`GuardDecision`、`ControlMode`、`RuntimeErrorCode`；定义 `ExecutionContext`、`Evidence`、`CapabilityResult`、`WorkflowInstance`、`Task`、`ExecutionRecord`、`CapabilityInvocation`、`AuditEvent`、`BudgetSnapshot` 和各 ID 类型。禁止 TypeScript `enum`、参数属性和其他 Node 类型剥离不支持的语法。

在 `runtime/models/runtime-error.ts` 实现：

```ts
export class RuntimeError extends Error {
  readonly name = 'RuntimeError';

  constructor(
    readonly code: RuntimeErrorCode,
    message: string,
    readonly details: Readonly<Record<string, string>> = {},
  ) {
    super(message);
  }
}
```

`RuntimeErrorCode` 必须至少包含：`WORKFLOW_NOT_FOUND`、`TASK_NOT_FOUND`、`TASK_ALREADY_EXISTS`、`INVALID_TRANSITION`、`GUARD_DENIED`、`CONFIRMATION_REQUIRED`、`BUDGET_EXCEEDED`、`OPERATION_CANCELLED`、`CAPABILITY_FAILED`。

- [ ] **Step 4: 配置测试入口并运行通过**

创建：

```json
{
  "name": "ai-cto-system-runtime-foundation",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --experimental-strip-types --test runtime/tests/runtime-foundation.test.ts"
  },
  "engines": {
    "node": ">=24"
  }
}
```

运行：

```powershell
node --experimental-strip-types --test runtime/tests/runtime-foundation.test.ts
```

预期：错误模型测试通过。

- [ ] **Step 5: 提交核心模型**

```powershell
git add package.json runtime/models runtime/tests/runtime-foundation.test.ts
git commit -m "feat: add runtime core types and errors"
```

### Task 2: 实现 Repository Port、In-memory Adapter、Workflow 与 Task 服务

**Files:**
- Create: `runtime/workflow/workflow-repository-port.ts`
- Create: `runtime/workflow/in-memory-workflow-repository.ts`
- Create: `runtime/workflow/workflow-service.ts`
- Create: `runtime/task/task-repository-port.ts`
- Create: `runtime/task/in-memory-task-repository.ts`
- Create: `runtime/task/task-service.ts`
- Modify: `runtime/tests/runtime-foundation.test.ts`

**Consumes:** `WorkflowInstance`、`Task`、`RuntimeError`、状态联合类型。

**Produces:** 技术栈无关 Repository Port、不可泄露内部引用的内存实现、Workflow 合法状态转换和单 Task 约束。

- [ ] **Step 1: 写入失败测试：合法状态转换、非法转换与单 Task 约束**

追加测试：

```ts
test('WorkflowService allows only declared transitions', () => {
  const service = createWorkflowService();
  const workflow = service.create(createWorkflowInput());
  const planning = service.transition(workflow.workflowId, 'PLANNING');
  assert.equal(planning.state, 'PLANNING');
  assert.throws(() => service.transition(workflow.workflowId, 'COMPLETED'), { code: 'INVALID_TRANSITION' });
});

test('TaskService rejects a second task for the same workflow', () => {
  const workflow = createWorkflowService().create(createWorkflowInput());
  const tasks = createTaskService();
  tasks.create(workflow.workflowId, { request: 'mock' });
  assert.throws(() => tasks.create(workflow.workflowId, { request: 'second' }), { code: 'TASK_ALREADY_EXISTS' });
});
```

- [ ] **Step 2: 运行测试，确认失败**

运行：

```powershell
node --experimental-strip-types --test runtime/tests/runtime-foundation.test.ts
```

预期：失败，原因是服务和 Repository Port 尚未定义。

- [ ] **Step 3: 定义 Port 与 In-memory Adapter**

Port 必须使用以下最小签名：

```ts
export interface WorkflowRepositoryPort {
  create(workflow: WorkflowInstance): WorkflowInstance;
  getById(workflowId: string): WorkflowInstance | undefined;
  update(workflow: WorkflowInstance): WorkflowInstance;
}

export interface TaskRepositoryPort {
  create(task: Task): Task;
  getByWorkflowId(workflowId: string): Task | undefined;
  update(task: Task): Task;
}
```

In-memory Adapter 使用私有 `Map<string, Entity>`；`create`、`getById`、`getByWorkflowId`、`update` 必须返回拷贝，而非可变内部引用。

- [ ] **Step 4: 实现领域服务**

`WorkflowService` 只通过 `transition(workflowId, targetState, reason?)` 改变 Workflow 状态，至少允许：

```text
CREATED -> PLANNING
PLANNING -> WAITING_APPROVAL | EXECUTING | CANCELLED | FAILED
WAITING_APPROVAL -> EXECUTING | CANCELLED
EXECUTING -> VALIDATING | FAILED | PAUSED | CANCELLED | ROLLING_BACK
VALIDATING -> COMPLETED | FAILED | ROLLING_BACK
PAUSED -> EXECUTING | CANCELLED
ROLLING_BACK -> CANCELLED
```

`TaskService.create(workflowId, input)` 只能创建一个 `Task`，`TaskService.complete(taskId, result)` 只负责写入 Task Result，不能推进 Workflow State 或调用 Capability。

- [ ] **Step 5: 运行测试并提交**

运行：

```powershell
node --experimental-strip-types --test runtime/tests/runtime-foundation.test.ts
```

预期：Workflow 与 Task 测试通过。

```powershell
git add runtime/workflow runtime/task runtime/tests/runtime-foundation.test.ts
git commit -m "feat: add workflow task services and repositories"
```

### Task 3: 实现 Guard、Mock Capability 与 Audit Port

**Files:**
- Create: `runtime/permission/permission-budget-guard.ts`
- Create: `runtime/capability/capability-adapter-port.ts`
- Create: `runtime/capability/mock-capability-adapter.ts`
- Create: `runtime/audit/execution-repository-port.ts`
- Create: `runtime/audit/in-memory-execution-repository.ts`
- Create: `runtime/audit/audit-repository-port.ts`
- Create: `runtime/audit/in-memory-audit-repository.ts`
- Create: `runtime/audit/audit-service.ts`
- Modify: `runtime/tests/runtime-foundation.test.ts`

**Consumes:** 核心模型、错误合同、Task 结果、Repository Port 规则。

**Produces:** 三种 Guard 决定、无副作用 Mock Capability、ExecutionRecord 与追加式 Audit Evidence。

- [ ] **Step 1: 写入失败测试：Guard、Mock Result 与 Audit Evidence**

追加测试：

```ts
test('PermissionBudgetGuard denies an over-budget invocation', () => {
  const decision = new PermissionBudgetGuard().evaluate({ tokenLimit: 1, tokenUsed: 2, controlMode: 'AUTO' });
  assert.equal(decision.kind, 'DENY');
  assert.equal(decision.reasonCode, 'BUDGET_EXCEEDED');
});

test('MockCapabilityAdapter returns deterministic evidence', () => {
  const result = new MockCapabilityAdapter(() => '2026-07-14T00:00:00.000Z').invoke(createCapabilityRequest());
  assert.equal(result.status, 'SUCCESS');
  assert.equal(result.evidence[0]?.confidence, 'L3');
  assert.equal(result.timestamp, '2026-07-14T00:00:00.000Z');
});
```

- [ ] **Step 2: 运行测试，确认失败**

运行：

```powershell
node --experimental-strip-types --test runtime/tests/runtime-foundation.test.ts
```

预期：失败，原因是 Guard、Adapter 与 Audit 服务尚未定义。

- [ ] **Step 3: 实现 Permission / Budget Guard**

`PermissionBudgetGuard.evaluate` 返回：

```ts
type GuardDecision =
  | { kind: 'ALLOW' }
  | { kind: 'CONFIRM_REQUIRED'; reasonCode: 'CONFIRMATION_REQUIRED' }
  | { kind: 'DENY'; reasonCode: 'BUDGET_EXCEEDED' | 'OPERATION_CANCELLED' | 'GUARD_DENIED' };
```

先检查取消，再检查 Token、工具、时间、成本预算，最后根据 `ControlMode` 返回确认或允许。Guard 不修改预算、不推进 Workflow，也不决定项目 Gate。

- [ ] **Step 4: 实现 Mock Capability 与 Audit**

`CapabilityAdapterPort.invoke(request)` 仅返回 `CapabilityResult`。`MockCapabilityAdapter` 根据 `request.input.mode` 返回 `SUCCESS` 或 `FAILURE`，始终生成脱敏 Evidence（`source`、`summary`、`confidence='L3'`、`timestamp`）。

Execution 与 Audit Port 使用以下签名：

```ts
export interface ExecutionRepositoryPort {
  append(record: ExecutionRecord): ExecutionRecord;
}

export interface AuditRepositoryPort {
  append(event: AuditEvent): AuditEvent;
  listByWorkflowId(workflowId: string): AuditEvent[];
}
```

`AuditService` 只能追加事件；不得修改 Workflow、Task、Guard 决定或 Knowledge Base。

- [ ] **Step 5: 运行测试并提交**

运行：

```powershell
node --experimental-strip-types --test runtime/tests/runtime-foundation.test.ts
```

预期：Guard、Capability、Execution 和 Audit 测试通过。

```powershell
git add runtime/permission runtime/capability runtime/audit runtime/tests/runtime-foundation.test.ts
git commit -m "feat: add guard mock capability and audit"
```

### Task 4: 实现 Runtime Foundation 协调服务与端到端 MVP 场景

**Files:**
- Create: `runtime/services/runtime-foundation-service.ts`
- Modify: `runtime/tests/runtime-foundation.test.ts`

**Consumes:** WorkflowService、TaskService、CapabilityAdapterPort、PermissionBudgetGuard、AuditService 与所有 Repository Port。

**Produces:** 唯一协调入口和正常完成、Capability 失败、用户取消、预算超限四类受控闭环。

- [ ] **Step 1: 写入失败集成测试**

追加测试：

```ts
test('RuntimeFoundationService completes the mock capability loop with audit evidence', () => {
  const runtime = createRuntimeFoundationService();
  const result = runtime.run(createWorkflowInput(), { request: 'mock', mode: 'success' });
  assert.equal(result.workflow.state, 'COMPLETED');
  assert.equal(result.task.result?.status, 'SUCCESS');
  assert.ok(result.auditEvents.some((event) => event.evidence.length > 0));
});

test('RuntimeFoundationService cancels on budget limit without invoking capability', () => {
  const runtime = createRuntimeFoundationService({ tokenLimit: 1, tokenUsed: 2 });
  const result = runtime.run(createWorkflowInput(), { request: 'mock', mode: 'success' });
  assert.equal(result.workflow.state, 'CANCELLED');
  assert.equal(result.capabilityInvocation, undefined);
});
```

另写 Capability 失败断言 `FAILED` 且无自动重试，以及取消断言 `CANCELLED` 且无 Invocation。

- [ ] **Step 2: 运行集成测试，确认失败**

运行：

```powershell
node --experimental-strip-types --test runtime/tests/runtime-foundation.test.ts
```

预期：失败，原因是 `RuntimeFoundationService` 尚未定义。

- [ ] **Step 3: 实现唯一协调服务**

`RuntimeFoundationService.run(workflowInput, taskInput)` 必须严格按以下顺序：创建 Workflow → Audit `WORKFLOW_CREATED` → `PLANNING` → 创建单 Task → Guard → `WAITING_APPROVAL` / `CANCELLED` / `EXECUTING` → Mock Capability → ExecutionRecord + Result + Evidence + Audit → `VALIDATING` → `COMPLETED` 或 `FAILED`。

对 `CONFIRM_REQUIRED`，返回 `WAITING_APPROVAL` 而不调用 Capability；本 MVP 不实现确认恢复接口。对 `DENY`，根据原因转为 `PAUSED` 或 `CANCELLED` 并审计。对 Capability `FAILURE`，Task Service 写入 Result，WorkflowService 转为 `FAILED`，不重试。

- [ ] **Step 4: 运行全套测试与边界检查**

运行：

```powershell
node --experimental-strip-types --test runtime/tests/runtime-foundation.test.ts
git diff --check
git diff --name-only -- runtime agents tools integrations api
```

预期：所有 `node:test` 测试通过；差异格式正常；变更只在允许的 `runtime/` 与根配置文件中，`agents/`、`tools/`、`integrations/`、`api/` 无变更。

- [ ] **Step 5: 提交协调服务**

```powershell
git add runtime/services/runtime-foundation-service.ts runtime/tests/runtime-foundation.test.ts
git commit -m "feat: add runtime foundation MVP loop"
```

### Task 5: 记录技术选型、实施状态并执行代码开发 Gate

**Files:**
- Create: `docs/adr/ADR-0021-RUNTIME-FOUNDATION-TECH-STACK.md`
- Modify: `docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md`
- Modify: `docs/architecture/MODULE_REGISTRY.md`
- Modify: `SKILL.md`
- Modify: `memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md`
- Modify: `docs/DEVELOPMENT_PROGRESS.md`

**Consumes:** 已通过的测试输出、实现文件、Phase 9C-1 Gate、技术选型。

**Produces:** 技术选型 ADR、Phase 9C-2 完成记录、实现证据和 Gate 结论。

- [ ] **Step 1: 写入 ADR-0021**

记录选择 TypeScript、Node.js 24、Node Built-in Test Runner 和 In-memory Repository 的原因、后果与替代方案；明确零真实工具、零数据库、零框架和非生产边界。

- [ ] **Step 2: 更新治理入口**

将 Phase 9C-2 标为已完成的 Runtime Foundation MVP 实现，列出实际限制与测试 Evidence。不得把完成解释为真实 Agent、Codex/MCP、Tool Calling、Automation、生产 Runtime 或 Gate 绕过；`Agent Runtime`、`Tool Calling`、`Codex Integration`、`Automation` 保持 `Planned`。

- [ ] **Step 3: 执行最终 Gate 验证**

运行：

```powershell
node --experimental-strip-types --test runtime/tests/runtime-foundation.test.ts
git diff --check
git status --short
```

检查：Implementation Plan、Project Structure、Data Model、API Contract、Mock Capability、Test Plan、Failure Handling、风险、安全边界、ADR-0021 和测试 Evidence 均存在且一致。若任一项缺失或测试失败，Gate 结果为 `CHANGES_REQUIRED`；全部通过且保持授权边界时，记录 `APPROVED_FOR_IMPLEMENTATION` 的实现验收证据，但不授权后续真实工具或生产能力。

- [ ] **Step 4: 提交治理记录**

```powershell
git add docs/adr/ADR-0021-RUNTIME-FOUNDATION-TECH-STACK.md docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md docs/architecture/MODULE_REGISTRY.md SKILL.md memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md docs/DEVELOPMENT_PROGRESS.md
git commit -m "docs: record runtime foundation implementation"
```
