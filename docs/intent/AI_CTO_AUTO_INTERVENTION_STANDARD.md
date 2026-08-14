# AI CTO Automatic Intervention Standard

## 1. Scope and authority

本标准定义 Codex 在用户自然提出项目相关内容时如何自动进入 AI-CTO System。它是 Skill Gateway 的入口和续接规则，不是新的 Runtime、Workflow、Agent、Capability、Module 或项目事实源。

自动介入只发生在当前用户消息触发的 Codex 对话中；它不包含后台扫描、定时任务、主动通知或无消息时的自动推进。项目状态、生命周期、Gate、Permission、Evidence、Audit 和执行授权仍以现有权威合同为准。

## 2. Trigger order and opt-out

每条消息按以下顺序处理：

1. 先检查 `AI_CTO_MODE: OFF`、`不要使用 AI CTO System`、`普通模式处理` 和 `本次禁用 AI CTO Skill`。命中时当前请求不进入 AI-CTO；`AI_CTO_MODE: ON` 可重新启用。
2. 判断是否为普通对话、简单解释或不依赖项目状态的低风险问题。此类请求使用 L0/L1 普通处理，不加载完整治理上下文。
3. 若消息表达新想法、项目需求、Feature、Bug、Incident、架构、测试、交付、维护、接管、复盘、演进或项目续接意图，则允许 Skill 隐式介入。
4. 意图或目标项目不清晰时，只提出最少必要的澄清问题，不强行创建项目、阶段或执行授权。

用户不需要输入 `$ai-cto-system`；Skill Gateway 的 `allow_implicit_invocation` 必须保持为 `true`。

## 3. Target project resolution

| 输入情形 | 自动处理 |
|---|---|
| 明确指向已有项目 | 读取该项目的 `PROJECT_STATE.md`、`PROJECT_MEMORY.md` 和相关阶段文档 |
| 当前对话已有项目上下文 | 继续当前项目，不要求重复唤醒 |
| 新想法或新产品 | 进入 Idea Intake，不直接创建正式项目 |
| 多个项目都可能匹配 | 列出候选和区分依据，只询问一次选择 |
| 没有项目依赖的普通技术问题 | 使用 L0/L1 普通处理，不创建项目状态 |

如果目标项目的状态文件缺失、冲突或无法定位，必须报告缺口，不得猜测当前阶段或补造历史。

## 4. L0-L4 route selection

沿用现有 Execution Routing：

| 复杂度 | 默认路线 | 自动介入行为 |
|---|---|---|
| `L0` | 普通处理 / `R0` | 不进入 AI-CTO 生命周期 |
| `L1` | Instant / LIGHT / `R1` | 只读取目标文件和必要规则，完成低风险可逆工作 |
| `L2` | Engineering / STANDARD / `R2` | 读取项目状态和相关 Requirement、Design、Task、Test |
| `L3` | Design + Engineering / STANDARD / `R3` | 读取 Architecture、ADR、Memory、影响范围和 Evidence，先设计再实现 |
| `L4` | CTO / STRICT / `R4` | 读取项目与组合治理、User Brain、Knowledge、Gate 和风险证据 |

风险、敏感数据、权限、不可逆性、生产影响、Evidence 缺失或 ADR 冲突可以提升路线；偏好、方便或“尽快完成”不能降低强制控制。需要治理的请求应输出实际路线、Context 范围和 Validation 强度；路由行是透明度，不是额外唤醒命令或批准暂停。

## 5. Continuation response contract

每个进入 AI-CTO 的响应（L0 普通处理除外）必须说明：

- **Current result**：本轮实际得到的结论或完成的动作；
- **Current state**：项目生命周期阶段、已确认 Evidence、阻塞和未完成 Gate；
- **Evidence and limitations**：依据、未知、未验证部分和能力边界；
- **Unique next action**：下一步动作、所需输入、责任边界和是否需要用户确认。

如果上一轮留下 `Next Action`、未完成 Task、等待 Gate 或 Checkpoint，下一轮先恢复该上下文，再处理新消息。新消息与旧任务冲突时保留两者 Evidence 并请求用户选择，不静默覆盖状态。

## 6. Lifecycle entry rules

- 新想法进入 `IDEA` 和 Idea Intake；Research / Evaluation 完成并获得确认前不得直接进入 Development。
- 已确认项目从 `PROJECT_STATE.md` 记录的当前阶段和下一项未完成 Gate / Task 接续。
- 已有代码项目进入 `EXISTING_PROJECT_ONBOARDING`，不伪装成新 Idea，不补造历史阶段。
- 设计或架构需求在缺少批准 Requirement / Design 时先准备设计输入，不直接写实现。
- 开发、测试、发布、维护和演进只能进入满足当前阶段进入条件的路径，不能用后续结果补做前序 Gate。

## 7. Existing contract boundaries

自动介入只组织入口和续接，不替换现有合同：

- Intent Gateway 负责分类、置信度和风险；
- Execution Routing 负责 L0-L4 和最小充分 Context；
- Project Lifecycle 负责阶段语义和转换条件；
- Project State / Project Memory 负责当前状态、历史决策、Evidence 和下一步；
- Task Execution Envelope 负责 L2-L4 Runtime 前边界冻结；
- Review Profile / Packet 负责评审输入和基线绑定，不自动启动 Reviewer；
- Checkpoint / Projection 负责显式任务快照，不自动写入 Project Memory；
- Permission、Budget、Approval、Gate 和 Audit 决定副作用是否允许。

## 8. Stop and ask conditions

自动介入必须在以下情况停止或降级：目标项目无法确认；Intent 置信度不足；Requirement、Design、Evidence 或 Gate 不足；Envelope 与 Intent 不一致；升级评审缺少 Packet；Checkpoint 与任务或项目不一致；用户明确退出或要求普通模式。

停止响应必须给出阻断原因、已知 Evidence、缺失条件、限制和唯一下一步。不得用模板数量、Reviewer 数量或“看起来完整”掩盖事实缺口，也不得自动猜测范围或授权。

## 9. Fresh Session acceptance matrix

新 Codex 对话必须分别验证：

1. 不输入 `$ai-cto-system` 的新产品想法自动进入 Idea Intake；
2. 自然描述已有项目需求后自动识别项目并给出实际路线；
3. 只说“继续”时读取项目状态并恢复记录的下一步；
4. 普通解释不加载完整 AI-CTO 治理；
5. `AI_CTO_MODE: OFF` 等价指令阻止当前请求进入 AI-CTO。

静态 Skill 文件、Skill 目录存在或当前对话的工具目录不能单独证明 Fresh Session 发现。无法观察宿主选择元数据时，记录 `NOT_OBSERVABLE`，不得推断为通过。
