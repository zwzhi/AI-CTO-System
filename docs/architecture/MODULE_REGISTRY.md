# AI CTO System 模块注册表

## 1. 使用规则

本注册表是 Module 名称、Owning Layer、用途和状态的权威索引。[AI CTO System Master Plan](../strategy/AI_CTO_SYSTEM_MASTER_PLAN.md) 是最高级总体规划与开发入口；本注册表是其当前 Module 事实投影。新增或调整模块前必须先阅读 Master Plan，再执行[需求归类规则](./FEATURE_CLASSIFICATION_RULES.md)；重大结构变化按[架构演进标准](./ARCHITECTURE_EVOLUTION_STANDARD.md)创建 ADR。

Module 状态变化、Owning Layer 变化、Module 新增 / 合并 / 拆分或核心边界变化后，必须同步更新 Master Plan、SKILL、Project Memory 和 Development Progress。Master Plan 是战略 Artifact，不作为 Module 登记，也不覆盖本注册表的当前事实。

状态只使用：

- `Completed`：治理规范和文档已经建立；不表示已有自动化实现。
- `Planned`：架构位置已确定，但尚未设计或实现。
- `Deprecated`：停止新增使用，等待迁移。
- `Retired`：已退出使用，保留历史追溯。

模板是 Module 产生或消费的 Artifact，不单独注册为 Module。一个 Module 只能有一个 Owning Layer；跨层关系通过相关文档和输入输出合同表示。

## 2. Layer 1：Identity & Memory

| Module Name | Layer | Purpose | Current Status | Related Documents |
|---|---|---|---|---|
| AI CTO Identity & Work Rules | Layer 1 | 定义使命、角色、职责与全局工作约束 | Completed | [Manifesto](../strategy/AI_CTO_SYSTEM_MANIFESTO.md)、[Architecture Principles](../strategy/AI_CTO_ARCHITECTURE_PRINCIPLES.md)、[SKILL](../../SKILL.md)、[AGENTS](../../AGENTS.md) |
| User Brain | Layer 1 | 保存用户画像、工作方式、技术偏好、产品哲学与决策风格 | Completed | [User Brain](../../memory/user_brain/) |
| Project Memory | Layer 1 | 保存项目目标、技术选择、决策、历史、状态与计划 | Completed | [Project Memory](../../memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md) |
| Knowledge Base | Layer 1 | 捕获、验证、注册、复用、纠错和演进可复用知识资产 | Completed | [Knowledge Governance](../knowledge/KNOWLEDGE_GOVERNANCE_STANDARD.md)、[Classification](../knowledge/KNOWLEDGE_CLASSIFICATION_STANDARD.md)、[Registry](../knowledge/KNOWLEDGE_REGISTRY_STANDARD.md)、[Knowledge Base](../../knowledge_base/) |
| Memory Management | Layer 1 | 定义三类记忆的写入、更新、证据和边界 | Completed | [Memory Management](../protocol/MEMORY_MANAGEMENT.md) |

## 3. Layer 2：Decision & Governance

