# KN-ENG-0001：用封闭状态词汇与固定输出契约约束文档治理

## Record Identity

| Field | Value |
|---|---|
| Knowledge ID | `KN-ENG-0001` |
| Title | 用封闭状态词汇与固定输出契约约束文档治理 |
| Type | Engineering Pattern |
| Source Project | `AI-CTO-System`，提交 `201b446` 与 `2ea04e2` |
| Owner | AI CTO System Maintainer |
| Record Version | `1.0.0` |
| Created Time | `2026-07-13T19:30:00+08:00` |
| Lifecycle Status | `VALIDATED` |
| Last Validated | `2026-07-13T19:32:00+08:00` |
| Next Review | `2026-10-13T00:00:00+08:00` |
| Related ADR | [ADR-0011](../../docs/adr/ADR-0011-CAPABILITY-GOVERNANCE.md)、[ADR-0012](../../docs/adr/ADR-0012-KNOWLEDGE-GOVERNANCE.md) |

## Knowledge Content

### Background

AI-CTO-System 的 Capability Governance 压力测试能拒绝高风险操作，但连续产生 `Quarantined / Blocked` 等非规范 Registry Status。仅在长文后部列出状态定义不足以稳定输出；将封闭词汇和未注册候选的固定字段配方提升到 SKILL 顶部后，复测才只使用规范字段。Knowledge Governance 的冲突基线随后暴露 `Candidate / Provisional` 状态和过早数据库选择，采用同类快速契约修正。

### Problem

文档驱动治理如果只描述原则而没有封闭枚举、正向字段和机器检查，AI 或人工执行者会用自然语言创造近义状态，把风险、评估结果和生命周期混在一起，进而破坏 Registry、Gate 和自动校验。

### Solution

当状态或决策结果会驱动下游授权时：定义封闭状态词汇；为常见边界情形提供正向字段配方；将关键契约放在入口附近；把风险、证据、生命周期和授权拆成不同字段；用结构断言检查状态与必填输出。规则修订后必须用原失败场景复测。

### Applicable Scenario

AI CTO System 类文档驱动治理、状态机、Registry、阶段 Gate 或 Prompt 执行协议，其中下游消费者依赖精确枚举和固定字段进行审计或授权。

### Non Applicable Scenario

不驱动状态或权限的自由写作、头脑风暴和探索性笔记；消费者不依赖精确枚举的普通说明文；无法提前定义有效状态空间的早期领域探索。

### Limitations

当前证据来自同一项目中的 Capability 与 Knowledge 两类治理场景。固定输出可能降低表达弹性；词汇过度封闭会把真实新状态错误压入旧枚举，因此仍需正式的词汇演进与 ADR。

### Risk If Misapplied

把所有内容都结构化会增加维护成本和模板噪音；缺失合法扩展路径会诱导错误归类；只检查字符串而不检查语义会产生“格式正确、决策错误”。

## Knowledge Admission Review

| Review Field | Value |
|---|---|
| Knowledge Type | Engineering Pattern |
| Source Evidence | SKILL 快速契约、Capability Lifecycle、Development Progress 压力测试、提交 `201b446` 与 `2ea04e2` |
| Evidence Level | `L3`：两个治理场景在当前项目中经历失败、规则修改与复测 |
| Confidence | `L3`：对状态驱动的 AI CTO 文档治理可信；不外推到自由文本工作 |
| Applicable Scenario | 有封闭状态机、Registry、Gate 或固定授权输出的文档驱动系统 |
| Non Applicable Scenario | 自由写作、开放探索、没有状态消费者的普通文档 |
| Risk If Misapplied | 模板过载、错误压缩新状态、只验证格式不验证语义 |
| Validation Requirement | 保留原失败场景；核验规范状态和字段；同时执行语义断言；跨项目复用时记录维护成本 |
| Review Disposition | `ACCEPT_FOR_VALIDATION`；不是 Lifecycle Status，也不授权 `ACTIVE` |

