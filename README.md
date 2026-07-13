# AI CTO System

## 系统使命

AI CTO System 帮助个人或组织建立可持续运作的 AI 技术组织，将想法持续转化为可交付、可维护、可进化的产品资产，并把每次项目实践沉淀为下一次研发的复利。

任何 Agent、Codex 或贡献者进入本项目时，必须先阅读 [AI CTO System Manifesto](./docs/strategy/AI_CTO_SYSTEM_MANIFESTO.md)，再理解工作规则、架构和具体任务。功能数量和自动化程度不能替代使命对齐。

## 项目介绍

AI CTO System 不是单一软件项目，而是管理未来 AI 项目与技术组织能力的长期操作系统。它通过统一的身份与记忆、决策治理、产品工程、运营生命周期和未来执行能力，管理从想法、立项、设计、开发、测试、发布到维护、接管、进化和组合治理的全过程。

## 核心价值

- 提升想法到产品的转化效率。
- 沉淀可验证、可维护、可复用的技术资产。
- 让项目经验形成长期研发复利。
- 通过复用和受控自动化降低重复劳动。
- 在 AI 提供建议与执行支持的同时，增强用户自身技术能力。

## 五层架构

AI CTO System 使用 [Layer + Module 五层架构](./docs/architecture/AI_CTO_SYSTEM_ARCHITECTURE.md)：

1. Identity & Memory
2. Decision & Governance
3. Product & Engineering
4. Operation Lifecycle
5. Execution & Intelligence

Phase 只记录历史交付批次，Module 表示可独立治理的能力，Lifecycle State 表示单项目状态。未来需求不能因为路线图名称直接创建新 Phase。

## 战略与治理入口

- [系统使命与边界](./docs/strategy/AI_CTO_SYSTEM_MANIFESTO.md)
- [架构设计原则](./docs/strategy/AI_CTO_ARCHITECTURE_PRINCIPLES.md)
- [模块加入评估规则](./docs/strategy/MODULE_ADMISSION_CRITERIA.md)
- [核心价值飞轮](./docs/strategy/AI_CTO_VALUE_LOOP.md)
- [模块注册表](./docs/architecture/MODULE_REGISTRY.md)
- [未来需求归类规则](./docs/architecture/FEATURE_CLASSIFICATION_RULES.md)
- [Capability Governance](./docs/capability/CAPABILITY_GOVERNANCE_STANDARD.md)
- [Capability Registry](./docs/capability/CAPABILITY_REGISTRY_STANDARD.md)
- [Knowledge Governance](./docs/knowledge/KNOWLEDGE_GOVERNANCE_STANDARD.md)
- [Knowledge Registry](./docs/knowledge/KNOWLEDGE_REGISTRY_STANDARD.md)
- [Governed Knowledge Base](./knowledge_base/)

未来系统能力先证明 Mission Alignment 和长期价值，取得 `ADMIT_FOR_CLASSIFICATION` 后，才能进入 Layer / Module 分类。无法证明使命价值的功能不进入 AI CTO System。

## 系统边界

AI CTO System 不是单纯代码生成工具、聊天机器人、普通项目管理工具或无约束自动化机器人。与使命无直接关系的通用工具应作为独立产品或外部能力管理，不因“使用 AI”自动成为系统核心模块。

## 当前状态

Phase 1–8、Architecture Review、Strategic Alignment Review、Phase 8.2 Capability Governance 和 Phase 8.3 Knowledge Governance 的文档治理已经建立。当前没有具体 Agent Runtime、自动化执行、正式 Capability Record、RAG 或向量数据库，也没有安装、接入或调用外部 Skill、MCP、Agent 或工具。
