# AI-CTO Auto-Intervention and Project Continuation Design

## 1. Goal

让 Codex 在用户自然提出想法、需求、项目进展或技术问题时，自动识别是否应进入 AI-CTO System，并在同一项目的后续对话中持续接续当前生命周期、项目状态和下一步动作；用户不需要每次显式输入 `$ai-cto-system` 或“启动 AI CTO”。

本设计只解决“当前 Codex 对话中的自动介入与项目接续”，不建设后台监控服务，不把 AI-CTO 变成无条件自动执行 Agent。

## 2. User Intent and Confirmed Boundary

用户确认的目标是第一种自动介入：

- Codex 收到用户消息后自动判断是否属于 AI-CTO 范围；
- 对属于 AI-CTO 的请求，自动选择最小充分路由和相关权威上下文；
- 能识别新想法、已有项目、需求、Bug、架构、测试、交付、维护和项目续接；
- 在同一项目后续对话中继续当前阶段，而不是每次重新开始；
- 只有在证据不足或真实决策不可替代时询问用户；
- 保留现有 Permission、Budget、Approval、Gate、Evidence、Audit 和人工控制边界。

明确不包括：

- 用户没有发消息时的后台扫描、定时任务、主动通知或自动催办；
- 无条件把普通聊天、闲聊、泛知识问答升级为 AI-CTO 项目；
- 直接调用外部模型、MCP、Provider、工具或生产环境；
- 自动修改权威治理文档、自动提交、自动部署或绕过人工 Gate；
- 新建一套独立的项目状态、记忆或生命周期事实源。

## 3. Current Evidence and Gap

当前仓库已经具备以下基础：

1. `skills/ai-cto-system/SKILL.md` 已声明新项目、已有项目、重大需求、架构、交付和维护请求可触发 AI-CTO；
2. `skills/ai-cto-system/agents/openai.yaml` 已设置 `allow_implicit_invocation: true`；
3. Intent Gateway 已定义 `L0`–`L4` 分类、风险升级、低置信度处理和普通对话排除；
4. 生命周期已定义 `IDEA → RESEARCH/EVALUATION → DESIGN → DEVELOPMENT → TESTING → RELEASE → MAINTENANCE → EVOLUTION`；
5. 项目状态、项目记忆、Runtime Handoff、Task Envelope、Review 和 Checkpoint 合同已经存在。

当前缺口不是“没有入口”，而是入口行为尚未被明确固化为统一的自动介入合同：

- Skill 触发描述与生命周期续接规则分散在不同文档中；
- 触发后如何解析目标项目、读取当前阶段、确定唯一下一步缺少单一操作标准；
- 新想法、已有项目和当前项目续接没有统一 Fresh Session 验收；
- Task Envelope、Review、Checkpoint 已经能提供边界合同，但还没有在 Skill 的每轮接续规则中明确其使用时机。

## 4. Design Principles

### 4.1 Skill 是自动入口，不是新的 Runtime

Skill 负责让 Codex 识别适用请求、选择最小上下文并进入既有治理；它不拥有 Workflow、Task、Capability、Agent、Permission 或 Project Memory 的权威。

### 4.2 现有项目状态是唯一续接依据

项目续接只读取目标项目现有 `PROJECT_STATE.md`、`PROJECT_MEMORY.md`、阶段文档和相关 Evidence。不得创建 `AI_CTO_SESSION.md`、全局聊天副本或第二个项目状态文件作为新权威。

### 4.3 自动介入不等于自动授权

自动介入可以自动路由、读取上下文、分析、设计、生成计划和提出下一步；任何写入、提交、部署、生产变更、Gate 通过和风险接受仍服从既有人工确认与授权合同。

### 4.4 最小充分上下文

先判断路线，再加载权威。L1 继续保持轻量；L2–L4 才按项目状态、阶段和任务范围加载对应 Requirement、Design、ADR、Task、Test、Review、Gate 或 Memory。

### 4.5 只问真正缺失的决策

如果可以依据现有 Evidence 和项目状态推进，直接继续；只有目标、范围、授权、风险接受、阶段 Gate 或关键事实缺失时才提问。提问必须明确缺口和不回答的后果。

## 5. Automatic Intervention Contract

### 5.1 Trigger Classification

每个用户消息先应用以下顺序：

1. 检查 `AI_CTO_MODE: OFF`、“不要使用 AI CTO System”、“普通模式处理”或“本次禁用 AI CTO Skill”；若命中，当前请求不进入 AI-CTO。
2. 判断是否为普通对话、简单解释或与项目状态无关的低风险问题；若是，使用 L0 普通处理，不加载 AI-CTO 治理上下文。
3. 判断是否包含项目、产品、需求、Bug、Incident、架构、代码、测试、发布、维护、接管、复盘或演进意图；若是，自动进入 AI-CTO 路由。
4. 对边界模糊的输入，先输出低干扰的候选判断和一个必要澄清问题，不强行创建项目或阶段。

