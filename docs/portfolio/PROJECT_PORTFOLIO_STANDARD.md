# 项目组合管理标准

## 1. 目的与治理边界

本标准规定 AI CTO 如何在多个项目之间维护统一事实、比较价值与风险、识别依赖和复用机会，并为资源投入提供可审计建议。

Portfolio Management 是覆盖所有单项目生命周期的治理层，不是新的生命周期状态。项目仍按 IDEA、RESEARCH、EVALUATION、DESIGN、DEVELOPMENT、TESTING、RELEASE、MAINTENANCE 和 EVOLUTION 运行；组合建议不能替代任何单项目门禁或用户授权。

## 2. Portfolio Register

AI CTO 必须维护项目列表、项目阶段、项目健康状态、项目价值评分、项目风险、资源投入和未来规划。每个项目至少包含：

| 字段 | 要求 |
|---|---|
| Project ID | 稳定唯一的 `PRJ-XXXX`，归档或淘汰后不得复用 |
| Project Name | 当前正式名称及历史别名引用 |
| Business Value | 分数、证据、时间窗和 Confidence |
| Current Stage | 单项目生命周期当前状态 |
| Health Score | 当前 Final / Provisional 分数、等级、基线与日期 |
| Priority | Portfolio Priority Score、等级和评审版本 |
| Dependencies | Dependency ID 列表及最高风险 |
| Owner | 对状态、证据和下一动作负责的角色 |
| Status | `ACTIVE`、`MAINTENANCE`、`PAUSED`、`ARCHIVED` 或 `RETIRED` |

同时记录战略价值、风险、资源投入、AI 与非 AI 成本、共享资产、目标里程碑、未来规划、Investment Recommendation、最后更新时间和下一复核日期。

## 3. 项目状态

| Status | 定义 | 管理要求 |
|---|---|---|
| `ACTIVE` | 正在推进 Idea、Research、Evaluation、Design、Development、Testing、Release 或 Evolution | 有当前资源、Owner、目标、门禁和 Next Action |
| `MAINTENANCE` | 已上线并以稳定运营和小范围维护为主 | 维护周期、指标、Incident、Debt、成本和演进触发器持续更新 |
| `PAUSED` | 暂停新增投入，但保留恢复价值和责任 | 记录原因、保护基线、风险、最小维护、恢复条件和复核日期 |
| `ARCHIVED` | 不再主动运营，资产按只读方式保留 | 完成归档检查、访问控制、保留策略和恢复说明 |
| `RETIRED` | 已完成停止、迁移或淘汰，不再作为活跃投资对象 | 完成数据、密钥、依赖、合同和最终知识处置 |

Portfolio Status 与 Current Stage 分开记录。`PAUSED` 不抹去暂停前的生命周期阶段；`ARCHIVED` 和 `RETIRED` 是组合处置状态，不代表生命周期门禁被补做或自动完成。

## 4. 组合管理流程

`项目登记 → 数据标准化 → 价值 / 优先级评估 → 依赖 / 资产 / 成本分析 → 投资建议 → 用户审批 → 资源配置 → 持续监控与再平衡`

每轮评审必须冻结 Portfolio Snapshot ID、项目集合、指标时间窗、成本口径、资源容量、战略约束、Evidence 和数据更新时间。使用不同时间窗或混合版本的项目数据时，必须说明不可比项。

## 5. 组合视图必填内容

组合视图至少提供：

- 项目总数及按 Status、Current Stage、Health 等级和 Priority 的分布；
- 每个项目的价值、健康、风险、成本、资源、里程碑和 Confidence；
- High / Medium / Low 跨项目依赖及关键路径；
- 可复用技术资产、使用次数、质量和适用项目；
- AI 成本预算、实际、预测和单位成本趋势；
- 当前资源容量、已承诺投入、缺口和机会成本；
- Investment Recommendation、批准状态和下一次再平衡条件；
- Portfolio Health Score、红线和风险集中度。

## 6. 更新与再平衡

项目阶段、健康、优先级、依赖、资源、成本、风险、Owner、里程碑或状态变化时必须更新 Portfolio Register。至少按约定周期执行组合复核；重大 Incident、预算越界、关键依赖失效、战略变化或新高价值机会会提前触发再平衡。

再平衡不能静默撤走已承诺的安全、数据、Incident 或发布保障资源。减少、暂停或终止投入必须记录影响、替代方案、保护动作、审批人和恢复 / 淘汰条件。

## 7. 决策边界

- Priority Score 只提供资源排序建议，不自动启动、继续、暂停或终止项目。
- 组合总分不能抵消单项目安全、数据、合规、License 或 P0 / P1 红线。
- 高层指令、历史投入、演示期限或单一大客户可以作为输入，但不能替代统一证据与审批。
- 资源分配后，每个项目仍必须满足自身生命周期和 Gate。
- 所有组合决策同步 Portfolio Register、PROJECT_STATE、PROJECT_MEMORY、Progress 和必要 ADR。

