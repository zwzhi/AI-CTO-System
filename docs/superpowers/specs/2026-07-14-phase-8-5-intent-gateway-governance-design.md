# Phase 8.5 Intent Gateway Governance 设计规格

## 目标

建立 Layer 5 的 `Intent Gateway` 文档治理模块，使未来 AI CTO 能把用户输入、对话上下文和项目上下文转换为建议性的 `Intent Classification Result`，判断是否属于 AI CTO 职责范围、是否触发 AI CTO、需要何种置信度与何时询问用户。

## 职责边界

- Intent Gateway 负责识别和分流“用户想做什么”。
- Execution Routing Governance 负责在已分类任务后建议“如何执行”，包括复杂度、Workflow、Capability、Skill、Tool、Model、Reasoning 与 Context。
- 两者都只输出建议，不调用模型、Skill、Tool、Git、MCP 或外部服务，不改变 Codex 行为，也不自动执行任务。
- Intent Gateway 不替代 Layer 2 项目决策、Layer 3 工程设计或 Layer 4 Gate；高置信度分类不构成执行授权。

## 输入与输出

输入：`User Input`、`Conversation Context`、`Project Context`。

输出：`Intent Classification Result`，至少含 `Intent Type`、`Confidence`、`Risk Level`、`Suggested Workflow`、`Required Capability`、`AI CTO Trigger`、`Confirmation Required`、`Evidence`、`Escalation Conditions`。

分类不确定、冲突、超出职责或证据不足时，使用 `AMBIGUOUS`、`OUT_OF_SCOPE` 或 `INSUFFICIENT_EVIDENCE`，不得强行归类。

## 分类体系

必含：`NEW_PROJECT`、`FEATURE_REQUEST`、`BUG_FIX`、`INCIDENT`、`REFACTOR`、`ARCHITECTURE_CHANGE`、`RESEARCH_REQUEST`、`KNOWLEDGE_UPDATE`、`PROJECT_STATUS_QUERY`、`GENERAL_CONVERSATION`。每类定义描述、识别特征、示例与默认复杂度。

## 置信度与触发

- L1：不确定，必须提问或保持不触发。
- L2：可能，需要确认后才建议进入流程。
- L3：较明确，可建议流程与下一步，但不执行。
- L4：高度明确，可输出完整建议性分类与路由输入，仍保留 Gate 和授权。

低风险、低复杂度的普通问答、解释与非技术聊天不进入完整 AI CTO Workflow。新项目、架构变化、重大功能、项目风险和生产 Incident 可触发 AI CTO 建议路径。

## Intent 到 Execution Routing

Intent Gateway 输出任务类型、风险、置信度与候选复杂度；Execution Routing 再依据这些输入选择 Workflow 与资源建议。示例：`NEW_PROJECT → L4 → CTO Workflow → Research + Product + Architecture Capability`；`BUG_FIX → L1/L2 → Instant 或 Engineering Workflow → Engineering / Testing Capability`。若 Intent 置信度不足，禁止把不确定分类当作 Routing 事实。

## Evidence 与主动介入

Intent Evidence 记录 User Input、Detected Intent、Confidence、Actual Result、Correction、Evidence 和适用边界。单案例不能成为自动分类或默认路由规则。

主动介入只能在用户已表达明确开发需求、项目风险或治理需要时，提供适度建议；禁止无依据地把模糊抱怨、普通交流或非技术聊天升级为复杂改造。

## 文档组成

1. Intent Gateway 总体规范。
2. Intent 分类、触发、置信度、映射、冲突、主动介入和 Evidence 七份规则。
3. ADR-0015。
4. Master Plan、SKILL、Module Registry、Project Memory、Development Progress 同步。

## 明确排除

- 不开发 Runtime、Intent Classifier、Agent、模型调用、工具调用、MCP、自动化或自动任务执行。
- 不修改 Codex 执行行为，不训练、评测或部署 Intent 模型。
- 不进入 Phase 8.6。

## 验收标准

1. 八份 Intent 规则、ADR-0015 和五个治理入口同步存在。
2. Registry 中 Intent Gateway 为 Layer 5 `Completed` 文档治理模块；Runtime / Classifier 不存在且不被宣称完成。
3. 每项规则明确低置信度询问、低风险不过度触发、冲突不强行分类，以及分类不等于执行授权。
4. Intent 与 Execution Routing 的输入 / 输出关系可追溯且不重复职责。
5. Markdown 链接、结构断言和 Git 差异校验通过。
