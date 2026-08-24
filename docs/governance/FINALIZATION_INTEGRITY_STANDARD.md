# Finalization Integrity Standard

## 1. 目的与边界

本标准规定 AI CTO 如何把已接受、已验证的最终状态转换为用户可见的交付物，减少会话临时方案、被否决内容和措辞纠正进入标题、文件名、注释、Commit、PR、Release 或 Handoff 的风险。

它是现有 Layer 3 Git / Layer 4 Delivery & Release / Layer 5 Skill 入口的横向治理规则，不是新的 Phase、Layer、Module、Capability、Agent、Runtime 或审批系统。

本标准不实现模型切换、工具调用、自动重试、文件扫描、后台监控或执行授权。Phase 8.4 的模型路由治理保持独立。

## 2. Accepted Final State First

最终交付必须优先依据以下事实生成：

1. 当前批准的 Requirement / Design；
2. 用户确认的目标和范围；
3. 实际 Diff、Commit 和变更基线；
4. 测试、Review、Release 或其他 Validation Evidence；
5. 仍然有效的限制、风险、回滚和下一动作。

完整会话记录只是上下文，不是最终事实源。不得从聊天记录逐词删改交付文案来“清理”中间过程；应从 Accepted Final State 重新生成高显著性内容。

## 3. 会话残留与真实变化

### 3.1 默认不进入最终交付

以下内容如果只在会话中出现、未进入实际基线，默认不写入最终交付：

- 被否决或替换的方案；
- 临时草稿和中间尝试；
- 用户的措辞纠正本身；
- 未执行的路径、未采用的命名和内部讨论。

### 3.2 必须保留

以下内容不能为了“避免负向回声”而隐藏：

- 已执行的删除、迁移、发布、发送或外部操作；
- 真实的安全、隐私、法律、兼容性、数据和回滚事实；
- API、Schema、配置、版本或行为的真实破坏性变化；
- 审计、Release、Gate 或用户明确要求的对比记录；
- 实际失败、部分成功、停止和回滚结果。

判断标准不是“是否在会话中出现过”，而是“当前交付面是否需要该事实才能准确、安全、可审计和不误导”。

## 4. 交付表面矩阵

最终检查逐面执行，不以最终聊天回复代替其他表面检查：

| 交付表面 | 最低检查 |
|---|---|
| 文件名 / 标题 | 是否描述最终采用的目标，而不是被否方案 |
| 正文 / 代码注释 | 是否保留必要事实，是否把过程残留写成结果身份 |
| 元数据 / 标签 / 包装 | 是否与最终范围、状态和版本一致 |
| Commit subject / body | 是否来自实际 Diff 和批准范围，是否遗漏真实破坏性变化 |
| PR 标题 / body | 是否与 Commit、Review、Test 和实际基线一致 |
| Release Report / Known Issues | 是否与冻结 Release Version Baseline 和验证证据一致 |
| Handoff / 用户交付说明 | 是否说明当前结果、限制、支持方式和下一动作 |
| Audit / Evidence | 是否保留真实动作和证据，且未把草案冒充事实 |

## 5. Positive Regeneration

当用户否定某个方案时，优先直接描述当前采用的方案：

```text
输入：不要采用方案 B。
最终交付：采用方案 A，原因是……
```

除非用户要求比较，或省略会导致安全、兼容、迁移、审计或事实错误，否则不要把“没有采用方案 B”写进标题、文件名、标签或开篇。不要用同义词、括号、反向说明或“已清理”口号绕过该规则。

## 6. 高保障 Finalization

以下情况使用高保障顺序：Commit、PR、Release、外部发送、生产变更、敏感信息、不可逆或难回滚动作，以及强烈压缩、委托或多阶段交接后的最终交付。

```text
Preflight
  → Freeze accepted surfaces
  → Authorized Action
  → Readback actual result
  → Postflight all readable surfaces
```

规则：

1. Preflight 记录目标、受众、批准基线、必需事实和排除项；
2. Freeze 后不得在执行动作中重新生成发送、Commit、PR 或发布文案；
3. Readback 读取真实生成结果、元数据、Hook 修改和平台包装（如果可访问）；
4. Postflight 重新检查结果与 Handoff；
5. 内容或基线发生变化时，先前检查失效，必须重新检查。

## 7. Evidence、Confidence 与检查器边界

Finalization Integrity 检查应记录：

- Accepted Final State 的来源；
- 实际基线和 Diff 引用；
- 检查过的交付表面；
- 保留的必要事实与理由；
- Readback / Postflight 结果；
- 未能读取或验证的表面；
- Evidence Level、Confidence 和限制。

文本扫描、关键词检查、格式检查或自动评审只能提供 Evidence，不证明语义正确、事实完整或模型行为已经普遍改善。任何扫描通过都不能替代用户验收、Code Review、Security Review、Release Gate 或审计判断。

## 8. 与现有治理的关系

- Layer 2 继续决定项目价值、优先级和资源，不受本标准改变；
- Layer 3 继续由 Requirement、Design、Task、Commit、Test 和 Review 形成工程基线；
- Layer 4 继续由 Testing、Release、Delivery、Rollback 和用户验收决定生命周期授权；
- Layer 5 继续由 Intent、Execution Routing、Runtime、Permission、Budget、Approval 和 Audit 管理受控执行；
- 本标准不授予任何执行、模型切换、Capability 激活或状态推进权限。

## 9. 最小验收清单

- [ ] Accepted Final State 已明确；
- [ ] 实际 Diff / 基线可访问；
- [ ] 文件名、标题、正文、Commit、PR、Release、Handoff 和 Audit 均已按适用性检查；
- [ ] 会话临时方案未被写成最终结果身份；
- [ ] 真实删除、迁移、安全、兼容、审计和外部动作事实未被隐藏；
- [ ] Readback / Postflight 在高保障场景完成，或明确标记 `NOT_CAPTURED`；
- [ ] 未用检查器通过替代任何既有 Gate 或用户决定。
