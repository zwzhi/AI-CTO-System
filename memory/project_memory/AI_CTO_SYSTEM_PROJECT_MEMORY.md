# AI CTO System Project Memory

## 项目目标

帮助个人或组织建立可持续运作的 AI 技术组织，将想法持续转化为可交付、可维护、可进化的产品资产，并让真实项目经验形成研发复利。

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
- 接管完成后的跨项目经验按证据、适用范围和许可边界提取到权威 `knowledge_base/`；历史 `memory/knowledge_base/` 仅保留为 Legacy Capture Area。
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
- Capability Governance 归属 Layer 5；Phase 8.2 已完成文档治理，真实 Capability、Runtime、自动选择、外部接入和工具调用仍为 `Planned`。
- AI CTO System 的使命基线由 Manifesto 定义：提高想法到产品的长期转化能力，沉淀技术资产，形成研发复利并增强用户技术能力。
- 系统不是单纯代码生成工具、聊天机器人、普通项目管理工具或无约束自动化机器人；通用邻近 AI 功能不自动成为核心 Module。
- Strategic Alignment 与 Module Admission 位于 Feature Classification 之前；先证明能力应该进入系统，再判断属于哪个 Layer。
- Module Admission 必须评估使命贡献、核心问题、Layer 候选、复用、长期资产与复杂度，结果只使用 `ADMIT_FOR_CLASSIFICATION`、`CONDITIONAL_ADMISSION` 或 `REJECT_OR_DEFER`。
- 只有 `ADMIT_FOR_CLASSIFICATION` 允许进入 Layer + Module 分类；该结果不授权设计、编码或功能实现。
- AI CTO 提供建议，人类对使命变化、Module 准入、重大资源投入和风险接受作最终决策。
- Strategic Alignment 是跨层治理检查点，不是第六个 Layer、新生命周期状态或新功能 Phase。
- Capability 是 AI CTO 可以调用、组合或委托的内部 / 外部能力，不等同于系统 Module、Feature 或 Technical Asset。
- Capability 治理链固定为 Mission Alignment → Admission → Registry → Evaluation → Activation → Selection / Invocation → Monitoring → Lifecycle Decision。
- Capability Type 只使用 Engineering、Testing、Security、Deployment、Research、Documentation、Data 和 AI Model 八类。
- Registry Status 只使用 `DISCOVERED`、`EVALUATING`、`ACTIVE`、`DEPRECATED`、`DISABLED`、`REMOVED`；Admission Result 只使用 `ADMIT_FOR_EVALUATION`、`ACTIVATE_CAPABILITY`、`REJECT_OR_DEFER`。
- 登记、Quality Score、`ACTIVE` 和单次 Invocation Authorization 分开判断；高分或激活状态不能抵消项目权限、License、安全、兼容或 Gate。
- 外部能力必须确认来源、License、安全、功能和兼容性，并通过可替换 Capability Contract / Adapter 接入；AI CTO Core 不直接依赖具体实现。
- Superpowers 目前只有架构示例，没有安装、读取、调用、注册或激活任何真实能力。
- Knowledge Governance 扩展 Layer 1 的既有 Knowledge Base Module；Phase 8.3 只是历史交付标签，不新增 Layer 或独立 Module。
- 权威知识资产位于根目录 `knowledge_base/`，按九类目录管理；历史 `memory/knowledge_base/` 不再接收新的权威 `ACTIVE` Knowledge。
- Knowledge 生命周期只使用 `CAPTURED`、`VALIDATING`、`VALIDATED`、`ACTIVE`、`DEPRECATED`、`ARCHIVED`；可信等级使用 L1–L4，质量采用独立的 100 分模型。
- 冲突知识按 Evidence、时间、适用范围和实际效果保留并处理，不允许简单覆盖；复用知识不得绕过 Architecture、Security、Testing 或 Release Gate。
- Phase 8.3 不开发 Agent、不实现 RAG、不接入向量数据库，也不进入 Phase 8.4。
- AI CTO System Master Plan 是最高级总体规划和系统级开发入口；它不覆盖 Manifesto 的使命与边界、已接受 ADR 的历史决策、Module Registry 的当前事实或生命周期 Gate 的执行授权。
- 系统级变更先读取 Master Plan，再执行 Mission Alignment、Module Admission 与 Feature Classification；Phase 名称不构成架构归属或实现授权。
- Knowledge Governance Pilot 选择 AI-CTO-System 作为唯一证据源；Knowledge Admission Review 必须先于实际迁移和生命周期推进。
- Pilot 创建 `KN-ARC-0001`、`KN-ENG-0001`、`KN-FAIL-0001`；前两项为 `VALIDATED`，失败经验因因果泛化只有 L2 Confidence 而保持 `VALIDATING`，三项均未进入 `ACTIVE`。
- 单项目多次采用不构成 L4 或通用最佳实践；复用模拟的 `ADAPT`、`ADOPT`、`REFERENCE_ONLY` 不改变 Knowledge Status，也不产生工程 Gate 授权。
- Phase 8.4 `Intelligent Resource & Execution Routing Governance` 是 Layer 5 的 `Completed` 文档治理 Module：它根据 User Intent、Task Context、Project Context、偏好和 Evidence 输出建议性 Execution Plan，治理复杂度、Workflow、Capability / Skill / Tool、模型类别、Reasoning、Context 与升级条件；不执行、不调用、不切换、不改变 Codex 行为，也不覆盖安全、ADR、Gate、权限或人类决策。
- EFF-001 是路由治理的单案例 Problem Validation Evidence，Confidence 为 L3 / 中等，部分指标为 `NOT_CAPTURED`；它不能固化默认流程、模型、Git 偏好或自动化规则。Runtime、自动模型切换、真实工具调用与自动化仍需多个案例、独立准入、评审、ADR 和受影响 Gate。
- Phase 8.5 Intent Gateway 是 Layer 5 的 `Completed` 文档治理 Module：它识别 Intent、Confidence、Risk、Trigger 和 Confirmation，并向 Execution Routing 提供建议输入；不执行、不调用模型或工具、不训练分类器、不改变 Codex 行为，也不覆盖 Gate 或用户授权。
- Phase 8.6 Delivery & Environment Governance 是 Layer 4 的 `Completed` 文档治理 Module：它管理环境、配置、交付包、用户文档、诊断和 Delivery Gate；不实现 CI/CD、Installer、部署工具或 Runtime。

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
- 2026-07-13：完成 AI CTO System Strategic Alignment Review，建立使命、原则、Module Admission、价值飞轮与 ADR-0010。
- 2026-07-13：完成 Phase 8.2 Capability Governance 文档框架、能力目录、Superpowers 架构示例与 ADR-0011。
- 2026-07-13：完成 Phase 8.3 Knowledge Governance 的分类、生命周期、可信度、质量、提取、复用、冲突、Registry、权威目录与 ADR-0012。
- 2026-07-13：完成 Phase 8.3 Knowledge Governance Pilot，建立 Record 模板、Admission Review、三条受控知识、Registry、复用模拟与 Pilot Report。
- 2026-07-14：完成 Master Architecture Sync，建立 AI CTO System Master Plan 并同步 README、SKILL、Module Registry、Project Memory 与 Development Progress。
- 2026-07-14：同步 Phase 8.4 为 Intelligent Resource & Execution Routing Governance；仅记录路线边界、反馈来源和未来证据要求，不创建 Module、ADR 或运行时实现。
- 2026-07-14：完成 Phase 8.4 Execution Routing Governance 文档治理，建立 L0–L4、Workflow、Skill、Tool、Model、Reasoning、Context、偏好、Evidence 规则与 ADR-0014，并登记 Layer 5 Module；未创建 Runtime 或自动化。
- 2026-07-14：完成 Phase 8.5 Intent Gateway Governance 文档治理，建立分类、触发、置信度、映射、冲突、主动介入、Evidence 与 ADR-0015，并登记 Layer 5 Module；未创建 Runtime 或 Classifier。
- 2026-07-14：完成 Phase 8.6 Delivery & Environment Governance 文档治理，建立九份交付规范与 ADR-0016，并登记 Layer 4 Module；未进入 Phase 9。
- 2026-07-14：完成 Governance Completion Review 与 ADR-0017；治理前置条件结论为 `READY_FOR_RUNTIME`，不授权 Phase 9 或 Runtime 实现。
- 2026-07-14：完成 Phase 9A Runtime Architecture Design 与 ADR-0018；仅建立 Control Plane First 架构合同，未实现 Runtime 或进入 Phase 9B。
- 2026-07-14：完成 Phase 9B Runtime MVP Scope Design 与 ADR-0019；定义单 Workflow、单 Task、Mock Capability、Audit Evidence、`AUTO` / `CONFIRM` / `BLOCK`、Success Criteria 和四类失败场景，未开发 Runtime 代码或接入真实 Agent、Codex、MCP、工具和自动执行。
- 2026-07-14：完成 Phase 9C-1 Runtime Foundation Implementation Design 与 ADR-0020；以 Thin Core + Contract First 建立 Workflow、Task、Mock Capability Adapter、Execution Context、Evidence Contract、Permission / Budget Guard、Audit、失败处理、测试和代码开发 Gate 的技术栈中立设计，未进入 Phase 9C-2 代码开发。
- 2026-07-14：完成 Phase 9C-2 Runtime Foundation MVP 实现与 ADR-0021；使用 TypeScript + Node.js 24、Repository Port + In-memory Adapter 实现单 Workflow / Task、Mock Capability、Guard、Execution / Audit，并通过 12 项本地测试；未接入真实 Agent、Codex/MCP、外部工具、数据库、Web 框架或自动执行。
- 2026-07-14：完成 Phase 9C-2 Runtime Foundation Review；以实现、合同、状态机和一次重新运行的 12/12 本地测试为 Evidence，Review Gate 结果为 `APPROVED_FOR_NEXT_PHASE`。未发现需要改变架构的重大结论，`ADR Not Required`；仅提出后续测试覆盖、In-memory 持久化、类型校验和未来集成安全风险，不授权生产或真实执行。
- 2026-07-14：完成 Phase 9C-3 Single Agent Execution Design 与 ADR-0022；在既有 Agent Runtime Module 内定义 Planner-first 合同、Agent 生命周期、最小权限、预算、审计、失败与人类控制。Planner 只返回 Proposed Execution Plan + Evidence，默认 `CONFIRM` 并由 Workflow 进入 `WAITING_APPROVAL`；未创建真实 Agent、工具调用、Codex/MCP 或自动执行。
- 2026-07-14：完成 Phase 9C-4 Single Agent Runtime Implementation Design 与 ADR-0023；定义 `PlannerAgentPort → DeterministicPlanner`、版本化 `ExecutionPlan` Contract、AgentTask、审批、审计、测试和实现 Gate。DeterministicPlanner 只用固定输入与封闭模板生成可预测计划；未写代码、未创建真实 Agent、未调用模型/网络/工具或自动执行。
- 2026-07-14：完成 Phase 9C-4 Single Agent Runtime 本地 MVP 实现；以 `PlannerAgentPort → DeterministicPlanner`、AgentTask 生命周期、版本化 ExecutionPlan、Workflow `WAITING_APPROVAL`、Permission / Budget 预检和 Agent Audit 形成受控闭环，并通过 21 项本地 `node:test`。未接入模型、网络、Codex/MCP、外部工具、多 Agent、持久化或自动执行。
- 2026-07-14：完成 Phase 9C-4 Deterministic Planner Runtime Review；21 项本地测试重新通过，未发现外部调用、Planner 直接推进 Workflow 或审批绕过。Review Gate 为 `CHANGES_REQUIRED`：Audit 尚缺输入/输出引用、权限/预算快照和失败字段，Planner 预检也尚未强制 `CONFIRM` 模式；未授权进入下一阶段。
- 2026-07-14：完成 Phase 9C-4 Correction；Audit 已补齐输入/输出引用、权限/预算快照、失败原因与阶段，Planner 预检已限制为 `CONFIRM`，Plan 约束引用已在 Runtime 验证，并新增无效 Plan、约束越界和集成失败测试。25 项本地测试通过，Review Gate 更新为 `APPROVED_FOR_NEXT_PHASE`；未自动进入下一阶段。

