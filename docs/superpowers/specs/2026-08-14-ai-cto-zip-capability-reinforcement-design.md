# AI-CTO System × Codex 跨项目长期技术助手 V4.1 能力补强设计

## 文档状态

- 状态：`DRAFT_FOR_USER_REVIEW`
- 日期：2026-08-14
- 目标项目：AI-CTO System
- 外部候选来源：`Codex跨项目长期技术助手Skills安装包_v4.1(1).zip`
- 当前基线：AI-CTO System `9e786e7282bf1cd009e8146f9dc5671fa5fa6830`
- 设计结论：不做 ZIP 一比一迁移；进行逐项能力评估、选择性补强和 AI-CTO 原生化

## 1. 目标与非目标

### 1.1 目标

以 AI-CTO System 为唯一主体、权威和控制平面，系统性评估 ZIP V4.1 中的工程机制，并将有长期价值的部分补强到现有 AI-CTO Module：

1. 提高任务路由和上下文加载的准确性；
2. 提高任务执行的确定性、可恢复性和停止边界；
3. 提高 Evidence、验证和复审的可追溯性；
4. 提高跨会话、跨项目任务的恢复能力；
5. 在真实项目中用可比较 Evidence 判断补强是否产生收益；
6. 避免复制权威、重复状态、流程膨胀和未经证明的自动化。

### 1.2 非目标

- 不把 ZIP 目录、9 个 Skills、脚本或模板整体复制到 AI-CTO；
- 不创建 ZIP 专属 Layer、Phase 或平行生命周期；
- 不让 ZIP 的 `AGENTS.md` 成为 AI-CTO 第二权威；
- 不因为 ZIP 声明了 `read-only` 就授予系统级权限隔离；
- 不自动安装外部 Skill、Provider、MCP、模型或工具；
- 不在本设计阶段接入真实 Codex、网络、生产项目或持久化服务；
- 不把 ZIP 自述的验证报告当作真实 Codex 客户端或生产 Evidence；
- 不因模板数量、Reviewer 数量或规则数量增加而宣称能力增强。

## 2. 设计原则

本设计遵循 AI-CTO 既有 [架构原则](../../strategy/AI_CTO_ARCHITECTURE_PRINCIPLES.md)、[模块准入标准](../../strategy/MODULE_ADMISSION_CRITERIA.md)、[需求归类规则](../../architecture/FEATURE_CLASSIFICATION_RULES.md) 和 [Capability Governance](../../capability/CAPABILITY_GOVERNANCE_STANDARD.md)：

1. **先证明价值，再决定归属。** 有 Layer 位置不等于应该进入系统。
2. **优先扩展已有 Module。** 默认结论为 `USE_EXISTING_MODULE` 或 `EXTEND_EXISTING_MODULE`，不因候选来源不同创建新 Module。
3. **按机制提炼，不按文件迁移。** 吸收可验证的合同、边界、字段和策略；删除重复术语、空模板和来源专属实现。
4. **统一权威。** Project Lifecycle、Gate、Permission、Evidence、Audit、Project Memory 和 Knowledge 只能由 AI-CTO 现有权威负责。
5. **独立推理不等于权限隔离。** Reviewer 的运行时隔离必须以实际证据为准。
6. **按风险和证据选择最小充分流程。** 不把高风险流程机械施加到低风险任务。
7. **能力可退出。** 每项补强都必须有 Owner、版本、验证、禁用和回滚路径。

## 3. 证据基线与限制

### 3.1 当前证据

| Evidence ID | 来源 | 已观察内容 | 可信度 | 限制 |
|---|---|---|---|---|
| `ZIP-E-001` | ZIP `README.md` / `manifest.json` | 9 个 Skills、执行档位、任务信封、Evidence Fingerprint、Reviewer Packet、长期记忆、安装管理等设计声明 | `L2` | 候选来源自述，不能证明真实效果 |
| `ZIP-E-002` | ZIP `docs/VALIDATION_REPORT.md` | 包结构、脚本、单元测试、安装恢复和语义校验在 Linux 容器中通过的报告 | `L2` | 不是本次独立复跑；Windows、真实 Codex 客户端和真实多 Agent 未验证 |
| `ZIP-E-003` | 本次 ZIP 只读解压与源码检查 | 125 个 Skill/模板文件、18 个脚本、8 个自定义 Agent；审查了 Reviewer、执行信封、记忆模板和全局规则 | `L3` | 静态检查，不代表运行质量 |
| `AICTO-E-001` | AI-CTO `npm.cmd test` | AI-CTO 当前 165 / 165 本地测试通过 | `L3` | 证明当前合同和边界，不证明 ZIP 补强收益 |
| `ZIP-E-004` | ZIP 包内 Windows 校验尝试 | 中文路径导致 Python/PowerShell 校验 harness 出现编码或路径处理异常 | `L2` | 不能直接归因于核心能力缺陷；需用 ASCII 临时路径重新验证 |

