# 项目生命周期状态机

## 状态转换原则

项目状态必须记录在项目的 `PROJECT_STATE.md` 中。每次转换都必须有证据、下一动作和可追溯文档。禁止跨过必要状态直接进入 `DEVELOPMENT`。

标准路径：

`IDEA → RESEARCH/EVALUATION → DESIGN → DEVELOPMENT → TESTING → RELEASE → MAINTENANCE → EVOLUTION`

`RESEARCH` 与 `EVALUATION` 的先后由不确定性决定：

- 可行性未知时：`IDEA → RESEARCH → EVALUATION`
- 价值与范围未知时：`IDEA → EVALUATION → RESEARCH`

两者均完成后才能进入 `DESIGN`。任何状态发现关键假设失效时，可退回前序状态，并记录原因。

## 状态定义

| 状态 | 进入条件 | 退出条件 | 必须生成或更新的文档 |
|---|---|---|---|
| `IDEA` | 收到新想法、新项目需求或待解决问题 | 问题、目标、用户、初始需求、约束和历史关联已记录；用户确认继续 | 项目候选 `README.md`、`PROJECT_STATE.md` |
| `RESEARCH` | Idea 信息足以确定调研问题；需要外部证据或方案比较 | 调研范围完成；来源、结论、风险和建议可追溯 | Research 文档、`PROJECT_MEMORY.md`、`PROJECT_STATE.md` |
| `EVALUATION` | 已有足够信息评估价值、范围、资源和风险 | 成功标准、可行性、优先级与立项建议明确；用户作出立项决定 | Evaluation 文档、必要的 ADR、`PROJECT_STATE.md` |
| `DESIGN` | Research 与 Evaluation 均完成且项目获准立项 | PRD、Architecture、数据或 Agent 设计、开发计划和验收标准获确认 | PRD、Architecture、Development Plan、必要的数据库/Agent 设计、ADR、`PROJECT_MEMORY.md` |
| `DEVELOPMENT` | 设计文档与开发计划已确认；任务、测试和回滚思路明确 | 计划范围已实现；开发验证通过；已知偏差被记录 | Progress、源代码、测试、ADR、`PROJECT_MEMORY.md` |
| `TESTING` | 开发范围完成并具备可测试版本 | 功能与非功能验收完成；缺陷已关闭或获准接受；发布条件满足 | Test Report、缺陷记录、Release Checklist、Progress |
| `RELEASE` | 测试通过；发布、监控和回滚方案已确认 | 版本已发布；关键指标可观测；发布结果已记录 | Release Notes、部署记录、回滚记录、`PROJECT_MEMORY.md` |
| `MAINTENANCE` | 项目已发布并进入稳定运营 | 触发重大产品、架构或能力演进，或项目被正式归档 | 运维记录、问题与解决方案、Progress、知识库条目 |
| `EVOLUTION` | 新证据或战略目标要求重大演进 | 演进方案进入新一轮 Design，或评估后返回 Maintenance | Evolution Proposal、Evaluation、ADR、更新后的 PRD/Architecture |

## 状态转换记录

每次状态变化必须在 `PROJECT_STATE.md` 中更新：

- Current Stage
- Confidence
- Evidence
- Next Action

并在 `PROJECT_MEMORY.md` 的“历史修改”和“当前状态”中留下摘要。
