# Codex Capability Integration Design Review Report

## Review scope

本次 Review 只审查 Phase 9C-5 的 Codex Capability 合同与控制边界，依据 [ADR-0024](../adr/ADR-0024-CODEX-CAPABILITY-INTEGRATION.md) 及相关 Runtime 文档完成。没有调用 Codex、API、CLI、MCP、网络、外部工具或真实项目，也没有创建 Capability Registry Record 或激活 Capability。

## 1. Capability boundary review

**Result: PASS**

Codex 被定义为可替换的 `Engineering Capability`。Runtime 保留任务分配、Permission、Budget、Human Control、Audit 与 Workflow 控制面权威；Codex 仅在一次受控调用中返回 Result + Evidence。合同明确禁止 Codex 作为 Core、Agent Manager、Workflow Controller、Gate 决策者或发布授权者。

## 2. Adapter and Workflow authority review

**Result: PASS**

`CodexCapabilityAdapter` 仅转换已授权请求并标准化结果。其禁止项明确排除 `WorkflowService.transition`、Workflow repository 写入、权限推断、审批推断和绕过 Gate。成功 Capability Result 也不能自行推进 Workflow 状态；仅 Runtime 完成验证、Audit 后由 Workflow 决定状态。

## 3. Permission model review

**Result: PASS WITH IMPLEMENTATION CONDITIONS**

Permission Grant 被限定为任务范围、最小权限、一次调用和有过期时间。`APPLY_CHANGE` 与 `CREATE_COMMIT` 需要已确认的人工批准、文件/提交范围和剩余预算；Manifesto、Master Plan、ADR、SKILL、Gate、Capability Registry 与 `ACTIVE` Knowledge 属于禁止范围。

后续实现设计必须把 Permission 生命周期、范围匹配、过期、撤销和消费检查落实为可测试的 Guard；不得把合同文字当成已实施的访问控制。

## 4. Human Control review

**Result: PASS**

控制模式使用 `AUTO`、`CONFIRM`、`BLOCK`。当前设计不启用 `AUTO`；文件修改和创建 Commit 固定为 `CONFIRM`。Approval Record 绑定任务、操作、影响范围、Capability/Adapter 版本、Permission、Budget、审批者、时间和有效期，不能被复用为后续任务、工具、发布或 Gate 的通用授权。

## 5. Audit completeness review

**Result: PASS**

Audit 记录任务/项目、Capability 与 Adapter/Provider 版本、授权输入引用、Context、Permission/Budget Snapshot、输出、Changed Files、Evidence、Approval、耗时、失败分类、失败阶段和后续处置。Audit 仅记录事实，不授予权限、不推进 Workflow，也不会自动写入 `ACTIVE` Knowledge。

## 6. Failure handling review

**Result: PASS**

`TIMEOUT`、`EXECUTION_FAILED`、`OUTPUT_INVALID`、`PERMISSION_DENIED`、`BUDGET_EXCEEDED`、`CANCELLED` 与 `ADAPTER_UNAVAILABLE` 都有受控响应。首次实现默认禁止自动重试、自动回退和自动恢复；任何扩大范围的恢复均须由 Workflow Policy 和人工决定。

## 7. Capability Registry status review

**Result: PASS**

当前状态严格保持：

| Field | Value |
|---|---|
| Registry Record | `ABSENT` |
| Registry Status | `N/A` |
| Proposed Registry Status | `DISCOVERED` |
| Selection | `PROHIBITED` |
| Activation Scope | `NONE` |

因此 Phase 9C-5 文档完成不表示已完成 Capability Admission、Evaluation、Registry 或 Activation，也不构成任何真实调用授权。

## Test-plan review

**Result: PASS**

测试计划限定为 Local Mock Codex Adapter，并覆盖成功、Provider Failure、Invalid Output、Permission Denial、Budget Denial、Approval Barrier、Cancellation 与 Audit Completeness。测试只验证合同和控制，不宣称真实 Codex 的质量、安全、成本、时延或供应商行为。

## Review gate

**Gate: `APPROVED_FOR_NEXT_PHASE`**

允许进入后续 **Codex Capability Implementation Design** 的文档设计工作。该 Gate 不授权真实 Codex 接入、Capability Activation、API/CLI/MCP 调用、网络访问、文件修改、Commit、自动执行或生产使用。

## ADR assessment

**ADR Not Required.** 本次 Review 未改变 ADR-0024 的架构决策，只确认其文档边界一致。

## Required conditions before any real integration

1. 完成 Capability Admission、Evaluation、Registry 与 Activation 的独立治理流程。
2. 完成实现设计、Mock 测试及受控集成测试，并验证 Permission、Budget、Approval、Audit、Cancellation 与 Kill Switch。
3. 完成来源、License、供应商版本、隐私/安全、成本、兼容性、维护与可替换性审查。
4. 取得用户对明确范围和风险的单独授权。
