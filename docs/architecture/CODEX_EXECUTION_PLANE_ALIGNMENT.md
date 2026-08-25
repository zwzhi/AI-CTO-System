# Codex Execution Plane Alignment

## 1. 总体模型

```text
AI CTO Governance Plane
  Mission / Memory / Decision / Design / Lifecycle / Evidence / Gates
                         ↓
Codex Execution Plane
  Model / Reasoning / Subagents / Skills / MCP / Plugins / Shell / Files
  Sandbox / Approval / Worktree / Goal / Scheduled Task
                         ↓
Project Repository and External Services
```

AI CTO System 负责判断、约束、记录和复盘；Codex App / CLI / IDE 负责在宿主权限内实际执行。两者不是两套平行的自动开发 Runtime。

## 2. AI CTO Governance Plane

AI CTO 保留以下职责：

- 使命、用户理解、Project Memory 和 Knowledge Governance；
- Idea、Research、Evaluation、Portfolio、Priority 和 Investment 决策；
- PRD、Architecture、Task、Git、Testing、Release 和 Delivery 标准；
- Risk、Permission、Approval、Gate、Audit、Evidence 和 Finalization Integrity；
- 对 Codex Host Surface 的选择建议、项目范围、验收和复盘。

AI CTO 不重复实现 Codex 的模型客户端、文件编辑器、Shell 执行器、Subagent 调度器、MCP 传输层或宿主后台任务。

## 3. Codex Execution Plane

Codex Host 负责：

- 模型和 Reasoning 执行；
- 文件、Shell、测试命令和 Git 工作区；
- Subagents / Custom Agents；
- Skills、Plugins、MCP、浏览器和其他已授权工具；
- Sandbox、Approval、Worktree、Goal、Long-running Work 和 Scheduled Task。

Codex Host 的实际能力必须以当前客户端、项目可信状态、用户配置、Sandbox、Approval 和可用插件 / MCP Evidence 为准。AI CTO 不能把设计文档或 Mock 当成实际执行证据。

## 4. 十二项能力责任矩阵

| 能力 | 主要执行者 | AI CTO 作用 | 当前状态 |
|---|---|---|---|
| 多 Agent 协作 | Codex Subagents | 任务拆分、角色边界、Review、Evidence | 复用 Host |
| 模型选择 / 未来切换 | Codex Host | 复杂度、风险、成本、质量建议 | Advisory；切换另行授权 |
| 真实 Codex 执行 | Codex App / CLI / IDE | 范围、Approval、Audit、Gate | 日常 Host-native |
| MCP / Plugins | Codex Host | Admission、License、安全、权限、回退 | 按需启用 |
| 代码修改 | Codex Host | Design、Task、Diff、测试、Review、回滚 | 项目范围内受控 |
| 部署 | Codex + 项目部署系统 | Environment、Deployment、Rollback、Approval | 项目级 |
| 生产发布 | 项目 Release 系统 + Codex | Release Gate、Security、UAT、回滚 | 人工控制 |
| 后台监控 | 项目监控系统 / Scheduled Task | 指标、告警、响应、复盘 | 不在 Core 内建 |
| RAG / 向量数据库 | 可选检索能力 | 数据、Evidence、冲突、复用治理 | 当前不需要 |
| 模块删除 | 人类 + AI CTO Proposal | 价值、影响、回滚、审批 | 禁止自动删除 |
| 核心治理修改 | 人类 + AI CTO Gate | ADR、Review、风险接受 | 必须人工批准 |
| 无人监督开发 | Codex Scheduled / Long-running | 范围、停止、验证、回滚、结果审阅 | 仅限受控任务 |

## 5. 现有 Runtime 文档的解释

仓库中的 Runtime、Agent 和 Codex 文档保留为：

1. `Internal MVP Evidence`：证明 Workflow、Task、Audit、Guard 和确定性 Capability 合同已经被验证；
2. `Governance Contract`：规定 AI CTO 对执行面必须施加的权限、预算、Approval、Audit 和 Gate；
3. `Optional External Runtime Reference`：未来若 AI CTO 脱离 Codex Host、接入其他宿主或构建独立编排器时参考。

这些文档的 `Completed` 不表示生产 Runtime、真实外部 Codex Provider 或无人监督执行已经可用。

## 6. 安全边界

- 日常 Codex 使用不等于外部 Codex Capability Registry 激活；当前外部 Codex 仍为 `ABSENT / PROHIBITED / NONE`。
- Sandbox / Approval 是宿主控制，不能替代 AI CTO 的 Project Scope、Gate、Audit 和用户决定。
- `danger-full-access`、`approval_policy = never` 或后台任务不能被解释为无限项目授权。
- 生产发布、权限提升、核心治理修改、模块删除、不可逆数据操作和无人监督全自动开发不进入默认路径。
- Scheduled Task / Long-running Work 优先使用隔离 Worktree，并在完成后读取 Diff、测试、状态和 Evidence。

## 7. 扩展判断

未来新增执行需求必须先回答：

1. Codex Host 是否已经原生提供；
2. AI CTO 是否只需增加治理合同、路由建议或 Evidence；
3. 项目专用系统是否更适合承担；
4. 是否真的需要独立 Runtime；
5. 是否会复制权限、调度、审计或记忆系统。

只有现有 Host、AI CTO Governance 和项目系统都无法承担的长期职责，才进入新的 Architecture Review；不得因历史 Runtime 文档存在而继续实现重复执行层。

## 8. 关联权威

- [AI CTO System Master Plan](../strategy/AI_CTO_SYSTEM_MASTER_PLAN.md)
- [AI CTO–Codex Operating Model](../superpowers/specs/2026-08-25-ai-cto-codex-operating-model-design.md)
- [ADR-0033](../adr/ADR-0033-AI-CTO-CODEX-EXECUTION-PLANE-ALIGNMENT.md)
- [Execution Routing Governance](../governance/EXECUTION_ROUTING_GOVERNANCE_STANDARD.md)
- [Model Routing Policy](../governance/MODEL_ROUTING_POLICY.md)
