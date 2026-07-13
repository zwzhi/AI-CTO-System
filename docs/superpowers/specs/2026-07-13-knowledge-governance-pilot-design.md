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

| Knowledge ID | Type | Title | 核心 Evidence | 目标状态 |
|---|---|---|---|---|
| `KN-ARC-0001` | Architecture Pattern | 用 Layer + Module 管理长期系统能力边界 | ADR-0009、五层架构、Module Registry、提交 `8666495` 及后续模块归类 | `ACTIVE` |
| `KN-ENG-0001` | Engineering Pattern | 用封闭状态词汇与固定输出契约约束文档治理 | SKILL、Capability Lifecycle、Development Progress 压力测试、提交 `201b446` | `ACTIVE` |
| `KN-FAIL-0001` | Failure Experience | 非规范状态和范围证据不足会导致过早治理决策 | Development Progress 中 Capability / Knowledge 压力测试、SKILL 快速契约、提交 `201b446` 与 `2ea04e2` | `ACTIVE` |

三条记录分别存放在 `knowledge_base/architecture_patterns/`、`engineering_patterns/` 和 `failures/`，不复制到其他分类目录。

## 4. Knowledge Record 与 Registry

创建 `templates/KNOWLEDGE_RECORD_TEMPLATE.md`，包含用户指定字段，并补充 Governance 标准需要的 Owner、Version、Evidence Links、Validation History、Reuse History、Last Validated、Next Review、Security / Privacy / License 和 Change History。

创建 `knowledge_base/knowledge_registry/README.md` 说明 Registry 权威、维护和审计规则，并创建 `knowledge_base/knowledge_registry/KNOWLEDGE_REGISTRY.md`，记录三条知识的 ID、Type、Source、Evidence、Confidence、Quality、Status、位置和复核时间。

## 5. 生命周期执行

每条知识在记录内保留不可覆盖的 Transition History：

1. `CAPTURED`：登记背景、问题、来源和 Owner；
2. `VALIDATING`：核验 ADR、Git Commit、相关治理文档、反例和适用范围；
3. `VALIDATED`：Evidence、Confidence、限制和冲突检查完成；
4. `ACTIVE`：质量、复用边界、Owner 和复核日期完整后批准。

本试点不会用文件创建时间冒充四个阶段经过的时间。四个状态转换使用同一试点日期，但分别记录检查动作和 Evidence。若验证时发现关键 Evidence 不可访问、Commit 不存在或适用范围无法定义，相应记录保持 `VALIDATING`，不得继续推进。

## 6. 复用模拟

模拟新项目：`AI Content Workflow Platform`。该项目计划长期扩展多个产品、工程和运行能力，但尚处于 Design 前评估，不产生真实开发授权。

复用判断：

- 查询 `KN-ARC-0001`，因目标同为长期扩展系统但业务边界不同，结果预期为 `ADAPT`；
- 查询 `KN-ENG-0001`，因治理枚举和输出契约可原样采用，结果预期为 `ADOPT`；
- 查询 `KN-FAIL-0001`，作为状态漂移与证据不足的风险提醒，结果预期为 `REFERENCE_ONLY`。

复用记录必须比较适用范围、版本、Evidence、Confidence 和限制，并明确这些 Knowledge 不替代新项目的 Architecture、Security、Testing 或 Release Gate。

## 7. Pilot Report 与验收

创建 `docs/knowledge/KNOWLEDGE_GOVERNANCE_PILOT_REPORT.md`，记录试点项目、三条知识、生命周期、Registry、复用模拟、问题、改进建议和验收结果。

只有以下五项都有文件证据时才判定通过：

1. Knowledge Record 模板和实例可创建；
2. Evidence 与 Confidence 可记录并相互约束；
3. 生命周期转换有逐步记录；
4. Registry 与知识记录一致；
5. Knowledge 能产生 `ADOPT`、`ADAPT`、`REFERENCE_ONLY` 或 `REJECT` 的可解释复用判断。

## 8. 验证

- 检查三个 Knowledge ID 唯一且路径符合 Type；
- 检查每条 Transition History 包含四个顺序状态；
- 检查 Registry 的 ID、Type、Confidence、Quality、Status 与记录一致；
- 检查所有 Evidence 文件和 Commit 均存在；
- 检查模板字段完整、Markdown 相对链接有效、质量分在 0–100；
- 检查未新增 Agent、RAG、向量数据库或 Phase 8.4 内容。
