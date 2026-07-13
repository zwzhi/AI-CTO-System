# AI CTO Capability Governance 标准

## 1. 目的

Capability Governance 管理 AI CTO System 可以使用的内部或外部能力，确保每项能力在进入生态前完成使命对齐、风险审查、质量评估、注册、授权和生命周期治理。

治理流程为：

`Mission Alignment → Capability Admission → Capability Registry → Capability Evaluation → Capability Activation`

本标准属于 Layer 5：Execution & Intelligence 中的 Capability Governance Module。Phase 8.2 是本套治理文档的历史交付标签，不创建第六个 Layer，也不实现 Agent Runtime、工具调用或外部接入。

## 2. Capability 定义

Capability 是 AI CTO 可通过稳定合同调用、组合或委托的内部或外部能力。它必须具有明确目的、输入、输出、来源、版本、依赖、权限、质量、风险、状态和退出路径。

Capability 不是功能模块：

| 概念 | 含义 | 示例 |
|---|---|---|
| Module | AI CTO System 内部长期治理职责和权威边界 | Capability Governance、Project Evaluation |
| Capability | Module 或未来 Runtime 可以选择、调用或替换的能力单元 | 代码审查 Skill、测试工具、部署 MCP 能力 |
| Feature | 面向用户或系统行为的具体需求 | 为项目生成测试报告 |
| Technical Asset | 经验证、可复用的代码、模板、架构或方案 | Review 模板、部署脚本 |

一个外部产品、Skill、MCP Server 或 Agent 可以暴露多个 Capability。若权限、输入输出、版本或风险边界不同，应拆成独立 Capability Record，不能用一个宽泛记录覆盖全部行为。

## 3. Capability 类型

Type 只使用以下八类：

| Type | 主要用途 |
|---|---|
| `Engineering Capability` | Planning、编码、TDD、调试、Review、重构等工程活动 |
| `Testing Capability` | 测试设计、执行、覆盖、回归、验证与证据生成 |
| `Security Capability` | 安全扫描、权限检查、密钥与供应链风险识别 |
| `Deployment Capability` | 构建、发布、部署、回滚、环境和基础设施操作 |
| `Research Capability` | 信息检索、开源调研、方案比较和来源验证 |
| `Documentation Capability` | 文档生成、转换、维护、追踪和一致性检查 |
| `Data Capability` | 数据读取、转换、质量、分析、迁移和治理 |
| `AI Model Capability` | 模型推理、嵌入、视觉、语音或其他模型能力 |

无法归类时保持 `DISCOVERED` 并补充边界，不创建临时 Type。跨类型能力按主要目的指定一个 Type，并在 Dependencies / Related Capabilities 中记录组合关系。

## 4. 与五层架构的关系

Capability Governance 的 Owning Layer 固定为 Layer 5。Registry 中的 `Applicable Layer` 表示能力可以服务的消费者，不改变其治理归属：

| Applicable Layer | Capability 可提供的支持 | 不得替代 |
|---|---|---|
| Layer 1 | 记忆处理、知识转换、检索或数据质量 | Memory 写入证据、隐私和更新规则 |
| Layer 2 | Research、评估、分析和决策辅助 | 项目评分、Gate 或人类最终决策 |
| Layer 3 | 设计、工程、测试先行、Review 和文档 | PRD / Architecture 基线与工程授权 |
| Layer 4 | Testing、Security、Deployment、Monitoring 和 Incident 支持 | 生命周期状态、专项 Gate 和发布授权 |
| Layer 5 | Runtime、路由、工具调用和自动化执行 | Capability 自身准入、权限和审计 |

Capability 可以跨层复用，但每次调用必须绑定当前项目、任务、阶段、权限、风险和证据。任何 Capability 都不能凭质量高分或 `ACTIVE` 状态绕过 Layer 1–4 的权威规则。

## 5. 治理职责

- **Capability Owner：** 维护目的、合同、版本、依赖、质量、风险和退出路径。
- **Registry Owner：** 保证记录唯一、完整、版本化且状态合法。
- **Security / License Reviewer：** 独立复核权限、数据、供应链、License 和外部来源。
- **Evaluation Owner：** 冻结基线、测试、评分、Evidence 和 Confidence。
- **Human Approver：** 对激活、生产权限、风险接受和例外作最终决定。
- **Runtime / Selector（未来）：** 只从 `ACTIVE` 且当前授权有效的记录中选择，不自行批准能力。

角色可以由同一人承担低风险工作，但高风险、生产写入、敏感数据或高权限能力必须有独立安全复核和人类批准。

## 6. 不可混淆的四种判断

1. **Admission Result：** 是否允许评估、激活或拒绝。
2. **Registry Status：** 能力当前生命周期状态。
3. **Quality Score：** 当前冻结版本的质量证据。
4. **Invocation Authorization：** 是否允许在特定项目、任务和环境中调用。

`ADMIT_FOR_EVALUATION` 不等于激活；登记不等于可用；90 分不等于自动授权；`ACTIVE` 不等于对所有项目、数据、环境和权限开放。

## 7. 最小治理链

每项 Capability 必须能追溯：

`Mission Evidence → Admission Record → Registry Record → Evaluation Baseline / Evidence → Activation Approval → Selection / Invocation Record → Monitoring / Incident → Lifecycle Decision`

任一关键记录缺失、过期、与当前版本不一致或存在红线时，不得激活或调用。

## 8. Phase 8.2 边界

本阶段只建立治理标准、目录和架构示例。不安装 Superpowers，不接入 Codex Skill、MCP 或第三方 Agent，不创建具体 Agent，不执行真实 Capability，不授予生产权限，也不进入 Phase 8.3。
