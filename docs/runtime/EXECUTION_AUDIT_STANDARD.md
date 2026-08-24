# Execution Audit Standard

每次执行记录 Task ID、Intent、Workflow、Agent、Capability、Tool、Model、Reasoning、Context、Permission、Approval、Budget、Result、Evidence、状态转换、失败与回滚。Audit 追加、可追溯、受访问控制；不可用作绕过隐私或保存 Secrets。

## Finalization Integrity

Audit 记录已实际发生的动作、结果、失败、停止、回滚和必要基线变化；会话临时草案、被否方案和未执行路径不得被冒充为最终事实，也不得为了减少交付文本残留而删除审计所需证据。涉及 Commit、PR、Release 或 Handoff 时，可引用 [Finalization Integrity Standard](../governance/FINALIZATION_INTEGRITY_STANDARD.md) 的 Accepted Final State、检查表面、Readback 和 Postflight 证据。
