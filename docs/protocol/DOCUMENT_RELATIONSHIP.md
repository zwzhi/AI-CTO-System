# 文档关联规则

## 单一事实来源

每类信息只指定一个权威来源，其他文档通过相对路径引用，不复制容易失效的大段内容：

| 信息 | 权威文档 |
|---|---|
| 产品目标、范围、需求与验收标准 | PRD |
| 系统结构、组件边界和技术约束 | Architecture |
| 开发任务、顺序、依赖与验证方法 | Development Plan |
| 实际完成情况、阻塞和下一步 | Development Progress |
| 重大决策及其演变 | ADR |
| 长期上下文与当前项目摘要 | PROJECT_MEMORY |
| 当前生命周期状态 | PROJECT_STATE |
| Idea 完整性与候选资格 | Idea Candidate Standard |
| 项目评分、依据与总分 | Project Evaluation |
| 结论的证据可信度 | Confidence Model |
| 立项结果与阶段门禁 | Project Approval Gate |
| 产品背景、用户、范围、需求与验收 | PRD |
| 需求优先级及其判断依据 | Requirement Priority |
| 技术结构、边界与非功能设计 | Architecture |
| 数据模型、生命周期与迁移 | Database Design |
| AI Agent 的职责、工具、记忆与评估 | Agent Design |
| 需求、设计、任务、提交与测试的端到端对应关系 | Traceability Matrix |
| DEVELOPMENT 授权结果 | Design Approval Gate |
| TESTING 授权结果 | Development Approval Gate |
| 测试目标、范围、类型、环境、数据、指标与责任 | Test Strategy |
| 测试案例的实际执行结果与可复核证明 | Test Evidence |
| 缺陷状态、优先级、修复与验证 | Bug Register |
| AI 输出质量、准确率、稳定性、幻觉、成本与时延结论 | AI Evaluation |
| 上线前安全检查与结论 | Security Review |
| 端到端发布准备判断 | Release Approval Gate |
| RELEASE 状态转换授权 | Testing Release Gate |
| 部署、回滚与数据恢复执行 | Deployment / Rollback Record |
| 上线指标、阈值、告警、观察窗口与处置 | Monitoring Record |
| 单个版本的发布结果总览 | Release Report |

## PRD 关联规则

### PRD → Architecture

- Architecture 必须引用 PRD 的路径和版本或提交。
- 每个架构组件应能追溯到一个或多个需求或非功能约束。
- 架构改变产品范围时，必须先更新 PRD。

### Architecture → Development Plan

- Development Plan 必须引用已确认的 Architecture。
- 每项开发任务必须说明其实现的需求和涉及的架构组件。
- 计划需要偏离架构时，先创建或更新 ADR，再同步 Architecture。

### Development Plan → Progress

- Progress 必须引用当前 Development Plan。
- 进度项使用计划中的任务标识，记录计划与实际差异。
- 新增、删除或重排重大任务时更新 Development Plan，并在 Progress 中说明原因。

### Requirement → Design → Task → Commit → Test → Evidence

- 每项已批准需求必须拥有稳定的 Requirement ID。
- Architecture、Database Design 和 Agent Design 使用 Design ID 引用对应需求。
- Development Plan 中的任务必须引用其实现的 Requirement ID 与 Design ID。
- 每个重要 Git Commit 必须引用 Task ID，并在 Traceability Matrix 中关联 Requirement、Design 与 Test Case。
- Test Plan 和测试案例必须引用验证的 Requirement ID、Design ID、Task ID 与相关 Commit。
- 每次测试执行必须生成稳定的 Evidence ID，记录候选基线、环境、数据、步骤、预期结果、实际结果、时间、执行人和原始证据位置，并关联对应 Test Case。
- TESTING → RELEASE 前，每项发布必需测试都必须形成 Requirement → Test Case → Evidence 的可复核投影；计划中的 `NOT_RUN` 不能作为通过证据。
- `docs/design/TRACEABILITY_MATRIX_TEMPLATE.md` 是端到端追踪关系的权威索引；源文档仍保存具体内容。
- 需求、设计、任务、Commit 映射、测试或 Evidence 有效性改变时，必须更新矩阵并执行正向、反向和孤儿项检查。

## ADR 规则

ADR 用于记录会影响架构、数据、接口、安全、成本、开发流程或长期维护的重大决策。

- 每份 ADR 使用唯一编号：`ADR-XXXX`。
- 状态使用：`Proposed`、`Accepted`、`Superseded`、`Rejected`。
- 技术决策变化时不得覆盖旧 ADR。
- 新建 ADR，并在新 ADR 中引用被替代的 ADR。
- 旧 ADR 标记为 `Superseded`，反向引用新 ADR。
- Architecture、Development Plan、Progress 和 PROJECT_MEMORY 必须引用相关 ADR。

## 更新顺序

需求变化时：

`PRD → ADR（如属重大决策）→ Architecture → Development Plan → Progress → PROJECT_MEMORY`

实现偏差时：

`Progress → ADR（如改变重大决策）→ Architecture/Development Plan → PROJECT_MEMORY`

立项决策时：

`Idea Candidate → Research → Project Evaluation + Confidence → Build vs Buy → Approval Gate → PROJECT_STATE → PROJECT_MEMORY`

设计与开发授权时：

`PRD → Requirement Priority → Architecture → Database/Agent Design（适用时）→ ADR → Development Plan + Test Plan → Traceability Matrix → Risk/Rollback → Design Approval Gate → PROJECT_STATE → PROJECT_MEMORY`

开发执行与测试授权时：

`Task → Test Case (RED) → Implementation (GREEN) → Refactor → Commit → Code Review → Validation → Five-layer Traceability → Development Approval Gate → PROJECT_STATE → PROJECT_MEMORY`

测试执行与发布授权时：

`Test Strategy → Test Case → Evidence → Bug / AI Evaluation / Security Review / UAT → Release Approval Gate → Testing Release Gate → PROJECT_STATE → PROJECT_MEMORY`

发布执行与上线验证时：

`Release Authorization → Deployment / Rollback Plan → Deployment Record → Monitoring → Release Report → PROJECT_STATE → PROJECT_MEMORY`
