# 项目生命周期状态机

## 状态转换原则

项目状态必须记录在项目的 `PROJECT_STATE.md` 中。每次转换都必须有证据、下一动作和可追溯文档。禁止跨过任何必要状态或用后续阶段补做前序门禁。

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
| `DEVELOPMENT` | 当前设计基线取得 `APPROVED_FOR_DEVELOPMENT`；任务、测试、变更影响与回滚方案明确 | Development Approval Gate 取得 `APPROVED_FOR_TESTING` | Development Plan、Task、Progress、源代码、测试证据、Code Review、Change Impact、五层 Traceability Matrix、ADR、`PROJECT_MEMORY.md` |
| `TESTING` | 当前精确 Commit 与文档基线取得 `APPROVED_FOR_TESTING`；测试策略、环境、数据、责任人与第一项行动已记录 | 测试、AI 评测（适用时）、安全审核与用户验收完成；P0/P1 Bug 关闭；TESTING → RELEASE 门禁取得 `READY_FOR_RELEASE` | Test Strategy、Test Case 与 Evidence、Bug Register、AI Evaluation 或 Approved N/A、Security Review、UAT 记录、Release Gate、Progress、`PROJECT_STATE.md` |
| `RELEASE` | 当前精确候选基线取得 `READY_FOR_RELEASE`；部署、回滚、监控方案已确认 | 部署与上线验证完成；观察窗口达到退出条件；发布、回滚及剩余风险结果已记录 | Release Report、部署记录、回滚记录、监控记录、Bug/Incident、`PROJECT_MEMORY.md`、`PROJECT_STATE.md` |
| `MAINTENANCE` | 项目已发布并进入稳定运营 | 触发重大产品、架构或能力演进，或项目被正式归档 | 运维记录、问题与解决方案、Progress、知识库条目 |
| `EVOLUTION` | 新证据或战略目标要求重大演进 | 演进方案进入新一轮 Design，或评估后返回 Maintenance | Evolution Proposal、Evaluation、ADR、更新后的 PRD/Architecture |

## 状态转换记录

每次状态变化必须在 `PROJECT_STATE.md` 中更新：

- Current Stage
- Confidence
- Evidence
- Next Action

并在 `PROJECT_MEMORY.md` 的“历史修改”和“当前状态”中留下摘要。

`APPROVED_FOR_TESTING` 只授权进入 `TESTING`；`READY_FOR_RELEASE` 只授权进入 `RELEASE`，不表示已经部署成功。授权边界及禁止跳过 TESTING 的决策见 [ADR-0005](../adr/ADR-0005-TESTING-AND-RELEASE-AUTHORIZATION.md)。
