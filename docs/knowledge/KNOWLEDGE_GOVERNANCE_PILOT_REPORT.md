# Knowledge Governance Pilot Report

## 1. Pilot Summary

| Field | Result |
|---|---|
| Pilot Project | AI-CTO-System |
| Selection Reason | 具有 ADR、架构、SKILL、Progress 和连续 Git Commit，可核验来源与版本 |
| Migrated Knowledge Count | 3 |
| Knowledge Types | Architecture Pattern、Engineering Pattern、Failure Experience |
| Admission Review | 3/3 完成；全部仅获准进入验证，不直接 `ACTIVE` |
| Final Lifecycle | 2 `VALIDATED`，1 `VALIDATING`，0 `ACTIVE` |
| Reuse Simulation | `ADAPT`、`ADOPT`、`REFERENCE_ONLY` 各 1 条 |
| Phase 8.4 | 未进入 |
| Acceptance Result | `PASSED_WITH_CONSTRAINTS` |

## 2. Knowledge Admission Review

| Knowledge ID | Type | Evidence | Confidence | Applicable Scenario | Non Applicable Scenario | Risk If Misapplied | Validation Requirement | Review Result |
|---|---|---|---|---|---|---|---|---|
| `KN-ARC-0001` | Architecture Pattern | L3：ADR-0009、架构与 Registry、提交 `8666495`，后续两次 Module 归类 | L3 | 多职责、长期、文档驱动的 AI CTO System 类治理平台 | 小型单体、短期原型、职责未稳定项目 | 过度设计、机械复制五层、所有权再次混淆 | 独立治理项目验证职责分离原则，不复制层数 | `ACCEPT_FOR_VALIDATION` |
| `KN-ENG-0001` | Engineering Pattern | L3：两类内部治理场景的失败、规则修订与复测，提交 `201b446`、`2ea04e2` | L3 | 状态、Registry 或 Gate 依赖封闭枚举的文档治理 | 自由写作、开放探索、没有状态消费者的文档 | 模板过载、错误压缩新状态、格式正确但语义错误 | 独立项目对比错误率、语义错误和维护成本 | `ACCEPT_FOR_VALIDATION` |
| `KN-FAIL-0001` | Failure Experience | L3：两个失败输出和修正动作真实记录 | L2：跨项目因果未验证 | 状态与范围 Evidence 驱动授权的 AI 辅助治理 | 自由文本、开放标签或已有直接当前证据的选择 | 过度保守、验证停滞、把措辞问题当语义问题 | 独立对照复现状态、范围和时间压力的影响 | `ACCEPT_FOR_VALIDATION`，保持 `VALIDATING` |

Admission Review 发现原试点设计把三条记录预设为 `ACTIVE`，存在用“试点完成”替代 Activation Evidence 的风险。设计已修订：本次状态上限为 `VALIDATED`，并明确一项目经验不能升级为通用最佳实践。

## 3. Migrated Knowledge

| Knowledge ID | Record | Quality Score | Lifecycle Status |
|---|---|---:|---|
| `KN-ARC-0001` | [Layer + Module Pattern](../../knowledge_base/architecture_patterns/KN-ARC-0001-layer-module-governance.md) | 86 | `VALIDATED` |
| `KN-ENG-0001` | [Closed Status and Output Contract](../../knowledge_base/engineering_patterns/KN-ENG-0001-closed-status-output-contract.md) | 84 | `VALIDATED` |
| `KN-FAIL-0001` | [Status and Scope Failure](../../knowledge_base/failures/KN-FAIL-0001-status-scope-premature-decision.md) | 73 | `VALIDATING` |

## 4. Lifecycle Validation

### KN-ARC-0001

`CAPTURED → VALIDATING → VALIDATED`

ADR、Commit、架构文件和两个后续 Module 归类均可核验；适用范围已收窄到 AI CTO System 类治理项目。没有跨项目证据，因此不进入 `ACTIVE`。

### KN-ENG-0001

`CAPTURED → VALIDATING → VALIDATED`