## Evidence

| Evidence ID | Source / Version | Observation | Supports | Limitations |
|---|---|---|---|---|
| `ENG-E1` | [Development Progress](../../docs/DEVELOPMENT_PROGRESS.md) | Capability 复测两次仍产生或忽略非规范词汇，契约提升到 SKILL 顶部后通过 | 契约位置与正向字段影响一致性 | 过程记录由同一项目维护 |
| `ENG-E2` | [SKILL](../../SKILL.md) | Capability 与 Knowledge 均有入口快速契约和封闭状态规则 | Pattern 已成为实际工作规则 | 文档规则不等于跨项目效果 |
| `ENG-E3` | [Capability Lifecycle](../../docs/capability/CAPABILITY_LIFECYCLE_STANDARD.md) | 明确区分 Lifecycle、Risk、Evaluation Result 和 Admission Result | 字段分离可表达风险而不污染状态 | 仅 Capability 领域直接验证 |
| `ENG-E4` | Git commits `201b446`、`2ea04e2` | 两次治理提交分别固化 Capability 和 Knowledge 契约 | Pattern 有可追溯版本 | 同一仓库内重复，不满足 L4 |

## Confidence Level

- Evidence Level：`L3`
- Confidence Level：`L3`
- Rationale：失败、修订和复测在当前项目可核验；尚无独立项目证明该做法的成本与收益。

## Quality Score

| Dimension | Score | Maximum | Rationale |
|---|---:|---:|---|
| Accuracy | 22 | 25 | 失败与修正记录一致，缺少外部复现 |
| Reuse Value | 17 | 20 | 对状态驱动治理复用价值高 |
| Validation Depth | 16 | 20 | 两类场景均验证，但属于同一项目 |
| Completeness | 14 | 15 | 包含边界、风险和验证方法 |
| Timeliness | 8 | 10 | 当前规则有效，观察周期短 |
| Applicability | 7 | 10 | 范围已收窄，跨实现方式仍需验证 |
| **Quality Score** | **84** | **100** | 可在相似治理场景受控采用，不具备 `ACTIVE` 授权 |

## Validation Requirement

进入 `ACTIVE` 前，在一个独立文档治理项目对比“自由状态输出”与“封闭词汇 + 固定契约”，记录错误状态率、语义错误率、维护成本和合法词汇扩展次数。

## Lifecycle Transition History

| Time | From | To | Validation Action | Evidence | Approver |
|---|---|---|---|---|---|
| `2026-07-13T19:30:00+08:00` | `NONE` | `CAPTURED` | 从 Capability 与 Knowledge 压力测试提取候选 | `ENG-E1`、`ENG-E4` | AI CTO System Maintainer |
| `2026-07-13T19:31:00+08:00` | `CAPTURED` | `VALIDATING` | 核对失败记录、SKILL 规则、状态分离和提交 | `ENG-E1`–`ENG-E4` | AI CTO System Maintainer |
| `2026-07-13T19:32:00+08:00` | `VALIDATING` | `VALIDATED` | 确认同项目重复验证并限制到状态驱动治理 | Admission Review、Quality Score 84 | AI CTO System Maintainer |

未进入 `ACTIVE`；跨项目效果和维护成本尚未验证。

## Reuse History

见 [Knowledge Reuse Pilot](../../docs/knowledge/KNOWLEDGE_REUSE_PILOT.md)。

## Security, Privacy and License

仅引用当前仓库内部治理记录和 Git 元数据，不包含敏感数据或第三方内容；沿用本仓库许可边界。

## Related Knowledge

- `KN-FAIL-0001`：`MITIGATES`

## Change History

| Version | Time | Change | Reason | Author |
|---|---|---|---|---|
| `1.0.0` | `2026-07-13T19:32:00+08:00` | 完成 Admission Review、验证与范围限制 | Knowledge Governance Pilot | AI CTO System Maintainer |
