# AI CTO Active Operating Core

> v2 daily context map. Full Active / Reference / Historical classification is maintained in [AI CTO System v2 Document Index](./AI_CTO_V2_DOCUMENT_INDEX.md).

## 1. 用途

本文件是 AI CTO System 的日常最小上下文地图。它告诉 Codex 在不同任务中先读什么、不要读什么，避免把历史 Phase、全部 Runtime 文档和无关项目一次性加载。

它不是新的 Module、Phase 或权威决策源；具体使命、Module、项目状态和 Gate 仍以各自权威文件为准。

## 2. 始终有效的入口

1. `skills/ai-cto-system/SKILL.md`：Codex 自动入口、退出、路由和 Host Surface 选择；
2. `SKILL.md`：AI CTO System 全局治理规则；
3. `docs/strategy/AI_CTO_SYSTEM_MANIFESTO.md`：使命、价值和边界；
4. `docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md`：系统总体规划和权威关系；
5. `docs/architecture/MODULE_REGISTRY.md`：当前 Module 与 Layer 事实；
6. `docs/architecture/AI_CTO_CODEX_OPERATING_MODEL.md`：Codex Host Surface 与最小上下文选择；
7. `docs/governance/FINALIZATION_INTEGRITY_STANDARD.md`：最终交付和 Readback 规则。

普通 L0 对话不加载这些文件；Skill 先路由，再按任务选择最小集合。

## 3. 任务 Context Pack

### L0：普通问答

加载当前用户问题即可。不要加载项目 Memory、完整治理文档或历史 Runtime。

### L1：轻量局部任务

加载：当前文件、相关规则、必要 Git 状态。

常见任务：局部 Markdown 修改、简单解释、单文件格式整理、状态查询。

### L2：普通项目开发

加载：目标项目 `PROJECT_STATE.md`、`PROJECT_MEMORY.md`、相关 Requirement / Design / Task / Test、当前 Git 状态。

常见任务：已批准功能、Bug 修复、测试补充、局部重构。

### L3：模块级或跨文档变化

加载：L2 + Architecture、相关 ADR、Change Impact、Review / Evidence、适用 Gate。

常见任务：模块变化、架构调整、跨模块重构、发布准备。

### L4：系统级或跨项目决策

加载：L3 + User Brain、Portfolio、Knowledge、Mission、Module Admission 和系统级 Gate。

常见任务：新项目、系统自身修改、多项目资源决策、Capability 准入、重大演进。

## 4. Project Context 优先级

```text
当前用户指令
  > 当前项目 State / Memory / Approved Task
  > 当前项目 Architecture / ADR / Gate
  > AI CTO System 治理标准
  > 历史 Progress、旧 Phase 文档和参考资料
```

历史文档可以提供背景，但不能覆盖当前项目状态、用户当前指令或有效 Gate。

## 5. 文档分层

### Active Governance

日常可能读取：入口 Skill、Manifesto、Master Plan、Module Registry、Operating Model、相关 Intent / Routing / Design / Development / Testing / Release / Delivery 标准、目标项目 State / Memory。

### Reference Architecture

按任务读取：Runtime、Agent、Capability、MCP、Codex Adapter、Self Evolution、Portfolio 和高级设计文档。它们只有在任务触及对应边界时才加载。

### Historical Evidence

按审计、复盘或 ADR 追溯读取：旧 Phase 规格、Review 报告、Superpowers 计划、历史 Progress、失败记录和已废弃方案。它们不应作为当前默认执行规则。

## 6. Codex Host Surface 选择

| 任务 | Host Surface |
|---|---|
| 单任务局部修改 | 直接工作区 |
| 独立并行子任务 | Subagent / Worktree |
| 外部数据或工具 | MCP / Plugin |
| 多步骤长任务 | Goal / Long-running Work |
| 定期检查 | Scheduled Task + Worktree 优先 |
| 高风险 / 生产任务 | 受控工作区 + Approval + 项目 Gate |

Host Surface 不可用时记录 `NOT_AVAILABLE`，不把设计态 Runtime 或 Mock Capability 冒充为实际执行。

## 7. 每次治理响应的最小输出

```text
Route
Current Stage / State
Current Result
Context Scope
Codex Host Surface
Evidence / Confidence / Limitations
Unique Next Action
Approval Required: YES / NO
```

## 8. Progress Checkpoint Sync

在任务开始、里程碑、阻塞 / 取消 / 失败 / 回滚、完成和合法阶段转换时，按 [Progress Synchronization Standard](../governance/PROGRESS_SYNCHRONIZATION_STANDARD.md) 更新项目状态和进度。不要为每个工具调用写入文档；Project Memory 只保存稳定事实和已验证 Evidence。

## 9. 不应加载的内容

- 与当前任务无关的项目；
- 全量 Knowledge Base；
- 全量 Runtime 文档；
- 未授权的敏感路径和配置；
- 已被当前状态取代的旧 Progress；
- 仅用于历史追溯的 rejected / superseded 方案。

## 10. 成功标准

- 新项目、已有项目、普通功能、Bug、Continuation 和系统级请求都有明确的 Context Pack；
- 用户不需要反复唤醒 AI CTO；
- Codex 执行由 Host 原生能力承担；
- AI CTO 继续负责治理、Evidence、Memory、Gate 和复盘；
- 低风险任务不因文档数量自动升级为完整 CTO Workflow。
