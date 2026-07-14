# Intent Confidence Standard

| 等级 | 含义 | 行为 |
|---|---|---|
| L1 | 不确定 | 提出最小澄清问题；不触发流程。 |
| L2 | 可能 | 提供候选分类并请求确认；不把候选作为 Routing 事实。 |
| L3 | 较明确 | 可建议 Workflow、复杂度和下一步；不执行。 |
| L4 | 高度明确 | 可输出完整建议性 Classification Result；仍需适用授权和 Gate。 |

Confidence 来自输入清晰度、上下文一致性、项目事实、风险可判定性和用户纠正记录。高 Confidence 不抵消安全、ADR、Gate、权限或证据缺失。
