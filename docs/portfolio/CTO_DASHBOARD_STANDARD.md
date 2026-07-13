# CTO Dashboard 标准

## 1. 目的与范围

本标准定义未来 AI CTO 驾驶舱的信息合同、指标口径和决策边界。本阶段只定义文档规范，不实现界面或具体 Agent。

Dashboard 是 Portfolio Register、PROJECT_STATE、Health、Dependency、Asset、Cost、Debt、Incident 和 Investment Record 的汇总视图，不是新的事实来源或审批系统。

## 2. Dashboard Snapshot

每次生成 Dashboard 必须记录 Dashboard Snapshot ID、Portfolio Snapshot ID、As of Time、统计时间窗、项目范围、数据源版本、数据新鲜度、缺失项、Confidence 和生成者。

过期、不可比或缺失数据必须显式标记，不得用上期数据填充而不披露。所有聚合数字必须能够下钻到 Project ID、Metric ID 和 Evidence。

## 3. 项目总览

必须展示：

- 项目数量，并按 `ACTIVE`、`MAINTENANCE`、`PAUSED`、`ARCHIVED`、`RETIRED` 分组；
- 按 Current Stage 分布的项目数量；
- 健康项目数量、风险项目数量和健康数据缺失数量；
- 高 / 中 / 低优先级项目数量；
- 当前里程碑、延期项目和无 Owner 项目；
- Portfolio Health Score、等级、Evidence Coverage 和红线。

“健康项目”和“风险项目”必须引用 Portfolio Health 与单项目 Health 的明确阈值，不能由颜色或主观判断产生。

## 4. 资源视图

必须展示：

| 资源域 | 指标 |
|---|---|
| 开发投入 | 人员 / 角色容量、已承诺与可用容量、项目分配、关键技能缺口 |
| AI 成本 | Budget、Actual、Forecast、Variance、Cost per Task / User / Successful Output |
| 维护成本 | Maintenance 工时、Incident、依赖升级、技术债和运行支持成本 |

共享团队、平台和资产成本必须显示分摊与未分摊部分。资源利用率不能单独代表效率，必须与用户结果、健康和风险共同解释。

## 5. 风险视图

必须展示高风险项目、High Dependency、开放 P0 / P1、重大 Incident、Critical / High 技术债、安全 / 数据 / License 红线、AI 成本越界、单点 Owner 和关键里程碑风险。

每项风险可下钻到 Owner、Evidence、影响、缓解、截止、状态和触发器。平均健康分不能隐藏单个红线项目。

## 6. 机会视图

必须展示：

- 可复用资产数量、质量、使用次数、候选使用项目和预计节省；
- 高价值 / 高优先级项目及其 Evidence Coverage；
- 可解除多项目阻塞的共享能力和关键依赖投资；
- 成本优化、技术债清偿和 Evolution 机会；
- 暂停或淘汰低价值项目释放的容量。

机会必须同时显示成本、依赖、风险、Confidence 和下一门禁，不能只展示潜在收益。

## 7. 过滤、下钻与访问

Dashboard 至少支持按 Status、Stage、Priority、Health、Owner、业务域、时间窗、风险、依赖和 AI / 非 AI 项目过滤。每个项目入口链接其 PROJECT_STATE、PROJECT_MEMORY、Priority Score、Investment Recommendation、Cost 和关键 Evidence。

成本、用户、Incident 和安全信息按最小权限展示。面向高层的摘要可以隐藏敏感细节，但必须保留可审计来源和授权下钻路径。

## 8. 更新频率与告警

Dashboard 按固定周期刷新；重大 Incident、P0 / P1、High Dependency 失效、预算硬上限、Health 等级变化或投资决策会触发即时快照。告警必须包含事实、阈值、影响、Owner 和 Next Action，不只发送颜色变化。

## 9. 决策边界

Dashboard 提供态势感知，不自动重新分配资源、启动、暂停、归档或淘汰项目。任何 Investment Recommendation 和状态变化必须进入相应评审、用户审批和单项目生命周期治理。

