# ADR-0005：Testing 与 Release 授权分离

- 状态：Accepted
- 日期：2026-07-13
- 决策者：AI CTO System 项目创建者、AI CTO

## 背景

Phase 5 已将 DEVELOPMENT 完成与进入 TESTING 的授权分离。Phase 6 同时需要验证从 Development 基线到可发布版本的端到端条件，以及记录 TESTING → RELEASE 的正式生命周期转换。如果把“Development → Release”解释为直接跳过 TESTING，系统测试、AI 效果评测、安全审核、用户验收和部署回滚验证将失去独立门禁。

## 决策

- 保持标准生命周期 `DEVELOPMENT → TESTING → RELEASE`，禁止直接从 DEVELOPMENT 跳转到 RELEASE。
- [Development Approval Gate](../development/DEVELOPMENT_APPROVAL_GATE.md) 仍是 DEVELOPMENT → TESTING 的唯一授权，结果为 `APPROVED_FOR_TESTING` 或 `CHANGES_REQUIRED`。
- [Release Approval Gate](../release/RELEASE_APPROVAL_GATE.md) 评估从获批 Development 基线到可发布候选的端到端条件，包括测试、Bug、安全、AI 评测、UAT、部署、回滚和监控。
- [Testing Release Gate](../release/TESTING_RELEASE_GATE.md) 是 TESTING → RELEASE 的阶段转换记录；只有 Release Approval Gate 对同一精确基线给出 `READY_FOR_RELEASE`，才能转换状态。
- `READY_FOR_RELEASE` 只表示获准进入 RELEASE 并执行部署，不表示部署成功、上线观察完成、项目交付或进入 MAINTENANCE。
- `CHANGES_REQUIRED` 表示存在可在当前授权范围内修订的缺口；`BLOCKED` 表示当前无法安全评审或推进，需要外部状态变化、重大决策或退回前序阶段。

## 选择理由

该方案保留各阶段单一职责：Development 证明实现可测，Testing 证明质量和验收，Release 管理部署、观察与回滚。两个门禁共享同一版本基线和证据链，但不会把测试通过、发布授权与部署成功混为一个状态。

## 替代方案

- 直接 DEVELOPMENT → RELEASE：流程更短，但会绕过正式 TESTING，拒绝。
- 只保留一个 Release Gate：文档较少，但难以区分端到端发布条件与生命周期状态转换，拒绝。
- 测试通过即自动发布：无法覆盖安全、UAT、部署、回滚和监控，拒绝。

## 后果

### 正面影响

- 每个状态转换都有唯一授权记录和精确版本基线。
- 测试、AI 效果、安全、验收与部署风险可独立阻断发布。
- 发布授权、部署结果和上线稳定性可以分别审计。

### 负面影响与风险

- 需要维护 Release Approval Gate 与 Testing Release Gate 两份关联记录。
- 基线变化会使测试、安全、验收和发布授权失效，需要重新评审。
- 门禁成本增加，需要明确 Gate Owner 和证据自动化边界。

## 后续行动

- 在 SKILL、生命周期、阶段清单、文档关系、PROJECT_STATE 和 PROJECT_MEMORY 中同步该授权边界。
- 使用 Release Report 记录实际部署、监控、回滚和下一动作。
- Phase 6 完成前执行压力场景，确认紧急窗口、权威压力和已有投入不能绕过门禁。