| Module Name | Layer | Purpose | Current Status | Related Documents |
|---|---|---|---|---|
| Idea Intake & Candidate | Layer 2 | 将新想法转换为合格的项目候选记录 | Completed | [Idea Intake](../protocol/IDEA_INTAKE_PROTOCOL.md)、[Candidate Standard](../evaluation/IDEA_CANDIDATE_STANDARD.md) |
| Open Source Research | Layer 2 | 形成开源与替代方案证据 | Completed | [Research Template](../research/OPEN_SOURCE_RESEARCH_TEMPLATE.md) |
| Project Evaluation | Layer 2 | 以 100 分模型评估项目价值与可行性 | Completed | [Evaluation Model](../evaluation/PROJECT_EVALUATION_MODEL.md) |
| Build vs Buy | Layer 2 | 比较自研、二开和现有产品 | Completed | [Build vs Buy](../evaluation/BUILD_BUY_ANALYSIS.md) |
| Confidence | Layer 2 | 标注结论的证据可信等级 | Completed | [Confidence Model](../evaluation/CONFIDENCE_MODEL.md) |
| Project Approval & Phase Gates | Layer 2 | 管理立项和阶段转换的决策证据 | Completed | [Approval Gate](../evaluation/PROJECT_APPROVAL_GATE.md)、[Gate Checklist](../evaluation/PHASE_GATE_CHECKLIST.md) |
| Portfolio Governance | Layer 2 | 管理多项目事实、资源、风险和规划 | Completed | [Portfolio Standard](../portfolio/PROJECT_PORTFOLIO_STANDARD.md) |
| Project Priority | Layer 2 | 为资源分配提供组合优先级建议 | Completed | [Priority Model](../portfolio/PROJECT_PRIORITY_MODEL.md) |
| Project Dependency | Layer 2 | 管理跨项目依赖和关键路径风险 | Completed | [Dependency Standard](../portfolio/PROJECT_DEPENDENCY_STANDARD.md) |
| Technical Asset Registry | Layer 2 | 管理经验证的跨项目可复用技术资产 | Completed | [Asset Registry](../portfolio/TECH_ASSET_REGISTRY_STANDARD.md) |
| AI Cost Governance | Layer 2 | 归集 AI 成本和单位经济性指标 | Completed | [AI Cost](../portfolio/AI_COST_MANAGEMENT_STANDARD.md) |
| CTO Dashboard | Layer 2 | 提供组合事实的只读汇总与下钻 | Completed | [Dashboard Standard](../portfolio/CTO_DASHBOARD_STANDARD.md) |
| Investment Decision | Layer 2 | 在资源竞争时生成版本化投资建议 | Completed | [Investment Decision](../portfolio/PROJECT_INVESTMENT_DECISION_STANDARD.md) |
| Portfolio Health | Layer 2 | 评估组合层整体健康与风险趋势 | Completed | [Portfolio Health](../portfolio/PORTFOLIO_HEALTH_STANDARD.md) |

## 4. Layer 3：Product & Engineering

| Module Name | Layer | Purpose | Current Status | Related Documents |
|---|---|---|---|---|
| Product Design & PRD | Layer 3 | 将批准目标转换为可验收产品需求 | Completed | [Product Design](../design/PRODUCT_DESIGN_STANDARD.md) |
| Requirement Priority | Layer 3 | 管理单项目 P0–P3 需求优先级 | Completed | [Requirement Priority](../design/REQUIREMENT_PRIORITY_MODEL.md) |
| Architecture Design | Layer 3 | 定义产品系统边界、模块、数据流和部署 | Completed | [Architecture Standard](../design/ARCHITECTURE_DESIGN_STANDARD.md) |
| Database Design | Layer 3 | 定义实体、字段、关系、索引和迁移 | Completed | [Database Standard](../design/DATABASE_DESIGN_STANDARD.md) |
| Agent Design | Layer 3 | 定义 AI Agent 的职责、Prompt、工具、Memory 和评估 | Completed | [Agent Design](../design/AGENT_DESIGN_STANDARD.md) |
| Traceability | Layer 3 | 维护 Requirement → Design → Task → Commit → Test | Completed | [Traceability Matrix](../design/TRACEABILITY_MATRIX_TEMPLATE.md) |
| Design Approval | Layer 3 | 管理 DESIGN → DEVELOPMENT 的工程授权 | Completed | [Design Gate](../design/DESIGN_APPROVAL_GATE.md) |
| Task Management | Layer 3 | 把设计拆成可独立验证的开发任务 | Completed | [Task Standard](../development/TASK_MANAGEMENT_STANDARD.md) |
| Development Execution Plan | Layer 3 | 管理任务顺序、依赖、里程碑、风险与资源 | Completed | [Execution Plan](../development/DEVELOPMENT_EXECUTION_PLAN_STANDARD.md) |
| Git Workflow | Layer 3 | 管理分支、提交和可追溯版本 | Completed | [Git Workflow](../development/GIT_WORKFLOW_STANDARD.md) |
| Test-Driven Development | Layer 3 | 规定测试先行的工程实现顺序 | Completed | [TDD Standard](../development/TEST_DRIVEN_DEVELOPMENT_STANDARD.md) |
| Code Review | Layer 3 | 审核需求、架构、ADR、安全、性能和测试 | Completed | [Code Review](../development/CODE_REVIEW_STANDARD.md) |
| Change Impact | Layer 3 | 分析变更对模块、数据、API、测试和回滚的影响 | Completed | [Change Impact](../development/CHANGE_IMPACT_ANALYSIS.md) |
| Development Status & Gate | Layer 3 | 管理开发状态并授权进入 Testing | Completed | [Status](../development/DEVELOPMENT_STATUS_STANDARD.md)、[Development Gate](../development/DEVELOPMENT_APPROVAL_GATE.md) |

