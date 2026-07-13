# Knowledge Governance Pilot Design

## 1. 目标

以 AI-CTO-System 自身为唯一试点项目，从现有 ADR、治理文档、Development Progress 和 Git 历史中提取三条真实、可追溯的知识记录，验证 Phase 8.3 的模板、Evidence、Confidence、生命周期、Registry 和复用判断可以实际运行。

本试点不开发功能、不创建 Agent、不实现 RAG 或向量数据库、不批量迁移旧知识，也不进入 Phase 8.4。

## 2. 试点选择

选择 `AI-CTO-System`，原因如下：

- 存在连续的 Git 提交记录；
- 存在 ADR-0009、SKILL、Module Registry、Project Memory 和 Development Progress；
- 存在架构决策、治理实施方式与失败压力测试三种不同证据；
- 全部来源均位于当前仓库，可进行版本和路径核验。

用户列举的抖音创作者日报、舆情监控、视频解析和 AI 内容生成项目不在当前仓库中，因此不推测或伪造其历史经验。

## 3. 迁移范围

只迁移三条知识：

| Knowledge ID | Type | Title | 核心 Evidence | 状态上限 |
|---|---|---|---|---|
| `KN-ARC-0001` | Architecture Pattern | 用 Layer + Module 管理长期系统能力边界 | ADR-0009、五层架构、Module Registry、提交 `8666495` 及后续模块归类 | 证据充分时 `VALIDATED`，不在试点中直接 `ACTIVE` |
| `KN-ENG-0001` | Engineering Pattern | 用封闭状态词汇与固定输出契约约束文档治理 | SKILL、Capability Lifecycle、Development Progress 压力测试、提交 `201b446` | 证据充分时 `VALIDATED`，不在试点中直接 `ACTIVE` |
| `KN-FAIL-0001` | Failure Experience | 非规范状态和范围证据不足会导致过早治理决策 | Development Progress 中 Capability / Knowledge 压力测试、SKILL 快速契约、提交 `201b446` 与 `2ea04e2` | 证据不足时保持 `VALIDATING` |

三条记录分别存放在 `knowledge_base/architecture_patterns/`、`engineering_patterns/` 和 `failures/`，不复制到其他分类目录。

## 4. Step 0：Knowledge Admission Review

实际迁移前，为三个候选分别创建 Admission Review，强制记录：Knowledge Type、Source Evidence、Evidence Level、Confidence、Applicable Scenario、Non Applicable Scenario、Risk If Misapplied 和 Validation Requirement。

审查重点：

- 区分“在 AI-CTO-System 中观察到”与“对所有软件项目普遍成立”；
- 一次项目经验最高只能证明当前项目或高度相似范围，不能直接升级为通用最佳实践；
- 公开资料、Git 存在、ADR 被接受和规则被采用分别代表不同证据，不互相替代；
- Applicable Scenario 必须收窄到 AI CTO System 类长期、文档驱动、治理密集项目；
- Non Applicable Scenario 和误用风险不完整时，不得进入 `VALIDATED`；
- Admission Review 只允许候选进入验证，不授权 `ACTIVE` 或项目复用。

Admission Review 结果记录在 Pilot Report 和每条 Knowledge Record 中。候选若来源不可核验、结论无法收窄、存在严重反证或许可风险，则不迁移；否则从 `CAPTURED` 进入 `VALIDATING`。

## 5. Knowledge Record 与 Registry

创建 `templates/KNOWLEDGE_RECORD_TEMPLATE.md`，包含用户指定字段，并补充 Governance 标准需要的 Owner、Version、Evidence Links、Validation History、Reuse History、Last Validated、Next Review、Security / Privacy / License 和 Change History。

创建 `knowledge_base/knowledge_registry/README.md` 说明 Registry 权威、维护和审计规则，并创建 `knowledge_base/knowledge_registry/KNOWLEDGE_REGISTRY.md`，记录三条知识的 ID、Type、Source、Evidence、Confidence、Quality、Status、位置和复核时间。

## 6. 生命周期执行

每条知识在记录内保留不可覆盖的 Transition History：

1. `CAPTURED`：登记背景、问题、来源和 Owner；
2. `VALIDATING`：核验 ADR、Git Commit、相关治理文档、反例和适用范围；
3. `VALIDATED`：Evidence、Confidence、限制和冲突检查完成；
4. `ACTIVE`：不在本试点授权范围内；需要后续独立复用证据和 Activation Review。

本试点不会用文件创建时间冒充生命周期经过。每次状态转换分别记录检查动作和 Evidence。若验证时发现关键 Evidence 不可访问、Commit 不存在、因果没有被验证或适用范围无法定义，相应记录保持 `VALIDATING`，不得继续推进。禁止仅因为模板完整、Quality Score 较高或用户要求试点就进入 `ACTIVE`。

## 7. 复用模拟

模拟新项目：`AI Content Workflow Platform`。该项目计划长期扩展多个产品、工程和运行能力，但尚处于 Design 前评估，不产生真实开发授权。

复用判断：

- 查询 `KN-ARC-0001`，因目标同为长期扩展系统但业务边界不同，候选结果为 `ADAPT`；
- 查询 `KN-ENG-0001`，只有新项目同样采用文档驱动治理和封闭枚举时才可 `ADOPT`，否则 `ADAPT`；
- 查询 `KN-FAIL-0001`，若仍为 `VALIDATING`，最多只能 `REFERENCE_ONLY`，不能作为强制规则。

复用记录必须比较适用范围、版本、Evidence、Confidence 和限制，并明确这些 Knowledge 不替代新项目的 Architecture、Security、Testing 或 Release Gate。

## 8. Pilot Report 与验收

创建 `docs/knowledge/KNOWLEDGE_GOVERNANCE_PILOT_REPORT.md`，记录试点项目、三条知识、生命周期、Registry、复用模拟、问题、改进建议和验收结果。

只有以下五项都有文件证据时才判定通过：

1. Knowledge Record 模板和实例可创建；
2. Evidence 与 Confidence 可记录并相互约束；
3. 生命周期从 `CAPTURED` 到 `VALIDATING`，并按证据进入 `VALIDATED` 或保持 `VALIDATING`；
4. Registry 与知识记录一致；
5. Knowledge 能产生 `ADOPT`、`ADAPT`、`REFERENCE_ONLY` 或 `REJECT` 的可解释复用判断。

## 9. 验证

- 检查三个 Knowledge ID 唯一且路径符合 Type；
- 检查每条 Transition History 从 `CAPTURED` 开始，随后进入 `VALIDATING`，且没有无证据直接进入 `ACTIVE`；
- 检查 Registry 的 ID、Type、Confidence、Quality、Status 与记录一致；
- 检查所有 Evidence 文件和 Commit 均存在；
- 检查模板字段完整、Markdown 相对链接有效、质量分在 0–100；
- 检查未新增 Agent、RAG、向量数据库或 Phase 8.4 内容。
