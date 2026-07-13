# 项目生命周期状态机

## 状态转换原则

项目状态必须记录在项目的 `PROJECT_STATE.md` 中。每次转换都必须有证据、下一动作和可追溯文档。禁止跨过任何必要状态或用后续阶段补做前序门禁。

新项目标准路径：

`IDEA → RESEARCH/EVALUATION → DESIGN → DEVELOPMENT → TESTING → RELEASE → MAINTENANCE → EVOLUTION`

已有项目接管路径：

`EXISTING_PROJECT_ONBOARDING → MAINTENANCE → EVOLUTION`

已有代码项目从 `EXISTING_PROJECT_ONBOARDING` 进入系统，不伪装成新 Idea，也不补造历史阶段。接管完成只表示项目基线已被理解并纳入治理；若后续需要开发、测试或发布，仍须满足目标阶段原有的进入条件和门禁。

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
| `MAINTENANCE` | 发布结果与观察窗口通过并进入稳定运营；或已有项目取得 `ONBOARDING_COMPLETED` 后纳管 | Evolution Gate 取得 `APPROVED_FOR_EVOLUTION`；或完成继续维护、重构、归档 / 停止的处置决定 | Maintenance Task、Incident、Postmortem、Debt、Feedback、AI Capability History、Retirement Review、Progress、知识库条目、`PROJECT_STATE.md`、`PROJECT_MEMORY.md` |
| `EXISTING_PROJECT_ONBOARDING` | 用户提供已有软件项目及其来源，并授权对项目进行只读扫描 | 代码、技术栈、文档、状态、风险、Git 与测试状态已确认；迁移门禁取得 `ONBOARDING_COMPLETED` | 扫描记录、Reverse Analysis、恢复的 PRD/Architecture/Database/ADR、Health Report、Onboarding State、Migration Gate、`PROJECT_MEMORY.md` |
| `EVOLUTION` | 系统性演进触发器已有证据；当前 Evolution Proposal 经评分、风险复核和用户审批，并取得 `APPROVED_FOR_EVOLUTION` | Proposal 被验证并返回 Maintenance；或获准路线进入适用的 Research / Evaluation / Design 及后续门禁 | Evolution Proposal、Gate Record、Evaluation / Research、ADR、更新后的 PRD / Architecture、执行与验证证据、`PROJECT_STATE.md`、`PROJECT_MEMORY.md` |

状态目录顺序为：`IDEA`、`RESEARCH`、`EVALUATION`、`DESIGN`、`DEVELOPMENT`、`TESTING`、`RELEASE`、`MAINTENANCE`、`EXISTING_PROJECT_ONBOARDING`、`EVOLUTION`。其中 `EXISTING_PROJECT_ONBOARDING` 是已有项目的替代入口，不是新项目标准路径中的顺序步骤。

## 已有项目转换规则

- 迁移门禁只允许输出 `ONBOARDING_COMPLETED` 或 `ONBOARDING_BLOCKED`。
- `ONBOARDING_BLOCKED` 时保持 `EXISTING_PROJECT_ONBOARDING`，记录缺失证据、风险与下一动作。
- `ONBOARDING_COMPLETED` 后，已在稳定运营的项目可以进入 `MAINTENANCE`。
- 接管结果不授予编码、测试、发布或生产变更权限；进入其他阶段必须重新满足该阶段的原有门禁。
- 关键事实必须标注证据、真值标签与 Confidence；禁止把当前代码推断包装为已证实的历史事实。
- 接管授权边界及设置独立入口的原因见 [ADR-0006](../adr/ADR-0006-EXISTING-PROJECT-ONBOARDING.md)。

## Maintenance 与 Evolution 转换规则

- Maintenance 管理稳定运营中的 Bug、小版本、性能、依赖、安全和技术债；生产故障必须执行 Incident、永久修复和适用 Postmortem。
- 重复 Bug、大量用户反馈、技术路线变化、AI 能力不足或流程低效达到系统性影响时，创建 Evolution Proposal 并执行 Gate。
- Gate 只允许 `APPROVED_FOR_EVOLUTION`、`CHANGES_REQUIRED` 或 `REMAIN_IN_MAINTENANCE`。只有第一种结果允许进入 `EVOLUTION`。
- `APPROVED_FOR_EVOLUTION` 不授权直接编码、测试、发布或生产修改；实现必须继续满足适用 Research、Evaluation、Design、Development、Testing 和 Release Gate。
- Proposal 验证达到用户结果和长期指标后，项目返回 `MAINTENANCE`；失败时回滚、缩小范围、重新评审或返回 Maintenance。
- Retirement Review 可以形成继续维护、重构、归档或停止结论。重构需要 Evolution Proposal；归档和停止必须完成用户、数据、安全、依赖和恢复检查。
- 长期维护与演进治理的决策见 [ADR-0007](../adr/ADR-0007-MAINTENANCE-AND-EVOLUTION-GOVERNANCE.md)。

## 状态转换记录

每次状态变化必须在 `PROJECT_STATE.md` 中更新：

- Current Stage
- Confidence
- Evidence
- Next Action

并在 `PROJECT_MEMORY.md` 的“历史修改”和“当前状态”中留下摘要。接管期间还必须维护 Onboarding State、健康评分、缺失文档和已知风险。

`APPROVED_FOR_TESTING` 只授权进入 `TESTING`；`READY_FOR_RELEASE` 只授权进入 `RELEASE`，不表示已经部署成功。授权边界及禁止跳过 TESTING 的决策见 [ADR-0005](../adr/ADR-0005-TESTING-AND-RELEASE-AUTHORIZATION.md)。
