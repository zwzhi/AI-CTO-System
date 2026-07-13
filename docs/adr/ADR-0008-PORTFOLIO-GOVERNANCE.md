# ADR-0008：从单项目治理升级为 Portfolio Governance

- 状态：Accepted
- 日期：2026-07-13
- 决策者：AI CTO System 项目创建者、AI CTO

## 背景

AI CTO System 已具备单项目从 Idea 到 Maintenance、Evolution 和 Retirement 的治理能力。但真实组织通常同时运行多个项目，共享人员、预算、AI 配额、平台、数据、技术资产和外部依赖。只优化单个项目可能造成组合层面的次优结果：多个项目重复建设、关键共享依赖无人负责、高价值项目被低价值紧急项挤占、AI 成本无法归属，或单项目都“正常”但整体资源已经失衡。

AI CTO 需要在不破坏单项目生命周期门禁的前提下，建立跨项目事实、比较、投资和再平衡能力。

## 决策

- 增加 Portfolio Management 治理层，覆盖所有单项目生命周期，但不新增或替代单项目状态。
- 维护统一 Portfolio Register，分开记录 Project Status 与 Current Stage。
- 采用 100 分 Priority Model 比较商业、战略、紧急、复用、资源成本和风险；分数只用于资源建议，不自动启动项目。
- 使用 Dependency Register 管理跨项目技术、数据、API、基础设施、AI、资产、团队、供应商、合规和时间依赖。
- 建立 Technology Asset Registry；新项目 DESIGN 前先检索已批准资产，再决定复用、二开、参考或自研。
- 建立 AI Cost Ledger、预算、预测和单位任务 / 用户 / 成功输出成本，成本进入项目评估、投资和 Evolution 判断。
- 以 CTO Dashboard 汇总项目、资源、风险和机会，但 Dashboard 不成为事实源或自动决策器。
- 每次资源竞争形成版本化 Investment Recommendation，比较机会成本、依赖和情景，并取得用户审批。
- 使用 Portfolio Health Score 综合项目健康、风险比例、技术债、资产复用和 AI 成本趋势，同时保留单项目红线。
- 组合建议不得绕过单项目 Idea、Evaluation、Design、Development、Testing、Release、Maintenance 或 Evolution Gate。

## 选择理由

Portfolio Governance 把项目之间的相互影响和共享约束显式化，使 AI CTO 能从“每个项目分别做对”升级为“在有限资源下让整体组合更健康”。分离 Priority、Investment Recommendation 和最终用户授权，可以保留建议能力而不让评分自动成为执行命令。

## 替代方案

- **继续只管理单项目**：简单，但无法处理资源冲突、共享依赖、重复建设和组合成本，拒绝。
- **只维护项目列表和 Dashboard**：可见性提高，但没有统一评分、依赖、资产和投资决策闭环，拒绝。
- **按最高 Priority Score 自动分配资源**：速度快，但忽略红线、保护性维护、依赖和用户授权，拒绝。
- **由负责人临时协调所有冲突**：灵活，但证据、机会成本和历史不可审计，拒绝。

## 后果

### 正面影响

- 多项目价值、风险、健康、资源和成本可以在统一口径下比较。
- 共享依赖和可复用资产获得明确 Owner、质量和版本治理。
- AI 成本从账单汇总升级为可归属、可预测的单位经济性指标。
- 资源投资、暂停、归档和淘汰建议可以保留证据和机会成本。
- CTO Dashboard 可以呈现整体健康，同时下钻到单项目事实。

### 负面影响与风险

- Portfolio Register、成本分摊、依赖和资产注册增加维护成本。
- 评分可能制造虚假精确性，需要持续报告 Confidence、Evidence Coverage 和红线。
- 项目团队可能优化指标而非用户结果，需要防止改变口径、拆分风险和隐藏成本。
- 共享资产治理不足时可能形成新的组合级单点。

## 后续行动

- 在生命周期、SKILL、PROJECT_STATE、PROJECT_MEMORY、文档关系和 Progress 中同步 Portfolio Governance。
- 用资源稀缺、CEO 偏好、沉没投入、共享依赖和 AI 预算压力场景验证 Investment Recommendation。
- Phase 8 完成后停止，等待用户确认，不进入 Phase 9。

