# Phase 9C-1 Runtime Foundation Documents Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不写 Runtime 代码的前提下，将 Phase 9C-1 的薄核心与合同优先设计固化为正式架构文档、开发 Gate 和治理记录。

**Architecture:** Runtime Foundation 只定义技术栈中立的 Entity、Interface Contract、Pseudo Type、State Machine 与 Input / Output Definition。Workflow Service 协调单 Workflow / 单 Task；Mock Capability 仅经 Adapter Contract 返回 Result + Evidence；Permission / Budget Guard 和 Audit Port 共同限制、记录执行。

**Tech Stack:** Markdown、Git、技术栈中立伪类型与合同；不选择编程语言、框架、数据库、ORM 或部署方案。

## Global Constraints

- 不写 Runtime 代码，不创建真实 Agent，不接入 Codex、MCP、真实工具或外部服务，不实现自动执行。
- MVP 只能是单 Workflow、单 Task、单次 Mock Capability Invocation；禁止多 Agent、自动代码修改、自动部署、生产执行、复杂循环和范围扩张。
- 所有合同必须保留 `Execution Context`、`Evidence Contract`、`Permission / Budget Guard`、`Audit Evidence` 和 Workflow State Machine。
- Entity、接口和伪类型必须技术栈中立；不得设计数据库 Schema、ORM 映射、框架 API 或部署实现。
- 只定义 `ROLLING_BACK` 的状态和记录语义，不实现真实回滚；预算超限不得自动扩大预算。

---

### Task 1: 建立 Runtime Foundation 的核心实现设计文档

**Files:**
- Create: `docs/runtime/RUNTIME_FOUNDATION_IMPLEMENTATION_PLAN.md`
- Create: `docs/runtime/RUNTIME_PROJECT_STRUCTURE.md`
- Create: `docs/runtime/RUNTIME_DATA_MODEL_IMPLEMENTATION.md`
- Create: `docs/runtime/RUNTIME_API_CONTRACT.md`
- Create: `docs/runtime/MOCK_CAPABILITY_IMPLEMENTATION_DESIGN.md`

**Consumes:** `docs/superpowers/specs/2026-07-14-phase-9c-1-runtime-foundation-implementation-design.md`、`docs/runtime/RUNTIME_MVP_SCOPE.md`、`docs/runtime/RUNTIME_DATA_MODEL.md`。

**Produces:** 面向 Phase 9C-2 的五阶段开发顺序、未来目录职责、五个核心 Entity、Execution Context / Evidence Contract、服务与端口合同，以及唯一 Mock Capability 的无副作用调用设计。

- [ ] **Step 1: 写入 Runtime Foundation Implementation Plan**

定义 `Runtime Core → Task Engine → Capability Adapter → Audit System → Integration Test` 五个阶段；每阶段列出输入、输出、依赖、验收和停止条件。明确仅为未来实现计划，不授权编码。

- [ ] **Step 2: 写入技术栈中立的 Project Structure**

定义未来 `runtime/workflow/`、`runtime/task/`、`runtime/capability/`、`runtime/audit/`、`runtime/permission/`、`runtime/models/`、`runtime/services/`、`runtime/tests/` 的职责和禁止职责；说明这是未来目录建议，不创建目录或文件。

- [ ] **Step 3: 写入核心 Data Model Implementation**

以字段表和伪类型定义 `WorkflowInstance`、`Task`、`ExecutionRecord`、`CapabilityInvocation`、`AuditEvent`，并补充 `ExecutionContext` 与 `Evidence`。字段必须包含身份、关联、状态、时间、预算或证据所需引用，不包含持久化或数据库细节。

- [ ] **Step 4: 写入 API Contract**

定义创建 / 查询 / 转换 Workflow，创建 / 查询 Task，调用 Capability，评估 Permission / Budget 和追加 / 查询 Audit 的输入输出合同。列明 `ALLOW`、`CONFIRM_REQUIRED`、`DENY`，以及 `DENY`、取消与超限时不允许调用的规则。

- [ ] **Step 5: 写入 Mock Capability 实现设计**

定义 Mock 输入、固定成功和受控失败输出、Evidence / Confidence / Timestamp 传递、无副作用保证和 Audit 写入关系。禁止真实工具、自动回退、真实重试、生产调用和 Agent。

- [ ] **Step 6: 校验核心合同一致性**

运行：

```powershell
rg -n 'Execution Context|Evidence|Permission|Budget|Audit|Mock Capability|WorkflowInstance|CapabilityInvocation' docs/runtime/RUNTIME_FOUNDATION_IMPLEMENTATION_PLAN.md docs/runtime/RUNTIME_PROJECT_STRUCTURE.md docs/runtime/RUNTIME_DATA_MODEL_IMPLEMENTATION.md docs/runtime/RUNTIME_API_CONTRACT.md docs/runtime/MOCK_CAPABILITY_IMPLEMENTATION_DESIGN.md
git diff --check
```

预期：五份文档均包含核心合同术语；无格式错误；没有语言、框架、数据库、ORM 或部署绑定。

### Task 2: 建立测试、失败处理、开发 Gate 与 ADR

**Files:**
- Create: `docs/runtime/RUNTIME_FOUNDATION_TEST_PLAN.md`
- Create: `docs/runtime/RUNTIME_FAILURE_HANDLING_DESIGN.md`
- Create: `docs/runtime/RUNTIME_IMPLEMENTATION_GATE.md`
- Create: `docs/adr/ADR-0020-RUNTIME-FOUNDATION-IMPLEMENTATION.md`

**Consumes:** Task 1 的合同、`docs/runtime/RUNTIME_MVP_WORKFLOW.md`、`docs/runtime/RUNTIME_MVP_TECHNICAL_CONSTRAINTS.md`、`docs/runtime/RUNTIME_SAFETY_BOUNDARY.md`。

