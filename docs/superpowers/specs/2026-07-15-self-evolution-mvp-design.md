# Phase 10 Self Evolution MVP 设计规格

## 目标

以最小、只读、确定性的方式验证以下闭环：

```text
Runtime / Audit / Evidence / Capability Snapshots
                    ↓
             Self Observation
                    ↓
    Value & Complexity Analysis
                    ↓
       Optimization Proposal + Evidence References
```

MVP 只输出分析与优化提案；不执行提案、不持久化结果，也不改变任何现有治理或 Runtime 状态。

## 范围与边界

### 包含

- 调用方显式传入四类只读快照：`RuntimeSnapshot`、`AuditSnapshot`、`EvidenceSnapshot`、`CapabilitySnapshot`。
- 从快照中形成可追溯的观察结果。
- 基于确定性规则计算价值、复杂度、风险和证据置信度。
- 生成带证据引用的 `OptimizationProposal`。
- 对输入无效、证据不足或观察无明确问题的情况给出明确结果，而不是猜测。

### 不包含

- 读取内部 Repository、文件系统、网络或外部 Provider。
- 数据采集、持久化、定时运行、自动执行、自动激活 Capability。
- 修改 Runtime Core、Workflow、Task、Agent、Permission、Manifesto、ADR、核心生命周期或项目资产。
- 自动删除 Module、Capability 或其他资产。

## 架构与职责

`SelfEvolutionMvpService` 是纯编排入口，只接收输入并返回结果：

1. `SelfObservationService`：规范化授权快照，提取成功/失败、耗时、人工控制、能力使用与证据覆盖等事实；不判断如何优化。
2. `ValueComplexityAnalysisService`：基于观察结果计算确定性分析结论；不生成或执行变更。
3. `OptimizationProposalGenerator`：仅在有足够证据时生成建议，并将每项建议链接回输入证据；不写入任何记录。

服务不依赖现有 Runtime Repository。未来如需从 Repository 获取数据，应由调用方或独立 Adapter 先转换为相同 Snapshot Contract；该扩展不属于本 MVP。

## Contract

### 输入

`SelfEvolutionSnapshotInput`：

- `runtimeSnapshot`：授权范围内的执行汇总，如任务数量、耗时、预算使用或失败计数。
- `auditSnapshot`：授权范围内的 `AuditEvent` 记录，只用于事实和证据引用。
- `evidenceSnapshot`：可被提案引用的 `Evidence` 记录。
- `capabilitySnapshot`：能力名称、使用次数、成功/失败计数、维护成本信号和状态摘要。

每个快照都必须声明来源引用。服务仅消费传入对象，不扩展扫描范围。

### 观察结果

`SelfObservation` 至少包含：

- 已观察的记录数量与来源引用。
- 执行成功/失败与可用的失败原因。
- 已知资源、耗时与人工确认信号。
- Capability 使用、成功率与维护成本信号。
- 已关联证据与缺失证据。

### 分析结果

`ValueComplexityAnalysis` 至少包含：

- `valueScore`：预期价值信号，范围 0–100。
- `complexityScore`：无价值复杂度信号，范围 0–100。
- `riskLevel`：`LOW`、`MEDIUM` 或 `HIGH`。
- `confidence`：`L1`–`L4`，只可由输入证据支撑。
- 明确的原因与限制。

评分用于排序和解释，不是自动执行许可。

### 优化提案

`OptimizationProposal` 必须包含：

- `proposalId`、`actionType`（`ADD`、`MODIFY`、`MERGE`、`DEPRECATE`、`REMOVE`、`SIMPLIFY`）。
- `problem`、`currentState`、`recommendation`、`expectedValue`。
- `risk`、`impact`、`rollback`、`validationMethod`。
- `evidence`、`confidence`、`limitations`。
- 固定执行边界：`executionAuthorization: 'NONE'`。

没有足够 Evidence 时，生成低置信度观察说明或不生成提案；不得把单次事件固化为长期规则。

## 确定性初始规则

初版只实现少量可解释规则，以验证 Contract：

- 同类失败重复出现且至少有两条相关 Audit/Evidence 时，提出 `SIMPLIFY` 或 `MODIFY` 建议，并标为需要人工评估。
- 能力有维护成本信号但无使用记录时，提出 `DEPRECATE` 候选，而非删除。
- 缺少足够 Evidence、或只有单次异常时，不生成强结论；保留在观察结果中并标为 `L1` 或 `L2`。

`ADD`、`MERGE` 与 `REMOVE` 是 Contract 支持的动作类型，但 MVP 不因推测自动提出删除或新增能力的建议。

## 错误处理与无副作用保证

- 缺少快照来源、Evidence 引用不一致或数值非法：拒绝输入并返回明确错误。
- 审计或证据为空：允许观察，但不得生成高置信度提案。
- 所有返回对象为新结果对象；调用方输入保持不变。
- 实现不得调用 Repository、文件系统、网络、Provider 或写入 Audit/Knowledge。

## 测试策略

测试以 TDD 实现，至少覆盖：

1. 有授权快照时生成观察、分析与可追溯提案。
2. 提案关联准确的 Audit/Evidence 引用。
3. 重复失败触发确定性优化建议。
4. 未使用但有维护成本的 Capability 仅产生 `DEPRECATE` 候选。
5. 单次事件或证据不足不产生强提案，且置信度受限。
6. 缺少来源或不一致 Evidence 被拒绝。
7. 输入对象未被修改，且无外部副作用。
8. 任意 Proposal 的 `executionAuthorization` 固定为 `NONE`。

## 验收标准

- 可通过显式 Snapshot 验证完整“观察 → 分析 → 提案”闭环。
- 每份提案都可回溯至授权 Evidence。
- 不引入数据采集、持久化或对现有 Runtime 的直接查询。
- 不产生系统修改、Capability 激活、资产删除或自动执行入口。
