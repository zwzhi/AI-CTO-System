# Phase 9A Runtime Architecture Design 规格

## 目标

设计 Layer 5 的 AI CTO Runtime 受控执行面，使未来系统能接收 Intent、生成 Execution Plan、创建 Workflow Instance、协调 Agent Task、经 Capability Adapter 调用外部能力、管理 Memory、Approval、Permission、Audit、Result 与 Status Update。

## 控制平面优先

Runtime 不拥有项目价值、架构、Gate、发布或风险接受的最终决策权。Layer 2–4 的决策、标准和 Gate 对 Runtime 具有约束力。Runtime 只在已授权范围内协调执行，并提供暂停、审计、停止和回滚能力。

## 架构层

- Input Layer：接收 Intent Result、User Request、Project Context。
- Processing Layer：Workflow Management、Execution Planning、Agent Coordination。
- Capability Layer：Capability Selection、Capability Invocation Contract、Capability Adapter。
- Memory Layer：User Brain、Project Memory、Knowledge Base 的规则化读写与冲突处理。
- Control Layer：Permission、Human Approval、Audit、预算、Kill Switch、人工停止。
- Output Layer：Result、Evidence、Status Update。

## Workflow 与 Agent

Workflow 状态机至少包括 `CREATED`、`PLANNING`、`WAITING_APPROVAL`、`EXECUTING`、`VALIDATING`、`PAUSED`、`ROLLING_BACK`、`COMPLETED`、`FAILED`、`CANCELLED`。失败、暂停、回滚和取消必须保留原因、Evidence、责任与恢复条件。

Agent 之间禁止直接调用。所有任务创建、分配、依赖、结果提交、重试、暂停和终止必须经过 Workflow Engine；Agent 只处理自己的明确 Task Contract。

## 预算与停止

Runtime 继承 Phase 8.4 Execution Routing 的预算治理，针对每个 Workflow / Task 记录并限制 Token、工具调用次数、时间和成本。预算越界、权限撤销、安全红线、用户停止或系统异常触发 `PAUSED`、`ROLLING_BACK` 或 `CANCELLED`。

Kill Switch 必须支持用户人工停止和授权控制者停止；停止后阻断新的 Invocation，保留 Audit，按可逆性执行安全停止或回滚。Kill Switch 不删除 Evidence，不绕过 Gate。

## 明确排除

不开发 Runtime 代码、不创建真实 Agent、不接入 Codex、MCP、工具或模型、不调用外部能力、不实现自动执行。所有接口均为未来架构合同。

## 验收范围

Phase 9A 将创建 Runtime 总体架构、Layer 集成、Agent Orchestration、Workflow Engine、Approval、Permission、Tool Integration、Memory Runtime、Audit、安全边界及 ADR-0018，并同步五个入口；不进入 Phase 9B。
