# Self Evolution Real Project Feedback Evidence

## Record Metadata

- Record ID: `SE-EVIDENCE-2026-08-13-001`
- Purpose: 汇总近期真实项目中与 AI CTO 使用、接管和治理有关的可核验反馈，为 Self Evolution 分析提供输入。
- Scope: 只读分析；不执行优化、不修改项目、不改变任何路由或治理规则。
- Created: 2026-08-13
- Overall Confidence: `L3`
- Limitation: 多数来源是项目 Memory、Progress 和 Handoff 记录，能够证明事件和处理结果，但不能单独证明所有结果均由 AI CTO 直接造成。

## 1. Evidence Sources

| Evidence ID | Source | Evidence Type | Confidence | Scope Note |
|---|---|---|---|---|
| `EVD-AIM-001` | `D:/AI Project/AI-Matrix/PROJECT_MEMORY.md` | 项目记忆、需求修正、测试记录 | L3 | 证明需求与治理过程，业务 Pilot 仍有未运行项 |
| `EVD-LIVE-001` | `D:/AI Project/live/PROJECT_MEMORY.md` | 接管基线、Gate、运行故障与安全约束 | L4 | 来源包含明确日期、状态、Commit 和风险边界 |
| `EVD-CUS-001` | `D:/AI Project/GitHubTest/01-WeFlow/PROJECT_MEMORY.md` | 接管健康评估、性能修复、业务 Gate | L3 | 当前健康分为临时评估，真实发送仍未完成 |
| `EVD-WFO-001` | `D:/AI Project/WorkflowOrchestrator/docs/PROGRESS.md` | 工作流、发布、暂停、重试和回滚记录 | L3 | 主要证明工程运行反馈，不等同于 AI CTO 性能遥测 |
| `EVD-WFO-002` | `D:/AI Project/WorkflowOrchestrator/docs/HANDOFF-2026-07-30.md` | 交接规范和异常处理约束 | L3 | 证明人工确认、幂等、恢复和停止是实际需求 |
| `EVD-CHAT-001` | 当前 Codex 对话截图 | 模型容量错误提示 | L3 | 证明一次真实交互失败；未记录精确等待时间、Token 和降级结果 |

## 2. Confirmed Observations

### OBS-001：证据门禁阻止了未经验证的业务结论

- Sources: `EVD-AIM-001`
- Observation: AI Matrix 将随机生成的正式判断题从业务证据中剥离，改为来源登记、候选提取、主体反馈、风险隔离和知识快照流程。
- Implication: Evidence-first、防止一次性经验泛化和知识状态分层是有效治理约束。
- Confidence: `L3`
- Limitation: 该记录证明流程被采用，不证明业务效果已经完成长期验证。

### OBS-002：接管 Gate 能够识别“技术可运行”与“可以授权修改”的差异

- Sources: `EVD-LIVE-001`, `EVD-CUS-001`
- Observation: live 与 CUSTORY 均记录了接管 Gate 阻塞、业务代码修改授权为 `NO`，并保留缺失的 License、Git、真实业务验收或恢复证据。
- Implication: Onboarding、Health、Permission 和 Gate 共同工作，避免把离线测试或单机运行误报为生产就绪。
- Confidence: `L3`
- Risk: 如果阻塞原因和下一步行动展示不清，用户可能把 Gate 理解为“系统卡住”。

### OBS-003：不确定的付费外部调用需要人工确认和受控降级

- Sources: `EVD-LIVE-001`
- Observation: 图片请求超时不能证明上游未接受或未计费，因此系统禁止自动重发付费请求；用户主动重试时重新确认费用。ChatGPT 不可用时，也只能在明确确认后使用最小安全兜底。
- Implication: Human Control、Budget Governance、Failure Handling 和 Fallback 规则具有直接业务价值。
- Confidence: `L4`

### OBS-004：实际工作流反复需要暂停、继续、重试、跳过、人工确认和回滚