典型自动触发输入包括：

- “我有一个产品想法，帮我判断能不能做”；
- “继续做这个项目”；
- “这个功能怎么设计并落地”；
- “帮我接管这个已有代码项目”；
- “这个 Bug 要怎么修，是否会影响架构”；
- “准备发布了，帮我做上线前检查”；
- “这个项目后面应该怎么维护和演进”。

### 5.2 Target Resolution

触发后先确定任务目标：

| 情形 | 处理 |
|---|---|
| 明确指向已有项目 | 使用该项目的 `PROJECT_STATE.md`、`PROJECT_MEMORY.md` 和相关阶段文档 |
| 当前对话已有明确项目上下文 | 继续当前项目，不要求用户重复唤醒 |
| 新想法或新产品 | 进入 Idea Intake，不直接创建正式项目 |
| 同时可能对应多个项目 | 列出候选项目和区分依据，只询问一次选择 |
| 没有项目依赖的普通技术问题 | 使用 L0/L1 普通处理，不创建项目状态 |

如果目标项目的状态文件缺失、冲突或无法定位，必须报告缺口，不得凭空创建当前阶段或假设历史完成。

### 5.3 Route Selection

沿用现有 L0–L4 路由：

| 复杂度 | 默认行为 | 自动介入结果 |
|---|---|---|
| L0 | 普通对话 | 不进入 AI-CTO 生命周期 |
| L1 | Instant / LIGHT / R1 | 只读取目标文件和必要规则，直接完成低风险可逆工作 |
| L2 | Engineering / STANDARD / R2 | 读取项目状态、相关 Requirement / Design / Task / Test，执行影响分析与目标工作 |
| L3 | Design + Engineering / STANDARD / R3 | 读取 Architecture、ADR、Memory、影响范围和相关 Evidence，先设计再实现 |
| L4 | CTO / STRICT / R4 | 读取项目与组合治理、User Brain、Knowledge、Gate 和风险证据，必须进行完整门禁判断 |

风险、敏感数据、权限、不可逆性、生产影响、当前 Evidence 缺失或未解决 ADR 冲突可以提升路由；用户偏好和“想快一点”不能降低强制控制。

触发后，在需要治理的请求中输出一行可见路由信息，例如：

`Route: L3 / Design + Engineering / STANDARD / R3 | Context: project state + architecture + impact scope | Validation: change impact + targeted tests`

该行是状态透明度，不是额外的唤醒命令，也不自动暂停等待批准。

### 5.4 Continuation Behavior

每次触发后的响应都必须包含以下四类信息（L0 普通对话除外）：

- 当前判断：识别到的项目、任务类型、复杂度、风险和置信度；
- 当前状态：项目生命周期阶段、已确认 Evidence、阻塞和未完成 Gate；
- 当前动作：本轮实际完成的分析、设计、修改、测试或审查；
- 唯一下一步：下一步动作、所需输入、责任边界和是否需要用户确认。

如果上一轮已经留下明确的 `Next Action`、未完成 Task、等待 Gate 或 Checkpoint，下一轮默认先恢复该上下文，再处理新消息；新消息与旧任务冲突时保留两者 Evidence 并请求用户选择，不静默切换或覆盖。

### 5.5 Lifecycle Entry

- 新想法：`IDEA → Research / Evaluation`，先形成候选和判断，不直接进入 Development；
- 已确认项目继续：读取 `PROJECT_STATE.md`，从当前阶段的下一项未完成 Gate 或 Task 接续；
- 已有代码项目接管：进入 `EXISTING_PROJECT_ONBOARDING`，不伪装为新 Idea，不补造历史阶段；
- 设计或架构需求：若当前没有批准的 Requirement / Design，先停在设计输入准备，不直接写实现；
- 开发、测试、发布、维护：只能进入满足当前阶段进入条件的路径，不能用后续结果补做前序 Gate。

## 6. Relationship with Existing Contracts

自动介入合同只组织入口和接续，不替换现有权威：

