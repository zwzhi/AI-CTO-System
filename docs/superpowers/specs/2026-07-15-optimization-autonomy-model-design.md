# Phase 10 Optimization Autonomy Model 设计规格

## 目标

为 Phase 10 Self Evolution 在 `Optimization Proposal` 之后定义风险驱动的自主程度，而不是把所有优化统一置于人工决策前等待。

该模型的完整逻辑链为：

```text
Observation → Analysis → Optimization Proposal
                         ↓
                   Risk Assessment
                         ↓
                  Autonomy Decision
                         ↓
              Execute / Confirm / Block
                         ↓
                Validation Evidence
```

## 范围

本次仅更新 Phase 10 架构与治理文档。

包含：

- 在现有 Self Evolution 架构中定义 Risk Assessment、Autonomy Decision 和未来 Execution Authorization 的职责与边界。
- 定义五级自主决策词汇及其准入条件。
- 说明 Proposal、现有 Human Control、Audit、Evidence、Runtime 与既有 Gate 的关系。
- 同步 Master Plan、Module Registry、Project Memory、Development Progress 的 Phase 10 设计状态。

不包含：

- 修改 `self-evolution/` 下的 MVP Contract、服务、测试或行为。
- 增加 Proposal 字段、执行授权代码、自动执行、自动文件修改、自动删除、自动 Capability 激活。
- 增加 Module、Phase、审批系统、Evolution Agent 或新的 Gate。
- 修改 Runtime Core、Permission Model、Manifesto、ADR、核心生命周期或现有通用 Runtime Human Control Model。

## 设计位置

采用“现有架构内嵌”方案：将 `Optimization Autonomy Model` 作为 `SELF_EVOLUTION_ARCHITECTURE.md` 的新章节，不创建独立治理入口。它是 Phase 10 的专属控制解释层；通用 Runtime Human Control Model 仍保持原有权威和词汇。

## Risk Assessment

每份 Optimization Proposal 在未来进入执行面前，必须基于其 Evidence 评估以下维度：

| 维度 | 判断内容 |
|---|---|
| 影响范围 | 是否仅影响隔离、内部、非权威资产；是否触及项目行为、用户、生产或多个模块。 |
| 可逆性 | 是否有经验证的低成本回退路径；是否可能造成不可逆数据、语义或治理历史损失。 |
| 数据与权限 | 是否访问敏感数据、扩大权限、修改身份或改变安全边界。 |
| 外部副作用 | 是否调用网络、工具、Provider、文件、Git、部署或第三方系统。 |
| Gate 影响 | 是否改变或绕过既有 Design、Testing、Release、Delivery、Security 或 Lifecycle Gate。 |
| Evidence 完整度 | 是否能用当前、可追溯、适用的 Evidence 支持问题、预期价值和验证方法。 |

任何维度为未知、证据不足或存在冲突时，决策不得下调为自动执行。

## Autonomy Decision

| 决策 | 适用条件 | 未来执行要求 |
|---|---|---|
| `AUTO_EXECUTE` | 低风险、无外部副作用、仅内部非权威资产、明确可逆且不影响 Gate。 | 仅在 Runtime 明确实现并授权后执行；保留完整 Audit 与结果 Evidence。 |
| `AUTO_WITH_VALIDATION` | 低至中风险、可逆、影响受限，且存在可执行的验证方法。 | 执行后必须生成 Validation Evidence；验证失败时停止后续动作并按可逆性回退。 |
| `NOTIFY` | 中风险、影响可控且执行边界明确。 | 在授权执行后通知用户或责任人，附 Evidence、影响与验证结果。 |
| `CONFIRM_REQUIRED` | 影响项目行为、文件、配置、用户体验或跨模块接口，但仍可控、可回退。 | 执行前取得明确确认；确认不替代适用 Gate。 |
| `MANDATORY_APPROVAL` | 触及 Runtime Core、Permission Model、Manifesto、ADR、核心生命周期、安全边界、大规模架构变化、生产发布或不可逆影响。 | 必须由授权人批准，并遵守已存在的 Gate、Audit 与回滚规则。 |

`AUTO_EXECUTE`、`AUTO_WITH_VALIDATION` 和 `NOTIFY` 是未来执行面可采用的策略，不是当前授权。它们不允许降低 `MANDATORY_APPROVAL` 项目，也不能覆盖现有 Gate。

## Proposal 与执行授权关系

Proposal 保留为问题、Evidence、建议、价值、风险、影响、回滚和验证方法的容器。Risk Assessment 在未来为 Proposal 给出 Autonomy Decision；Execution Authorization 只在 Runtime 实现阶段才可作为受控执行数据出现。

当前 Self Evolution MVP 的 `OptimizationProposal.executionAuthorization` 固定为 `NONE`。该限制继续有效：本设计不修改 Contract，不允许当前 MVP 执行、通知、写入或删除任何内容。

## 安全与反复杂度边界

- 自主决策只复用现有 Runtime、Audit、Evidence、Human Control、Capability Governance 与适用 Gate；不增加审批流程或管理模块。
- Risk Assessment 不能把核心治理、权限、安全或不可逆操作降级为自动执行。
- 即使满足低风险条件，Evidence 不完整、验证不可执行或回退不明确时，也必须升级为 `CONFIRM_REQUIRED` 或 `MANDATORY_APPROVAL`。
- 执行自动化的未来实现必须支持停止、审计、验证失败处理和可逆回退；这些是 Runtime 实现前置条件，不是本次实现内容。

## 验收标准

- Phase 10 文档明确不再把全部 Proposal 默认解释为“必须人工决策”。
- 五种 Autonomy Decision 均有适用条件、边界和未来执行要求。
- 现有 Self Evolution MVP 仍保持纯分析与提案、`executionAuthorization: NONE`。
- 不创建 Module、Phase、审批系统、新 Gate 或任何自动执行代码。