- Sources: `EVD-WFO-001`, `EVD-WFO-002`
- Observation: 发布、迁移、审核和外部服务流程均记录了暂停/继续、失败阶段重试、版本冲突保护、人工补录和回滚需求。
- Implication: Workflow State Machine 和可恢复执行比单纯的“一键自动化”更重要。
- Confidence: `L3`

### OBS-005：低级别性能问题可以通过小范围、可验证的优化解决

- Sources: `EVD-CUS-001`, `EVD-LIVE-001`
- Observation: 监测启动卡顿通过 single-flight、退避、低频恢复扫描和分阶段历史收录改善；页面布局、超时错误和有限重试也经过局部修正。
- Implication: Self Evolution 应优先识别可逆、局部、证据明确的简化和稳定性优化，而不是扩大架构。
- Confidence: `L3`

### OBS-006：模型容量不足会被用户感知为“系统卡住”

- Sources: `EVD-CHAT-001`
- Observation: 一次跨项目只读检索因模型达到容量上限而被拒绝，界面没有在同一交互中完成可见的降级或替代路径。
- Implication: Execution Routing 需要覆盖模型容量失败、可见状态、低成本模型降级和重试建议。
- Confidence: `L3`
- Limitation: 只有单个案例，缺少精确时延、Token、成本和替代模型结果。

## 3. Cross-Project Patterns

| Pattern | Evidence | Current Assessment |
|---|---|---|
| 低风险任务被复杂流程放大 | `EVD-CHAT-001`, existing `EFF-001` | 已有信号，尚不足以修改默认规则 |
| Gate 阻塞但补证动作不够直观 | `EVD-LIVE-001`, `EVD-CUS-001` | 需要改善可解释性，不应取消 Gate |
| 付费/外部副作用操作需要 Confirm | `EVD-LIVE-001`, `EVD-WFO-002` | 已被多个工作流支持，属于稳定原则 |
| 操作需要可暂停、可恢复、可回滚 | `EVD-WFO-001`, `EVD-WFO-002` | 应继续作为 Runtime 和 Capability 的基础约束 |
| 反馈和证据分散在多个项目文件 | 全部来源 | 当前主要知识检索成本，尚未有统一遥测 |
| 工程通过不等于真实业务通过 | `EVD-AIM-001`, `EVD-CUS-001`, `EVD-LIVE-001` | 应持续显式区分 Engineering Evidence 与 Business Evidence |

## 4. Evidence Gaps

以下数据目前没有被跨项目一致记录，因此不得据此做强结论：

- 每次 AI CTO 任务的准确总耗时；
- Token、模型成本和上下文大小；
- Skill、Tool、Workflow 的实际调用次数；
- 用户确认、返工和撤销次数；
- 用户对“结果有帮助”的直接评分；
- 不同路由方案的质量、成本和时延对照；
- 同一反馈在多个独立项目中的重复出现率（需排除快照/交接副本）。

## 5. Optimization Proposal Candidates

以下为候选提案，不代表已批准、可执行或已写入 Self Evolution MVP Contract。

### OP-FEEDBACK-INDEX-001 — 跨项目反馈证据索引

- Problem: 反馈散落于各项目的 `PROJECT_MEMORY`、`PROGRESS` 和 `HANDOFF`，快照副本可能造成重复计数。
- Evidence: `EVD-AIM-001`、`EVD-LIVE-001`、`EVD-CUS-001`、`EVD-WFO-001`。
- Recommendation: 在现有 Knowledge/Evidence 治理范围内建立只读索引记录，保留来源项目、来源文件、日期、Evidence Level 和是否为快照副本。
- Expected Value: 降低跨项目复盘成本，避免把一个项目的经验误算成多项目规律。
- Risk: 低；只读元数据，不改变项目文件。
- Autonomy Candidate: `AUTO_WITH_VALIDATION`（未来执行时仍需白名单与验证）。
- Validation: 抽样核对来源、去重率和索引可追溯性。

### OP-ROUTING-ADAPTIVE-001 — 低复杂度反馈分析轻量路由

