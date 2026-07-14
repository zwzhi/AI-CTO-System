# Intent Conflict Resolution

当输入模糊、多意图、上下文矛盾、项目状态不明或用户纠正先前判断时，输出 `AMBIGUOUS` 或 `INSUFFICIENT_EVIDENCE`，列出候选与缺失信息，并提出最小澄清问题。

示例：“这个系统不太好。”可能是 `BUG_FIX`、`FEATURE_REQUEST` 或 `REFACTOR`；**不能强行判断**。应询问：问题表现是什么、影响谁、是否可复现、希望修复还是改变功能 / 结构？

用户纠正优先于历史分类。多意图应拆分并分别标注 Confidence；高风险候选优先提示风险，但不自动升级为 Incident 或执行路径。
