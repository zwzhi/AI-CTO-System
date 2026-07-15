# Phase 10 Optimization Execution MVP Design

## 1. Execution Scope

本设计定义未来 Phase 10 的最小、受控优化执行边界。它只描述已完成 `Optimization Proposal → Risk Assessment → Autonomy Decision` 后，如何在低风险范围内执行和验证优化；它不改变当前 Self Evolution MVP。

未来受控执行路径为：

```text
Optimization Proposal
  → Risk Assessment
  → Autonomy Decision
  → Execution Eligibility Check
  → Bounded Documentation Optimization
  → Validation Evidence
  → Audit / Rollback
```

第一版仅允许处理调用方逐项明确授权的非权威 Markdown 文档。一次执行只能覆盖单一文档，或预先枚举的小型文档集合；不得扫描目录、隐式加入文件、跨项目扩展范围，或基于推断扩大授权。

目标资产必须同时满足：

1. 不承载系统权威、项目状态、审批结论、正式决策或 Gate 结果。
2. 不包含敏感信息、访问凭据或受限数据。
3. 执行前存在可引用的基线版本，并能安全恢复。
4. 存在明确、可复现的语义保持验证方法。

以下资产永久排除在本 MVP 的自动执行范围之外：`README.md`、Manifesto、ADR、Master Plan、任何 Gate、Module Registry、Project Memory、Development Progress、生命周期文件、权限与安全规则、Runtime 架构及实现文档。

当前 Self Evolution MVP 继续保持 `Snapshot → Observation → Analysis → Optimization Proposal`；`OptimizationProposal.executionAuthorization` 固定为 `NONE`。本设计不会授予当前 MVP 执行、通知、写入、激活或删除权限。

## 2. Supported Optimization Types

第一版只支持语义不变的 `SIMPLIFY` 类文档动作：

| 类型 | 允许的变化 | 示例 |
| --- | --- | --- |
| 结构整理 | 等价调整标题层级、列表、段落顺序 | 将同一主题下连续的重复小节整理为单一小节。 |
| 重复信息整理 | 合并逐字重复或可证实等价的说明，并保留必要引用 | 移除同一非权威文档内重复出现的定义。 |
| 格式规范化 | 修复空行、列表缩进、标题格式和表格表现层问题 | 修正 Markdown 列表缩进或冗余空行。 |

不支持修改事实、规则、决策、版本、状态、日期、标识符、引用指向、责任归属或行为要求。任何需要解释、推断或补充语义的动作都不属于该 MVP。

## 3. Risk Boundary

只有 `AUTO_EXECUTE` 和 `AUTO_WITH_VALIDATION` 候选可被未来 MVP 考虑；两者都是未来执行策略，不是当前授权。

`AUTO_EXECUTE` 仅适用于完全确定、机械化、可逆的格式规范化或精确重复清理，并且必须同时满足：

- 授权目标和动作范围明确；
- 不存在网络、工具、Provider、Git、部署或其他外部副作用；
- 不影响权威资产、项目状态、Gate 或系统行为；
- 基线和回滚路径可用；
- 自动验证能够确认其属于允许的动作并保持结构有效。

`AUTO_WITH_VALIDATION` 仅适用于影响受限、可逆、但需要额外语义保持验证的结构整理或重复信息合并，并且必须同时满足：

- 变化边界和允许动作明确；
- 语义保持的验证方法明确且可执行；
- 执行后能生成 Validation Evidence；
- 回滚路径在执行前已准备完成。

以下任一情况必须停止并升级为 `CONFIRM_REQUIRED`，不得自动执行：Proposal、风险结论、授权目标或动作范围不完整；Evidence 不足、冲突或不适用；语义存在歧义；验证失败或不可执行；回滚不可用；目标涉及代码、配置、数据、权限、网络、Git、外部系统、项目行为或权威文件。

涉及 Runtime Core、Permission Model、Manifesto、ADR、核心生命周期、安全边界、系统边界、模块删除或大规模架构变化的 Proposal 始终是 `MANDATORY_APPROVAL`，不属于本 MVP。

## 4. Execution Contract

未来 Runtime 实现应以独立执行合同消费既有 Proposal，不扩展或修改当前 `OptimizationProposal` Contract。该未来合同至少需要以下字段：

| 字段 | 用途 |
| --- | --- |
| `proposalReference` | 引用既有 Optimization Proposal 及其 Evidence。 |
| `riskAssessmentReference` | 引用已完成的风险评估与 Autonomy Decision。 |
| `authorizedTargetReferences` | 枚举明确授权的非权威目标资产。 |
| `baselineReferences` | 记录每个目标的执行前版本、内容摘要或等价可恢复基线。 |
| `actionBoundary` | 声明允许的优化类型、禁止变化和最大影响范围。 |
| `validationPlan` | 说明执行后所需的范围、结构与语义保持验证。 |
| `rollbackPlan` | 说明停止条件、基线恢复步骤和恢复验证方式。 |
| `evidenceRequirements` | 规定执行、验证与回滚必须保留的 Audit/Evidence。 |

Execution Eligibility Check 必须验证以上字段完整一致，并验证自主等级与目标资产、动作类型相匹配。未来执行实现不得自行扩大目标、改变动作类型、提升自主等级、绕过 Human Control 或替代既有 Gate。

## 5. Validation Model

未来执行成功前，必须产生以下 Validation Evidence：

1. **范围验证**：实际变更仅发生于 `authorizedTargetReferences`，且未触碰排除资产。
2. **结构验证**：Markdown 结构仍有效，标题层级、列表和表格未被破坏。
3. **语义保持验证**：未改变事实、规则、决策、状态、标识符、引用或责任归属。
4. **动作验证**：实际变化符合 `actionBoundary` 中允许的 `SIMPLIFY` 动作。
5. **回滚可用性验证**：基线可恢复，且恢复所需引用已被审计记录。

任何验证缺失、失败或发生冲突时，未来执行必须停止。`AUTO_WITH_VALIDATION` 不得将失败或不确定结果解释为成功，也不得继续处理后续目标。

## 6. Rollback Strategy

未来执行开始前，必须已获得每个目标资产的基线引用。执行或验证失败时，应立即停止后续动作，恢复所有已变更目标到基线，生成恢复结果的 Evidence，并将执行结果记录为未完成。

本 MVP 不支持删除、迁移、覆盖不可恢复内容或跨资产的部分成功继续执行。任何无法安全回滚的候选优化都不得进入自动执行。

## 7. Human Control Boundary

本设计不创建新的审批系统，继续复用现有 Human Control、Runtime Safety Boundary、Audit 和适用 Gate：

- 只有通过 Eligibility Check 的 `AUTO_EXECUTE` 或 `AUTO_WITH_VALIDATION` 候选，才是未来自动执行的设计对象。
- 当前实现没有任何 Execution Authorization；所有 Proposal 仍仅用于分析和分类。
- 人类可在未来实现中停止、要求确认或否决任何候选动作；自主等级不得覆盖该控制权。
- `CONFIRM_REQUIRED` 与 `MANDATORY_APPROVAL` Proposal 永远不得进入本 MVP 的自动执行链路。
- 未来执行必须保留 Audit、Evidence、Validation Evidence 和可恢复基线；不得绕过既有 Gate 或修改核心治理权威。
