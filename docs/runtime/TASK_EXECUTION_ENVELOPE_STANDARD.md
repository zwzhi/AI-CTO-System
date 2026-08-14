# Task Execution Envelope Standard

## 1. 定位与所有权

Task Execution Envelope 是 Layer 5 `AI CTO Runtime Architecture` 的任务级控制合同，用于把一次任务的目标、边界、证据、Gate、停止条件、回滚条件、验收条件和下一步动作冻结在同一个可追踪快照中。

它是对现有 Intent Gateway → Execution Routing → Workflow / Task → Permission / Budget Guard → Audit 链路的补强，不是新的 Layer、Phase、Module、Capability、Agent 或 Reviewer 编排系统。唯一权威仍是 AI-CTO System；ZIP 中同名机制只被提炼为适合本 Runtime 的合同字段和前置校验。

## 2. 适用范围

| 任务复杂度 | 是否要求 Envelope | 说明 |
|---|---:|---|
| `L0` / `L1` | 可选 | 轻量咨询、只读分析或低风险可逆工作仍走现有最小路径，避免流程膨胀。 |
| `L2` / `L3` / `L4` | 必须 | 在 Runtime 创建 Workflow / Task 前必须通过 Envelope 结构、路由档位、当前证据和 Gate 校验。 |

Envelope 的存在不等于授权。所有修改、提交、推送、部署、重启、数据库写入和缓存/消息写入仍必须分别受现有 Permission、Budget、Approval、Capability 和 Release Gate 控制。

## 3. 合同字段

Envelope 版本固定为 `1.0`，包含：

- `envelopeId`、`taskRef`、`title`：用于跨 Intent、Routing、Workflow、Task、Audit 的关联。
- `project`：项目名、仓库路径、分支和基线提交；用于确认任务所针对的项目基线。
- `execution`：`mode`、`profile`、`phase`、`riskLevel`、`complexity` 与可选可逆性；不能降低 Router 计算出的最低档位。
- `authorization`：文件修改、Commit、Push、Deploy、Restart、数据库和 Cache/MQ 写入的布尔声明；声明不是执行授权。
- `scope`：非空目标、非目标、允许路径和禁止路径；允许与禁止路径不得重叠。
- `gates`：要求通过的 Gate 及已完成 Gate；未完成的 required Gate 阻断交接。
- `stopConditions`、`rollbackConditions`、`acceptanceCriteria`、`nextAction`：必须明确、非空且可复核。
- `evidence`：仓库指纹、验证记录、Review 记录和过期项目；L2–L4 至少需要仓库基线指纹且不得存在 `staleItems`。
- 可选 `review`：声明本次交接要求的 `ReviewProfile` 列表和 `packetSha256`；声明的 Packet 指纹必须同时出现在 `evidence.reviews` 中。

## 4. 运行时校验顺序

受控 Handoff 按以下顺序处理：

1. 在集成边界重建并深度冻结 Intent、Execution Context、Budget 和可选 Envelope，不修改调用方输入。
2. 仅允许已分类且达到 L3/L4 路由置信度的 Intent 进入现有 Advisory Router。
3. 对 `OUT_OF_SCOPE` 和 `INSUFFICIENT_EVIDENCE` 保持原有路由阻断。
4. 对 L2–L4 检查 Envelope：缺失、结构无效、复杂度/风险低于 Intent、档位低于路由最低档位、基线证据缺失/过期、required Gate 未完成或升级路由缺少 Review Packet 绑定时返回 `ENVELOPE_BLOCKED`。
5. 只有通过上述检查，才调用现有 Runtime；现有 `CONFIRM` 和 `WAITING_APPROVAL` 不变。显式 Checkpoint 只有在配置 `CheckpointService` 时，才会在受控 Runtime 终态追加。

`ENVELOPE_BLOCKED` 必须在 Workflow / Task 创建前返回，只产生集成层 Evidence 和可解释限制，不产生 Capability Invocation、Execution Record 或 `executionAuthorization`。

## 5. 校验结果与证据

`TaskExecutionEnvelopeService` 返回 `VALID` 或 `BLOCKED`，阻断原因包括：

- `ENVELOPE_INVALID`：版本、字段、列表、路径或授权声明不合法。
- `EVIDENCE_REQUIRED`：L2–L4 缺少当前仓库基线或仍有过期证据。
- `PROFILE_BELOW_MINIMUM`：Envelope 声明的档位低于 Router 建议的最低档位。
- `GATE_REQUIRED`：required Gate 未完成，或路由要求 Review 却没有声明 Gate。
- `CONTEXT_MISMATCH`：Envelope 的 `taskRef`、复杂度或风险与已冻结 Intent 不一致。
- `REVIEW_REQUIRED`：路由升级为 `ESCALATE_FOR_REVIEW`，但 Envelope 没有绑定 Review Profile / Packet。

通过和阻断都返回带 `envelopeId` 关联的 Evidence。Evidence 只描述校验事实，不回显项目源代码或生成执行权限。

## 6. 与 ZIP 能力的选择性关系

本合同采用 ZIP Task Execution Envelope 的边界冻结、证据基线、停止/回滚/验收字段；适配 AI-CTO 已有的 `ExecutionProfile`、`Evidence`、`Permission`、`Budget`、`Gate` 和 `Audit` 类型。

没有引入 ZIP 的模板目录、通用长记忆包、默认多 Reviewer、跨项目复制规则或任何未经真实证据支持的复杂编排。未来只有在真实任务数据证明收益且不增加不必要上下文和维护成本时，才可通过新的设计与 Gate 扩展本合同。

## 7. 当前边界

- 当前实现是确定性、内存内、受控 Handoff 前置校验；不读取文件系统、Git、网络或外部 Provider。
- `repoFingerprint` 由调用方提供并由合同验证格式；当前不会自行计算真实仓库哈希。
- Review Profile / Packet 仍由调用方或既有 Code Review 流程生成；Handoff 只校验 Envelope 中的 Profile 与 Packet 指纹绑定，不启动 Reviewer 或模型。
- 通过 Envelope 只代表“允许进入现有审批检查点”，不代表批准执行、部署或生产变更。
- Checkpoint 是显式、追加式的 Runtime 快照；未显式提供时不写入，Projection 也不会自动写入 Project Memory。
- 现有 L1 轻量路径继续可用，以保持渐进上下文和反流程膨胀原则。

## 8. 验证记录

- 目标测试：Task Envelope `TE-01`–`TE-13`，Controlled Handoff `IH-14`–`IH-21`。
- 当前分支：`feat/ai-cto-zip-reinforcement`。
- 实现提交：`add72f5`、`fa5a445`、`fbac4ec`。
- 验证要求：`npm.cmd test`、`git diff --check`，并确认结果中不存在 `executionAuthorization`。
