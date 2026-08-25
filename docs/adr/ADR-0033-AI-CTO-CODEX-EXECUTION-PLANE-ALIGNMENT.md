# ADR-0033：AI CTO System 与 Codex Execution Plane 职责对齐

- **状态：** Accepted
- **日期：** 2026-08-25
- **决策者：** AI CTO System 发起人、AI CTO

## 背景

AI CTO System 已建立 Runtime、Agent、Capability Adapter 和 Codex Capability 设计；Codex App / CLI / IDE 同时已经提供模型调用、Subagents、Skills、MCP、Plugins、Sandbox、Approval、Worktree、Goal 和 Scheduled Task。继续在 AI CTO Core 中实现同类执行能力，会形成重复 Runtime、重复权限和重复审计。

## 决策

1. AI CTO System 定位为 Governance Plane，负责使命、记忆、决策、设计、生命周期、Evidence、Audit、Gate 和人类控制。
2. Codex 定位为默认 Execution Plane，负责模型、文件 / Shell、Subagents、Skills、MCP、Plugins、Worktree、Goal 和宿主执行。
3. 日常使用 Codex 不等于将 Codex 作为外部 Provider 激活到 AI CTO Capability Registry；真实 Provider 仍须独立准入。
4. 既有 Runtime / Agent / Codex 文档保留为 Internal MVP Evidence、Governance Contract 或 Optional External Runtime Reference，不删除历史证据，不继续实现重复执行层。
5. 模型切换、MCP、部署、Scheduled Task 和后台任务由宿主 / 项目系统提供；AI CTO 只提供治理建议和边界，不默认取得自动执行权。

## 后果

### 正面

- 降低 AI CTO System 的重复架构和上下文负担；
- 直接利用 Codex 已验证的执行能力；
- 保留 AI CTO 对项目价值、范围、质量、权限、审计和 Gate 的独立控制；
- 未来可以替换 Codex Host，而不改变治理层。

### 代价与限制

- AI CTO 不能假设宿主支持所有执行能力，必须记录 Capability / Host Evidence；
- 自动模型切换、生产发布、监控和 RAG 仍需逐项项目化或宿主化设计；
- 现有 Runtime 文档的“Completed”必须理解为合同 / MVP 证据完成，而不是生产执行完成。

## 不采用的方案

- 不在 AI CTO Core 内复制 Codex 的模型客户端、Agent 调度器、MCP 层或部署平台；
- 不以全局 `danger-full-access` 或 `approval_policy = never` 代替项目授权；
- 不自动删除现有 Runtime 文档或重写历史 ADR；
- 不开放无人监督的任意项目、任意文件和任意生产执行。

## 参考

- [AI CTO–Codex Execution Plane Alignment Design](../superpowers/specs/2026-08-25-codex-execution-plane-alignment-design.md)
- [AI CTO System Master Plan](../strategy/AI_CTO_SYSTEM_MASTER_PLAN.md)
- [Codex Subagents 官方说明](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [Codex MCP 官方说明](https://learn.chatgpt.com/docs/extend/mcp)
- [Codex Scheduled Tasks 官方说明](https://learn.chatgpt.com/docs/automations)
