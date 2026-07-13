# 跨项目依赖管理标准

## 1. 目的

本标准用于识别 Project A depends on Project B 等跨项目关系，防止共享组件、数据、团队、接口或时间计划成为未登记的组合风险。

依赖方向统一表示为：`Source Project depends on Target Project`。Source 是被阻塞或受影响的项目，Target 是提供能力、资产、数据或前置结果的项目。

## 2. Dependency Record

每条依赖必须记录：

| 字段 | 要求 |
|---|---|
| Dependency ID | 稳定唯一的 `DEP-XXXX` |
| Source Project | 依赖方 Project ID 与当前版本 |
| Target Project | 被依赖方 Project ID / Asset ID / 外部来源 |
| Dependency Type | Technical、Data、API、Infrastructure、AI Model、Asset、Team、Vendor、Compliance 或 Schedule |
| Impact | 对范围、里程碑、质量、成本、数据、安全和用户结果的影响 |
| Risk | `High`、`Medium` 或 `Low`，以及证据和 Confidence |
| Resolution | 消除、替换、隔离、兼容、复制、延后、接受或停止的方案与 Owner |

同时记录接口 / 契约、所需版本、交付日期、状态、Owner、Fallback、监控、验证标准、关联项目门禁和最后更新时间。

## 3. 依赖风险

| Risk | 定义 | 管理要求 |
|---|---|---|
| `High` | 依赖失败会阻断关键里程碑、生产运行、安全 / 数据要求，且没有可信替代 | 进入组合风险清单，设置专项 Owner、缓解、Fallback 和高频复核 |
| `Medium` | 会造成明显延期、成本或范围变化，但存在受控绕行 | 纳入计划与里程碑，定义触发器和替代路径 |
| `Low` | 影响有限、可快速替代或不会改变关键结果 | 保持登记并按周期确认有效性 |

风险未知但可能达到 High 时按 High 控制，补证后才能降低。不得用 Target 项目高健康分替代具体依赖验证。

## 4. 依赖类型与验证

- Technical / Asset：接口、版本、兼容性、测试、Owner 和弃用策略；
- Data：Schema、质量、权限、来源、时效、保留和删除；
- API / Infrastructure：SLA、容量、限额、故障隔离、监控和恢复；
- AI Model：模型版本、能力、成本、区域、配额、安全和退出方案；
- Team / Schedule：稀缺角色、容量、交付承诺和冲突优先级；
- Vendor / Compliance：合同、License、EOL、数据处理和法定期限。

依赖只有在目标版本和代表性环境完成契约、集成、失败与回退验证后才能标记可用。

## 5. 状态与关系图

Dependency Status 只允许：`PROPOSED`、`CONFIRMED`、`AT_RISK`、`BLOCKED`、`RESOLVED`、`RETIRED`。

Portfolio 必须维护依赖图、关键路径、单点、扇入 / 扇出、循环和跨项目版本矩阵。发现循环依赖时必须明确打破方向、提取共享资产、调整接口或记录接受理由；循环未解决前，相关里程碑不能标记无阻塞。

## 6. 变更与解决

Source / Target 范围、版本、Owner、接口、交付日期、健康、成本或风险变化时重新评估依赖。Resolution 必须包含动作、Owner、截止、验证、Fallback 和关闭证据；仅写“协调处理”不构成解决方案。

共享依赖失效时，更新所有受影响项目的 PROJECT_STATE、计划、风险、投资建议和 Portfolio Health。不得只在 Target 项目记录问题而让 Source 项目继续显示正常。