- Problem: 简单的跨项目状态/反馈汇总可能触发过大的上下文和推理路径。
- Evidence: `EVD-CHAT-001`、已有 `EFF-001`。
- Recommendation: 在现有 Execution Routing 和 Intent Gateway 中增加“只读反馈汇总”任务特征建议，优先使用 targeted context 和较低推理预算。
- Expected Value: 降低耗时和模型容量失败概率。
- Risk: 中；路由过轻可能遗漏关键项目边界。
- Autonomy Candidate: `CONFIRM_REQUIRED`（需多案例对照后再考虑自动建议）。
- Validation: 至少收集 3–5 个同类任务的时延、上下文量、Token、质量和人工返工数据。

### OP-GATE-EXPLAINABILITY-001 — Gate 阻塞的补证行动说明

- Problem: `ONBOARDING_BLOCKED` 能阻止越权，但用户可能不知道下一步补什么。
- Evidence: `EVD-LIVE-001`、`EVD-CUS-001`。
- Recommendation: 在已有 Gate 输出中统一显示阻塞原因、缺失 Evidence、可继续的只读动作和下一项行动；不改变 Gate 权威或放宽授权。
- Expected Value: 减少“系统卡住”感，降低重复确认和错误修改。
- Risk: 低至中；只改变解释层，不改变 Gate 判断。
- Autonomy Candidate: `AUTO_WITH_VALIDATION`（仅限非权威说明文本）。
- Validation: 阻塞案例中用户是否能一次识别下一步；验证输出未改变 Gate 结果。

### OP-MODEL-FALLBACK-001 — 模型容量失败的可见降级建议

- Problem: 模型容量不足时，用户只看到拒绝，容易误认为系统无响应。
- Evidence: `EVD-CHAT-001`。
- Recommendation: 在现有 Model Routing/Execution Routing 建议中记录 capacity failure，给出等待、切换已授权模型或缩小上下文的建议；不自动切换、不调用未授权模型。
- Expected Value: 降低静默失败和重复提交。
- Risk: 中；模型降级可能影响质量和数据边界。
- Autonomy Candidate: `NOTIFY` 或 `CONFIRM_REQUIRED`。
- Validation: 记录容量失败后的用户选择、完成率、质量、成本和等待时间。

### OP-EVIDENCE-TELEMETRY-001 — AI CTO 使用 Evidence 补采

- Problem: 当前项目记录能证明修改结果，但不能稳定比较 AI CTO 路由的耗时、Token、上下文和人工交互成本。
- Evidence: `EVD-CHAT-001`、已有 `EFF-001` 中的 `NOT_CAPTURED` 项。
- Recommendation: 复用已有 Execution Routing Evidence 和 Audit 标准，由调用方在授权范围内补充统一快照字段；不新增采集系统。
- Expected Value: 为后续 Self Evolution 提供可比较 Evidence。
- Risk: 中；可能扩大记录范围或引入敏感数据，必须最小化字段并脱敏。
- Autonomy Candidate: `CONFIRM_REQUIRED`（先确认记录范围和隐私边界）。
- Validation: 多项目样本中字段完整率和敏感信息扫描结果。

## 6. Self Evolution Input Recommendation

本记录可以作为 Self Evolution 的只读 Snapshot 输入：

1. `Observation Snapshot`：OBS-001 至 OBS-006；
2. `Evidence Snapshot`：EVD-* 来源及其 Confidence/Limitations；
3. `Capability Snapshot`：Execution Routing、Intent Gateway、Onboarding、Knowledge/Evidence Governance；
4. `Runtime Snapshot`：本次只读检索任务的路由信息和模型容量失败信息。

Self Evolution 当前仍只允许：

`Snapshot → Observation → Analysis → Optimization Proposal`

本记录不授权任何 Proposal 执行、通知、写入、激活、删除或模型自动切换。

## 7. Conclusion

真实项目反馈支持继续优化 AI CTO 的执行效率、Gate 可解释性和 Evidence 索引能力，但不支持新增 Phase 或扩大 Runtime 权限。当前最优先的下一步是补齐跨项目可比较的 Execution Evidence，再对上述候选 Proposal 进行正式风险评估。
