# KN-ARC-0001：用 Layer + Module 管理长期系统能力边界

## Record Identity

| Field | Value |
|---|---|
| Knowledge ID | `KN-ARC-0001` |
| Title | 用 Layer + Module 管理长期系统能力边界 |
| Type | Architecture Pattern |
| Source Project | `AI-CTO-System`，提交 `8666495` 及后续 `201b446`、`2ea04e2` |
| Owner | AI CTO System Maintainer |
| Record Version | `1.0.0` |
| Created Time | `2026-07-13T19:30:00+08:00` |
| Lifecycle Status | `VALIDATED` |
| Last Validated | `2026-07-13T19:32:00+08:00` |
| Next Review | `2026-10-13T00:00:00+08:00` |
| Related ADR | [ADR-0009](../../docs/adr/ADR-0009-AI-CTO-SYSTEM-ARCHITECTURE-MODEL.md) |

## Knowledge Content

### Background

AI-CTO-System 连续以 Phase 交付 Kernel、Decision、Design、Development、Lifecycle 和 Portfolio 治理后，Phase 同时承载交付顺序、架构归属和生命周期语义，新增 Capability Governance 时出现职责归类不稳定。Architecture Review 将系统稳定职责抽象为五个 Layer，并以 Module 表示可独立治理的能力；Phase 只保留为历史交付标签。

### Problem

当长期治理系统不断增加能力时，如果路线图批次同时作为架构边界，名称和交付顺序会推动重复 Module、新 Layer 或跨层权威，导致职责、数据源和 Gate 所有权漂移。

### Solution

对稳定职责使用 Layer，对可独立治理的能力使用 Module，对交付历史使用 Phase，对单项目状态使用 Lifecycle State。新增需求先复用或扩展已有 Module，只有稳定职责无法由现有 Layer 承载时才评审新 Layer；跨层协作通过版本化输入输出合同，而不是复制权威记录。

### Applicable Scenario

长期演进、文档驱动、治理密集，并同时包含多个稳定职责域、多个 Module、跨层 Evidence 和 Gate 的 AI CTO System 类平台。团队需要让架构边界独立于路线图批次，且能够维护 Module Registry 和 ADR。

### Non Applicable Scenario

单一用途、生命周期短、模块极少的小型应用；仍在探索核心问题、稳定职责尚未形成的原型；只需要发布版本分组而不存在架构所有权冲突的项目。该记录没有证明“五层”数量适合其他组织，也没有证明所有系统都需要 Module Registry。

### Limitations

证据来自一个治理项目，后续 Capability 与 Knowledge 归类仍属于同一仓库内重复应用，不构成跨项目 L4。Pattern 的可复用部分是职责、模块、交付批次和状态语义分离，不是复制 AI-CTO-System 的五层名称或数量。

### Risk If Misapplied

在小项目中会制造不必要层级、Registry 和评审成本；机械复制五层可能掩盖真实边界；把 Module 当成部署单元或团队组织图会重新混淆职责。

## Knowledge Admission Review

| Review Field | Value |
|---|---|
| Knowledge Type | Architecture Pattern |
| Source Evidence | ADR-0009、AI CTO System Architecture、Module Registry、提交 `8666495`，以及 Capability / Knowledge 后续归类提交 `201b446`、`2ea04e2` |
| Evidence Level | `L3`：在 AI-CTO-System 的正式架构调整和后续两个 Module 归类中实际采用 |
| Confidence | `L3`：对 AI CTO System 类治理项目可信；对其他类型项目不外推 |
| Applicable Scenario | 长期、文档驱动、多个治理职责域与 Module 的系统 |
| Non Applicable Scenario | 小型单体、短期原型、职责尚未稳定或只需要版本分组的项目 |
| Risk If Misapplied | 架构过度设计、层级复制、所有权再次混淆 |
| Validation Requirement | 核验 ADR 与 Commit；确认后续 Module 均能唯一归层；跨项目采用前重新设计 Layer 数量并验证职责稳定性 |
| Review Disposition | `ACCEPT_FOR_VALIDATION`；不是 Lifecycle Status，也不授权 `ACTIVE` |

