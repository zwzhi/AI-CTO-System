# 项目投资决策标准

## 1. 目的

本标准规定多个项目竞争人员、时间、预算、AI 配额或共享资产时，AI CTO 如何形成可解释的 Investment Recommendation。

投资建议不是自动执行命令。资源分配、项目启动、暂停、归档和淘汰必须由有权限的用户针对当前 Portfolio Snapshot 明确批准。

## 2. 决策输入

必须考虑：

- 商业价值；
- 战略价值；
- 成本，包括开发、AI、基础设施、维护和机会成本；
- 风险，包括技术、用户、数据、安全、合规、依赖和可逆性；
- 时间窗口和延迟成本；
- 复用价值和技术资产积累；
- Priority Score、Health、Current Stage、Confidence 和 Evidence Coverage；
- 跨项目依赖、资源容量、已承诺责任和 Portfolio Health。

历史投入属于沉没成本，只能作为已有资产、迁移成本或停止影响的证据，不能单独提高优先级。

## 3. 决策流程

`冻结 Portfolio Snapshot → 确认容量与约束 → 标准化项目证据 → Priority / Dependency / Asset / Cost 分析 → 情景比较 → Investment Recommendation → 用户审批 → 资源配置 → 结果复核`

至少比较：维持当前分配、优先单一项目、共享能力优先、分阶段投资、暂停低价值项目和不新增投资。每种情景说明用户结果、里程碑、成本、风险、依赖、机会成本和失败后的恢复方式。

## 4. Investment Recommendation 类型

| Recommendation | 含义 |
|---|---|
| `INVEST` | 证据、价值、容量和风险支持按批准范围投入 |
| `CONDITIONAL_INVEST` | 满足补证、依赖、成本、健康或里程碑条件后投入 |
| `MAINTAIN` | 保持必要运营与保护性资源，不扩大范围 |
| `RESEARCH` | 先补充用户、技术、成本或市场证据 |
| `PAUSE` | 暂停新增投入并保护项目基线，等待恢复条件 |
| `ARCHIVE` | 进入受控归档评审与执行 |
| `RETIRE` | 进入停止 / 淘汰评审与执行 |

Recommendation 必须包含 Recommendation ID、Portfolio Snapshot、Project ID、建议类型、资源额度、时间窗、理由、Priority、Health、成本、依赖、资产、风险、Confidence、条件、机会成本、替代方案、审批人和复核触发器。

## 5. 排序与保护性资源

项目排序以 Priority Score 为统一起点，再结合硬约束、依赖关键路径、Portfolio Health 和情景分析。不得直接按单一商业价值、紧急程度或高层偏好排序。

生产安全、数据保护、Incident 恢复、法规义务和必要维护属于保护性资源。它们可以在投资排名之外先得到最低必要投入，但必须记录范围和期限，不能借保护名义无限扩大新功能。

共享技术资产如果能解除多个高价值项目阻塞，可以作为独立组合投资项，但必须有 Asset Owner、使用项目、质量、交付契约、成本和退出条件。

## 6. 示例

示例 Recommendation：优先投资“AI 内容员工系统”，原因是其商业与战略价值均有当前证据、可形成多个项目复用的 Agent / Prompt / 数据资产、单位成功成本可控且依赖已关闭。该示例只有在 Portfolio Snapshot 和评分支持时成立；项目名称本身不能预设优先级。

## 7. 审批与执行

用户审批必须绑定 Recommendation ID、项目、资源、时间窗、条件和风险。Priority Score 达到 80 只表示高优先级，不自动产生 `INVEST`；Recommendation 获批也不替代项目的 IDEA、Evaluation、Design、Development、Testing、Release、Maintenance 或 Evolution Gate。

资源配置后记录实际人力、预算、AI 配额、共享资产承诺和里程碑。发生成本越界、High Dependency、健康恶化、关键证据失效或战略变化时，原建议重新评审。

## 8. 结果复核

在批准时间窗结束时比较预期与实际用户价值、里程碑、成本、风险、资产复用和组合健康贡献。未达到条件时调整、暂停或停止投入；达到条件也只支持下一轮建议，不形成永久资源权利。

