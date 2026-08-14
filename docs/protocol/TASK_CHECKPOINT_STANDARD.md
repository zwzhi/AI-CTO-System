# AI CTO Task Checkpoint Standard

## 1. 定位

Task Checkpoint 是 Layer 1 `Project Memory / Memory Management` 与 Layer 5 Runtime 之间的任务连续性合同。它吸收 ZIP 的 Checkpoint、Handoff 和 Recovery 思路，但以 AI-CTO 现有 Project Memory、Evidence、Audit 和人类确认规则为唯一权威。

Checkpoint 是运行时快照，不是第二个项目事实源；Project Memory 仍保存单项目长期连续性，Knowledge Base 仍保存经过治理的跨项目知识。

## 2. Checkpoint 内容

每个 `TaskCheckpoint` 使用版本 `1.0`，包含：

- `checkpointId`、`taskRef`、`projectRef`、`phase`、`kind`、`status`、`ownerRef`；
- `confirmedFacts`、`decisions`、`blockers`、`risks` 和 `nextAction`；
- 带唯一 Evidence ID、来源、Confidence 和可选引用的 Evidence 列表；
- 创建时间和可选 `predecessorCheckpointId`。

Confirmed facts 必须有非空 Evidence 集合；Evidence ID 不得重复。Checkpoint 不记录秘密、完整 Prompt、完整工具日志、源代码正文或未经验证的隐性推理。敏感模式包括 API Key、Password、Token、Secret、Bearer 凭据和私钥头。

## 3. 追加与恢复

`InMemoryCheckpointRepository` 只允许追加，不允许覆盖既有 ID；前序 Checkpoint 必须存在且属于同一 Task。`CheckpointService.recover()` 仅返回最新快照、前序 ID 链和固定的重新核验义务：

- 重新检查当前 Project 状态；
- 重新检查当前 Git、基线和授权状态；
- 重新检查 Evidence freshness；
- 重新检查当前阻塞与风险；
- 重新确认当前下一步动作。

旧 Checkpoint 不能替代当前代码、配置、Git、授权或 Evidence；恢复不会自动恢复 Workflow / Task，不创建执行授权，不自动重试或继续执行。

在受控 Runtime Handoff 中，调用方可以显式提交一个已验证的 Checkpoint。集成边界会校验其 `taskRef` 与 Intent、`projectRef` 与 Execution Context 一致；若未配置 `CheckpointService`，请求在路由前失败。Runtime 到达 `WAITING_APPROVAL` 或 `CANCELLED` 后才追加该快照，追加失败会作为 Handoff 不变量错误暴露；未显式提供 Checkpoint 时不产生任何 Checkpoint 写入。

## 4. Project Memory Projection

`ProjectMemoryProjectionService` 只从 Evidence Confidence 为 `L1`–`L4` 的 Checkpoint 生成不可变、metadata-only Projection，内容包括确认事实、决策、Evidence、阻塞、风险、下一步和建议章节。Projection 始终带 `rawConversationIncluded: false`。

如果 Evidence 为 `UNVERIFIED`、`UNKNOWN` 或 `NOT_CAPTURED`，Projection 返回 `PROJECTION_REQUIRES_CONFIRMED_EVIDENCE`，不得把未知提升为事实。Projection 不写 Markdown、Git、外部记忆或 Knowledge Base；需要用户或受治理流程确认后，才可追加到 Project Memory。

## 5. 生命周期与保留

Checkpoint 的保留、归档和删除由 Project Memory / Runtime 的治理流程决定，不由 Runtime 自动清理或覆盖历史。持久化、跨设备同步、SQLite、云存储和后台监控不属于当前内存 MVP；未来引入必须经过独立设计、Evidence、安全评审和 Gate。

## 6. 采用边界

本合同采用 ZIP 中有实际价值的追加快照、前序关联、恢复核验和 Projection 分层；没有复制完整聊天记忆、未经验证的自动记忆写入、跨项目事实复制或复杂后台恢复编排。
