# Intent Gateway Standard

Intent Gateway 判断用户“想做什么、是否属于 AI CTO、是否需要确认”；它不执行任务。输入为 `User Input`、`Conversation Context`、`Project Context`；输出为 `Intent Classification Result`：Intent Type、Confidence、Risk Level、Suggested Workflow、Required Capability、AI CTO Trigger、Confirmation Required、Evidence、Escalation Conditions。

Intent Gateway 将分类、风险与复杂度候选交给 [Execution Routing Governance](../governance/EXECUTION_ROUTING_GOVERNANCE_STANDARD.md)，由后者建议如何执行。Codex 的 [AI CTO Automatic Intervention Standard](./AI_CTO_AUTO_INTERVENTION_STANDARD.md) 只定义 Skill 入口、目标项目解析和生命周期续接，不替换 Intent 分类，也不执行任务。二者均不调用模型、Skill、Tool、Git 或外部服务，不覆盖安全、ADR、Gate、权限或当前用户指令；分类不构成执行授权。

结果只使用 `CLASSIFIED`、`AMBIGUOUS`、`OUT_OF_SCOPE`、`INSUFFICIENT_EVIDENCE`。不确定或冲突时必须询问或升级，不得强行分类。
