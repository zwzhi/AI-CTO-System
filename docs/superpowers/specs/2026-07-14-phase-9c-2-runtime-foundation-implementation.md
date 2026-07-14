# Phase 9C-2 Runtime Foundation Implementation Design

## 目标

实现 Runtime Foundation MVP 的最小受控闭环：

```mermaid
flowchart LR
    A[User Request] --> B[Intent Result]
    B --> C[Workflow Instance]
    C --> D[Single Task]
    D --> E[Mock Capability Adapter]
    E --> F[Result + Evidence]
    F --> G[Audit Evidence]
```

范围仅覆盖单 Workflow、单 Task、单次 Mock Capability Invocation、内存级数据保存、Permission / Budget Guard 与 Audit Evidence。它不是生产 Runtime，不包含真实 Agent、真实工具、多 Agent 协作、自动代码修改、自动部署、Codex、MCP、Web API、数据库或外部服务。

## 技术选型

| 领域 | 选择 | 原因 |
|---|---|---|
| Language | TypeScript | 以静态类型直接表达 Entity、Port 与 Contract。 |
| Runtime | Node.js 24 | 当前环境可用，满足 MVP 的本地执行需要。 |
| Test | Node.js Built-in Test Runner | 用 `node:test` 与 `node:assert/strict` 测试，不额外引入测试框架。 |
| Persistence | In-memory Adapter | 仅提供可测试的 MVP 存储，不绑定数据库或 ORM。 |

不引入 Web 框架、数据库、ORM、消息队列、第三方工具 SDK 或外部测试依赖。

## 结构与依赖方向

```text
runtime/
├── workflow/      # 状态机与 Workflow Service
├── task/          # Task Entity、输入输出与单 Task 约束
├── capability/    # Adapter Port 与 Mock Capability
├── audit/         # Execution Record、Audit Event、Evidence
├── permission/    # Permission / Budget Guard
├── models/        # 纯类型、枚举、状态与合同
├── services/      # 最小闭环协调服务
└── tests/         # node:test 测试
```

依赖只能朝向合同和 Port：`services` 协调领域服务和 Port；领域模块可依赖 `models`，但不能依赖其他领域的内存实现。Core 不依赖具体 Repository 或 Capability Adapter；具体 In-memory Adapter 只实现 Repository Port。

## 领域职责与禁止事项

| 领域 | 负责 | 禁止 |
|---|---|---|
| Workflow | Workflow State、合法转换、生命周期协调。 | 执行能力、直接写 Audit 存储、跨领域修改 Task / Invocation 状态。 |
| Task | Task 输入、输出、单 Task 约束。 | Agent 协作、推进 Workflow State、直接调用 Capability。 |
| Capability | Capability Adapter Contract、Mock Result。 | 调用真实工具、修改 Workflow / Task 状态、自动重试。 |
| Audit | ExecutionRecord、AuditEvent、Evidence 追加记录。 | 授权 Gate、修改领域状态、自动写 Knowledge Base。 |
| Permission | `ALLOW` / `CONFIRM_REQUIRED` / `DENY` 约束判断。 | 替代业务审批、改变预算、推进 Workflow。 |
| Services | 经各领域服务完成闭环协调。 | 绕过 Port、直接改内部状态、增加多 Task 或多 Agent。 |

所有状态变化必须由对应领域服务的公开方法发起；其他领域不得直接修改实体字段或 Repository 中的状态。Evidence 只保存在 Result 与 Audit 中，未来只能作为 Knowledge Candidate 的受控输入，不自动进入 Knowledge Base。

## Repository Port 与 In-memory Adapter

每个可保存 Entity 通过技术栈无关的 Port 描述：

```text
WorkflowRepositoryPort
  create(workflow) -> WorkflowInstance
  getById(workflowId) -> WorkflowInstance | undefined
  update(workflow) -> WorkflowInstance

TaskRepositoryPort
  create(task) -> Task
  getByWorkflowId(workflowId) -> Task | undefined
  update(task) -> Task

ExecutionRepositoryPort
  append(record) -> ExecutionRecord

AuditRepositoryPort
  append(event) -> AuditEvent
  listByWorkflowId(workflowId) -> AuditEvent[]
```