Capability 与 Knowledge 两类内部场景均记录失败、规则修订和复测；仍为同一项目证据，因此不进入 `ACTIVE`。

### KN-FAIL-0001

`CAPTURED → VALIDATING`

失败事件本身达到 L3，但“状态不规范和范围证据不足导致过早决策”的因果泛化只有 L2 Confidence，缺少独立对照复现，因此保持 `VALIDATING`。

## 5. Registry Validation

[Knowledge Registry](../../knowledge_base/knowledge_registry/KNOWLEDGE_REGISTRY.md) 已登记三条记录的 ID、Type、Source、Evidence、Confidence、Quality、Status、路径和 Next Review。

Registry 与源记录逐项一致：

- `VALIDATED`：2
- `VALIDATING`：1
- `ACTIVE`：0
- 重复 ID：0
- Type / Directory mismatch：0

`knowledge_registry/` 被定义为元数据目录，不改变九类 Knowledge 的封闭分类。

## 6. Reuse Validation

模拟项目 `AI Content Workflow Platform` 的详细记录见 [Knowledge Reuse Pilot](./KNOWLEDGE_REUSE_PILOT.md)。

| Knowledge ID | Decision | Reason |
|---|---|---|
| `KN-ARC-0001` | `ADAPT` | 采用职责分离原则，但必须重新设计 Layer，禁止复制五层 |
| `KN-ENG-0001` | `ADOPT` | 仅对状态和授权治理协议受控采用，仍需设计与测试 |
| `KN-FAIL-0001` | `REFERENCE_ONLY` | 状态仍为 `VALIDATING`，只能进入风险清单和验证问题 |

复用决定没有改变 Knowledge Status，也没有绕过 Architecture、Security、Testing 或 Release Gate。

## 7. Acceptance Criteria

| Criterion | Evidence | Result |
|---|---|---|
| Knowledge Record 可创建 | [Knowledge Record Template](../../templates/KNOWLEDGE_RECORD_TEMPLATE.md) 与三条实例 | PASS |
| Evidence 和 Confidence 可记录 | 三条 Admission Review、Evidence 表和 Confidence 章节 | PASS |
| Knowledge 生命周期可以运行 | 两条进入 `VALIDATED`，一条按证据保持 `VALIDATING` | PASS |
| Knowledge Registry 可维护 | Registry 与源记录一致性检查通过 | PASS |
| Knowledge 可参与复用判断 | 模拟得到 `ADAPT`、`ADOPT`、`REFERENCE_ONLY` 并保留 Gate | PASS |

Acceptance Result：`PASSED_WITH_CONSTRAINTS`。

## 8. Problems Found

1. 原设计预设 `ACTIVE`，证明生命周期目标容易反向影响 Evidence 判断；Admission Review 必须在状态目标之前。
2. 同一项目的多次采用容易被误读为 L4；独立项目是 L4 的必要条件。
3. Evidence Level 可以描述事件真实性，但因果 Confidence 可能更低；两个字段不能合并。
4. Registry 元数据目录此前没有明确位置，现已补充，但不能变成第十种 Knowledge Type。
5. 模拟复用只能验证流程，不能提升 Knowledge Evidence 或 Confidence。
6. 同一天完成多个生命周期检查只表示检查顺序，不表示已经获得长期观察。

## 9. Improvement Recommendations

1. 将 Knowledge Admission Review 作为以后每项迁移的强制前置步骤。
2. `ACTIVE` 增加独立 Activation Review，至少检查实际复用结果、消费者、Owner 和复核窗口。
3. 下一次试点选择一个独立真实软件项目，验证三条知识是否仍适用，并记录拒绝或失败 Evidence。
4. 未来可以设计 Registry Schema Validator，但必须另行准入；本试点不实现自动化、RAG 或向量数据库。

## 10. Constraints and Next Action

- 当前没有 `ACTIVE` Knowledge。
- `KN-FAIL-0001` 保持 `VALIDATING`。
- 全部 Evidence 仍来自 AI-CTO-System 单一项目。
- 真实跨项目复用尚未验证。
- 等待用户确认 Pilot；不进入 Phase 8.4。
