# Phase 10 Optimization Execution MVP 设计规格

## 目标

在不改变现有 Self Evolution MVP 合同或代码的前提下，为未来最小优化执行能力定义受控边界。

该设计只覆盖已被风险评估为 `AUTO_EXECUTE` 或 `AUTO_WITH_VALIDATION` 的低风险候选优化；它不把 Proposal 直接变成当前可执行动作。

目标链路为：

```text
Optimization Proposal
  → Risk Assessment
  → Autonomy Decision
  → Execution Eligibility Check
  → Bounded Documentation Optimization
  → Validation Evidence
  → Audit / Rollback
```

## 范围

包含：

- 定义未来优化执行的最小输入、授权范围、验证证据和回滚边界。
- 定义第一版允许的低风险优化类型：仅限明确授权的非权威 Markdown 文档中的结构整理、重复信息整理和格式规范化。
- 区分 `AUTO_EXECUTE` 与 `AUTO_WITH_VALIDATION` 的准入条件。
- 定义验证失败、范围越界、证据不足和回滚不可用时的降级与停止规则。

不包含：

- 修改 `self-evolution/` 下的现有 Contract、服务、测试或行为。
- 自动执行、自动写入、自动删除或自动应用任何优化。
- 新增 Module、Phase、审批系统、Gate、Agent 或 Runtime 执行组件。
- 修改 Runtime Core、Permission Model、Manifesto、ADR、核心生命周期、安全边界或系统边界。
- 修改 Module Registry、Development Progress、Project Memory、Master Plan 或任何项目状态记录。

当前 Self Evolution MVP 继续保持：`Snapshot → Observation → Analysis → Optimization Proposal`，且 `executionAuthorization` 固定为 `NONE`。

## 执行范围

第一版未来仅可处理调用方逐项明确授权的、非权威的 Markdown 文档资产。每次执行应限定为单一文档或预先枚举的小型文档集合；不得进行目录扫描、隐式扩展范围或跨项目处理。

允许的目标资产必须同时满足：

1. 不承载系统权威、项目状态、审批结论、正式决策或 Gate 结果。
2. 不包含敏感信息、访问凭据或受限数据。
3. 在执行前可获得基线版本引用与可恢复副本。
4. 可以通过明确、可复现的验证方法确认变化未改变语义。

以下资产永久排除在 MVP 自动优化范围外：`README.md`、Manifesto、ADR、Master Plan、任何 Gate、Module Registry、Project Memory、Development Progress、生命周期文件、权限与安全规则、Runtime 架构及实现文档。

## 支持的优化类型

第一版仅支持不改变规范含义的 `SIMPLIFY` 类动作：

| 类型 | 允许的变化 | 例子 |
| --- | --- | --- |
| 结构整理 | 标题层级、列表与段落顺序的等价整理 | 将同一主题下连续的重复小节收敛为一个小节。 |
| 重复信息整理 | 合并完全重复或可证明等价的说明，并保留必要来源引用 | 删除同一文档内逐字重复的定义。 |
| 格式规范化 | 空行、列表缩进、标题格式、表格列对齐等表现层调整 | 修复 Markdown 列表缩进或多余空行。 |

不支持任何会改变事实、规则、决策、版本、状态、日期、标识符、引用指向、责任归属或行为要求的动作。语义不确定时必须停止，不得猜测或“顺带修正”。

## 风险边界与自主等级

`AUTO_EXECUTE` 只可用于完全确定、机械化、可逆的格式或重复整理，且必须满足：授权范围明确、无外部副作用、不会影响权威资产或 Gate、基线与回滚可用、验证可自动完成。

`AUTO_WITH_VALIDATION` 可用于影响受限但需要额外验证的结构或重复整理，且必须满足：变更边界明确、语义保持方法明确、验证证据可产生、回滚路径可用。

若存在任一情形，必须降级为 `CONFIRM_REQUIRED`，当前不得执行：

