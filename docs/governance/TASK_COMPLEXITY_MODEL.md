# Task Complexity Model

## 模型原则

复杂度衡量任务的影响范围、风险、可逆性、未知度、跨层关系与所需证据，不按用户职位、截止时间、预算或工具可用性判断。任一安全、Gate、ADR、数据、不可逆副作用或证据红线可升级任务；评分或偏好不能降级红线。

| 等级 | 判断标准 | 示例 | 默认 Workflow | 默认 Context |
|---|---|---|---|---|
| Level 0 | 普通咨询；不需项目事实、不改变项目资产、不请求受控操作 | 概念解释、一般建议 | 不进入 AI CTO 流程 | 当前问题与必要公开知识 |
| Level 1 | 已确认范围、局部、低风险、可逆的文档或配置性修改；无 Module / ADR / Gate 影响 | 修正已确认文档措辞、同步局部状态 | Instant Workflow | 当前文件、目标规则、必要 Git 状态 |
| Level 2 | 单项目常规工程任务；有明确需求和设计，影响可界定 | 已批准设计下的功能实现、测试修复 | Engineering Workflow | 当前项目 Memory、相关需求 / 设计 / 任务 / 测试 |
| Level 3 | 模块级变化、跨多个工程对象或需新设计 / 影响分析 | 新增模块、数据库迁移、关键集成变更 | 设计 + Engineering Workflow | Project Memory、相关 Knowledge、Architecture、ADR、影响面 |
| Level 4 | 新项目、重大架构、跨项目资源 / 安全 / 生命周期变化 | 新项目立项、跨 Layer Module、生产架构重构 | CTO Workflow | User Brain、Portfolio、Knowledge、项目上下文与适用 Gate |

## 判定步骤

1. 判断任务是否改变项目资产或需要项目事实；若否，归为 Level 0。
2. 判断范围是否已确认、局部、低风险且可逆；若是，候选 Level 1。
3. 判断是否已有批准的 Requirement、Design 和 Task；若是，候选 Level 2。
4. 判断是否涉及 Module、架构、数据、跨层、外部依赖或重大影响；若是，至少 Level 3。
5. 判断是否属于新项目、重大架构、跨项目投资 / 资源或高风险变更；若是，Level 4。
6. 记录证据、Confidence、默认路径和升级条件；不确定时使用更高等级或 `INSUFFICIENT_EVIDENCE`。

## 升级规则

以下任一条件把任务升级到至少下一级：未知或敏感数据、生产影响、不可逆操作、P0 / P1 风险、未解决 ADR 冲突、触发项目 Gate、跨项目依赖、权限不明、质量要求无法验证、用户当前指令与偏好冲突。

Level 1 不得因任务短小而免除范围检查、必要文档同步、变更验证或当前用户授权。
