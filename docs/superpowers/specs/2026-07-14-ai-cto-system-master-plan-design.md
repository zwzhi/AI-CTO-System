# AI CTO System Master Architecture Sync Design

## 1. 目标

创建 `docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md`，作为 AI CTO System 最高级总体规划、当前架构快照和后续开发入口。它统一使命、五层架构、已完成能力、当前路线、未来规划、Module 扩展、新需求分类、禁止事项和核心 ADR，防止后续局部模块优化偏离整体方向。

本次只执行文档同步，不新增功能、Module、Layer、Agent、自动化或生命周期状态，不进入 Phase 8.4。

## 2. 权威关系

Master Plan 是最高级总体规划与开发入口，但不是对所有历史和授权记录的覆盖层：

```text
Manifesto
└── 定义系统为什么存在、核心价值和不可越过的边界

Accepted ADR
└── 保存重大决策当时的背景、选择与后果，Master Plan 不改写其历史

Master Plan
└── 统一当前架构、能力现状、开发路线和扩展入口

Module Registry / Project Memory / Progress
└── 分别保存当前 Module 事实、项目连续性和交付状态

Lifecycle Standards / Gates
└── 控制具体项目和变更的执行授权
```

发生冲突时：使命与边界以 Manifesto 为准；历史决策以对应 ADR 为准；当前总体规划和路线以 Master Plan 为准；当前 Module 状态以 Module Registry 为准；具体阶段转换以适用 Gate 为准。发现不一致必须停止推进并同步源文档，禁止选择性引用。

## 3. Master Plan 结构

Master Plan 包含十个用户指定章节：

1. 系统使命：引用 Manifesto，保留使命、边界与人类最终决策。
2. 五层架构模型：提供总体图和 Layer 间数据流。
3. Layer 职责：为每层列出职责、权威对象、主要输入输出和禁止越权事项。
4. 当前已完成能力：按 Layer 汇总已完成的文档治理能力，区分“治理完成”与“运行时已实现”。
5. 当前开发路线：标记 Master Architecture Sync 为当前工作，Phase 8.4 未启动。
6. 未来 Phase 规划：Phase 仅作历史交付与候选路线标签；未来候选必须先通过 Mission Alignment、Module Admission 和 Feature Classification。
7. Module 扩展规则：优先复用、其次扩展、再创建既有 Layer 内 Module，最后才提议新 Layer。
8. 新需求分类流程：提供从请求到 Admission、Layer / Module 分类、ADR / Registry / Gate 的完整流程和固定结果。
9. 架构禁止事项：禁止路线驱动架构、重复权威、越层授权、绕过 Gate、用评分抵消红线、直接激活 Capability / Knowledge 等。
10. 核心 ADR 索引：索引 ADR-0001 至 ADR-0012，按主题说明当前影响。

Master Plan 只保存总体结论和链接。评分细则、生命周期状态定义、模板字段和具体 Gate 继续由现有专业文档负责，避免复制后产生漂移。

## 4. 同步范围

### README.md

在战略与治理入口最前方加入 Master Plan，并在当前状态中说明后续开发必须先读取它。

### SKILL.md

在系统使命入口和 Strategic Alignment 规则中要求先读 Master Plan；增加 Master Plan 约束：所有系统级需求先核对使命、Layer、Module、路线和 ADR，不得直接依据未来 Phase 名称实施。

### MODULE_REGISTRY.md

在使用规则中引用 Master Plan，并说明 Registry 是 Master Plan 的当前 Module 事实投影；新增或变更 Module 必须同步两者，但不得创建一个名为 Master Plan 的业务 Module。

### PROJECT_MEMORY

记录 Master Plan 的权威关系、Master Architecture Sync 历史、当前完成状态和“等待确认、不进入 Phase 8.4”的下一步。

### DEVELOPMENT_PROGRESS

根据根 AGENTS 规则同步本阶段状态、验证结果、风险和下一步。用户未明确列出该文件，但所有修改必须更新开发进度。

## 5. 当前能力口径

“Completed”仅表示治理协议、标准、模板或 Registry 已建立，不表示存在自动执行：

- Layer 1：Identity、User Brain、Project Memory、Knowledge Governance 和 Pilot。
- Layer 2：Idea、Research、Evaluation、Portfolio、Priority、Investment。
- Layer 3：Product / Architecture / Database / Agent Design、Task、Git、TDD、Review、Traceability。
- Layer 4：Testing、Security、Release、Deployment、Monitoring、Onboarding、Maintenance、Incident、Evolution。
- Layer 5：Capability Governance 文档已完成；Intent Gateway、Agent Runtime、Codex Integration、Automation 等运行时仍为 `Planned`。

## 6. 路线表达

当前路线分为：

- 已完成治理基线：Phase 1–8.3、Architecture Review、Strategic Alignment、Knowledge Governance Pilot。
- 当前同步工作：Master Architecture Sync。
- 未启动候选：Phase 8.4 及后续任何能力。

未来 Phase 名称不构成 Module Admission、设计或开发授权。路线候选只能输出 `PROPOSED / UNDER_REVIEW / APPROVED_FOR_DESIGN / DEFERRED` 等规划结论，且不得冒充 Lifecycle State；具体状态词汇在 Master Plan 中明确为路线元数据，不写入 Module Registry 或项目生命周期。

## 7. 验证

- Master Plan 十个章节全部存在。
- 五个 Layer 的职责、主要能力和越权边界完整。
- ADR-0001 至 ADR-0012 全部可访问且索引无缺失。
- README、SKILL、Module Registry、Project Memory、Progress 均引用 Master Plan。
- Master Plan 中的 Module 状态与 Registry 一致。
- Phase 8.4 明确为未启动，不出现功能、Agent 或自动化实现。
- 全仓相对 Markdown 链接、根 SKILL、占位符和 Git diff 检查通过。