## Evidence

| Evidence ID | Source / Version | Observation | Supports | Limitations |
|---|---|---|---|---|
| `ARC-E1` | [ADR-0009](../../docs/adr/ADR-0009-AI-CTO-SYSTEM-ARCHITECTURE-MODEL.md) | Accepted 决策明确区分 Layer、Module、Phase 和 Lifecycle State | Pattern 的决策背景与边界 | ADR 记录决策，不独立证明跨项目效果 |
| `ARC-E2` | [AI CTO System Architecture](../../docs/architecture/AI_CTO_SYSTEM_ARCHITECTURE.md) 与 [Module Registry](../../docs/architecture/MODULE_REGISTRY.md) | 五层职责和 Module 唯一归属已经形成权威文档 | Pattern 可被实际表达和治理 | 仅当前项目 |
| `ARC-E3` | Git commit `8666495` | 架构评审作为可追溯版本提交 | 变更真实存在且可复核 | Commit 存在不等于方案普遍有效 |
| `ARC-E4` | Git commits `201b446`、`2ea04e2` | Capability Governance 归入 Layer 5，Knowledge Governance 扩展 Layer 1 既有 Module | Pattern 在后续需求分类中被重复使用 | 同一项目，不满足 L4 独立性 |

## Confidence Level

- Evidence Level：`L3`
- Confidence Level：`L3`
- Rationale：正式决策和后续实际归类均可核验，但全部来自 AI-CTO-System，不能宣称通用架构最佳实践。

## Quality Score

| Dimension | Score | Maximum | Rationale |
|---|---:|---:|---|
| Accuracy | 22 | 25 | 决策、结构和提交一致，长期运行效果尚短 |
| Reuse Value | 16 | 20 | 对治理型平台有价值，对普通应用价值有限 |
| Validation Depth | 17 | 20 | 在同一项目的架构调整和两个后续 Module 中验证 |
| Completeness | 14 | 15 | 背景、边界、反例和风险完整 |
| Timeliness | 8 | 10 | 当前有效，但观察周期短 |
| Applicability | 9 | 10 | 适用与不适用范围明确 |
| **Quality Score** | **86** | **100** | 可在相似范围内受控参考，不具备 `ACTIVE` 授权 |

## Validation Requirement

进入 `ACTIVE` 前至少需要一个独立治理项目采用该职责分离原则，记录原始结构、适配方式、重复职责变化、维护成本和失败情况；不得要求对方复制五层数量。

## Lifecycle Transition History

| Time | From | To | Validation Action | Evidence | Approver |
|---|---|---|---|---|---|
| `2026-07-13T19:30:00+08:00` | `NONE` | `CAPTURED` | 从 Architecture Review 提取候选并限定单项目来源 | `ARC-E1`、`ARC-E3` | AI CTO System Maintainer |
| `2026-07-13T19:31:00+08:00` | `CAPTURED` | `VALIDATING` | 核对架构、Registry、Commit 和后续 Module 归类 | `ARC-E1`–`ARC-E4` | AI CTO System Maintainer |
| `2026-07-13T19:32:00+08:00` | `VALIDATING` | `VALIDATED` | 确认当前项目证据、收窄适用范围并登记非适用场景 | Admission Review、Quality Score 86 | AI CTO System Maintainer |

未进入 `ACTIVE`；单项目验证不足以完成 Activation Review。

## Reuse History

见 [Knowledge Reuse Pilot](../../docs/knowledge/KNOWLEDGE_REUSE_PILOT.md)。

## Security, Privacy and License

仅引用当前仓库内部文档与 Git 元数据，不包含密钥、个人数据或第三方受限内容；沿用本仓库许可边界。

## Related Knowledge

- `KN-FAIL-0001`：`MITIGATES`

## Change History

| Version | Time | Change | Reason | Author |
|---|---|---|---|---|
| `1.0.0` | `2026-07-13T19:32:00+08:00` | 完成 Admission Review、验证和范围限制 | Knowledge Governance Pilot | AI CTO System Maintainer |
