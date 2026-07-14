# Phase 8.4 Intelligent Resource & Execution Routing Governance Design

## 1. 目标

将未来路线名称从“Phase 8.4 Resource Governance”调整为“Phase 8.4 Intelligent Resource & Execution Routing Governance”，并把它登记为 `PROPOSED` 路线元数据。

调整来自用户确认的真实使用反馈：模型耗时、Token 效率和流程过载风险。该反馈说明需要研究资源治理与执行路由，但尚不足以定义 Module、实施方案、运行时或执行授权。

## 2. 规划边界

未来路线拟研究以下治理问题：

- 在不同任务、风险、质量、预算与时延约束下，如何选择或建议执行路径；
- 如何记录模型耗时、Token 效率和流程负载，识别成本或过载风险；
- 何时建议降级、拆分、排队、限流、暂停或请求人工决策；
- 如何使资源与执行建议继续服从 Mission Alignment、Capability Governance、Security、项目 Gate 和人工授权。

本次不实现模型路由、任务队列、Agent Runtime、工具调用、自动化、成本优化算法、监控服务或任何外部接入。

## 3. 架构归属与状态

路线暂定属于 Layer 5：Execution & Intelligence 的候选治理方向，并消费 Layer 2 的优先级 / 投资约束、Layer 3 的任务与工程基线、Layer 4 的测试 / 运行证据，以及 Layer 1 的经验与成本知识。

`PROPOSED` 只表示规划状态，不是 Module Registry Status、Capability Status、Knowledge Status、Portfolio Status 或 Lifecycle State。它不授予 Module Admission、设计、编码、工具调用、运行时执行或进入 Phase 8.4 的权限。

## 4. Evidence 与验证要求

本次唯一来源是用户确认的真实使用反馈，必须按“用户确认的观察”记录，不能伪造量化结论。未来进入 Module Admission 前，至少补充：

1. 任务类型、模型、输入 / 输出 Token、耗时、成功率、失败类型和成本基线；
2. 流程负载、排队、重试、阻塞与人工干预记录；
3. 不同路由或降级策略的质量、成本、时延和安全影响对比；
4. 权限、数据、供应商、回滚和可解释性风险；
5. 受影响项目的 Architecture、Security、Testing 和 Release Gate 影响分析。

没有这些 Evidence 时，路线只能保持 `PROPOSED` 或 `UNDER_REVIEW`。

## 5. 同步范围

更新：

- `docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md`：登记 Phase 8.4 新名称、来源、范围、依赖和非授权边界；
- `README.md`：显示新的未启动路线名称；
- `SKILL.md`：要求未来相关请求先收集指标并走 Admission / Classification；
- `memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md`：记录用户反馈和规划状态；
- `docs/DEVELOPMENT_PROGRESS.md`：记录路线调整、未启动状态和下一步。

不更新 Module Registry，因为尚无可登记 Module；不创建 ADR，因为没有改变 Layer、Module、Gate 或已接受架构决策。

## 6. 验证

- 新名称在五个同步文件中一致出现；
- 每处均标明 `PROPOSED`、未启动和不授权；
- 不出现新 Module、Agent、Runtime、工具调用或自动化实现；
- Master Plan 仍明确 Phase 名称不是自动授权；
- Markdown 链接、根 SKILL、占位符和 Git diff 检查通过。
