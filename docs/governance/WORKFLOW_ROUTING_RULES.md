# Workflow Routing Rules

## Workflow 类型

| Workflow | 适用等级 | 最小组成 | 不适用情形 |
|---|---|---|---|
| Instant Workflow | Level 1 | 任务范围核对、定向上下文、最小修改 / 回答、适用验证、进度或记录同步 | 新项目、Module / ADR / Gate / 安全 / 数据 / 不可逆变更 |
| Engineering Workflow | Level 2，必要时 Level 3 的执行部分 | 已批准需求和设计、任务追踪、测试先行、实现、Review、变更影响和工程 Gate | 缺失批准设计、范围未明或项目级决策未完成 |
| CTO Workflow | Level 3–4 | Idea / Research / Evaluation / Design 与适用的 Portfolio、Risk、Gate、用户决策 | 低风险、已确认范围的局部文档或工程任务 |

## 选择规则

1. 先依据 [Task Complexity Model](./TASK_COMPLEXITY_MODEL.md) 判级，再选择 Workflow；不得反向用想调用的流程决定等级。
2. Level 0 输出 `OUT_OF_SCOPE`，不启动 AI CTO Workflow。
3. Level 1 默认 Instant Workflow；**低风险任务禁止仅为流程完整启动完整 CTO Workflow**。
4. Level 2 默认 Engineering Workflow；没有批准设计时升级或返回前置阶段。
5. Level 3 先完成适用设计与影响分析，再进入 Engineering；Level 4 使用完整 CTO Workflow。
6. 红线、未知、冲突和项目 Gate 只能升级路径或请求人工决策，不能被效率目标降级。

## Workflow 输出约束

Workflow 路由输出建议性的步骤和升级条件，不创建执行授权。执行仍需满足适用的 Capability、权限、安全审查、Architecture、Development、Testing、Release 或其他 Gate。

## EFF-001 应用

EFF-001 是候选 Level 1：范围已确认、只同步治理文档，且没有 Module / ADR / Runtime 变更。未来 Router 可建议 Instant Workflow，但必须先核实当前范围、工作区、相关规则和用户授权；不能据此取消所有设计、确认或 Git 安全检查。
