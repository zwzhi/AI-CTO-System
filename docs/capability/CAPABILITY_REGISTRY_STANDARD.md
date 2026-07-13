# Capability Registry 标准

## 1. 目的

Capability Registry 是 AI CTO 可使用能力的权威目录。所有进入评估、激活、选择、弃用或移除流程的 Capability 都必须注册；未注册能力不得被选择、调用或作为默认依赖。

Registry 记录描述事实和状态，不自动授予调用权限。实际调用还必须满足当前项目、任务、风险、权限和人类授权。

## 2. 存储与标识

正式记录存放在 `capabilities/{type}/`，每项能力使用一个 Markdown Record。Capability ID 使用：

- Engineering：`CAP-ENG-XXXX`
- Testing：`CAP-TST-XXXX`
- Security：`CAP-SEC-XXXX`
- Deployment：`CAP-DEP-XXXX`
- Research：`CAP-RSH-XXXX`
- Documentation：`CAP-DOC-XXXX`
- Data：`CAP-DAT-XXXX`
- AI Model：`CAP-AIM-XXXX`

ID 永久唯一，不因名称、来源或版本改变而复用。移除后保留 Tombstone，避免历史调用失去追溯。

## 3. 必填字段

| Field | 要求 |
|---|---|
| Capability ID | 稳定唯一 ID |
| Name | 清晰能力名称，不只写产品名 |
| Type | 八种规范 Type 之一 |
| Description | 能力行为、边界和非目标 |
| Purpose | 使命贡献与核心使用价值 |
| Source | 内部位置、外部仓库 / 供应商及来源证据 |
| Version | 精确版本、Commit、模型 ID 或不可变标识 |
| License | License 名称、版本、验证状态和证据 |
| Applicable Layer | 可以服务的 Layer；不改变 Layer 5 治理归属 |
| Applicable Phase | 适用 Lifecycle Stage / 工作阶段；不是架构 Phase 或授权 |
| Input | Schema、格式、大小、敏感级别与前置条件 |
| Output | Schema、格式、Evidence、副作用与失败输出 |
| Dependencies | Runtime、服务、模型、网络、数据和其他 Capability |
| Permission Requirement | 文件、网络、凭据、数据、执行、写入和生产权限 |
| Status | 六种 Capability Lifecycle Status 之一 |
| Quality Score | 0–100、评估基线、日期、Evidence 和 Confidence |

## 4. 扩展字段

同时记录 Owner、Publisher、Provenance、Artifact Hash、Risk Level、Security Review、Compatibility Matrix、Maintenance State、Cost、Latency、Evaluation Result、Activation Approval、Allowed Projects / Environments、Selection Constraints、Fallback、Replacement、Monitoring、Incident、Last Review、Next Review 和 Change History。

未知字段写 `UNKNOWN`，不留空或编造。敏感凭据不得写入 Registry；只记录受控密钥引用和权限范围。

## 5. Applicable Phase 解释

由于 Phase 在 AI CTO System 架构中只表示历史交付标签，Registry 的 `Applicable Phase` 字段只保存能力适用的工作 / 生命周期上下文，例如：`RESEARCH`、`DESIGN`、`DEVELOPMENT`、`TESTING`、`RELEASE`、`MAINTENANCE` 或 `ALL`。它不能成为 Module 归属、生命周期转换或调用授权。

## 6. 记录状态与版本

- 每次 Source、Version、License、合同、依赖、权限、质量或风险变化都创建不可覆盖的 Change History。
- 版本变化默认使旧 Evaluation 和 Activation Approval 失效；经影响分析证明不受影响的项目必须记录理由。
- Registry Status 只使用 `DISCOVERED`、`EVALUATING`、`ACTIVE`、`DEPRECATED`、`DISABLED`、`REMOVED`。
- Dashboard、Selector 和未来 Runtime 只能读取 Registry，不能直接改写权威记录。

## 7. 完整性与审计

Registry Owner 定期检查重复 ID、未知 License、过期评估、无 Owner、过度权限、失联来源、版本漂移、未关闭 Incident 和无消费者的能力。任一关键字段未知或证据过期时不得保持默认选择资格；按风险转入 `EVALUATING`、`DISABLED` 或 `DEPRECATED`。

## 8. Registry 与 Technical Asset Registry

Capability Registry 管理“AI CTO 可以调用什么及其权限状态”；Technical Asset Registry 管理“哪些技术资产适合复用”。Capability 可以引用一个或多个 Technical Asset，但 `APPROVED_FOR_REUSE` 不等于 Capability `ACTIVE`，Capability 高分也不自动批准资产复用。