## 5. Layer 4：Operation Lifecycle

| Module Name | Layer | Purpose | Current Status | Related Documents |
|---|---|---|---|---|
| Project Lifecycle | Layer 4 | 定义单项目状态机和转换规则 | Completed | [Project Lifecycle](../protocol/PROJECT_LIFECYCLE.md) |
| Project Initialization | Layer 4 | 在正式立项时建立标准项目空间 | Completed | [Initialization](../protocol/PROJECT_INITIALIZATION.md) |
| Document Relationship | Layer 4 | 维护跨生命周期文档关系与变更传播 | Completed | [Document Relationship](../protocol/DOCUMENT_RELATIONSHIP.md) |
| Test Strategy | Layer 4 | 管理测试范围、类型、环境、数据和证据 | Completed | [Test Strategy](../testing/TEST_STRATEGY_STANDARD.md) |
| Bug Management | Layer 4 | 管理 Bug 生命周期和 P0–P3 分级 | Completed | [Bug Standard](../testing/BUG_MANAGEMENT_STANDARD.md) |
| AI Evaluation | Layer 4 | 验证发布候选的 AI 效果、成本与稳定性 | Completed | [AI Evaluation](../testing/AI_EVALUATION_STANDARD.md) |
| Security Review | Layer 4 | 审核密钥、数据、权限、第三方和日志安全 | Completed | [Security Review](../testing/SECURITY_REVIEW_STANDARD.md) |
| Release Approval & Gate | Layer 4 | 授权 TESTING → RELEASE | Completed | [Release Approval](../release/RELEASE_APPROVAL_GATE.md)、[Testing Release Gate](../release/TESTING_RELEASE_GATE.md) |
| Deployment & Rollback | Layer 4 | 管理部署、配置、迁移、恢复和回滚 | Completed | [Deployment Standard](../release/DEPLOYMENT_ROLLBACK_STANDARD.md) |
| Delivery & Environment Governance | Layer 4 | 管理用户环境、配置、交付包、文档、诊断、交付 Gate 与资产复用 | Completed | [Delivery](../delivery/DELIVERY_GOVERNANCE_STANDARD.md)、[Environment](../delivery/ENVIRONMENT_SPECIFICATION_STANDARD.md)、[Gate](../delivery/DELIVERY_READINESS_GATE.md)、[ADR-0016](../adr/ADR-0016-DELIVERY-AND-ENVIRONMENT-GOVERNANCE.md) |
| Monitoring | Layer 4 | 管理上线后状态、错误、性能、反馈与 AI 指标 | Completed | [Monitoring](../release/MONITORING_STANDARD.md) |
| Release Reporting | Layer 4 | 保存发布内容、验证、风险和下一计划 | Completed | [Release Report Template](../../templates/RELEASE_REPORT_TEMPLATE.md) |
| Existing Project Onboarding | Layer 4 | 接管已有软件项目并纳入治理 | Completed | [Onboarding Protocol](../onboarding/PROJECT_ONBOARDING_PROTOCOL.md) |
| Reverse Analysis & Recovery | Layer 4 | 从代码和证据恢复项目理解与文档 | Completed | [Recovery](../onboarding/PROJECT_DOCUMENT_RECOVERY.md)、[Reverse Template](../../templates/PROJECT_REVERSE_ANALYSIS_TEMPLATE.md) |
| Project Health Check | Layer 4 | 对已有项目进行八维健康评分 | Completed | [Health Check](../onboarding/PROJECT_HEALTH_CHECK_STANDARD.md) |
| Onboarding Migration Gate | Layer 4 | 决定已有项目是否完成接管 | Completed | [Migration Checklist](../onboarding/PROJECT_MIGRATION_CHECKLIST.md) |
| Experience Extraction | Layer 4 | 将接管经验沉淀到知识库 | Completed | [Experience Extraction](../onboarding/EXPERIENCE_EXTRACTION_STANDARD.md) |
| Maintenance | Layer 4 | 管理稳定运营期 Bug、小版本、性能、依赖和安全 | Completed | [Maintenance Standard](../maintenance/MAINTENANCE_STANDARD.md) |
| Incident & Postmortem | Layer 4 | 管理生产故障、永久修复和复盘 | Completed | [Incident](../maintenance/INCIDENT_MANAGEMENT_STANDARD.md)、[Postmortem Template](../../templates/POSTMORTEM_TEMPLATE.md) |
| Technical Debt | Layer 4 | 登记、排序和关闭技术债 | Completed | [Tech Debt](../maintenance/TECH_DEBT_MANAGEMENT_STANDARD.md) |
| User Feedback | Layer 4 | 将用户反馈转为可验证维护或演进输入 | Completed | [Feedback Pipeline](../maintenance/USER_FEEDBACK_PIPELINE.md) |
| AI Capability Evolution | Layer 4 | 记录运营期 AI 能力长期趋势 | Completed | [AI Capability Evolution](../evolution/AI_CAPABILITY_EVOLUTION_STANDARD.md) |
| Evolution Proposal & Gate | Layer 4 | 管理系统性优化提案及进入 Evolution 的授权 | Completed | [Proposal](../evolution/EVOLUTION_PROPOSAL_STANDARD.md)、[Evolution Gate](../evolution/EVOLUTION_GATE.md) |
| Project Retirement | Layer 4 | 管理继续维护、重构、归档和停止 | Completed | [Retirement Standard](../maintenance/PROJECT_RETIREMENT_STANDARD.md) |

