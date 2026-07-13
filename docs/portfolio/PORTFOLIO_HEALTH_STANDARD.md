# 项目组合健康评估标准

## 1. 目的

本标准评估整个项目组合和技术资产体系是否健康、可持续并能够把资源投入转化为用户与业务结果。Portfolio Health Score 是组合风险与能力的汇总，不替代任何单项目 Health、Incident 或红线。

## 2. 评估基线

每次评估创建唯一 `PFH-XXXX`，冻结 Portfolio Snapshot、纳入项目、Status、时间窗、项目 Health 版本、风险、Debt、Asset、Cost、资源和 Evidence。默认纳入 `ACTIVE` 与 `MAINTENANCE` 项目；`PAUSED` 单独报告风险，`ARCHIVED` / `RETIRED` 只纳入遗留义务与成本。

## 3. 五个健康维度

| 维度 | 权重 | 计算输入 |
|---|---:|---|
| 项目健康平均分 | 30 | 纳入项目的当前 Final Health Score 平均值及分布 |
| 风险项目控制 | 20 | High Risk Project Ratio、红线、风险 Owner 与缓解状态 |
| 技术债水平 | 20 | Critical / High Debt、逾期、增长趋势和治理容量 |
| 技术资产复用 | 15 | Approved Asset Reuse Rate、质量、覆盖和实际节省 |
| AI 成本趋势 | 15 | Budget Variance、Forecast、单位成功成本和异常趋势 |
| **合计** | **100** | 各分项均转换为 0–100 后按权重折算 |

`Portfolio Health Score = Σ（分项得分 × 权重 ÷ 100）`

## 4. 分项计算

### 4.1 项目健康平均分

报告算术平均、按资源投入加权平均、中位数、最低分和等级分布。Score 分项使用算术平均，防止高投入项目权重掩盖小项目红线；其他统计用于解释集中度。

### 4.2 风险项目比例

`High Risk Project Ratio = 存在未关闭 High / Critical 组合风险的纳入项目数 ÷ 纳入项目数`

风险控制分基础值为 `100 × (1 - High Risk Project Ratio)`，再核对风险是否有 Owner、期限、缓解和 Evidence。没有 Owner 或存在未受控红线时应用第 6 节上限。

### 4.3 技术债水平

每个项目依据 Critical / High Debt 数量、逾期、年龄、增长、Owner、偿还容量和关闭证据形成 0–100 Debt Health。组合分项使用项目 Debt Health 平均值，并报告债务总量与变化，禁止通过拆分或合并项目改善分数。

### 4.4 资产复用率

`Asset Reuse Rate = 已采用至少一个 APPROVED_FOR_REUSE 资产且完成验证的适用项目数 ÷ 存在复用机会的适用项目数`

没有复用机会的项目不进入分母，但必须有检索记录。分项同时检查资产 Quality、Incident、节省和重复建设，不能仅按 Usage Count 评分。

### 4.5 AI 成本趋势

AI Cost 分项综合 Budget Variance、Forecast、Cost per Successful Output 趋势、未分摊成本和质量护栏。非 AI 项目不进入 AI 单位成本分母；没有 AI 项目时记录 Approved N/A，并按剩余四维重新归一化权重且披露公式。

## 5. 健康等级

| Portfolio Health Score | 等级 | 默认治理建议 |
|---:|---|---|
| 85–100 | 健康 | 保持投资纪律，扩大已验证复用和高价值能力 |
| 70–84.9 | 可控 | 关闭集中风险和明确短板，保持周期复核 |
| 50–69.9 | 风险 | 限制新增承诺，优先修复依赖、债务、成本或健康问题 |
| 0–49.9 | 严重 | 启动组合级恢复、暂停、重排或淘汰评审 |

分数保留一位小数，按原始值判断等级，不四舍五入跨级。

## 6. 红线与缺失数据

存在未受控安全 / 数据 / 合规红线、多个项目受同一 High Dependency 阻断、组合级 P0、关键 AI 成本无归属或核心项目 Health 不可评估时，Portfolio Health 只能为 Provisional；若必须给出治理等级，上限为 49.9 并明确红线，不能由其他高分抵消。

缺少分项数据时报告已评估小计、未评估权重、可能区间、Evidence Coverage 和补证动作。不得用 0 或上期值静默填充。

## 7. 输出与行动

报告至少包含 Portfolio Health Score / Range、等级、五个分项、项目 Health 分布、风险项目比例、Debt、Asset Reuse、AI Cost、资源集中度、红线、Confidence、趋势、主要贡献项目、主要拖累项目、Investment Impact 和 Next Actions。

每项行动必须有 Owner、资源、期限、验证标准和触发器。Portfolio Health 改善必须由单项目结果、风险关闭、债务下降、复用验证或单位成功成本证据支持，不能只通过移除低分项目改善报表。