### 3.2 未知项

- ZIP Skill 在真实 Codex 新对话中的实际激活准确率；
- 子 Agent 的真实运行时权限隔离；
- Reviewer 并发带来的质量收益、Token 成本和延迟；
- Checkpoint 对跨会话恢复成功率的实际提升；
- 领域 Skill 对不同项目类型的长期维护成本；
- 任何 ZIP 能力接入 AI-CTO 后的真实项目收益。

因此，本设计中的能力结论均为候选处理建议，不替代后续 Capability Evaluation 和真实 Pilot。

### 3.3 历史吸收基线

历史记录表明，AI-CTO 已经吸收了 ZIP V4.1 中若干关键思想；但这些吸收主要是围绕 AI-CTO 自身问题逐步完成的，不是对 ZIP 全包进行过一次逐项准入迁移。当前应把候选能力分为“已吸收”“部分吸收”“尚未吸收”和“明确不直接吸收”，避免重复建设。

| ZIP 机制 | AI-CTO 当前状态 | 证据 | 本次是否作为新能力 |
|---|---|---|---|
| `LIGHT / STANDARD / STRICT` 与风险升级 | 已吸收为 `L0–L4`、`R0–R4`、Execution Profile 和风险升级 | `docs/superpowers/specs/2026-08-06-execution-profile-evidence-freshness-design.md`、`runtime/routing/` | 否；只评估合同边界和实际使用反馈补强 |
| Evidence Fingerprint / Freshness | 已有确定性只读比较器，支持 `CURRENT / STALE / NOT_CAPTURED` | `runtime/routing/evidence-freshness-service.ts`、ER 测试 | 部分；评估是否扩展到 Review、Validation 和 Task Envelope |
| Progressive Context / Route-first | 已吸收 `L0–L4`、最小充分流程、渐进 Context 和 `L1` 防流程膨胀 | `skills/ai-cto-system/SKILL.md`、2026-08-06 Skill Routing Preflight | 否；只评估与 ZIP 领域 Skill 的路由衔接 |
| Approval、Permission、Budget、Audit | 已有 Runtime Foundation、Planner-first、Guard、Workflow、Task 和 Audit | `runtime/services/`、`runtime/permission/`、165/165 回归 | 否；不重复建立执行控制平面 |
| Controlled Handoff | 已有 Intent → Router → Workflow / Task → `WAITING_APPROVAL` 的内部链路 | `runtime/integration/controlled-runtime-handoff-service.ts`、IH 测试 | 否；只评估与任务信封、Review Profile 的连接 |
| Capability Governance | 已有 Admission、Registry、Evaluation、Activation 的治理标准 | `docs/capability/CAPABILITY_GOVERNANCE_STANDARD.md` | 否；ZIP Skills 作为候选 Capability 逐项评估 |
| Code Review / Security Review / Testing | 已有工程 Review、Security、Testing 和 Gate 标准 | `docs/development/CODE_REVIEW_STANDARD.md`、`docs/testing/` | 部分；评估 ZIP 的 Review Packet、预算、隔离和结构化归并是否能补强 |
| Agent 独立上下文与结构化复审 | 已有 Agent Contract 和 Planner，但没有 ZIP 级 Reviewer Packet / Controller | `runtime/agent/`、`runtime/services/single-agent-runtime-service.ts` | 是，作为部分补强候选 |
| Task Execution Envelope | 已有 Workflow / Task / Execution Context 字段，但没有统一的跨阶段任务信封 | `runtime/models/runtime-types.ts`、`runtime/workflow/` | 是，作为合同补强候选 |
| Checkpoint / Handoff / Recovery | 有 Project Memory 和 Memory Management，但没有 ZIP 级任务节点 Checkpoint 体系 | `memory/project_memory/`、`docs/protocol/MEMORY_MANAGEMENT.md` | 是，作为 Project Memory 补强候选 |
| 9 个领域 Skills | AI-CTO 只有仓库权威的 AI CTO Skill Gateway，没有 ZIP 的 9 个领域 Skill | `skills/ai-cto-system/`、Module Registry | 是，逐项 Conditional Admission，不整体接纳 |
| ZIP 安装器、Doctor、模板集合 | AI-CTO 有自己的 Skill Gateway 安装器、治理模板和权威文档 | `scripts/install-ai-cto-skill.ps1`、`templates/` | 否；只提取可复用字段和诊断思想 |

