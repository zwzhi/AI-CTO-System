# Agent Orchestration Architecture

未来角色：Planner（计划）、Researcher（调研）、Product（需求）、Architect（架构）、Developer（代码）、QA（验证）、Security（安全）、Release（发布证据）、Memory（候选记忆）。每个 Agent 只接收 Workflow Engine 分配的 Task Contract，输出结构化结果和 Evidence；权限由 Permission Model 限定。

Agent 禁止直接调用 Agent。任务创建、依赖、分配、结果、重试、暂停、终止都必须经过 Workflow Engine。任何 Agent 禁止绕过 Gate、Approval、预算、Audit 或修改核心治理文件。