## 6. Layer 5：Execution & Intelligence

| Module Name | Layer | Purpose | Current Status | Related Documents |
|---|---|---|---|---|
| Intent Gateway | Layer 5 | 将用户输入转换为建议性 Intent Classification Result，并判断触发、置信度与确认需求 | Completed | [Gateway](../intent/INTENT_GATEWAY_STANDARD.md)、[Classification](../intent/INTENT_CLASSIFICATION_STANDARD.md)、[Evidence](../intent/INTENT_EVIDENCE_STANDARD.md)、[ADR-0015](../adr/ADR-0015-INTENT-GATEWAY-GOVERNANCE.md) |
| Agent Runtime | Layer 5 | 管理 Agent 合同、任务执行边界、状态、权限、预算、人类控制和审计；当前完成 Planner-first 与确定性本地 Planner 实施设计 | Completed | [Execution Model](../runtime/AGENT_EXECUTION_MODEL.md)、[Contract](../runtime/AGENT_CONTRACT_STANDARD.md)、[Planner](../runtime/PLANNER_AGENT_DESIGN.md)、[Implementation Design](../runtime/SINGLE_AGENT_RUNTIME_IMPLEMENTATION_DESIGN.md)、[AgentTask](../runtime/AGENT_TASK_MODEL.md)、[ADR-0023](../adr/ADR-0023-SINGLE-AGENT-RUNTIME-IMPLEMENTATION.md) |
| AI CTO Runtime Architecture | Layer 5 | 定义未来受控执行面、Workflow、权限、审批、预算、审计与 Adapter 合同，并包含 Phase 9C-2 的本地 Runtime Foundation MVP 实现 | Completed | [Runtime](../runtime/AI_CTO_RUNTIME_ARCHITECTURE.md)、[Foundation Plan](../runtime/RUNTIME_FOUNDATION_IMPLEMENTATION_PLAN.md)、[API Contract](../runtime/RUNTIME_API_CONTRACT.md)、[Implementation Gate](../runtime/RUNTIME_IMPLEMENTATION_GATE.md)、[Runtime Source](../../runtime/services/runtime-foundation-service.ts)、[ADR-0018](../adr/ADR-0018-AI-CTO-RUNTIME-ARCHITECTURE.md)、[ADR-0021](../adr/ADR-0021-RUNTIME-FOUNDATION-TECH-STACK.md) |
| Tool Calling | Layer 5 | 管理未来工具调用、权限、结果和副作用 | Planned | [System Architecture](./AI_CTO_SYSTEM_ARCHITECTURE.md) |
| Codex Integration | Layer 5 | 定义 Codex 作为可替换 Engineering Capability 的合同、Adapter、权限、人工控制、审计、失败、Mock-only 实现设计与测试边界 | Completed | [Architecture](../runtime/CODEX_CAPABILITY_ARCHITECTURE.md)、[Contract](../runtime/CODEX_CAPABILITY_CONTRACT.md)、[Implementation Design](../runtime/CODEX_CAPABILITY_IMPLEMENTATION_DESIGN.md)、[Mock Design](../runtime/MOCK_CODEX_CAPABILITY_DESIGN.md)、[Implementation Gate](../runtime/CODEX_CAPABILITY_IMPLEMENTATION_GATE.md)、[ADR-0024](../adr/ADR-0024-CODEX-CAPABILITY-INTEGRATION.md)、[ADR-0025](../adr/ADR-0025-CODEX-CAPABILITY-IMPLEMENTATION.md) |
| Automation | Layer 5 | 编排经授权的重复流程和状态同步 | Planned | [System Architecture](./AI_CTO_SYSTEM_ARCHITECTURE.md) |
| Capability Governance | Layer 5 | 管理内部 / 外部能力的准入、注册、评估、选择、权限和生命周期 | Completed | [Governance](../capability/CAPABILITY_GOVERNANCE_STANDARD.md)、[Admission](../capability/CAPABILITY_ADMISSION_PROCESS.md)、[Registry](../capability/CAPABILITY_REGISTRY_STANDARD.md)、[Evaluation](../capability/CAPABILITY_EVALUATION_STANDARD.md)、[Engineering Strategy](../capability/ENGINEERING_CAPABILITY_STRATEGY.md) |
| Execution Routing Governance | Layer 5 | 根据任务特征生成建议性 Execution Plan，治理复杂度、Workflow、资源、上下文、偏好和 Evidence | Completed | [Routing Standard](../governance/EXECUTION_ROUTING_GOVERNANCE_STANDARD.md)、[Complexity](../governance/TASK_COMPLEXITY_MODEL.md)、[Evidence](../governance/EXECUTION_ROUTING_EVIDENCE_STANDARD.md)、[ADR-0014](../adr/ADR-0014-EXECUTION-ROUTING-GOVERNANCE.md) |