In-memory Adapter 以私有 Map / 列表保存上述 Entity，只在测试和本地 MVP 中使用。它不能泄露可变内部引用；返回值应视为不可变快照。未来数据库 Adapter 必须实现同一 Port，不能反向改变 Domain Contract。

## 核心 Contract

```text
ExecutionContext {
  userRef?: UserRef
  projectRef?: ProjectRef
  intentRef: IntentResultRef
  constraintRefs: ConstraintRef[]
  allowedContextRefs: ContextRef[]
}

Evidence {
  evidenceId: EvidenceId
  source: EvidenceSource
  summary: SafeText
  confidence: ConfidenceLevel
  timestamp: Timestamp
  reference?: EvidenceRef
}

CapabilityResult {
  status: SUCCESS | FAILURE | CANCELLED | BLOCKED
  output: SafeResult
  evidence: Evidence[]
  confidence: ConfidenceLevel
  timestamp: Timestamp
  error?: SafeError
}

GuardDecision = ALLOW | CONFIRM_REQUIRED | DENY
```

Execution Context 只携带受控引用，不加载或复制 User Brain、Project Memory 或 Knowledge Base。Evidence 必须有来源、脱敏摘要、Confidence 和 Timestamp；Audit Event 追加记录 Evidence，但不作 Gate 决策。

## Workflow 与失败状态

正常路径：`CREATED → PLANNING → EXECUTING → VALIDATING → COMPLETED`。

- `CONFIRM_REQUIRED`：进入 `WAITING_APPROVAL`，没有确认不得调用 Mock Capability。
- Capability、Task 或 Workflow 失败：进入 `FAILED`；不得自动重试、替换 Adapter 或创建新 Task。
- 预算超限：进入 `PAUSED` 或 `CANCELLED`；不得自动扩大预算。
- 用户取消或 Kill Switch：进入 `CANCELLED` 并阻止后续调用。
- 需要回滚的未来动作：进入 `ROLLING_BACK`；本阶段只记录状态和 Evidence，不实现真实回滚。

## 最小服务闭环

`RuntimeFoundationService` 按如下顺序协调：

1. 创建 Workflow，并写入创建 Audit。
2. 由 Workflow Service 合法推进到可创建 Task 的状态。
3. 通过 Task Service 创建唯一 Task。
4. Permission / Budget Guard 输出 `ALLOW`、`CONFIRM_REQUIRED` 或 `DENY`。
5. 仅在允许或已确认时，通过 `CapabilityAdapter` 调用 Mock Capability。
6. 写入 ExecutionRecord、Result + Evidence 与 Audit Event。
7. Workflow Service 推进到 `VALIDATING` 和 `COMPLETED`，或根据受控失败推进到相应状态。

## 测试与验收

使用 Node.js Built-in Test Runner 覆盖：

1. 合法和非法 Workflow 转换。
2. 一个 Workflow 仅允许一个 Task。
3. Guard 的三种决定与预算拒绝。
4. Mock Capability 成功与失败 Result。
5. 从 Workflow 到 Task、Capability、Execution Record、Audit Evidence 的完整闭环。
6. Capability 失败、用户取消、预算超限与 `ROLLING_BACK` 记录语义。
7. Evidence 的来源、Confidence、Timestamp 与敏感信息排除。

所有测试仅使用 In-memory Adapter 和 Mock Capability，不能连接网络或调用外部工具。

## 风险与回滚

主要风险是实现时将领域状态修改、审批决策和 Audit 权威混在一起，或为便利引入真实工具与持久化。缓解方式是 Port 边界、私有实体状态、领域服务转换、严格测试和 Gate 复核。

本阶段的“回滚”只针对源码提交：实现应以小而独立的提交交付；若测试或边界验证失败，回退对应提交。Runtime 内的 `ROLLING_BACK` 仍仅为状态与审计语义，不产生真实外部回滚动作。
