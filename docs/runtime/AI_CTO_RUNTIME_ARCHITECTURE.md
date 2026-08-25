# AI CTO Runtime Architecture

Runtime 属于 Layer 5，是受控执行面，不拥有项目价值、架构、Gate、发布或风险接受的最终决策权。Input 接收 Intent Result、请求、项目上下文；Processing 管理 Workflow、Plan、Agent；Capability 经 Adapter；Memory 读写记忆；Control 管理权限、审批、预算、Audit、Kill Switch；Output 产生 Result、Evidence、Status Update。Control Plane 先于 Execution Plane，所有执行均受 Gate 约束。

## Codex Execution Plane Alignment

本 Runtime 架构是 AI CTO 的 Governance / Control Plane 合同和内部 MVP 证据，不是 Codex App 的替代实现。日常在 Codex App / CLI / IDE 中执行时，模型、文件 / Shell、Subagents、Skills、MCP、Plugins、Worktree、Goal、Scheduled Task 和宿主权限由 Codex Execution Plane 提供；AI CTO 通过 Skill、Project Memory、Execution Plan、Permission / Approval / Gate、Audit 和 Evidence 约束其使用。只有在未来需要脱离 Codex Host、接入其他宿主或构建独立编排器时，才考虑实现本 Runtime 的外部执行 Adapter。

现有 Runtime 文档中的 `Completed` 表示合同、MVP 或内部受控链路已建立，不表示 Codex Host 已被 Capability Registry 激活，也不表示生产级自动执行可用。

## Task Execution Envelope 补强

现有 Runtime 通过 [Task Execution Envelope Standard](./TASK_EXECUTION_ENVELOPE_STANDARD.md) 对 L2–L4 任务增加任务级前置合同。Envelope 冻结目标、非目标、项目基线、允许/禁止路径、路由档位、Evidence、Gate、停止、回滚、验收和下一步动作；它扩展现有 Intent → Routing → Workflow / Task → Permission / Budget → Audit 链路，不新增 Module、Phase 或执行授权层。

L0/L1 仍使用最小路径；L2–L4 在创建 Workflow / Task 前必须通过 Envelope 校验。缺失 Envelope、证据过期、档位不足或 Gate 未完成时返回 `ENVELOPE_BLOCKED`，不创建 Workflow / Task、不调用 Capability、不产生 `executionAuthorization`。通过校验只允许进入现有 `CONFIRM` / `WAITING_APPROVAL` 检查点，不能替代 Approval、Permission、Budget 或 Release Gate。

Envelope 还负责把已冻结 Intent 的 `taskRef`、复杂度和风险与执行声明对齐；`ESCALATE_FOR_REVIEW` 路由必须绑定 Review Profile 与 Packet SHA，且 Packet 指纹必须存在于任务 Evidence 中。Review 仍是既有 Code Review 的受控输入，不会由 Runtime 自动编排 Reviewer。

受控 Handoff 可显式携带一个已验证的 Task Checkpoint。只有配置 `CheckpointService` 且 Handoff 到达 `WAITING_APPROVAL` 或 Runtime `CANCELLED` 终态时才追加该快照；它不写 Project Memory、不改变 Workflow / Task 状态、不恢复执行，也不产生授权。
