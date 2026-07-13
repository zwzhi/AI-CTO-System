# KN-FAIL-0001：非规范状态和范围证据不足会导致过早治理决策

## Record Identity

| Field | Value |
|---|---|
| Knowledge ID | `KN-FAIL-0001` |
| Title | 非规范状态和范围证据不足会导致过早治理决策 |
| Type | Failure Experience |
| Source Project | `AI-CTO-System`，提交 `201b446` 与 `2ea04e2` |
| Owner | AI CTO System Maintainer |
| Record Version | `1.0.0` |
| Created Time | `2026-07-13T19:30:00+08:00` |
| Lifecycle Status | `VALIDATING` |
| Last Validated | `NOT_VALIDATED` |
| Next Review | `2026-08-13T00:00:00+08:00` |
| Related ADR | [ADR-0011](../../docs/adr/ADR-0011-CAPABILITY-GOVERNANCE.md)、[ADR-0012](../../docs/adr/ADR-0012-KNOWLEDGE-GOVERNANCE.md) |

## Knowledge Content

### Background

Capability Governance 压力测试在正确拒绝高风险能力时仍产生非规范 Registry Status；Knowledge Governance 冲突基线又使用 `Candidate / Provisional`，并在新项目离线需求未知时过早给出 PostgreSQL 默认方向。两次都通过加强状态契约、范围检查和 `REVALIDATE` 规则修正。

### Problem

观察到的失败是：执行者用自然语言近义词替代权威状态，或把旧知识的高 Evidence、较新公开资料、已有架构草稿和截止压力组合成超出适用范围的结论。这样会让格式、证据和授权边界失真。

### Solution

在状态驱动治理中拒绝非规范状态；把 Evidence Level 与当前范围 Confidence 分开；适用范围未知时保持 `VALIDATING` 或使用 `REVALIDATE`；不把已有草稿、较新资料、负责人意见或时间压力当作决定性 Evidence。

### Applicable Scenario

AI CTO System 类 AI 辅助治理任务，其中 Registry Status、Knowledge Status、适用范围和 Evidence 会影响后续选择、激活、架构或 Gate。

### Non Applicable Scenario

不涉及权威状态、权限或下游决策的自由讨论；已经有独立实验直接证明当前场景结论的简单选择；允许开放标签且不会被自动解释为授权的记录系统。

### Limitations

“导致过早决策”是对两个内部压力场景的因果归纳，尚未通过独立项目或对照实验隔离状态词汇、上下文位置、模型行为和截止压力的影响。Observed failure 为 L3，通用因果 Confidence 仅 L2。

### Risk If Misapplied

把该失败经验升级为通用禁令会造成所有不确定决策长期停留验证、抑制合理判断；把任何非标准措辞都当作严重故障会忽略真正的语义和风险问题。

## Knowledge Admission Review

| Review Field | Value |
|---|---|
| Knowledge Type | Failure Experience |
| Source Evidence | Development Progress 中 Capability / Knowledge 压力测试、SKILL 快速契约、提交 `201b446` 与 `2ea04e2` |
| Evidence Level | `L3`：失败输出和修正规则在当前项目真实发生并记录 |
| Confidence | `L2`：失败事实可信，但跨项目因果和普遍性尚无独立验证 |
| Applicable Scenario | 状态、范围和 Evidence 会驱动授权的 AI 辅助治理任务 |
| Non Applicable Scenario | 自由文本、开放标签、没有下游授权含义或已有直接当前证据的场景 |
| Risk If Misapplied | 过度保守、验证停滞、用格式检查替代语义判断 |
| Validation Requirement | 在独立治理项目复现；分别改变状态契约、范围证据和时间压力；比较过早决策率与错误阻断率 |
| Review Disposition | `ACCEPT_FOR_VALIDATION`；保持 `VALIDATING`，不授权 `VALIDATED` 或 `ACTIVE` |

## Evidence

| Evidence ID | Source / Version | Observation | Supports | Limitations |
|---|---|---|---|---|
| `FAIL-E1` | [Development Progress](../../docs/DEVELOPMENT_PROGRESS.md) | Capability 场景连续产生或忽略非规范状态，入口契约后复测通过 | 非规范状态风险真实存在 | 未隔离模型、上下文位置等变量 |
| `FAIL-E2` | [Development Progress](../../docs/DEVELOPMENT_PROGRESS.md) | Knowledge 冲突基线出现非规范状态与范围未知时过早选择 | 范围证据不足与过早结论同时出现 | 单次模拟，不证明因果 |
| `FAIL-E3` | [SKILL](../../SKILL.md) | 当前规则要求封闭状态、`REVALIDATE` 和禁止用草案 / 截止时间选定结论 | 修正措施已经固化 | 规则存在不等于长期效果 |
| `FAIL-E4` | Git commits `201b446`、`2ea04e2` | 两次修正有可追溯提交 | 事件与治理变更可核验 | 同一项目，不满足独立重复验证 |

## Confidence Level

- Evidence Level：`L3`
- Confidence Level：`L2`
- Rationale：失败输出和修正动作属于真实项目证据；“这些因素普遍导致过早决策”的因果主张缺少独立复现。

## Quality Score

| Dimension | Score | Maximum | Rationale |
|---|---:|---:|---|
| Accuracy | 19 | 25 | 事件记录可信，因果仍待隔离 |
| Reuse Value | 15 | 20 | 可用于风险提醒，不能作为强制规则 |
| Validation Depth | 13 | 20 | 同项目两类场景，无独立复现 |
| Completeness | 13 | 15 | 背景、风险、未知和验证计划完整 |
| Timeliness | 7 | 10 | 当前相关，观察周期短 |
| Applicability | 6 | 10 | 已收窄，但边界仍需实证 |
| **Quality Score** | **73** | **100** | 可参考并继续验证，保持 `VALIDATING` |

## Validation Requirement

使用至少一个独立治理项目和一组对照场景，分别测试封闭状态契约、明确适用范围、截止压力与输出位置；记录过早决策率、非规范状态率、错误阻断率和人工纠正成本。达到可复核 L3 因果证据后再评审 `VALIDATED`。

## Lifecycle Transition History

| Time | From | To | Validation Action | Evidence | Approver |
|---|---|---|---|---|---|
| `2026-07-13T19:30:00+08:00` | `NONE` | `CAPTURED` | 从两个内部压力场景提取候选，区分观察与因果主张 | `FAIL-E1`、`FAIL-E2` | AI CTO System Maintainer |
| `2026-07-13T19:31:00+08:00` | `CAPTURED` | `VALIDATING` | 核对事件、修正规则和 Commit，并发现缺少独立因果验证 | `FAIL-E1`–`FAIL-E4` | AI CTO System Maintainer |

保持 `VALIDATING`；没有记录 `VALIDATING → VALIDATED`，也没有进入 `ACTIVE`。

## Reuse History

见 [Knowledge Reuse Pilot](../../docs/knowledge/KNOWLEDGE_REUSE_PILOT.md)。

## Security, Privacy and License

仅引用当前仓库内部测试记录和 Git 元数据，不包含用户敏感数据或第三方受限内容；沿用本仓库许可边界。

## Related Knowledge

- `KN-ARC-0001`：`MITIGATED_BY`
- `KN-ENG-0001`：`MITIGATED_BY`

## Change History

| Version | Time | Change | Reason | Author |
|---|---|---|---|---|
| `1.0.0` | `2026-07-13T19:31:00+08:00` | 完成 Admission Review 并保持验证状态 | 缺少独立因果复现 | AI CTO System Maintainer |
