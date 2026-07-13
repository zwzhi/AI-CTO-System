# AI CTO System Project Memory

## 项目目标

建立一个用于管理未来 AI 项目开发的 AI CTO 操作系统。

## 技术选择

- Markdown 管理协议、模板与记忆。
- Git 管理系统版本。
- 当前不包含具体 Agent 实现。

## 关键决策

- 所有新项目需求必须从 IDEA 开始。
- RESEARCH 与 EVALUATION 可调整先后，但进入 DESIGN 前必须全部完成。
- 重大决策使用 ADR 追加记录，不覆盖历史。
- 项目评估采用 100 分制，但分数、Confidence 与风险红线分别判断。
- 进入 DESIGN 前必须完成 Research、Evaluation、风险分析、立项门禁和用户确认。
- Design 完成与 Development 授权分离；只有 Design Approval Gate 通过后才能编码。
- DESIGN 阶段必须先建立 Requirement → Design → Development Task → Test Case 计划链，并为尚未产生的 Commit 明确标记 `NOT_CREATED`。
- Development 执行采用测试先行，禁止代码完成后补测试。
- Requirement → Design → Task → Commit → Test 必须形成五层追踪。
- Development 完成与 Testing 授权分离；只有 Development Approval Gate 通过后才能进入 TESTING。
- 五层身份链之外，每项测试执行必须生成可复核 Evidence；进入 RELEASE 前形成 Requirement → Test Case → Evidence 投影。
- AI 项目不能只通过功能测试，必须以冻结的模型、Prompt、工具、数据集和环境基线完成八维 AI Evaluation。
- Bug 使用 P0 Blocker、P1 Critical、P2 Major、P3 Minor；发布前未关闭 P0/P1 必须为 0。
- 安全评审只允许 `APPROVED`、`CHANGES_REQUIRED`、`BLOCKED`；只有当前候选基线的 `APPROVED` 能作为发布输入。
- Testing 完成与 Release 授权分离。Release Approval Gate 负责端到端就绪判断，Testing Release Gate 是 TESTING → RELEASE 的唯一状态转换授权。
- `READY_FOR_RELEASE` 仅允许进入 RELEASE，不表示部署成功、上线稳定或进入 MAINTENANCE / EVOLUTION。
- 发布必须具备可执行的部署、回滚、数据恢复与监控方案，并以观察窗口和 Release Report 记录实际结果。
- 已有软件项目使用独立的 `EXISTING_PROJECT_ONBOARDING` 入口，不强制伪装成新 Idea，也不补造不存在的历史阶段。
- 接管先冻结并只读扫描现状，再恢复文档、建立记忆和状态、完成健康评估与迁移门禁；事实、推断、冲突与未知必须分开标记并携带 Confidence。
- 项目健康分数与迁移门禁分开判断；高分不能抵消安全红线、来源不明的 Git 改动或未知测试风险边界。
- 接管门禁只允许 `ONBOARDING_COMPLETED` 或 `ONBOARDING_BLOCKED`；完成接管不授予编码、测试、发布或生产变更权限。
- 接管完成后的跨项目经验按证据、适用范围和许可边界沉淀到 `memory/knowledge_base/`。
- Maintenance 负责稳定运营中的 Bug、小版本、性能、依赖、安全和技术债；临时恢复、永久修复和 Incident 关闭必须分开记录。
- Incident、Postmortem、技术债、用户反馈和 AI Capability History 使用不可覆盖的历史记录，并把已验证、已脱敏经验沉淀到知识库。
- AI 项目在运营期持续评估输出质量、准确率、稳定性、Agent 成功率、Prompt 效果、Token 成本和响应时间；单次 Release 评测不能替代长期趋势。
- 系统性优化必须先创建 Evolution Proposal。只有 `APPROVED_FOR_EVOLUTION` 允许从 MAINTENANCE 进入 EVOLUTION，且该结果不授权编码、测试、发布或生产修改。
- Evolution 实现继续执行适用的 Research、Evaluation、Design、Development、Testing 和 Release Gate；重大变更不能从 Feedback、Incident 或 Proposal 直接进入代码。
- 项目周期复核必须在继续维护、重构、归档和停止之间形成证据化结论，并处理用户、数据、安全、依赖和恢复边界。
- Portfolio Management 是 Layer 2 内覆盖多个单项目生命周期的治理范围，不是独立架构 Layer 或新的单项目状态；Portfolio Status 与 Current Stage 分开记录。
- 组合优先级采用商业、战略、紧急、复用、资源成本和风险六维 100 分制，但 Priority Score 只提供资源建议，不自动启动或停止项目。
- 跨项目依赖、共享技术资产和 AI 成本必须使用统一 ID、版本、Owner、Evidence 和 Confidence 管理；共享能力不能成为无主单点或未分摊成本。
- 新项目 DESIGN 前先检索 `APPROVED_FOR_REUSE` 技术资产，复用结论仍须满足适用设计、安全、测试和发布门禁。
- CTO Dashboard 是组合快照与下钻视图，不是事实源或审批器；Investment Recommendation 必须经用户对当前 Portfolio Snapshot 明确批准。
- Portfolio Health 综合项目健康、风险项目比例、技术债、资产复用和 AI 成本趋势，且组合高分不能抵消单项目红线。
- AI CTO System 使用五层 Layer + Module 作为权威架构模型；Phase 只保留为历史交付批次，Lifecycle State 只描述单项目状态。
- 每个 Module 必须有且只有一个 Owning Layer；跨层关系通过版本化输入输出合同表示，不复制权威数据、评分或 Gate。
- 未来需求必须先分类为复用 Module、扩展 Module、在现有 Layer 创建 Module、提议新 Layer 或暂缓，禁止单个功能直接创建新 Phase。
- 新 Layer 必须通过系统级架构评审；Module 移动、合并、拆分、跨层权威或核心 Gate 变化必须创建 ADR。
- Layer 5 是未来执行与智能层，目前全部为 `Planned`；它不得覆盖 Layer 2 决策、Layer 3 工程基线、Layer 4 生命周期门禁或 Layer 1 记忆规则。
- Capability Governance 已归类为 Layer 5 的 `Planned` Module；本次审查不进入 Phase 8.2，也不实现该能力。

## 历史修改

- 2026-07-13：完成 Phase 1 Kernel 初始化。
- 2026-07-13：建立 Phase 2 Operating Protocol。
- 2026-07-13：建立 Phase 3 Decision Intelligence。
- 2026-07-13：建立 Phase 4 Design Intelligence。
- 2026-07-13：建立 Phase 5 Development Execution Intelligence。
- 2026-07-13：建立 Phase 6 Testing & Release Intelligence。
- 2026-07-13：建立 Phase 6.5 Existing Project Onboarding Intelligence。
- 2026-07-13：建立 Phase 7 Maintenance & Evolution Intelligence。
- 2026-07-13：建立 Phase 8 Portfolio & Multi-Project Governance Intelligence。
- 2026-07-13：完成 AI CTO System Architecture Review，采用五层 Layer + Module 模型并创建 ADR-0009。

## 当前状态

AI CTO System Architecture Review 已完成五层架构、模块注册表、未来需求归类、Phase 映射和架构演进规则。当前等待用户确认；Capability Governance 保持 Layer 5 `Planned`，不进入 Phase 8.2。

## 未来计划

等待用户确认架构审查。确认后先按 Layer + Module 规则处理后续需求；若继续 Capability Governance，应作为 Layer 5 现有 Planned Module 另行完成需求、设计与授权，不默认创建 Phase 8.2。
