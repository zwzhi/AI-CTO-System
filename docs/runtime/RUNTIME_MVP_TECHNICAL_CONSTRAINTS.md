# Runtime MVP 技术约束

1. 只允许单 Workflow、单 Task、单次 Mock Capability Invocation。
2. 禁止 Runtime 代码、真实 Agent、Codex/MCP、外部工具、生产环境和自动执行。
3. 禁止多 Agent 协作、Agent 直连、复杂 Loop、递归、无界重试、预算自动扩容和静默降级。
4. 必须继承 Token、工具调用、时间、成本和失败重试预算；任一超限都停止新增调用。
5. 必须遵循 Permission、Human Control、Kill Switch、项目 Gate 和审计要求；不得以 MVP 为理由绕过既有治理。
6. 任何真实 Capability、持久化实现或代码开发均为后续独立范围，需取得新的设计和开发授权。
