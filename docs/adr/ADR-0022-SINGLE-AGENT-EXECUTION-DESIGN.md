# ADR-0022：Single Agent Execution 采用 Planner-first、确认门控设计

## 状态

Accepted — 仅限 Phase 9C-3 Agent Contract Design。

## 背景

Phase 9C-2 已验证单 Workflow、单 Task、Mock Capability、Permission / Budget Guard 与 Audit Evidence 的 Runtime Foundation。本系统仍没有真实 Agent、Codex/MCP、外部工具、自动执行或多 Agent 协作。若直接设计多个可执行 Agent，会在未验证 Agent 合同、权限、预算、生命周期和人类控制关系前扩大执行与授权风险。

## 决策

采用 Single Agent 先行：先设计一个 Planner Agent。Planner 只将明确输入转换为 Proposed Execution Plan 和 Plan Evidence，默认受 `CONFIRM` 约束。Workflow Engine 接收并审计结果后进入 `WAITING_APPROVAL`；只有人类确认后，未来经独立授权的 Workflow 才可考虑下一步。

Agent 不能直接改变 Workflow 状态、调用 Agent 或 Capability、修改代码或治理文件、写入 `ACTIVE` Knowledge，或绕过 Gate、Permission、Budget、Audit 和 Human Approval。

## 后果

该选择将 Agent 定位为受控、可审计的合同执行者，而非决策者或自动化入口。代价是本阶段不交付真实 Agent、模型调用、工具调用、自动计划执行、低风险 `AUTO` 模式、多 Agent 协作或生产能力。

## 替代方案

1. 直接设计多 Agent 协作：拒绝，尚未验证单 Agent 与 Workflow 的边界。
2. 让 Planner 自动进入 `EXECUTING`：拒绝，违反当前默认确认与 Control Plane First 边界。
3. 仅生成独立文档、不接入 Workflow：拒绝，不能验证 Agent Runtime 合同与审计关系。

## 相关文档

- [Agent Execution Model](../runtime/AGENT_EXECUTION_MODEL.md)
- [Agent Contract Standard](../runtime/AGENT_CONTRACT_STANDARD.md)
- [Planner Agent Design](../runtime/PLANNER_AGENT_DESIGN.md)
- [Agent Human Control](../runtime/AGENT_HUMAN_CONTROL.md)
