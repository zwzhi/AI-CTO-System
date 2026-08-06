# CAP-DOC-0001 · Deterministic Evidence-driven Documentation Assistant

## Registry Record

| Field | Value |
|---|---|
| Capability ID | `CAP-DOC-0001` |
| Name | Deterministic Evidence-driven Documentation Assistant |
| Type | Documentation Capability |
| Description | 基于请求内显式授权的内存来源，以确定性方式生成可追溯文档草案；不读取或写入文件，不调用外部能力。 |
| Purpose | 将已批准目标和授权 Evidence 转换为供人工审阅的 Draft Package，降低文档草拟成本并保留来源边界。 |
| Source | AI CTO System 内部 TypeScript：`runtime/capability/documentation-execution-contract.ts`、`documentation-capability-adapter.ts`、`documentation-invocation-port.ts`、`deterministic-documentation-assistant.ts`、`runtime/services/documentation-capability-runtime-service.ts` |
| Version | `1.0.0-internal` |
| Source Commit | `9876764` |
| Artifact | 当前仓库内上述 TypeScript 源文件和 `runtime/tests/documentation-capability.test.ts` |
| License | `INTERNAL_USE_ONLY`；不是开源 License，不授权公开分发、商业再许可、外部打包或跨组织共享 |
| Applicable Layer | Layer 5 Capability Governance；可服务 Layer 2、3、4 的受控文档任务 |
| Applicable Phase | `RESEARCH`、`EVALUATION`、`DESIGN`、`DEVELOPMENT`、`TESTING`、`RELEASE`、`MAINTENANCE` |
| Input | 明确授权的内存 Source Scope、Task Objective、Execution Context、Permission Grant、Budget Snapshot |
| Output | Draft、Source References、Confidence、Evidence、Limitations；无写入副作用 |
| Dependencies | Node.js 24、现有 Permission/Budget Guard、Audit、Documentation Adapter 与 Runtime Service |
| Permission Requirement | 仅 `GENERATE_DRAFT`；无文件、网络、Provider、Tool、Knowledge 或项目状态写权限 |
| Status | `EVALUATING` |
| Quality Score | `84/100`；Confidence `L3`；基线日期 2026-08-06 |

## Provenance 与使用条款

- Provider：`NONE`。
- Publisher / Owner：AI CTO System 项目所有者。
- Provenance：项目内部实现，Source Commit `9876764` 已在当前分支验证存在且源文件无漂移。
- Usage Terms：`INTERNAL_USE_ONLY`，仅限 AI CTO System 当前仓库、内部非生产、受控 Runtime 评估。
- Attribution Requirement：内部审计记录必须保留 Capability ID、版本和 Source Commit。
- Commercial Restriction：当前未授予外部分发或商业再许可权。
- 重新评审触发器：外部发布、Provider 接入、第三方依赖、源文件变化、权限扩大或所有权变化。

## 风险、权限与兼容性

| Domain | Record |
|---|---|
| Risk Level | Low，仅适用于当前确定性、只读、内存来源和非生产范围 |
| Security Review | 当前实现无文件、网络、Provider、Tool、Knowledge 或 Workflow 隐式副作用；调用级审批桥尚在实现中 |
| Compatibility | Node.js 24、现有 Runtime Foundation、Capability Adapter、Audit、Permission/Budget Guard |
| Maintenance | 内部维护；缺少长期版本历史、并发、持久化和大规模样本 Evidence |
| Cost | 确定性本地执行；模型、Token、网络和第三方 API 成本为 0 |
| Latency | 仅本地同步执行基线；未建立生产延迟 SLO |
| Human Control | `CONFIRM_REQUIRED`，每次调用必须单独绑定当前任务和来源范围 |
| Selection | `PROHIBITED`（当前 Status 为 `EVALUATING`） |
| Activation Scope | `NONE` |

## Evaluation

- Evaluation Result：`PASS`，但当前只完成能力本体评估，不等于激活。
- Admission Result：`ADMIT_FOR_EVALUATION`。
- Quality Score：`84/100`，Confidence `L3`。
- Evaluation Evidence：[Documentation Capability Evaluation](../../docs/capability/DOCUMENTATION_CAPABILITY_EVALUATION.md)。
- 激活前置：审批绑定 Runtime 桥、Source Scope Fingerprint、失败/取消/重放路径和全量回归必须全部通过。

## Activation、Fallback 与停止条件

- 当前不允许项目执行或默认选择。
- 未来仅允许 `INTERNAL_LOCAL`、`GENERATE_DRAFT`、显式确认、授权内存来源、只返回 Draft Package 的受限范围。
- Fallback：拒绝执行并回到人工草拟；不切换 Provider，不生成无 Evidence 替代结果。
- Emergency Disable：出现未授权来源、写入副作用、Evidence 漂移、Source Commit 变化或权限越界时立即停止选择并重新进入评估。
- Rollback：将 Registry 状态保持或恢复到 `EVALUATING`，撤销任务级选择资格；当前无持久化外部状态需要回滚。

## Review

| Field | Value |
|---|---|
| Last Review | `2026-08-06T00:00:00.000Z` |
| Next Review | `2026-09-05T00:00:00.000Z` |
| Human Approver | 项目所有者已批准本次设计与实施计划；最终激活仍以实现 Gate Evidence 为条件 |
| Blockers | 审批执行桥、15 项专项测试、165 项全量回归和最终范围扫描尚未完成 |
| Next Action | 在隔离分支按 `SYS-L5-DOC-ACT-001` 实现并验证受控审批后执行闭环 |

## Change History

| Time | Transition | Evidence |
|---|---|---|
| 2026-08-06 | `ABSENT -> DISCOVERED` | 已确认内部 Capability Identity、Source、Version、Usage Terms 和用途 |
| 2026-08-06 | `DISCOVERED -> EVALUATING / ADMIT_FOR_EVALUATION` | 84/100、L3 评估基线；批准在隔离分支实现审批绑定桥 |

