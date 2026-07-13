# 项目维护标准

## 1. 目的与适用范围

本标准规定项目进入 `MAINTENANCE` 后，AI CTO 如何管理稳定运营、问题修复、小版本需求、性能、依赖、安全和技术债。维护的目标是在不绕过原有设计、开发、测试和发布门禁的前提下维持用户价值、可靠性与可演进性。

进入 Maintenance 前必须存在当前发布基线、责任人、监控与回滚方式、`PROJECT_STATE.md`、`PROJECT_MEMORY.md` 和开放风险清单。已有项目也可以在取得 `ONBOARDING_COMPLETED` 后进入 Maintenance。

## 2. 维护范围

| 类别 | 管理内容 | 必须关联的治理对象 |
|---|---|---|
| Bug 修复 | 生产、测试或用户反馈发现的行为偏差 | Bug ID、Incident ID（适用时）、Task、Commit、Test Evidence |
| 小版本需求 | 不改变核心产品定位和主要架构的小范围需求 | Feedback / Requirement ID、影响分析、验收标准 |
| 性能优化 | 延迟、吞吐、容量、资源和成本改善 | Baseline、指标、目标阈值、回归与成本证据 |
| 依赖升级 | Runtime、Framework、Library、模型或服务版本升级 | 版本差异、兼容性、安全、License、回滚方案 |
| 安全更新 | 漏洞、密钥、权限、数据和供应链处置 | Security Finding、风险等级、验证和受控披露记录 |
| 技术债处理 | 代码、架构、测试、性能、安全和维护债务 | Debt ID、成本、风险、计划与关闭证据 |

维护不得被用来承载未经评估的重大产品范围、架构、数据模型或 AI 能力变化。触发重大变化时，必须生成 Evolution Proposal 并执行 Maintenance → Evolution Gate。

## 3. 维护任务优先级

| Priority | 定义 | 响应要求 | 典型示例 |
|---|---|---|---|
| `P0` | 系统不可用、严重安全 / 数据风险或无可接受绕行 | 立即响应，优先隔离影响；按 Incident 流程处理 | 大面积不可用、数据破坏、有效密钥泄露 |
| `P1` | 核心功能严重退化或高影响用户 / 业务问题 | 优先进入当前维护周期，建立 Owner 和恢复目标 | 核心流程失败、持续严重性能退化 |
| `P2` | 重要但影响有界，存在可接受临时绕行 | 纳入计划维护周期，按价值和风险排序 | 局部缺陷、依赖升级、明确技术债 |
| `P3` | 低风险体验、效率或未来优化项 | 进入 Backlog，定期复核价值与过期条件 | 文案、轻微体验、低频边界优化 |

维护任务优先级用于排程，不替代 [Bug 管理标准](../testing/BUG_MANAGEMENT_STANDARD.md)中的 `P0 Blocker`、`P1 Critical`、`P2 Major`、`P3 Minor`。同一事项同时是 Bug 时，必须分别记录 Bug 严重性和维护排程优先级，且不得用较低排程优先级覆盖 Bug 的发布阻断规则。

## 4. 标准维护流程

`发现问题 → 记录 → 评估 → 执行 → 验证 → 关闭`

| 阶段 | 必须动作 | 输出 |
|---|---|---|
| 发现问题 | 保留现场、记录来源、时间、症状与初始影响；安全或生产风险先止损 | 初始 Evidence、候选 Priority |
| 记录 | 创建 Maintenance Task ID，并关联 Bug、Feedback、Incident 或 Debt | 状态 `RECORDED` 的维护记录 |
| 评估 | 确认影响、优先级、根因假设、成本、依赖、风险和是否触发 Evolution | 已批准处置路线与 Owner |
| 执行 | 按适用的 Design、TDD、Change Impact、Review 和 Git 规则实施 | Task、Commit、Review、变更记录 |
| 验证 | 在目标基线执行定向、回归、安全、性能或 AI 评测 | Test / Metric Evidence、验证结论 |
| 关闭 | 核对用户结果、文档、监控、风险、追踪和知识沉淀 | `CLOSED` 记录或重新打开 |

紧急止损可以先于完整根因分析，但必须建立 Incident 或 Bug 记录、保留授权与变更证据，并在稳定后完成永久修复、验证和复盘。临时恢复不得被标记为永久关闭。

## 5. Maintenance Task 必填字段

每个维护任务至少包含：Maintenance Task ID、类别、来源、发现时间、当前发布基线、影响范围、Priority、关联 Bug / Incident / Feedback / Debt、目标、输入、输出、Owner、依赖、风险、回滚、验收标准、测试要求、目标版本、状态、Commit、验证 Evidence、关闭结论和下一复核时间。

状态只允许：`RECORDED`、`ASSESSED`、`SCHEDULED`、`IN_PROGRESS`、`VALIDATING`、`CLOSED`、`REOPENED`、`DEFERRED`。`DEFERRED` 必须包含授权人、理由、风险、复核日期和触发器，不表示问题已经解决。

## 6. 执行边界

- 代码、配置、数据库、模型、Prompt 或基础设施变更必须有 Git / Change 记录。
- 任何变更都必须执行影响分析、测试、Review 和适用发布门禁。
- P0 / P1 事项不得通过拆分、降级或口头接受隐藏真实影响。
- 小版本需求一旦改变系统边界、关键数据、主要用户流程或重大 AI 行为，转为 Evolution Proposal。
- 维护状态、开放问题、风险、指标和 Next Action 必须同步 `PROJECT_STATE.md` 与 `PROJECT_MEMORY.md`。

## 7. 维护指标与周期复核

每个维护周期至少报告：开放任务数量与年龄、P0–P3 分布、Bug 重开率、Incident 数和恢复时间、技术债变化、依赖与安全过期项、性能趋势、用户反馈闭环率、AI 能力趋势、变更失败率和未关闭风险。

周期复核必须判断项目应继续维护、进入 Evolution、重构、归档或停止。单一平均指标不能掩盖 P0 / P1、红线或持续退化趋势。