- Proposal、风险等级、授权目标或行动范围不完整。
- Evidence 不足、相互矛盾或不适用于目标文档。
- 需要解释或推断文档语义才能完成整理。
- 验证方法不可执行、验证失败或回滚路径不清晰。
- 目标涉及权威文件、项目状态、接口、代码、配置、数据、权限、网络、Git 或外部系统。

涉及 Runtime Core、Permission、Manifesto、ADR、核心生命周期、安全边界、系统边界、模块删除或大规模架构变化的 Proposal 始终为 `MANDATORY_APPROVAL`，不属于本 MVP。

## 未来执行合同

该合同仅描述未来 Runtime 实现所需的输入，不扩展当前 `OptimizationProposal` 实体：

| 字段 | 用途 |
| --- | --- |
| `proposalReference` | 引用既有 Optimization Proposal 与其 Evidence。 |
| `riskAssessmentReference` | 引用已完成的风险评估和 Autonomy Decision。 |
| `authorizedTargetReferences` | 明确、有限的非权威目标资产列表。 |
| `baselineReferences` | 每个目标的执行前版本、内容摘要或等价可恢复基线。 |
| `actionBoundary` | 允许的优化类型、禁止变化和最大影响范围。 |
| `validationPlan` | 执行后必须生成的结构、范围与语义保持验证。 |
| `rollbackPlan` | 触发条件、恢复基线的方法和恢复验证方式。 |
| `evidenceRequirements` | 执行、验证与回滚必须写入的 Audit/Evidence 项。 |

未来实现只能消费通过 Eligibility Check 的合同；它不得自行扩大目标、变更动作类型、提升自主等级或替代既有 Gate。

## 验证模型

每次未来执行至少生成以下 Validation Evidence：

1. **范围验证**：实际变更仅发生在 `authorizedTargetReferences` 中，且未触碰排除资产。
2. **结构验证**：Markdown 结构仍有效；标题层级、列表与表格没有被破坏。
3. **语义保持验证**：确认没有改变事实、规则、决策、状态、标识符、引用或责任归属。
4. **动作验证**：实际动作属于 `actionBoundary` 中允许的类型。
5. **回滚可用性验证**：基线可以恢复，并已记录恢复所需的引用。

任何验证失败、缺失或产生冲突时，未来执行必须停止；`AUTO_WITH_VALIDATION` 不能把失败结果解释为成功。

## 回滚策略

未来执行前必须先获得目标资产的基线引用。执行或验证失败时：停止后续动作、恢复所有已变更目标到基线、生成恢复结果的 Evidence，并将执行标记为未完成。

MVP 不支持删除、迁移、覆盖不可恢复内容或跨资产的部分成功继续执行。无法安全回滚时，任务不得进入自动执行。

## Human Control 边界

本设计不建立新的审批系统，继续复用现有 Human Control、Runtime Safety Boundary、Audit 和适用 Gate：

- 只有 Eligibility Check 明确满足条件的 `AUTO_EXECUTE` / `AUTO_WITH_VALIDATION` 候选，才是未来自动执行的设计对象。
- 当前实现没有任何执行授权；所有 Proposal 仍只可分析与分类。
- 人类可在未来实现中停止执行、要求确认或否决任何候选动作；这些控制不得被自主等级覆盖。
- `CONFIRM_REQUIRED` 和 `MANDATORY_APPROVAL` Proposal 不得进入本 MVP 的自动执行链路。

## 验收标准

- 文档明确限定为非权威文档的结构、重复与格式整理。
- 明确列出永远排除在 MVP 自动执行外的核心治理与状态资产。
- `AUTO_EXECUTE`、`AUTO_WITH_VALIDATION` 的准入、验证、停止与回滚规则可区分且无默认放行。
- 未来执行合同不修改当前 Self Evolution MVP Contract 或代码。
- 不创建 Module、Phase、Gate、审批系统或自动执行实现。