## 当前状态

Master Architecture Sync 已完成。Phase 8.3 Knowledge Governance Pilot 验收结果为 `PASSED_WITH_CONSTRAINTS`：2 条 `VALIDATED`、1 条 `VALIDATING`、0 条 `ACTIVE`。Phase 9A、9B、9C-1、9C-2 实现/Review、9C-3 Agent Contract 和 9C-4 受控本地 Deterministic Planner MVP / Correction / Review 已完成；当前 Review Gate 为 `APPROVED_FOR_NEXT_PHASE`，且仍没有 Router、Classifier、真实 Agent、模型调用、真实工具调用、持久化或自动化实现。

## 未来计划

等待用户确认 Phase 9C-4 Correction / Review 结果。`APPROVED_FOR_NEXT_PHASE` 只允许讨论和设计后续阶段，不自动进入或实现 Phase 9C-5。后续任何真实 Agent 或 Runtime 扩展必须先复核本地 In-memory MVP 的证据边界、Review 报告风险、Planner/Plan/AgentTask 合同和缺失覆盖，并通过受影响的 Single Agent Gate、Mission Alignment、Module Admission、Feature Classification、Architecture Review、必要 ADR、Capability / Permission / Safety 审查；不得把本次本地 MVP 推广为真实 Agent、LLM、Codex/MCP、外部工具、数据库、生产环境或自动执行授权。