Capability Governance 的文档治理在 Phase 8.2 完成；Engineering Capability Strategy 已定义 Provider 无关的类别、风险优先级、合同和 `Adopt / Improve / Merge / Deprecate / Remove` 策略动作。真实 Capability Record、自动选择、插件接入和工具调用仍未实现。`Completed` 不表示已安装或激活任何外部能力。

Execution Routing Governance 的文档治理在 Phase 8.4 完成；它只输出建议性 Execution Plan。Intent Gateway 与 Agent Runtime 的合同治理已完成，但没有 Router 代码、真实 Agent、自动模型切换、真实工具调用或执行授权；Tool Calling 与 Automation 仍为 `Planned`。

Intent Gateway 的文档治理在 Phase 8.5 完成；它只输出建议性 Intent Classification Result。Intent Classifier Runtime、模型调用、自动任务执行、真实 Agent、Tool Calling 与 Automation 均未实现。

Phase 9C-2 已实现并以 12 项本地测试验证 Runtime Foundation MVP：TypeScript + Node.js 24、Repository Port + In-memory Adapter、单 Workflow / Task、Mock Capability、Execution Context、Evidence Contract、Permission / Budget Guard、Execution / Audit 与受控失败状态。Phase 9C-3 在同一 `Agent Runtime` Module 建立 Planner-first 合同；Phase 9C-4 实现 `PlannerAgentPort → DeterministicPlanner`、版本化 `ExecutionPlan`、AgentTask、审批、审计、测试与实现 Gate，并以 25 项本地测试完成 Correction / Review。Agent 只返回 Result + Evidence，默认 `CONFIRM`，Workflow 独占 `WAITING_APPROVAL` 和后续状态推进。Phase 9C-5 已完成 Codex Integration 合同/Review、Mock-only Implementation 与公开 Evidence Acquisition：其 `Completed` 仅表示文档、Mock 与 Evidence 基线完成，Capability Registry Record 仍为 `ABSENT`，Evaluation 为 `BLOCKED`，Admission 为 `REJECT_OR_DEFER`；未完成真实准入、评估、激活或 Codex/API/CLI/MCP/网络接入；Tool Calling 与 Automation 保持 `Planned`。
