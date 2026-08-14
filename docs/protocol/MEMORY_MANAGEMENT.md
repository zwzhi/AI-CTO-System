# 记忆管理协议

## 基本原则

记忆只保存对未来协作有复用价值且有来源的信息。事实、推断和用户确认必须区分；敏感信息遵循最小记录原则。

## Runtime Checkpoint 与 Project Memory Projection

Runtime Checkpoint 是单个任务的追加式、内存内状态快照，只记录可验证事实、决策、Evidence 引用、阻塞、风险和下一步动作。它不保存完整聊天上下文、完整 Prompt、秘密、完整工具日志或隐性推理，也不改变 Workflow / Task 状态或产生执行授权。

Project Memory Projection 是从已确认 Checkpoint 生成的元数据摘要，明确标记任务、项目、Checkpoint、Evidence 和建议写入章节。Projection 默认不写 Markdown、Git、外部记忆或 Knowledge Base；必须经过用户或受治理流程确认后，才能成为 Project Memory 的新追加记录。Project Memory 仍是单项目连续性的唯一权威事实源，Checkpoint 不能替代它或覆盖历史。

Knowledge Base 只接收经过跨项目适用性、来源、许可、脱敏和生命周期门禁的复用知识。Checkpoint 或 Projection 中的单项目事实不会自动升级为 Knowledge。

## PROJECT_MEMORY

### 更新时机

- 项目正式初始化时。
- 生命周期状态改变时。
- 技术选择或重大决策发生变化时。
- 完成重要里程碑、发布或回滚时。
- 出现影响后续工作的风险、限制或已知问题时。
- 项目暂停、恢复、维护或演进时。
- 已有项目完成扫描、文档恢复、健康评估或迁移门禁判断时。
- Incident 恢复、永久修复、Postmortem 或预防行动发生变化时。
- 技术债、用户反馈、AI 能力趋势或 Evolution Proposal 改变后续决策时。
- 项目作出继续维护、重构、归档或停止决定时。
- Portfolio Priority、Investment Recommendation、跨项目依赖、资源或状态变化影响项目后续工作时。
- 共享技术资产、AI 成本或 Portfolio Health 变化形成长期决策依据时。

### 更新内容

项目目标、技术选择、关键决策、历史修改、当前状态和未来计划。详细内容保留在源文档中，PROJECT_MEMORY 保存摘要与链接。

## USER_BRAIN

### 更新时机

- 用户明确表达长期稳定的工作、技术、产品或决策偏好时。
- 用户纠正既有画像时。
- 同一偏好在多个项目中重复出现，并经用户确认可长期使用时。

### 禁止事项

- 不把单次项目约束自动推断为长期偏好。
- 不记录无关的敏感个人信息。
- 不确定的信息标记为 `TODO` 或“待确认”。
- 新信息与旧信息冲突时保留来源并请求用户确认。

## KNOWLEDGE_BASE

`knowledge_base/` 是治理知识资产的权威目录；`memory/knowledge_base/` 是 Legacy Capture Area。后者保留早期材料用于追溯，不再接收新的权威 `ACTIVE` Knowledge。Project Memory 保存单项目连续性，Knowledge Base 保存经过治理的跨时间或跨项目复用资产，两者不得互相替代。

### 更新时机

- 某项经验可跨项目复用时。
- 问题已定位根因并形成稳定解决方案时。
- 形成可复用的架构模式、提示词、Agent 方法或最佳实践时。
- 失败案例揭示了通用风险或预防措施时。

### 分类与治理

使用 `project_experience/`、`architecture_patterns/`、`engineering_patterns/`、`agent_patterns/`、`prompt_patterns/`、`bug_solutions/`、`decisions/`、`failures/`、`business_insights/` 九类目录。详细用途、来源与范围见 [Knowledge Classification](../knowledge/KNOWLEDGE_CLASSIFICATION_STANDARD.md)。

知识条目必须包含适用范围、来源、Evidence、Confidence、限制和最后验证时间，并按 [Knowledge Lifecycle](../knowledge/KNOWLEDGE_LIFECYCLE_STANDARD.md) 与 [Knowledge Registry](../knowledge/KNOWLEDGE_REGISTRY_STANDARD.md) 管理。低可信内容不得作为强制决策依据，冲突内容不得互相覆盖。

已有项目取得 `ONBOARDING_COMPLETED` 后，按 `docs/onboarding/EXPERIENCE_EXTRACTION_STANDARD.md` 提取技术方案、解决方案、Bug 经验、失败原因和可复用模块。接管未完成、来源不明、含敏感数据或许可边界未确认的内容不得直接进入知识库。

Maintenance 与 Evolution 中，经过 Postmortem、长期指标或实际升级验证的故障模式、解决方案、架构经验、Prompt / AI 评测方法和最佳实践可以按 `CAPTURED` 状态进入治理流程。条目必须链接 Incident / Proposal / Evidence，说明适用版本、环境、限制、Confidence、脱敏与许可状态；未经验证的 Proposal、用户原始敏感反馈和临时恢复方案不得包装成最佳实践。

Portfolio Governance 中，跨项目重复出现并经验证的 Agent / Prompt、代码、架构、数据库、部署和解决方案经验先进入权威 `knowledge_base/`；达到明确 Owner、版本、质量、安全、License 和适用边界后，才注册为 `APPROVED_FOR_REUSE` 技术资产。Portfolio 评分、成本和投资结论保留在组合记录与项目记忆中，不把短期资源偏好写成通用最佳实践。

## 维护责任

每次阶段结束前，AI CTO 必须检查三类记忆是否需要更新。无需更新时不创建无意义记录；需要更新但信息不足时，将其列入 `Next Action`。