| 现有合同 | 自动介入中的使用时机 |
|---|---|
| Intent Gateway | 判断用户意图、置信度、风险和是否进入 AI-CTO |
| Execution Routing | 选择 L0–L4、Workflow、Context 和 Validation 强度 |
| Project Lifecycle | 确定当前阶段和允许的下一阶段 |
| Project State / Memory | 提供当前状态、历史决策、Evidence 和未完成动作 |
| Task Execution Envelope | L2–L4 任务进入 Runtime 前冻结边界和证据 |
| Review Profile / Packet | 需要评审时冻结评审职责和基线，不自动编排 Reviewer |
| Checkpoint / Projection | 在显式生命周期节点保存任务快照，不自动写入 Project Memory |
| Permission / Budget / Approval / Gate | 决定是否允许实际副作用 |

## 7. Failure and Safety Boundaries

自动介入必须在以下情况停止或降级：

- 无法确认目标项目或项目状态存在冲突；
- Intent 置信度不足或请求明显超出 AI-CTO 范围；
- 当前阶段的 Requirement、Design、Evidence 或 Gate 不足；
- 任务复杂度和风险与 Envelope 不一致；
- 升级评审任务没有 Review Packet 绑定；
- Checkpoint 不能与当前任务或项目上下文一致；
- 用户明确关闭 AI-CTO 或要求普通模式处理。

停止时输出阻断原因、已知 Evidence、未满足条件和唯一下一步；不得用模板完整性掩盖缺失事实，不得自动猜测或自动扩张范围。

## 8. Acceptance Criteria

### 8.1 Fresh Session Scenarios

在新 Codex 对话中验证以下五类场景：

1. 新产品想法：不输入 `$ai-cto-system`，自动进入 Idea Intake，并询问最少必要问题；
2. 已有项目需求：自然描述一个功能，自动识别项目并给出 L1–L3 路由和下一步；
3. 项目续接：只说“继续”，能读取当前项目状态并恢复未完成动作；
4. 普通对话：简单解释不触发 AI-CTO 治理和长上下文；
5. 明确退出：`AI_CTO_MODE: OFF` 或等价指令后，当前请求不进入 AI-CTO。

### 8.2 Governance and Execution Scenarios

- L2–L4 请求在 Runtime 前具备 Envelope；
- `ESCALATE_FOR_REVIEW` 没有 Packet 绑定时被阻断；
- 显式 Checkpoint 只在配置持久化能力时追加，且不自动写 Project Memory；
- 任意人工 Gate、Permission、Budget 或 Approval 不会被自动入口绕过；
- 每次治理请求都能明确输出当前结果、Evidence、限制和唯一下一步。

### 8.3 Non-Goals for This Increment

- 不承诺生产级无人工全自动交付；
- 不承诺没有新用户消息时主动推进；
- 不接入真实外部 Provider、MCP、网络或部署系统；
- 不新增第二个项目状态源或通用长记忆包；
- 不以 Reviewer 数量、模板数量或规则数量作为完成度指标。

## 9. Alternatives Considered

### A. 只修改 Skill 描述

优点是改动最小；缺点是触发后的项目解析、阶段续接和验收标准仍然分散，无法稳定验证。拒绝作为完整方案，但其中的触发词和隐式调用声明保留。

### B. 自动介入合同 + 现有治理复用

优点是以 AI-CTO 为主体，能补上“自动进入”和“持续接续”的缺口，不新增 Runtime 权威、不复制 ZIP、不制造新状态源；缺点是仍依赖 Codex Skill 的宿主发现行为，需要 Fresh Session 验收。采用此方案。

### C. 新建全功能 Runtime Controller

优点是可统一编排状态和工具；缺点是当前缺少真实执行 Evidence，会提前引入状态同步、权限和维护复杂度，超出当前目标。暂不采用。

## 10. Implementation Boundary

预计修改集中在：

- `skills/ai-cto-system/SKILL.md`：自动触发、目标解析、项目续接、输出合同和退出规则；
- `skills/ai-cto-system/agents/openai.yaml`：隐式调用的默认提示语；
- `docs/intent/AI_CTO_AUTO_INTERVENTION_STANDARD.md`：权威标准与验收场景；
- `DEVELOPMENT_PROGRESS.md`、`memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md`、`docs/architecture/MODULE_REGISTRY.md`：状态同步；
- Fresh Session 验收记录：只记录触发、路由、上下文范围、结果和限制，不伪造宿主行为证据。

不修改 Runtime 核心状态机，不创建新的 Layer、Phase、Module、Agent、Capability 或后台服务。

## 11. Success Definition

本设计完成后的成功标准不是“用户记住如何调用 Skill”，而是用户可以自然描述项目相关内容，Codex 自动进入适用的 AI-CTO 流程；在同一项目后续对话中，系统能根据权威项目状态继续工作，并在缺少真正决策或授权时明确停下来。普通聊天、退出指令和无证据的复杂化建议仍保持低干扰和可拒绝。
