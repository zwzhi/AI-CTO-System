# ADR-0006：支持已有项目接管

- 状态：Accepted
- 日期：2026-07-13
- 决策者：AI CTO System 项目创建者、AI CTO

## 背景

AI CTO System 已建立从新 Idea 到 Release 的文档、门禁和记忆体系，但已有软件项目通常带有现存代码、生产状态、Git 历史、未提交修改、技术债、过期文档和未知决策。如果强制把它们当作新 Idea，现有事实与历史资产会被忽略；如果直接视为 Maintenance 或 Development，又会在基线、风险和授权不明时开始变更。

AI CTO 必须能够在不伪造历史、不破坏用户现场和不绕过生命周期门禁的前提下，建立可信接管基线。

## 决策

- 增加操作模式 `PROJECT_ONBOARDING_MODE` 和生命周期状态 `EXISTING_PROJECT_ONBOARDING`。
- 已有项目先执行只读扫描、逆向理解、文档恢复、健康评估和迁移门禁，再纳入 AI CTO 管理。
- 所有恢复结论区分 OBSERVED、INFERRED、USER_CONFIRMED、CONFLICTED 与 UNKNOWN，并使用 L1–L4 Confidence 绑定证据。
- 健康评估采用八维 100 分制；分数、Confidence、Evidence Coverage 与风险红线分别判断。
- 接管门禁只允许 `ONBOARDING_COMPLETED` 或 `ONBOARDING_BLOCKED`。
- 已上线且仍运行的项目取得 `ONBOARDING_COMPLETED` 后，可以转入 `MAINTENANCE`。
- `ONBOARDING_COMPLETED` 不是开发、测试、发布或生产变更授权。新功能、重构和迁移仍须满足原有 Evaluation、Design、Development、Testing 与 Release 门禁。
- 接管完成后，只把有证据、可复用、已脱敏且授权允许的经验写入 `memory/knowledge_base/`。

## 选择理由

独立接管状态能把“理解现状”与“改变现状”分离。它允许 AI CTO 先保护 Git 与生产现场，恢复当前事实和可信文档，再决定继续维护、优化、重构、迁移或停止，避免用新项目假设覆盖遗留项目现实。

## 替代方案

- **所有已有项目从 IDEA 开始**：流程统一，但会把事实恢复误当作需求探索，拒绝。
- **收到仓库后直接进入 MAINTENANCE**：速度快，但没有可信状态、文档、健康度和风险基线，拒绝。
- **收到仓库后直接进入 DEVELOPMENT**：能立即修改，但会绕过设计、测试和变更授权，拒绝。
- **仅生成一次扫描报告**：成本低，但无法建立长期状态、记忆、门禁和经验闭环，拒绝。

## 后果

### 正面影响

- AI CTO 可以安全接管遗留、外部和已上线项目。
- 代码、Git、数据库、接口、运行状态和历史不确定性得到统一记录。
- 恢复文档与 Confidence 可以被后续维护和演进复用。
- 健康分、红线和迁移门禁为重构、迁移或停止提供证据。
- 历史项目经验可以进入知识库并保留适用边界。

### 负面影响与风险

- 接管增加扫描、复核和文档恢复成本。
- 证据缺失时可能长期停留在 `EXISTING_PROJECT_ONBOARDING`。
- 健康评分可能被误当作单一决策，需要持续强调 Confidence 与红线分离。
- 恢复文档可能看似完整但仍不代表真实历史，需要显式保留 UNKNOWN 和冲突。

## 后续行动

- 在生命周期、SKILL、PROJECT_STATE、PROJECT_MEMORY 和 Progress 中同步接管规则。
- 使用迁移清单验证 `ONBOARDING_COMPLETED` 与 `ONBOARDING_BLOCKED` 的唯一性。
- 使用压力场景验证紧急客户、负责人指令、历史投入和已上线状态不能绕过接管门禁。
- Phase 6.5 完成后停止，等待用户确认，不进入 Phase 7。
