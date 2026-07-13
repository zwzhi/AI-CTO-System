# AI CTO Knowledge Governance 标准

## 1. 目的

Knowledge Governance 管理 AI CTO System 如何捕获、验证、注册、复用、纠错和演进技术与业务经验，防止 Knowledge Base 退化为无法判断真伪、范围和时效性的文件堆积。

治理链为：

`Event / Source → Capture → Classification → Validation → Registry → Activation → Reuse → Outcome Evidence → Revalidation / Deprecation`

Phase 8.3 是本套治理文档的历史交付标签。Knowledge Governance 扩展 Layer 1 现有 Knowledge Base Module，不新增架构 Layer、Agent、RAG 或向量数据库。

## 2. AI CTO Knowledge 定义

AI CTO Knowledge 是具有明确来源、背景、问题、因果、结论、适用条件、限制、Evidence、Confidence、质量、状态和复用历史的技术或业务经验资产。

以下内容本身不是可复用 Knowledge：

- 没有来源和时间的结论；
- 只保存最终结果、不保存背景和原因的总结；
- 未区分事实、推断、建议和未知项的 AI 输出；
- 未经验证的 Prompt、代码片段、聊天记录或会议笔记；
- 无适用范围、限制、Owner 或更新条件的“最佳实践”；
- 因文件存在、搜索命中或表达自信而被当作事实的内容。

原始材料可以作为 Evidence 或 `CAPTURED` Knowledge Candidate，但不能直接标记为 `ACTIVE`。

## 3. Knowledge 类型

Type 只使用以下九类：

| Type | 定义 |
|---|---|
| `Project Experience` | 项目目标、路径、结果、权衡和长期效果形成的经验 |
| `Architecture Pattern` | 在明确约束下可复用的系统边界、组件、数据流和部署模式 |
| `Engineering Pattern` | 开发、测试先行、Review、调试、重构、交付和维护模式 |
| `Agent Pattern` | Agent 职责、输入输出、工具、Memory、失败和评估模式 |
| `Prompt Pattern` | 经版本化评测验证的 Prompt 结构、适用任务和失败边界 |
| `Bug Solution` | Bug 现象、复现、根因、修复、验证和防复发经验 |
| `Decision Record` | 决策背景、Evidence、选项、取舍、结果和复核条件形成的经验 |
| `Failure Experience` | 失败条件、根因、信号、影响、恢复和避免重复的经验 |
| `Business Insight` | 用户、市场、价值、流程、成本或商业结果的可验证洞察 |

一项 Knowledge 只能指定一个 Primary Type；跨类型关系通过 Related Knowledge IDs 表示，不能复制正文形成多个权威版本。

## 4. 治理对象边界

| 对象 | 权威职责 |
|---|---|
| Project Memory | 保存单项目当前上下文、历史和状态 |
| Knowledge Base | 保存经过治理、可跨时间或跨项目复用的知识资产 |
| Technical Asset Registry | 管理可复用实现资产及其质量、版本和采用记录 |
| Capability Registry | 管理 AI CTO 可调用能力的激活、权限和生命周期 |
| ADR | 保存重大决策当时的不可覆盖记录 |

Knowledge 可以引用上述对象，但不能替代它们。Knowledge 中的架构经验不自动成为当前项目 Architecture，Bug Solution 不自动成为代码修复，Decision Record 不自动批准新项目。

## 5. 权威目录

根目录 `knowledge_base/` 是 Phase 8.3 后治理知识资产的权威存储。历史 `memory/knowledge_base/` 保留为 Legacy Capture Area，用于追溯早期目录，不再作为 `ACTIVE` Knowledge 的权威位置。

Legacy 内容若未来出现，必须按[知识提取标准](./KNOWLEDGE_EXTRACTION_STANDARD.md)迁移：分配 Knowledge ID、保留原路径与来源、去重、验证、注册后进入根目录。禁止无记录复制或同时维护两个权威版本。

## 6. 治理职责

- **Knowledge Owner：** 维护内容、范围、Evidence、状态和复核日期。
- **Source Owner：** 证明原始项目、事件、数据或公开资料的真实性与许可边界。
- **Validator：** 独立检查准确、因果、复现、反例、适用范围和限制。
- **Registry Owner：** 维护唯一 ID、分类、状态、分数、关系和版本。
- **Consumer：** 在当前上下文重新验证适用性，记录采用、改造、拒绝和结果。
- **Human Decision Maker：** 对强制标准、重大架构、安全、业务和风险决定作最终判断。

高影响、安全、数据、财务、法律或生产决策不能只由 Knowledge 作者或 AI 自评批准。

## 7. 使用原则

1. 查询 Knowledge 是决策输入，不是自动决定。
2. `ACTIVE` 只表示在记录范围内可复用，不表示对所有项目有效。
3. L1 / L2 Knowledge 不能作为强制或高风险决策的唯一依据。
4. Quality Score、Evidence Level、Confidence、Status 和当前适用性分别判断。
5. 新 Evidence 与旧 Knowledge 冲突时保留历史并执行 Conflict Resolution，不覆盖旧记录。
6. 每次重要复用必须记录目标项目、采用方式、修改、结果和新 Evidence，使 Knowledge 随真实使用进化。
7. 复用不能绕过 Architecture、Security、Testing、Release 或其他项目 Gate。

## 8. Phase 8.3 边界

本阶段只建立治理标准、目录和状态规则。不开发 Knowledge Agent，不实现搜索服务或 RAG，不生成 Embedding，不接入向量数据库，不迁移真实知识内容，也不进入 Phase 8.4。
