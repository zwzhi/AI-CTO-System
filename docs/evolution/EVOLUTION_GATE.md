# Maintenance → Evolution Gate

## 1. 目的

本门禁判断项目何时应从稳定维护进入重大演进。它防止把普通维护无限升级为架构项目，也防止把系统性问题拆成零散修复而长期回避根因。

## 2. 触发条件

以下任一信号达到项目预设阈值或形成系统性影响时，必须启动 Gate Assessment：

| Trigger | 需要核验的证据 |
|---|---|
| 重复 Bug | 同一根因、模块或控制失效的重开率、逃逸率、修复成本和用户影响 |
| 大量用户反馈 | 跨用户 / 场景的数量、频率、价值、趋势和结果证据，而非单纯声量 |
| 技术路线变化 | Runtime、架构、平台、供应商、数据、接口、模型或基础设施变化 |
| AI 能力不足 | 七维能力持续退化、目标差距、人工接管、成本或时延失控 |
| 流程低效 | 交付周期、变更失败、Incident、重复手工操作或跨团队等待持续超阈值 |

战略变化、关键技术 EOL、安全 / 合规要求、容量上限或 Retirement Review 的重构结论也可以触发评估。

单一、边界明确、风险可控且不改变核心设计的问题通常留在 Maintenance；是否“改动小”不能单独判断，影响系统边界、数据、安全或 AI 行为时仍需 Evolution。

## 3. Gate 输入

必须提供：当前 Maintenance 基线、Trigger Record、Incident / Bug / Feedback / Debt / AI Capability History、影响分析、Evidence 与 Confidence、现有 PRD / Architecture / ADR、继续维护的成本、候选方案、风险红线和版本化 Evolution Proposal。

缺少 Proposal 时，Gate Assessment 的输出是创建 `DRAFT` Proposal 和补证行动，项目保持 `MAINTENANCE`，不能直接进入 Evolution。

## 4. 进入条件

只有以下条件全部满足才能进入 `EVOLUTION`：

- Trigger 已由证据确认，不是单次噪声或未经验证的偏好；
- Evolution Proposal 必填字段、评分、Confidence 和替代方案完整；
- 继续维护、局部修复、演进、替换 / 购买和停止已比较；
- 目标、范围、成功指标、预算、责任、风险、回滚和停止条件明确；
- 未关闭安全、数据、合规、License 或不可恢复红线为 0；
- 用户对当前 Proposal 精确版本作出明确审批；
- PROJECT_STATE、PROJECT_MEMORY、ADR 和下一阶段路线已准备。

## 5. Gate 结果

| 结果 | 含义 | Current Stage |
|---|---|---|
| `APPROVED_FOR_EVOLUTION` | 当前 Proposal 获准进入演进治理 | 从 `MAINTENANCE` 改为 `EVOLUTION` |
| `CHANGES_REQUIRED` | 方向可能成立，但范围、证据、方案或风险控制不足 | 保持 `MAINTENANCE` |
| `REMAIN_IN_MAINTENANCE` | 当前问题适合维护处理或价值不足 | 保持 `MAINTENANCE` |

不存在条件性进入 Evolution。紧急性、负责人指令、历史投入、供应商承诺、单一高分或“先改后补 Proposal”都不能替代 `APPROVED_FOR_EVOLUTION`。

## 6. Gate Record

每次评审记录 Gate ID、Proposal ID / Version、Maintenance Baseline、Trigger、逐项 Evidence、Score、Confidence、红线、替代方案、用户决定、结果、Current Stage、Next Action、Owner 和复核条件。

`APPROVED_FOR_EVOLUTION` 只批准生命周期转换和后续演进工作，不授权编码、测试、发布或生产修改。任何实现仍必须经过适用的 Research / Evaluation / Design / Development / Testing / Release Gate。

## 7. 失效与返回

Proposal 的目标、范围、架构、数据、AI 行为、预算、风险、成功指标或基线发生重大变化时，旧 Gate 结果失效，重新评审。证据证明问题可由普通维护解决、价值消失或风险不可接受时，项目返回 `MAINTENANCE`，并记录 Proposal 的 `DEFERRED`、`REJECTED` 或 `SUPERSEDED` 状态。

