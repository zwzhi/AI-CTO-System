# Knowledge Registry

本目录保存 AI CTO System 的 Knowledge Registry 元数据和审计索引，不是第十种 Knowledge Type。九类正式 Knowledge Record 仍存放在各自类型目录，Registry 只引用它们，不复制或覆盖正文。

维护规则：

1. Registry 的 Knowledge ID、Type、Source、Evidence、Confidence、Quality Score、Status 和 Record Path 必须与源记录一致。
2. 新记录先完成 Knowledge Admission Review，再以 `CAPTURED` 状态登记。
3. 状态变化必须先写入源记录的 Lifecycle Transition History，再同步 Registry。
4. `VALIDATED` 不等于 `ACTIVE`；`ACTIVE` 需要独立 Activation Review。
5. Registry 不包含 RAG、Embedding、向量索引或自动检索实现。

当前权威索引见 [KNOWLEDGE_REGISTRY.md](./KNOWLEDGE_REGISTRY.md)。
