# Phase 10 Controlled Real Target Integration 设计规格

## 目标

为 Phase 10 设计从 Optimization Proposal 到真实但非权威 Markdown 目标的受控接入路径。该设计解决 Proposal、Risk Assessment、Autonomy Decision 与执行请求之间缺少明确连接的问题。

本设计不实现文件读取、文件写入、自动优化、持久化组件或 Runtime Core 改动。真实文件写入即使被评估为 `AUTO_EXECUTE`，也必须在执行前取得一次明确人工确认。

## 架构

```text
Optimization Proposal
  → Risk Assessment
  → Autonomy Decision
  → Real Target Execution Request (read-only preflight)
  → Before Snapshot + Eligibility Check
  → Explicit Confirmation
  → Single Bounded Write
  → After Snapshot + Validation Evidence
  → Persistent Audit
  → Completed / Rollback
```

`AUTO_EXECUTE` 只表示候选优化具有进入受控执行路径的资格；它不构成对真实文件的写入授权。真实目标请求在确认前只允许读取必要的白名单目标并建立快照，不得变更内容。

## Proposal Routing

Proposal Routing 不改变现有 `OptimizationProposal` Contract。它为 Proposal 创建独立的、未来可实现的 Real Target Execution Request，其中引用而非复制：

- `proposalReference`：问题、Evidence、推荐、价值、风险、回滚与验证方法的来源；
- `riskAssessmentReference`：影响范围、可逆性、数据/权限、外部副作用、Gate 和 Evidence 完整度的评估；
- `autonomyDecision`：仅接受已定义的五级控制词汇；
- `authorizedTargetReferences`：用户显式列举的目标文件；
- `authorizationState`：`PREFLIGHT_ONLY`、`WAITING_CONFIRMATION`、`CONFIRMED`、`STOPPED`、`EXPIRED`；
- `validationPlanReference`、`rollbackPlanReference`、`auditRequirements`。

路由只允许将同时具有有效 Proposal、Risk Assessment、Autonomy Decision 和显式目标白名单的候选送入预检。任一引用缺失、Evidence 冲突或风险未知时，停止路由并升级为 `CONFIRM_REQUIRED`。

## Real Target Boundary

第一版真实目标仅可为调用方逐项明确白名单的、项目范围内的非权威 Markdown 文件。每份请求限定单一文件或预先枚举的小型集合，不得目录扫描、通配符匹配、跨项目扩展或由 Runtime 推断新目标。

无条件禁止：Manifesto、ADR、Master Plan、Module Registry、Project Memory、Development Progress、README、任何 Gate、生命周期/权限/安全文件、Runtime 文档与实现、代码、配置、数据库、Capability/Knowledge 记录和任何系统边界文件。

执行侧必须独立重复检查禁止列表与白名单，不能只信任路由结论。文件路径必须解析为项目根目录内的实际目标；符号链接、相对路径逃逸、文件类型不符、白名单不一致或确认前内容漂移均应停止。

## Execution Authorization Flow

1. **Preflight**：读取显式白名单目标，验证其非权威身份、类型、路径范围和基线状态，创建 Before Snapshot。
2. **Eligibility**：确认 Proposal、风险、Autonomy Decision、白名单、验证方案与回滚方案仍一致。此时任何 `AUTO_EXECUTE` 只能进入 `WAITING_CONFIRMATION`。
3. **Confirmation**：用户明确确认具体 Proposal、目标列表、预期动作与 Before Snapshot 标识。确认仅授权一次请求，不授权未来同类文件。
4. **Bounded Write**：仅对确认时的白名单内容执行既有确定性 Markdown 动作；不允许附带修改、跨目标扩展或二次优化循环。
5. **Validation / Rollback**：建立 After Snapshot，生成验证 Evidence；验证失败、内容漂移、授权过期或停止信号触发时恢复 Before Snapshot。

`CONFIRM_REQUIRED` 与 `MANDATORY_APPROVAL` 不得被本设计降级；`MANDATORY_APPROVAL` 项目根本不进入真实目标执行链路。

## Real File Safety Model

每个目标必须拥有：

| 项目 | 要求 |
| --- | --- |
| Before Snapshot | 文件内容、内容摘要、时间、路径规范化结果和基线引用。 |
| After Snapshot | 实际写入后的内容、内容摘要、时间和变更范围。 |
| Rollback Reference | 指向 Before Snapshot 的可恢复引用；写入前必须可用。 |
| Drift Check | 在确认后、写入前再次比较当前内容摘要与 Before Snapshot。 |
| Validation Evidence | 范围、结构、语义保持、动作边界、回滚可用性及恢复结果。 |

不支持无法原子恢复的写入、部分成功继续、删除、迁移、覆盖不可恢复内容或同时执行多个独立 Proposal。写入出错时优先停止；已写入但未通过验证时必须回滚。

## Persistent Audit

未来持久审计复用既有 Audit 语义，不授予权限，也不替代 Gate。每次请求至少持久记录：

- Proposal、Risk Assessment、Autonomy Decision 与确认引用；
- 授权状态变化及确认时间；
- 白名单和实际 Changed Scope；
- Before/After/Rollback Snapshot 引用与内容摘要；
- Validation Evidence、结果、失败阶段与回滚结果；
- Stop Control 事件（如触发）。

第一版持久化位置固定为项目根目录的 `.ai-cto/audit/`。每次请求向一个追加式 JSON Lines 文件写入事件；该目录属于本地运行数据并由 `.gitignore` 排除，不进入 Git 历史，也不构成新的 Module。

Audit 内容必须是可追溯元数据与 Evidence 引用；不应把完整敏感内容写入审计。审计写入失败时，执行必须停止，且在已经写入目标时进入回滚路径。

## Stop Control 与失败处理

复用 Runtime Kill Switch 与人工停止权：

- **确认前停止**：取消请求，保留预检 Audit，不写入任何文件。
- **写入前停止**：阻断 Bounded Write，标记 `STOPPED`。
- **写入后、验证前停止**：恢复 Before Snapshot，记录回滚 Evidence。
- **验证失败或 Drift**：停止后续动作、回滚、持久记录失败原因与恢复结果。
- **Audit 失败**：若尚未写入则停止；若已写入则回滚后再以可用的最小安全路径保留失败 Evidence。

Stop Control 不允许删除 Evidence、绕过 Gate 或把高风险请求降级。

## 保持边界

本设计不实现自动架构修改、自动删除能力、自动修改核心治理、权限变更、Runtime Core 改动、真实 Provider/Agent/工具接入或无确认的真实文件写入。现有 Self Evolution MVP、`OptimizationProposal.executionAuthorization = NONE`、内存级 Optimization Execution MVP 均保持不变。

## 验收标准

- Proposal、Risk Assessment、Autonomy Decision 和真实目标请求之间有明确、可追溯的引用关系。
- 真实目标边界只允许显式白名单的非权威 Markdown 文件，并在路由和执行两层拒绝禁止资产。
- `AUTO_EXECUTE` 不会绕过真实写入前的明确确认。
- Before/After Snapshot、漂移检测、验证、回滚、持久审计和停止控制都有明确责任与失败路径。
- 没有新增 Module、没有修改 Runtime Core、没有改变当前执行授权或实现真实写入。
