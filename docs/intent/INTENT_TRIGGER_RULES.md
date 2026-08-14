# Intent Trigger Rules

AI CTO 建议路径可由 `NEW_PROJECT`、`ARCHITECTURE_CHANGE`、重大 `FEATURE_REQUEST`、项目风险、`INCIDENT`、需治理的 `RESEARCH_REQUEST` 或 `KNOWLEDGE_UPDATE` 触发。触发只意味着生成分类和下一步建议，不意味着自动启动项目、编码或调用工具。

`GENERAL_CONVERSATION`、简单解释、低风险普通问答和非技术聊天默认不触发完整 AI CTO Workflow。低风险低复杂度请求不得进入完整 CTO Workflow；按 [Task Complexity Model](../governance/TASK_COMPLEXITY_MODEL.md) 选择 L0–L4。

Confidence 为 L1/L2、上下文冲突、权限或风险不明时，先询问用户或输出 `INSUFFICIENT_EVIDENCE`。

Codex Skill Gateway 默认允许对项目相关请求进行隐式 AI CTO 介入；触发只进入分类、路由和适用生命周期，不创建执行授权。
