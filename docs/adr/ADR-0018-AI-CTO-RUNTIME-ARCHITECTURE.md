# ADR-0018：AI CTO Runtime Architecture

采用 Control Plane First Runtime：Intent、Routing、Workflow、Permission、Approval、Budget、Audit 与 Kill Switch 先约束未来执行；Agent 和工具经 Workflow Engine 与 Capability Adapter 协调。原因是 Runtime 必须受治理层控制。后果是 Phase 9A 只完成架构合同，不实现 Runtime、Agent、Codex、MCP 或自动执行。
