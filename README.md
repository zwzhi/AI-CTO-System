# AI CTO System

## 系统使命

AI CTO System 帮助个人或组织建立可持续运作的 AI 技术组织，将想法持续转化为可交付、可维护、可进化的产品资产，并把每次项目实践沉淀为下一次研发的复利。

任何 Agent、Codex 或贡献者进入本项目时，必须先阅读 [AI CTO System Master Plan](./docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md) 与 [AI CTO System Manifesto](./docs/strategy/AI_CTO_SYSTEM_MANIFESTO.md)，再理解工作规则、架构和具体任务。功能数量和自动化程度不能替代使命对齐。

当前工作版本：`v2.1.1`（宿主中立版）。v2 基线：`v2.0.0-codex-native`；v1 治理基线由 Git tag `v1.0.0-governance-baseline` 保留。v2 通过 Active Operating Core、宿主执行面模型和按路由加载的详细标准降低日常上下文和流程负担；v2.1.x 吸收了 [codex-long-term-assistant-skills](https://github.com/JimmyVGDY/codex-long-term-assistant-skills)（LTA）的工程实践，并将宿主措辞通用化（Codex / ZCode 双宿主）。

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

- [AI CTO System Master Plan](./docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md)
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
- [Finalization Integrity](./docs/governance/FINALIZATION_INTEGRITY_STANDARD.md)
- [Codex Execution Plane Alignment](./docs/architecture/CODEX_EXECUTION_PLANE_ALIGNMENT.md)
- [AI CTO–Codex Operating Model](./docs/architecture/AI_CTO_CODEX_OPERATING_MODEL.md)
- [AI CTO Active Operating Core](./docs/architecture/AI_CTO_ACTIVE_OPERATING_CORE.md)
- [AI CTO Comprehensive Product Review](./docs/strategy/AI_CTO_SYSTEM_COMPREHENSIVE_REVIEW.md)
- [Progress Synchronization](./docs/governance/PROGRESS_SYNCHRONIZATION_STANDARD.md)
- [安装与首次使用](./docs/GETTING_STARTED.md)
- [Governed Knowledge Base](./knowledge_base/)

未来系统能力先以 Master Plan 核对当前架构和路线，再证明 Mission Alignment 和长期价值；取得 `ADMIT_FOR_CLASSIFICATION` 后，才能进入 Layer / Module 分类。无法证明使命价值的功能不进入 AI CTO System。

## 系统边界

AI CTO System 不是单纯代码生成工具、聊天机器人、普通项目管理工具或无约束自动化机器人。与使命无直接关系的通用工具应作为独立产品或外部能力管理，不因“使用 AI”自动成为系统核心模块。

## 与宿主 Agent 的关系

AI CTO System 负责治理平面：使命、记忆、决策、设计、生命周期、Evidence、Audit、Gate 和人类控制；宿主 Agent 负责执行平面：模型、文件 / Shell、子代理、Skills、MCP、定时任务和宿主权限。当前验证过的宿主包括 Codex App / CLI / IDE 与 ZCode，同一套治理通过宿主术语映射在两者上工作。日常使用宿主能力不等于激活外部 Capability；真实 Provider 接入仍遵循独立准入和安全规则。详见 [Codex Execution Plane Alignment](./docs/architecture/CODEX_EXECUTION_PLANE_ALIGNMENT.md)。

## 快速开始

两种安装方式，治理内容完全一致：

1. **通用技能方式（任何支持 SKILL.md 的宿主，如 ZCode）**：把本仓库根目录（含 `SKILL.md` 与 `docs/`）放入宿主的用户级技能目录（如 `~/.zcode/skills/ai-cto-system/` 或 `~/.codex/skills/ai-cto-system/`），新会话自动生效。
2. **Codex 插件方式**：通过发行 marketplace 安装插件包；Plugin 只是安装、发现和版本包装，不改变治理权威。

安装后无需唤醒命令：提出新项目想法、接管/继续项目或重要功能与架构决策时自动介入；`AI_CTO_MODE: OFF` / `普通模式处理` 可按请求退出。详见 [安装与首次使用](./docs/GETTING_STARTED.md)。

## 最常用的使用方式

```text
新项目：我想做一个新项目：……请按 AI CTO System 先做 Idea 分析，不要直接编码。
已有项目：请接管当前项目，先完成 Onboarding 和健康评估，不修改代码。
继续开发：继续当前项目，读取 Project State 和 Memory，完成下一个已授权任务。
退出治理：AI_CTO_MODE: OFF
```

用户不需要每条消息重复唤醒；AI CTO Skill 会根据当前项目、Intent、风险和 Gate 选择最小充分的宿主执行面。完整规则见 [AI CTO–Codex Operating Model](./docs/architecture/AI_CTO_CODEX_OPERATING_MODEL.md)。

## 当前状态

Phase 1–8、Architecture Review、Strategic Alignment Review、Phase 8.2 Capability Governance、Phase 8.3 Knowledge Governance、Knowledge Governance Pilot、Master Architecture Sync 与 Phase 8.4 `Intelligent Resource & Execution Routing Governance` 的文档治理已经建立；Phase 8.4 含确定性只读路由建议，但不包含真实模型切换、工具调用或执行授权。当前没有生产级 Agent Runtime、自动化执行、RAG 或向量数据库；仓库内 AI CTO Skill Gateway 已存在并允许隐式调用，但新对话发现仍需独立 Fresh Session Pilot 证据。当前没有安装、接入或调用外部 MCP、Agent、Provider 或工具。

v2.1.0：形成 Thin Plugin 发行包装设计（ADR-0034）与本地 marketplace 发行包；Plugin 仅做安装、发现和版本管理，发行制品排除创建者 User Brain、Project Memory、真实项目反馈、Secrets 与 Git 元数据。

v2.1.1：吸收 LTA V7.10.0 七条工程实践——证据新鲜度（对象变更即失效）、分离授权（commit/push/部署/重启/数据写入逐项授权与读回）、风险导向复审（L3+ 实现前独立子代理按风险组合复审）、会话交接检查点、记忆隐私边界、响应契约分级（L1–L2 一行路由，L3–L4 完整契约）、显式停止条件；宿主措辞通用化为 Codex / ZCode 双宿主。

## 许可证

本项目基于 [Apache License 2.0](./LICENSE) 开源。
