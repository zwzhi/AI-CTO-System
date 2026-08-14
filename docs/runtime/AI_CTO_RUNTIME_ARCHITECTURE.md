# AI CTO Runtime Architecture

Runtime 属于 Layer 5，是受控执行面，不拥有项目价值、架构、Gate、发布或风险接受的最终决策权。Input 接收 Intent Result、请求、项目上下文；Processing 管理 Workflow、Plan、Agent；Capability 经 Adapter；Memory 读写记忆；Control 管理权限、审批、预算、Audit、Kill Switch；Output 产生 Result、Evidence、Status Update。Control Plane 先于 Execution Plane，所有执行均受 Gate 约束。

## Task Execution Envelope 补强

现有 Runtime 通过 [Task Execution Envelope Standard](./TASK_EXECUTION_ENVELOPE_STANDARD.md) 对 L2–L4 任务增加任务级前置合同。Envelope 冻结目标、非目标、项目基线、允许/禁止路径、路由档位、Evidence、Gate、停止、回滚、验收和下一步动作；它扩展现有 Intent → Routing → Workflow / Task → Permission / Budget → Audit 链路，不新增 Module、Phase 或执行授权层。

L0/L1 仍使用最小路径；L2–L4 在创建 Workflow / Task 前必须通过 Envelope 校验。缺失 Envelope、证据过期、档位不足或 Gate 未完成时返回 `ENVELOPE_BLOCKED`，不创建 Workflow / Task、不调用 Capability、不产生 `executionAuthorization`。通过校验只允许进入现有 `CONFIRM` / `WAITING_APPROVAL` 检查点，不能替代 Approval、Permission、Budget 或 Release Gate。