因此，历史判断不是“当时完全没注意”，也不是“ZIP 已经全部融入”：

- **已经吸收的部分**：主要是 ZIP 的问题抽象，例如轻重路由、渐进 Context、Evidence Freshness、人工确认和受控 Runtime。
- **尚未完整吸收的部分**：主要是 ZIP 的执行运营化机制，例如任务信封、Review Packet / Controller、任务级 Checkpoint 和领域 Skill 能力化。
- **当时刻意没有吸收的部分**：ZIP 的全局规则、安装包结构、固定 Reviewer 数量、模板全集和未经真实客户端验证的权限 / 自动化假设。

本次工作因此不是从零吸收 ZIP，而是对“已有吸收是否完整、哪些只停留在思想层、哪些值得形成 AI-CTO 原生合同”进行补强审计。

## 4. 能力评估模型

每项候选能力使用 0–3 分进行内部比较，不把总分直接当作准入授权：

| 维度 | 0 分 | 1 分 | 2 分 | 3 分 |
|---|---|---|---|---|
| Mission Fit | 无直接关系 | 仅邻近收益 | 对工程转化有明确帮助 | 对长期交付、维护或组织复利有直接证据 |
| Problem Evidence | 只有设想 | 静态设计或单案例 | 多个可复核案例 | 多个真实、可比较结果 |
| Reuse / Gap | 与现有能力重复 | 边界不清 | 明确补足缺口 | 可跨项目复用且不复制权威 |
| Safety / Control Fit | 绕过权限或 Gate | 需要大量改造 | 可在现有边界内控制 | 天然支持最小权限、审计和回滚 |
| Asset Value | 一次性输出 | 低复用模板 | 可复用合同或方法 | 可持续沉淀为 Evidence / Knowledge / Technical Asset |
| Complexity Efficiency | 复杂度远高于收益 | 收益不明确 | 成本可接受 | 明显降低返工、风险或维护成本 |
| Exit / Reversibility | 难以拆除 | 有迁移负担 | 可禁用或替换 | 可独立版本化、回滚和退出 |

准入不会用简单总分替代门禁。以下任一情况会阻止直接 `ADOPT`：安全或权限边界不清、与 AI-CTO 权威重复、关键效果只有自述、不可回滚、持续成本无法解释，或必须依赖未经批准的外部执行。

## 5. ZIP 候选能力逐项处理建议

以下是基于当前证据的**初步 disposition**，不是最终 Activation Approval。

### 5.1 横向执行机制