**Produces:** 测试矩阵、失败状态转换、代码开发前 Gate 与渐进实施 ADR。

- [ ] **Step 1: 写入 Runtime Foundation Test Plan**

定义 Unit Test（状态、单 Task、Guard、Evidence）、Integration Test（Workflow 到 Mock Capability 到 Audit）、Failure Test（Capability / Task / Workflow 失败、取消、预算超限）和 Audit Test（必填字段、关联、脱敏）。每种测试说明测试对象、前置、断言与禁止的真实依赖。

- [ ] **Step 2: 写入 Failure Handling Design**

定义 Capability 失败、Task 失败、Workflow 失败、预算超限、用户取消的触发、状态、阻止动作、证据与恢复规则。使用 `FAILED`、`PAUSED`、`CANCELLED`、`ROLLING_BACK`；明确 `ROLLING_BACK` 无真实回滚实现。

- [ ] **Step 3: 写入 Runtime Implementation Gate**

要求 Implementation Plan、Project Structure、Data Model、API Contract、Mock Capability、Test Plan、Failure Handling、风险和安全边界均完成并相互一致。Gate 只输出 `APPROVED_FOR_IMPLEMENTATION` 或 `CHANGES_REQUIRED`；当前文档阶段不作批准。

- [ ] **Step 4: 写入 ADR-0020**

记录渐进实施的背景、决策、后果与替代方案：先验证薄核心、Mock Capability、状态、Guard 和 Audit，再在独立授权下确定技术栈和开发代码。

- [ ] **Step 5: 校验失败与 Gate 覆盖**

运行：

```powershell
rg -n 'Capability失败|Task失败|Workflow失败|预算超限|用户取消|FAILED|ROLLING_BACK|CANCELLED|APPROVED_FOR_IMPLEMENTATION|CHANGES_REQUIRED' docs/runtime/RUNTIME_FOUNDATION_TEST_PLAN.md docs/runtime/RUNTIME_FAILURE_HANDLING_DESIGN.md docs/runtime/RUNTIME_IMPLEMENTATION_GATE.md docs/adr/ADR-0020-RUNTIME-FOUNDATION-IMPLEMENTATION.md
git diff --check
```

预期：五类失败、四个状态和两个 Gate 结果都可检索；无格式错误；没有代码或工具接入。

### Task 3: 同步治理入口、验证并提交文档设计

**Files:**
- Modify: `docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md`
- Modify: `SKILL.md`
- Modify: `docs/architecture/MODULE_REGISTRY.md`
- Modify: `memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md`
- Modify: `docs/DEVELOPMENT_PROGRESS.md`

**Consumes:** Task 1–2 的八份正式文档、`docs/adr/ADR-0020-RUNTIME-FOUNDATION-IMPLEMENTATION.md`。

**Produces:** Phase 9C-1 完成状态、Layer 5 Runtime Architecture 的关联文档、当前 Gate 未批准实现的记录与下一步建议。

- [ ] **Step 1: 更新 Master Plan 与 Module Registry**

将 Phase 9C-1 标注为 Runtime Foundation Implementation Design 已完成，关联主要文档和 ADR-0020；明确只完成设计、未进入 Phase 9C-2 代码开发，且不新增 Module、不改变真实 Runtime / Agent / Tool Calling / Codex Integration 的 `Planned` 状态。

- [ ] **Step 2: 更新 SKILL、Project Memory 与 Development Progress**

加入 Phase 9C-1 规则：合同优先、单 Workflow / Task、Mock Capability、Execution Context、Evidence、Guard、Audit、失败状态与 Gate。记录当前未批准实现、风险和下一步为等待用户确认。

- [ ] **Step 3: 执行文档完整性验证**

运行：

```powershell
$required = @(
  'docs/runtime/RUNTIME_FOUNDATION_IMPLEMENTATION_PLAN.md',
  'docs/runtime/RUNTIME_PROJECT_STRUCTURE.md',
  'docs/runtime/RUNTIME_DATA_MODEL_IMPLEMENTATION.md',
  'docs/runtime/RUNTIME_API_CONTRACT.md',
  'docs/runtime/MOCK_CAPABILITY_IMPLEMENTATION_DESIGN.md',
  'docs/runtime/RUNTIME_FOUNDATION_TEST_PLAN.md',
  'docs/runtime/RUNTIME_FAILURE_HANDLING_DESIGN.md',
  'docs/runtime/RUNTIME_IMPLEMENTATION_GATE.md',
  'docs/adr/ADR-0020-RUNTIME-FOUNDATION-IMPLEMENTATION.md'
)
$required | ForEach-Object { if (-not (Test-Path $_)) { throw "Missing: $_" } }
git diff --check
```

预期：九份文件均存在，所有变更通过差异格式检查。

- [ ] **Step 4: 校验 Markdown 相对链接和边界词**

检查新增或修改 Markdown 的相对链接；检索 `不写 Runtime 代码`、`不接入 Codex`、`不接入 MCP`、`不创建真实 Agent`、`不绑定技术栈` 和 `不扩大 MVP` 的等价规范表述。发现断链、技术栈绑定或范围扩张时，先修正文档再提交。

- [ ] **Step 5: 提交文档设计**

```powershell
git add docs/runtime docs/adr/ADR-0020-RUNTIME-FOUNDATION-IMPLEMENTATION.md docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md SKILL.md docs/architecture/MODULE_REGISTRY.md memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md docs/DEVELOPMENT_PROGRESS.md
git commit -m "docs: add Phase 9C-1 runtime foundation design"
```

预期：提交只包含 Markdown 设计与治理记录，不包含 Runtime 源码、依赖、工具配置、数据库定义或部署资产。
