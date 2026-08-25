# AI CTO System v2 Codex-Native Simplification Design

## 1. Version定位

v2 不是重写 AI CTO System，也不是删除 v1 历史；它是同一仓库的 Codex-native Operating Version：用一个精简的 Active Core 作为日常入口，把详细标准、Runtime MVP、ADR、Review 和旧 Phase 文档留在可追溯的 Reference / Historical 层。

## 2. v2 核心产品

```text
AI CTO Active Core
  Mission + Route + Context Pack + Project State / Memory
  Design / Development / Testing / Release / Finalization
                         ↓
Codex Host
  Model + Files + Shell + Subagents + Skills + MCP + Plugins
  Worktree + Goal + Scheduled Task + Host Approval
```

v2 只需要让 Codex 在正确项目、正确范围和正确 Gate 下工作，不需要在 AI CTO Core 中复制执行层。

## 3. v2 Active Core

日常默认读取：

1. `skills/ai-cto-system/SKILL.md`；
2. `SKILL.md` 精简治理摘要；
3. `docs/architecture/AI_CTO_ACTIVE_OPERATING_CORE.md`；
4. `docs/architecture/AI_CTO_CODEX_OPERATING_MODEL.md`；
5. `docs/strategy/AI_CTO_SYSTEM_MANIFESTO.md`；
6. `docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md`；
7. 当前项目 `PROJECT_STATE.md` / `PROJECT_MEMORY.md`；
8. 当前任务相关的标准、ADR、Gate 和 Evidence。

不再默认加载全量 Runtime、Capability、历史 Phase 或 Superpowers 文档。

## 4. 文档分层

### Active

入口 Skill、Active Operating Core、Codex Operating Model、Manifesto、Master Plan、Module Registry、Project State / Memory 和当前任务标准。

### Reference

Runtime、Agent、Capability、MCP、Self Evolution、Portfolio、Review、Delivery 和未来扩展架构；按任务需要加载。

### Historical

旧 Phase 规格、实现计划、Review 报告、ADR 历史、Execution Case 和已完成迁移记录；只用于追溯和 Evidence。

物理文件不删除，避免破坏链接、Git 历史和审计证据。

## 5. v2 功能优先级

### P0：日常必须稳定

- 新项目 Idea → Design 入口；
- 已有项目 Onboarding；
- 项目 State / Memory 续接；
- L0–L4 路由和最小 Context；
- Codex Host Surface 选择；
- Design / Development / Testing / Release Gate；
- Finalization、Evidence、Audit 和 Next Action。

### P1：真实项目复利

- Knowledge 提取与复用；
- Portfolio / 技术资产复用；
- Execution Feedback；
- Self Evolution Proposal；
- Fresh Session Pilot 和跨项目反馈。

### P2：未来可选

- 自动模型切换；
- 更强的 Codex Host Adapter；
- RAG / 向量检索；
- 生产监控和自动部署编排；
- 脱离 Codex Host 的独立 Runtime。

## 6. v2 禁止事项

- 删除 v1 历史文档或重写 ADR 历史；
- 因“新版本”创建新 Phase / Layer / Module；
- 在 AI CTO Core 中复制 Codex Subagents、MCP、Plugins、模型客户端或部署系统；
- 默认自动切换模型、删除模块、修改核心治理、发布生产或无人监督开发；
- 将 Codex Host 权限解释为 AI CTO 的项目授权。

## 7. v2 验收标准

- 新项目、已有项目、Continuation、Feature、Bug 和退出治理都有一条 Active Core 路径；
- 根 `SKILL.md` 只保留治理摘要，详细规则在标准文件中按路由加载；
- README、Master Plan、Module Registry、Project Memory 和 Progress 对 v2 定位一致；
- 212 项现有回归测试继续通过；
- Runtime / Package / Provider / MCP / Permission / Gate 行为未改变；
- v1 基线可通过 Git Tag 恢复。
