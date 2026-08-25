# AI CTO–Codex Execution Plane Alignment Design

## 1. 问题

AI CTO System 当前同时保存了治理标准、Runtime Foundation、Agent Contract、Codex Capability Adapter 和工具接入设计；而 Codex App / CLI / IDE 已经原生提供 Subagents、Skills、MCP、Plugins、Sandbox、Approvals、Worktrees、Goals 和 Scheduled Tasks。若两边都继续实现相同的执行能力，会造成职责重复、权限边界重复和上下文负担。

## 2. 目标架构

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

### 2.1 AI CTO Governance Plane

AI CTO System 继续负责：

- 使命、边界、用户与项目记忆；
- Idea、Research、Evaluation、Portfolio 和 Investment 决策；
- PRD、Architecture、Task、Git、Testing、Release 和 Delivery 标准；
- Risk、Permission、Approval、Gate、Audit、Evidence 和 Finalization Integrity；
- 对 Codex 原生能力的选择建议、准入规则、项目范围、验收和复盘。

AI CTO 不重复实现 Codex 的文件编辑器、Shell 执行器、模型客户端、Subagent 调度器或 MCP 传输层。

### 2.2 Codex Execution Plane

Codex 继续负责：

- 实际模型调用和推理；
- 文件读取 / 修改、Shell 和测试命令；
- Subagents 与 Custom Agents；
- Skills、Plugins、MCP 和宿主工具；
- Sandbox、Approval、Worktree、Goal、Scheduled Task 与本地环境。

Codex 的执行能力仍受用户授权、宿主权限、安全策略和项目治理规则约束。Codex 原生能力可被 AI CTO 建议和审计，但不被 AI CTO Core 重新实现。

## 3. 十二项能力归属

| 能力 | 主要执行者 | AI CTO 责任 | 当前判断 |
|---|---|---|---|
| 多 Agent 协作 | Codex Subagents | 任务拆分、角色边界、Evidence、Review | 复用 Codex，不建第二套 Runtime |
| 模型选择 / 未来切换 | Codex Host | 复杂度、风险、成本和质量建议 | 治理保留，宿主切换另行授权 |
| 真实 Codex 执行 | Codex App / CLI | 范围、Approval、Audit、Gate | 日常使用直接复用 Codex |
| MCP / Plugins | Codex Host | Capability Admission、License、安全、权限 | 复用原生接入 |
| 代码修改 | Codex Host | Design、Task、Diff、Review、测试和回滚 | 有边界地允许，不开放“任意项目” |
| 部署 | Codex + 项目部署系统 | Environment、Deployment、Rollback、Approval | 项目级能力，不属于 AI CTO Core |
| 生产发布 | 项目 Release 系统 + Codex | Release Gate、Security、UAT、回滚 | 不默认无人审批 |
| 后台监控 | 项目监控系统 / Codex Scheduled Task | 监控指标、告警、响应和复盘 | 不在 AI CTO Core 内建监控服务 |
| RAG / 向量数据库 | 可选检索能力 | 数据分类、Evidence、冲突和复用治理 | 当前文件型 Memory 足够，按规模再接入 |
| 模块删除 | 人类 + AI CTO Proposal | 价值、影响、回滚、审批 | 不自动删除 |
| 核心治理修改 | 人类 + AI CTO Gate | ADR、Review、风险接受 | 必须人工批准 |
| 无人监督开发 | Codex Scheduled / Long-running | 范围、停止条件、回滚、结果审阅 | 只允许受控、可回顾的任务 |

## 4. 现有 Runtime 文档的重新定位

现有 Runtime、Agent 和 Codex Capability 文档不删除，保留为三类：

1. **Internal MVP Evidence**：证明 AI CTO 曾验证 Workflow、Task、Audit、Guard 和确定性 Capability 合同；不代表日常 Codex Host 必须复用该 Runtime。
2. **Governance Contract**：定义 AI CTO 对执行面的权限、预算、审批和审计要求；继续有效。
3. **Optional External Runtime Reference**：未来若 AI CTO 要脱离 Codex App，独立编排其他宿主或 Provider，可作为参考；当前不进入实施。

Codex Capability Registry 的真实 Provider 仍保持现有 `ABSENT / REJECT_OR_DEFER / PROHIBITED / NONE` 结论；日常在 Codex App 中使用 Codex 不等于将外部 Codex Provider 激活到 AI CTO Registry。

## 5. 权限与安全边界

- AI CTO 的治理规则不能替代 Codex Sandbox / Approval；两者必须同时满足。
- “自动执行”必须绑定具体项目、工作区、任务、范围、预算、停止条件和回滚路径。
- 生产发布、权限提升、核心治理文件修改、模块删除和不可逆数据操作必须人工批准。
- Codex 的 `danger-full-access` / `approval_policy = never` 属于宿主环境风险，不应被 AI CTO 解释为项目授权。
- Scheduled Task / Long-running Work 使用 Worktree 优先隔离，完成后必须读取结果、检查 Diff、测试和状态。

## 6. 简化原则

后续新增需求先判断：

1. Codex 是否已经原生提供该执行能力；
2. AI CTO 是否只需增加治理合同、路由建议或 Evidence；
3. 是否真的需要新的 Core Runtime；
4. 是否会造成第二套权限、审计、调度或记忆系统。

只有无法由 Codex Host、现有 AI CTO Governance 或项目专用系统承担的长期职责，才进入新的架构评审；不得因为已有 Runtime 文档就继续实现重复执行层。

## 7. 成功标准

- 用户可以在 Codex 项目中直接使用 AI CTO Skill 完成项目治理和开发；
- Codex 原生执行能力与 AI CTO 治理责任在入口文档中明确分离；
- 12 项能力均有唯一的主要责任方和当前状态；
- 历史 Runtime / Mock / ADR 证据可追溯，但不再被误解为生产 Codex 接入；
- 不新增 Runtime 代码、Provider、MCP、自动模型切换或无人监督执行。
