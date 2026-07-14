# ADR-0015：Intent Gateway Governance

- **状态：** Accepted
- **日期：** 2026-07-14

## 背景

AI CTO 已具备 Capability Governance 与 Execution Routing Governance，但仍需先判断用户输入是否属于 AI CTO、应触发何种治理与何时确认。没有统一入口会导致普通交流被过度治理，或高风险输入未被识别。

## 决策

建立 Layer 5 `Intent Gateway` 文档治理 Module，输出建议性 Intent Classification Result；它与 Execution Routing 分离：前者识别意图、置信度、风险和确认需求，后者决定建议性执行方式。

## 后果

Intent Gateway 不执行、不调用模型或工具、不改变 Codex 行为。Runtime、Classifier、自动执行和训练仍需独立 Evidence、Admission、Architecture Review、必要 ADR 与受影响 Gate。低 Confidence 必须询问，不能强行分类。
