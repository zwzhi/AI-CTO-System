# Documentation Capability MVP Test Plan

## 1. 测试目标

验证 Evidence-driven Documentation Assistant MVP 能在不访问文件系统、网络、Provider 或外部工具的前提下，通过 Documentation Capability Adapter 输出完整 Draft Package，并将结果追加为 Audit Evidence。

所有测试使用固定时间、内存请求和确定性执行体；不读取真实项目文件，不创建或修改任何文件。

## 2. 测试层级

| 层级 | 范围 | 目标 |
|---|---|---|
| Unit | Contract、Deterministic Assistant、Adapter preflight | 验证单一职责与受控失败 |
| Integration | Request → Adapter → Assistant → Outcome → Audit | 验证最小运行闭环与不改变 Workflow |
| Boundary | 只读来源、无写入、无 Provider、无 Knowledge 写入 | 验证禁止项无法进入调用路径 |

## 3. 必测场景

| ID | 场景 | 输入 / 条件 | 期望结果 |
|---|---|---|---|
| DOC-01 | 成功草案 | 一个已授权、可定位来源与有效权限 | `SUCCESS`；五项输出齐全；Draft 只引用该来源；Audit 已追加 |
| DOC-02 | Evidence-first | 多个已授权来源 | 每个 Draft 关键结论先有来源 Evidence；引用与 Evidence 属于来源子集 |
| DOC-03 | 来源为空 | `authorizedSources` 为空 | `BLOCKED`；执行体未被调用；Audit 记录失败原因 |
| DOC-04 | 来源未授权 | 来源 `sourceRef` 不在 `allowedContextRefs` | `BLOCKED`；不生成 Draft；Audit 记录来源范围失败 |
| DOC-05 | 来源不可定位 | 缺少 `location` | `BLOCKED`；不调用执行体 |
| DOC-06 | 权限拒绝 | 缺少、过期或不含 `GENERATE_DRAFT` 的 Permission Grant | `BLOCKED`；执行体未被调用 |
| DOC-07 | 预算超限 | Budget Guard 返回拒绝 | `BLOCKED`；使用量为零；执行体未被调用 |
| DOC-08 | 用户取消 | 请求标记取消 | `BLOCKED`；执行体未被调用；Audit 可追溯 |
| DOC-09 | 输出合同无效 | 注入返回缺少五项字段之一的 Invocation Port | `FAILURE` 或 `BLOCKED`；不把不完整输出当作成功 |
| DOC-10 | 未引用事实 | 注入包含超范围引用或无 Evidence 的输出 | `FAILURE`；返回可追溯性失败 |
| DOC-11 | Audit 完整性 | 成功与失败调用各一次 | Audit 包含 Task、Workflow、Input References、Output Reference、Evidence、预算和失败信息 |
| DOC-12 | Runtime 状态边界 | 调用 Documentation Runtime Service | 不调用 WorkflowService、不改变 Workflow / Task / Knowledge / Registry 状态 |
| DOC-13 | 无外部副作用 | 代码范围扫描与执行测试 | 无文件系统、网络、Provider、MCP、CLI、数据库或 Knowledge 写入依赖 |

## 4. 验收标准

1. 新增测试与现有测试全部通过。
2. `DocumentationResult` 的 `draft`、`sourceReferences`、`confidence`、`evidence`、`limitations` 均在成功结果中非空。
3. 所有 `sourceReferences` 和 Evidence 的 `reference` 都属于请求的 Authorized Source Scope。
4. 空来源、未授权来源、不可定位来源、权限拒绝、预算超限和取消均在调用执行体前阻断。
5. 对无效输出或无 Evidence 的 Draft，Adapter 不得报告 `SUCCESS`。
6. 每个结果（成功或失败）均有追加的 Audit Evidence；Audit 不触发 Knowledge 回写。
7. 代码范围仅限文档专用 Contract、Port、Adapter、确定性执行体、Runtime Service、测试和测试脚本；通用 Runtime Core 不变。

## 5. 不在测试范围

- 真实文件读取、目录扫描、文档写入或 Git 操作；
- Provider、模型、API、MCP、网络、CLI 或外部工具调用；
- Capability Candidate、Registry、Activation 或 Provider Evaluation；
- Workflow 推进、自动调度、Agent 协作、Knowledge ACTIVE 写入；
- 文档内容的语言质量、语义正确性或生产性能基准。