| 候选 | ZIP 内容 | AI-CTO 归属 | 初步结论 | 处理理由与补强方向 |
|---|---|---|---|---|
| Execution Profile | `LIGHT / STANDARD / STRICT` | Layer 5 `Execution Routing Governance` | `ADAPT` | 价值与 AI-CTO L0–L4 / R0–R4 相容；提炼为风险、可逆性、证据和成本约束，不复制第二套路由档位 |
| Execution Phase | `IDENTIFY → PLAN → IMPLEMENT → VALIDATE → REVIEW → DELIVER` | Layer 5 Runtime + Layer 3/4 Gate | `ADAPT` | 作为 Task-level phase；不能替代 Project Lifecycle；需要与 Workflow 状态、Gate 和授权绑定 |
| Task Execution Envelope | 目标、非目标、权限、范围、停止、回滚、验收和 Evidence 字段 | Layer 5 Runtime / Task | `ADAPT` | 直接补足当前 Runtime 任务合同；需采用 AI-CTO Permission、Budget、Evidence 和 Audit 类型 |
| Evidence Fingerprint | Git / Diff 指纹、变更后 stale | Layer 1 Evidence + Layer 5 Audit | `ADAPT` | 是强补强候选；需定义与当前 Evidence 的版本、Scope、Freshness 和失效原因映射 |
| Progressive Context | Reference 分片和延迟加载 | Layer 1 Context + Layer 5 Intent Gateway | `ADAPT` | 与 AI-CTO Route-first 原则一致；需由当前任务、Gate 和 Evidence 决定加载范围，不使用固定 Skill 数量硬限制 |
| Checkpoint / Handoff | 当前任务、Progress、Decision、Recovery、Handoff | Layer 1 Project Memory | `ADAPT` | 强化跨会话恢复；必须避免创建第二个项目事实源，外部记忆与仓库 Memory 的边界要明确 |

### 5.2 Review 与多 Agent 机制

| 候选 | ZIP 内容 | AI-CTO 归属 | 初步结论 | 处理理由与补强方向 |
|---|---|---|---|---|
| Reviewer Profiles | 7 类专业职责 | Layer 3 Review / Layer 5 Agent Runtime | `ADAPT` | 职责分工可取；保留为可组合 Profile，不固定为每次都启动 7 个 Agent |
| Risk-based Reviewer Budget | 按低/中/高/关键风险选择 1–6 个 Reviewer | Layer 5 Execution Routing + Review Gate | `ADAPT` | 吸收预算和最小充分原则；参数必须由 AI-CTO 风险模型、Token、时延和任务证据共同决定 |
| Review Packet | 变更文件、关联文件、验证 Evidence、约束、Diff SHA | Layer 1 Evidence / Layer 3 Review | `ADAPT` | 可作为 Review 的冻结输入包；与 AI-CTO Traceability 和 Audit 绑定 |
| Review Controller | 轮次、深度、并行数、修复轮次和状态台账 | Layer 5 Runtime | `ADAPT` | 状态控制思想有价值；优先实现最小状态合同，不直接引入 ZIP 专属 JSON 控制器 |
| Structured Review Result | 问题、证据、严重等级、根因、验证和未验证项 | Layer 3 Review / Layer 1 Evidence | `ADOPT`（字段级） | 与 AI-CTO Evidence-first 直接一致；统一到现有 Review / Audit 输出，不复制 Markdown 模板体系 |
| Isolation Evidence | system-readonly / logical-readonly / self-review / unknown | Layer 5 Permission / Agent Runtime | `ADAPT` | 对 AI-CTO 安全边界有直接价值；Level A 资格必须由平台运行时 Evidence 证明 |
| Independent Context | 子 Agent 最小任务包和结构化摘要 | Layer 5 Agent Runtime | `ADAPT` | 可降低主上下文噪声；不自动视为权限隔离，不允许 Reviewer 自行派生或改写共享 Memory |
| Mechanical stop limits | 最大深度、轮次、并行数和总量 | Layer 5 Guard | `ADAPT` | 防止循环和成本失控；作为默认上限与任务级覆盖，而不是不可调整的全局数字 |

### 5.3 领域 Skills

