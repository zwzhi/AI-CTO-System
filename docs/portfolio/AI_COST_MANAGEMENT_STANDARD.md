# AI 成本治理标准

## 1. 目的与范围

本标准统一记录、分摊、预测和优化 AI 项目成本，使项目价值、质量和资源投入可以在相同时间窗内比较。成本优化不得以隐藏失败、降低安全或牺牲用户结果为代价。

## 2. 成本分类

每个 AI 项目必须记录：

| 成本类型 | 范围 |
|---|---|
| 模型调用成本 | 推理、Embedding、重排、语音、图像和批处理模型调用 |
| Token 消耗 | Input、Output、Cached、Reasoning 或供应商等价计量 |
| API 费用 | AI 与非 AI 第三方接口、搜索、工具和数据服务 |
| 服务器成本 | CPU、GPU、内存、网络、容器、函数和常驻服务 |
| 存储成本 | 数据库、对象存储、向量存储、日志、备份和传输 |

费用记录必须包含 Cost Record ID、Project ID、Feature / Task、Environment、Provider、Model / Service、Region、Usage、Unit Price、Currency、Exchange Rate、Billing Period、Actual Cost、Allocated Cost、Evidence 和更新时间。

## 3. 成本归集与分摊

所有可控制调用必须携带 Project ID、Environment 和 Feature / Task 标签。共享 Agent 平台、模型网关、存储和基础设施按可解释驱动因子分摊，例如调用量、Token、活跃用户、存储量或保留容量。

分摊规则必须版本化，记录生效日期和变化影响。无法可靠分摊的成本标记 `UNALLOCATED`，单独报告并设置关闭 Owner；不得平均分摊后假装精确。

生产、测试、开发、评测和实验成本分别报告，避免把一次性研发费用隐藏在生产单位成本中。

## 4. AI 项目单位成本指标

| 指标 | 公式 | 使用边界 |
|---|---|---|
| Cost per Task | 目标时间窗内归属成本 ÷ 有效任务数 | Task 定义、去重和失败口径必须固定 |
| Cost per User | 目标时间窗内归属成本 ÷ 有效用户数 | 区分付费、活跃、内部和测试用户 |
| Cost per Successful Output | 目标时间窗内归属成本 ÷ 达到预设成功标准的输出数 | 成功标准必须在观察结果前冻结 |

同时报告总成本、调用量、Token、成功率、失败成本、P50 / P95 单位成本和分布。分母为 0 时指标为 `NOT_COMPUTABLE`，不得用 0 成本替代。

## 5. 预算与预测

每个项目和共享资产必须维护月度 / 季度预算、承诺成本、实际成本、预测成本、剩余预算、Variance、Owner 和阈值。至少设置：预警阈值、软上限、硬上限和异常增长阈值。

达到阈值时按风险执行通知、限额、降级、缓存、批处理、模型路由、暂停非关键实验或投资复核。硬上限不应导致安全、数据或关键用户流程静默失败；必须有预定义降级和沟通方式。

## 6. 成本优化规则

优化前冻结当前模型、Prompt、工具、数据集、质量、成功率、延迟和成本基线。候选方案必须同时比较：

- 模型、Prompt、上下文、缓存、批处理和路由变化；
- 输出质量、准确率、稳定性、Agent 成功率和安全红线；
- Token、时延、单位成功成本和供应商锁定；
- 实施成本、迁移、监控、停止和回滚。

只有成本下降且预设质量、安全和用户结果未低于阈值，才能宣称优化成功。把失败请求移出统计、缩短评测窗口或改变成功定义不构成成本改善。

## 7. 进入评估与 Evolution

AI 成本必须进入 Project Evaluation、Portfolio Priority、Investment Recommendation 和 Portfolio Health。以下情况必须评估 Evolution：单位成功成本持续超阈值、成本增长快于用户 / 业务价值、供应商价格或配额改变技术路线、当前架构无法支持预算、成本优化需要改变核心模型 / Prompt / 数据 / 工具行为。

成本越界可以触发 Incident、Maintenance 或 Evolution，但不能直接授权修改模型或生产配置。执行仍须满足适用 Evolution、Design、Testing、Security 和 Release Gate。

## 8. 报告与审计

每个周期报告 Budget vs Actual vs Forecast、五类成本、三个单位成本、共享 / 未分摊成本、主要驱动、异常、优化行动、质量权衡、Confidence 和 Next Action。账单更正、汇率、分摊规则或成功定义变化时，保留旧版本并说明重算影响。

