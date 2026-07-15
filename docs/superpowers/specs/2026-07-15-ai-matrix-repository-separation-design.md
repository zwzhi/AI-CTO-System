# AI Matrix 独立仓库拆分设计

- 日期：2026-07-15
- 状态：Approved
- 决策：方案 A——保留 Git 历史的独立仓库拆分
- 源仓库：`D:\AI Project\AI-CTO-System`
- 目标仓库：`D:\AI Project\AI-Matrix`

## 1. 目标

AI Matrix 是使用 AI CTO System 进行开发治理的独立业务产品，不是 AI CTO System 源码仓库中的子项目。本次拆分将 AI Matrix 的代码、测试、业务资料、产品文档和项目治理资产迁移到独立 Git 仓库，同时保留可追溯历史，并解除对 AI CTO System 源码目录的相对路径依赖。

## 2. 边界

### AI Matrix 独立仓库拥有

- 产品源代码、测试、数据库迁移和依赖锁文件；
- Application Strategy、Pilot、MVP、完整产品和 Product Foundation 设计；
- AI Matrix 专属 ADR、Knowledge 候选、来源笔记、Pilot Task Registry；
- 独立 `AGENTS.md`、`PROJECT_MEMORY.md`、`DEVELOPMENT_PROGRESS.md`；
- 应用侧 AI CTO Contract / Port 以及本地适配器。

### AI CTO System 仓库保留

- AI CTO System 自身 Core、Runtime、Capability、Audit、Evidence 和治理实现；
- ADR-0031 以及一条“AI Matrix 是外部受治理项目”的组合治理记录；
- 必要的历史事实，但不保留 AI Matrix 产品源码、业务 Knowledge、Pilot 数据或产品实现文档。

## 3. Git 历史策略

使用 `git subtree split --prefix=projects/ai-matrix` 从当前已验证分支提取项目目录历史，在 `D:\AI Project\AI-Matrix` 建立独立仓库并将提取历史设为 `main`。随后迁入原来位于源仓库 `docs/` 下的 AI Matrix 专属设计、ADR 和实施计划，形成一次可审计的迁移基线提交。

不重写 AI CTO System 既有提交，不强制删除历史对象。源仓库只在当前功能分支追加“移出业务项目”提交。

## 4. 依赖解耦

独立仓库禁止出现指向 `AI-CTO-System/runtime` 的相对导入。现有依赖按以下方式处理：

1. 在 AI Matrix 内建立最小、Provider-neutral 的 AI CTO Contract，包括 Runtime 基础类型、Audit Repository Port、Audit Service 和 Permission / Budget Guard 合同；
2. 业务代码只依赖这些应用侧合同；
3. SQLite Audit Adapter 实现应用侧 Audit Port；
4. 将来如 AI CTO System 发布正式 SDK / Package，再通过 Adapter 替换本地合同实现，不改变 AI Matrix 领域模型；
5. 不复制 AI CTO Core、Workflow Engine、Agent Runtime、Module Registry 或 Self Evolution 实现。

## 5. 源仓库清理

从 AI CTO System 当前功能分支移除：

- `projects/ai-matrix/`；
- `docs/applications/AI_MATRIX_*.md`；
- ADR-0026～ADR-0030；
- AI Matrix 专属实施计划。

AI CTO System 的全局进度和项目记忆改为引用外部仓库路径，并明确其职责仅为开发治理。ADR-0031 留在源仓库，作为边界变更的权威记录。

## 6. 验证

迁移完成必须同时满足：

- 新仓库存在独立 `.git`，默认分支为 `main`，没有指向源仓库的 Git remote；
- 新仓库 `rg` 扫描不存在 `../../../runtime`、`../../../../runtime` 或 AI CTO 源码路径依赖；
- AI Matrix 全部测试通过，SQLite 重启持久化和 Audit 原子事务保持有效；
- AI CTO System 根测试 126 / 126 通过；
- AI CTO System 当前文件树不再包含 AI Matrix 产品源码和业务资料；
- 两个仓库工作树均干净，项目记忆和开发进度与实际状态一致。

## 7. 回滚

在新仓库测试全部通过并提交之前，不提交源仓库删除操作。若依赖解耦失败，保留源仓库当前分支和 subtree split 引用，新仓库可删除重建；不得通过 `reset --hard`、历史强推或删除源提交进行回滚。

## 8. 非目标

- 不开发新的产品功能；
- 不接入模型、Provider、RAG、外部工具或多 Agent；
- 不修改 AI CTO Core；
- 不创建新的 Phase 或 Module；
- 不配置公网远程仓库或执行推送。