| Skill | 主要价值 | AI-CTO 归属 | 初步结论 |
|---|---|---|---|
| Java Backend | Java / Spring / JVM / 事务 / 并发 / 测试与部署检查 | Layer 5 `Capability Governance` | Admission：`CONDITIONAL_ADMISSION`；集成：`ADAPT` |
| Python Backend & AI | Python Web、异步、任务、模型调用、RAG、GPU | Layer 5 `Capability Governance` | Admission：`CONDITIONAL_ADMISSION`；集成：`ADAPT` |
| Frontend Engineering | 多框架识别、客户端/服务端边界、状态、安全、性能和验证矩阵 | Layer 5 `Capability Governance` | Admission：`CONDITIONAL_ADMISSION`；集成：`ADAPT` |
| Data / Middleware / AI Infrastructure | 数据库、Redis、MQ、搜索、向量、GPU、容器和基础设施 | Layer 5 `Capability Governance` | Admission：`CONDITIONAL_ADMISSION`；集成：`ADAPT` |
| Log / Observability | 日志、Metrics、Trace、Profile、告警和变更事件关联 | Layer 5 `Capability Governance` | Admission：`CONDITIONAL_ADMISSION`；集成：`ADAPT` |
| Engineering Quality & Delivery | 修改、测试、Git、部署、回滚、生产操作的阶段化控制 | Layer 3 `Development` | Admission：`ADMIT_FOR_CLASSIFICATION` 候选；分类：`EXTEND_EXISTING_MODULE` |
| Technical Document Writing | 方案、架构、数据库、部署、Incident、进度和报告 | Layer 3 `Documentation` | Admission：`ADMIT_FOR_CLASSIFICATION` 候选；分类：`EXTEND_EXISTING_MODULE` |
| Long-running Task Memory | Checkpoint、恢复、交接和长期任务状态 | Layer 1 `Project Memory` | Admission：`ADMIT_FOR_CLASSIFICATION` 候选；分类：`EXTEND_EXISTING_MODULE` |
| Multi-agent Independent Review | Reviewer 组合、审查包、隔离和归并 | Layer 3 `Code Review` | Admission：`ADMIT_FOR_CLASSIFICATION` 候选；分类：`EXTEND_EXISTING_MODULE` |

领域 Skill 不会因为“内容全面”就直接进入 `ACTIVE`。每个 Skill 必须在真实任务类型、适用技术栈、证据质量、维护 Owner、输入输出和权限边界明确后单独评估。

### 5.4 安装、脚本和模板

| 候选 | ZIP 内容 | 初步结论 | 处理方式 |
|---|---|---|---|
| Package Manager | 用户级 / 仓库级安装、升级、卸载、备份和恢复 | `REFERENCE_ONLY` / `DEFER` | 提取安全和回滚要求；不直接改变 AI-CTO 全局安装模型 |
| Doctor / Verify | 安装检查、重复路径、语义校验和完整性检查 | `ADAPT` | 可补强 Skill Gateway 的诊断，但须使用 AI-CTO 的 canonical source 和权限边界 |
| Global `AGENTS.md` | 全局身份、规则优先级和 Skill 路由 | `REFERENCE_ONLY` | 不建立第二个最高权威；仅提取不冲突的工程硬约束 |
| Task Envelope Template | YAML 任务字段 | `ADAPT` | 抽取字段并转为 AI-CTO Runtime Contract |
| Review Templates | Review Plan / Result / Ledger / Isolation | `ADAPT` | 抽取字段，统一至现有 Review / Evidence / Audit |
| Memory Templates | Progress / Checkpoint / Handoff / Recovery | `ADAPT` | 作为 Project Memory 的视图和恢复接口，不新增 Memory 权威 |
| Technical Templates | API、架构、数据库、部署、Incident、选型等 | `ADAPT` / `REFERENCE_ONLY` | 与现有模板逐项比对，只有缺失字段进入原模板；重复模板不新增 |
| Observability Templates | 日志台账、时间线、Metrics、Trace、关联 | `ADAPT` | 补强现有 Monitoring / Incident Evidence；先支持只读分析 |
| Framework Detectors / Scripts | 前端技术栈检测、执行 Guard、Review Packet 工具 | `REFERENCE_ONLY` / `ADAPT` | 先验证跨平台、路径、输出和维护成本；不直接当作 Runtime 权威 |

## 6. 目标 AI-CTO 原生模型

### 6.1 统一合同

补强后的 AI-CTO 不暴露 ZIP 原始文件结构，而提供以下稳定合同：

```text
AI-CTO Intent
  → Execution Profile Decision
  → Task Envelope
  → Workflow / Agent Task
  → Selected Capability / Review Profile
  → Evidence + Freshness
  → Audit + Project Memory Checkpoint
  → Gate / Human Decision
```

### 6.2 归属原则

