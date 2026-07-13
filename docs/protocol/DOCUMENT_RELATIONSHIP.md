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