| 能力 | Owning Layer | 主要 Owner Module |
|---|---|---|
| Execution Profile / Context Policy | Layer 5 | Execution Routing Governance |
| Task Envelope / Stop / Rollback | Layer 5 | AI CTO Runtime Architecture |
| Evidence Fingerprint / Freshness | Layer 5 | Execution Routing Governance（Runtime 消费；Evidence 结果回写 Layer 1） |
| Review Profile / Packet / Result | Layer 3 | Code Review（Runtime 负责受控调度） |
| Checkpoint / Handoff | Layer 1 | Project Memory |
| Domain Skills | Layer 5 | Capability Governance |
| Log Evidence | Layer 4 | Monitoring / Incident（能力由 Layer 5 Capability Governance 管理） |

不得让一个候选能力同时拥有多个 Owning Layer。跨层服务通过版本化输入输出合同连接。

## 7. 风险、反模式和停止条件

### 7.1 需要避免的反模式

- 将 ZIP 的文件数量、Skill 数量或测试数量当作 AI-CTO 能力成熟度；
- 用 Reviewer 数量代替审查质量；
- 用模板填写完成代替 Evidence；
- 用独立上下文描述代替系统权限隔离；
- 用固定上下文 / Token 数字阻止必要信息加载；
- 将 ZIP Memory 文件与 AI-CTO Project Memory 并列为事实源；
- 将候选 Skill 的 `ACTIVE` 状态误解为全项目、全环境可调用；
- 因一次成功任务把候选机制升级为通用默认规则。

### 7.2 停止条件

出现以下任一情况时，停止对应能力的实现并保持 `CONDITIONAL_ADMISSION`、`REFERENCE_ONLY` 或 `DEFER`：

- 真实任务无法证明价值或收益无法比较；
- 复杂度、Token、时延或维护成本持续高于收益；
- 与现有 AI-CTO 权威或状态产生冲突；
- 无法建立最小权限、审计、回滚或退出路径；
- 平台运行时无法证明要求的隔离边界；
- 领域规则过度绑定单一技术栈或单一用户偏好；
- 必须引入未经准入的外部工具、网络、模型或生产写权限。

## 8. 分阶段实施边界

本设计不授权直接编码。后续计划应分为：

### Phase A：评估与合同

- 完成逐项 Admission Record 和 Feature Classification Record；
- 只扩展现有 Module 的合同和字段；
- 建立最小测试矩阵和证据字段；
- 不接入 ZIP 原始运行脚本或真实外部能力。

### Phase B：横向补强 MVP

优先验证：

1. Task Envelope；
2. Evidence Fingerprint / Freshness；
3. Review Profile / Structured Result；
4. Checkpoint / Handoff；
5. Progressive Context Policy。

### Phase C：真实任务 Pilot

- 选择低风险、可回滚任务；
- 比较启用和未启用补强时的耗时、Token、人工修改、失败、质量和安全结果；
- 至少形成多个同类 Evidence 后再建议修改默认路由或 Review 预算。

### Phase D：选择性领域能力

- 按实际项目需要评估 Java、Python、前端、数据、可观测性和文档能力；
- 逐项完成 Capability Registry、Evaluation 和受限 Activation；
- 任何领域 Skill 都不得因进入包内就获得生产授权。

## 9. 验收标准

设计与后续实现必须证明：

1. AI-CTO 仍是唯一控制平面和权威来源；
2. 没有新增重复的 Project Lifecycle、Gate、Memory 或 Evidence 权威；
3. 每项吸收能力有明确 Owner、输入、输出、权限、版本、失败和退出路径；
4. 低风险任务不会机械触发高成本 Reviewer 编排；
5. 证据随基线或差异变化正确标记 stale；
6. Reviewer 结果可结构化归并且不允许自动无限循环；
7. Checkpoint 能支持恢复，但不会写入未经验证的项目事实；
8. 未验证的客户端隔离、真实 Skill 路由和真实生产效果如实保持 `UNKNOWN` / `NOT_CAPTURED`；
9. 当前 AI-CTO 全量回归测试继续通过；
10. 真实 Pilot 产生的收益与成本证据足以支持下一次 Admission / Evolution 决策。

## 10. 当前请求的下一步

1. 用户审阅本设计规格；
2. 用户确认需要调整的候选处理结论；
3. 通过后创建实现计划，不直接进入全量 ZIP 迁移；
4. 实现计划继续按 AI-CTO 的 Design / Development / Testing Gate 执行。
