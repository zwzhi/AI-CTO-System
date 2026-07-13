# Testing Release Gate

## 1. 目的与唯一授权边界

本门禁是 TESTING → RELEASE 阶段转换的实际授权包装器。它不重新发明发布标准，而是核验前序授权链、当前阶段、冻结基线和 Testing 完成证据，并强制引用按 [Release Approval Gate](./RELEASE_APPROVAL_GATE.md) 形成的当前有效结果。

本门禁遵循 [项目生命周期](../protocol/PROJECT_LIFECYCLE.md) 与 [阶段门禁检查清单](../evaluation/PHASE_GATE_CHECKLIST.md)。前序授权使用 [Development Approval Gate](../development/DEVELOPMENT_APPROVAL_GATE.md)，安全结论遵循 [安全评审标准](../testing/SECURITY_REVIEW_STANDARD.md)，实质发布判定来自 [Release Approval Gate](./RELEASE_APPROVAL_GATE.md)，分层授权决策见 [ADR-0005](../adr/ADR-0005-TESTING-AND-RELEASE-AUTHORIZATION.md)。

只有本门禁针对当前精确 Release Version Baseline 确认结果为 `READY_FOR_RELEASE`，才可将 `PROJECT_STATE.Current Stage` 从 `TESTING` 更新为 `RELEASE`。任何其他结果、文档、测试报告、口头同意、自动化状态或历史记录都不授权该转换。

本门禁授权进入 RELEASE 阶段，不表示候选版本已经部署、已对外发布、数据迁移已执行、流量已切换、发布验证已通过或版本已进入 MAINTENANCE。

## 2. 不可跳过的生命周期顺序

必须完整执行并记录以下顺序：

1. [Development Approval Gate](../development/DEVELOPMENT_APPROVAL_GATE.md) 对精确 Development 基线给出有效 `APPROVED_FOR_TESTING`。
2. `PROJECT_STATE` 以该记录为证据从 DEVELOPMENT 转为 TESTING，并记录 Confidence、Evidence、Next Action；PROJECT_MEMORY 同步摘要。
3. 在 TESTING 阶段按批准范围和候选基线完成全部 Testing、Bug 关闭、安全评审、用户验收、部署 / 回滚准备、AI 评测（适用时）与监控准备。
4. [Release Approval Gate](./RELEASE_APPROVAL_GATE.md) 针对同一 Release Version Baseline 给出 `READY_FOR_RELEASE`。
5. 本门禁核验上述链条和当前性，记录 `READY_FOR_RELEASE` 后才执行 TESTING → RELEASE。

即使全部 Testing 证据提前存在，只要当前 `PROJECT_STATE` 仍为 DEVELOPMENT，仍必须先凭有效 `APPROVED_FOR_TESTING` 完成独立的 DEVELOPMENT → TESTING 转换。本门禁禁止 DEVELOPMENT → RELEASE、DESIGN → RELEASE 或任何补写式、倒推式阶段跳跃。

## 3. 门禁结果

本门禁沿用 Release Approval Gate 的三个唯一结果，不创建别名、条件授权或第四种状态：

| Gate Result | 使用条件 | 是否授权 `PROJECT_STATE` 转为 RELEASE |
|---|---|---|
| `READY_FOR_RELEASE` | 本门禁全部检查 PASS；Release Approval Gate 对同一精确基线为当前有效 `READY_FOR_RELEASE`；硬阻断为 0 | 是 |
| `CHANGES_REQUIRED` | 没有硬阻断，但有可在当前批准方向和可控范围内关闭的测试、Bug、安全、验收、部署或证据缺口 | 否 |
| `BLOCKED` | 缺少前序授权、当前阶段错误、基线无法建立、Release Gate 为 `BLOCKED`，或存在无法在当前范围 / 权限内安全解除的硬阻断 | 否 |

如果 Release Approval Gate 为 `CHANGES_REQUIRED` 或 `BLOCKED`，本门禁必须记录相同结果，不能上调。若 Release Approval Gate 为 `READY_FOR_RELEASE`，但包装器发现授权链、阶段、基线或记录当前性失败，本门禁按问题性质记录 `CHANGES_REQUIRED` 或 `BLOCKED`，不得转换阶段。

## 4. 角色与职责

| 角色 | 职责 |
|---|---|
| Testing Release Gate Owner | 冻结包装器输入，核验授权链与逐项状态，确认唯一结果并执行获准的状态更新 |
| Test Owner | 证明完整 Testing 证据、环境、数据与候选基线一致，所有必需测试已完成 |
| Release Gate Owner | 提供当前 Release Approval Gate Record、Release Version Baseline 和逐项结论 |
| Development Gate Owner / Development Owner | 证明 `APPROVED_FOR_TESTING` 当前有效，Testing 期间修订未绕过重新授权 |
| Security Reviewer | 证明 Security Result 为当前基线的 `APPROVED` |
| UAT Owner / 用户或业务责任人 | 证明用户验收范围、版本、执行和签署完成 |
| Deployment / Rollback Owner | 证明部署与回滚方案完整、可执行并对应候选基线 |
| State Record Owner | 更新 PROJECT_STATE 和 PROJECT_MEMORY，保存转换前后证据与下一动作 |

Gate Owner 不能通过重命名状态、风险接受、降低 Bug 优先级、删减 Testing 范围或引用旧版本记录消除失败项。

## 5. 强制输入

发起 Testing Release Gate 时必须提供以下输入，且全部可访问、版本化、状态明确：

1. 当前有效的 Development Gate Record，结果精确为 `APPROVED_FOR_TESTING`，包含获准范围、源 / 内容基线、文档基线、Test Case 基线、Testing 环境、Test Owner 和第一项 Next Action。
2. `PROJECT_STATE` 的 DEVELOPMENT → TESTING 转换记录和当前快照；Current Stage 必须精确为 TESTING。
3. PROJECT_MEMORY 与 Progress 的 Testing 摘要、决定、风险、证据和下一动作记录。
4. Release Version Baseline Manifest，以及其与 `APPROVED_FOR_TESTING` 基线的精确对应关系；Testing 中的任何内容变化须有返回 DEVELOPMENT、重新授权并再次进入 TESTING 的记录。
5. 完整 Testing Plan、Test Case、Test Report、原始结果、环境、数据、执行人、执行时间和失败 / 重试 / N/A 处置。
6. Bug Register 及 P0 / P1 全部关闭证据。
7. 当前 Release Version Baseline 的 Security Review Record，Security Result 必须为 `APPROVED`。
8. 当前候选版本的 UAT 计划、执行证据、发现关闭和有权限的验收签署。
9. 完整且已验证可执行的部署方案和回滚 / 恢复方案。
10. AI 项目的正式 AI Evaluation Report，或非 AI 项目有效 N/A；同时提供监控与响应就绪证据。
11. 当前 [Release Approval Gate](./RELEASE_APPROVAL_GATE.md) Record，结果、逐项证据、硬阻断和生效基线完整。
12. 拟写入 PROJECT_STATE 的 Confidence、Evidence、Next Action，以及拟写入 PROJECT_MEMORY 的转换摘要。

任一强制输入缺失、不可访问、版本不明、混用基线或状态不一致时，不得记录 `READY_FOR_RELEASE`。

### 5.1 强制输出

每次执行必须形成以下输出，不能只更新一个状态字段：

- `READY_FOR_RELEASE`、`CHANGES_REQUIRED` 或 `BLOCKED` 三者之一的不可覆盖 Testing Release Gate Record；
- Release Version Baseline、逐项检查结论、硬阻断数量、Evidence、责任人与 Next Action；
- PROJECT_STATE 的 Current Stage、Confidence、Evidence、Next Action 更新，以及 PROJECT_MEMORY 与 Progress 摘要；
- 通过时的 RELEASE 环境、执行责任人、第一项受控部署动作与停止条件；
- 未通过时的 Issue / Bug / Finding / Change、生命周期落点、修订或解除阻断条件和重新评审要求；
- 明确的“已部署 / 已发布”字段，门禁时固定为 `NO`。

## 6. 包装器逐项检查

### 6.1 Development 授权链与阶段状态

- `APPROVED_FOR_TESTING` 来自 [Development Approval Gate](../development/DEVELOPMENT_APPROVAL_GATE.md)，Gate Record ID、结果、范围和基线可核验。
- `PROJECT_STATE` 已引用该记录完成 DEVELOPMENT → TESTING，当前 Current Stage 为 TESTING；没有跳过、补写或倒推记录。
- `APPROVED_FOR_TESTING` 批准后的任何源、配置、依赖、Schema、模型 / Prompt、工具权限、文档或 Test Case 基线变化均已按生命周期重新授权。
- PROJECT_STATE、PROJECT_MEMORY、Progress、Development Gate、Test Report 和 Release Gate 对阶段、范围与版本的描述一致。

### 6.2 Release Version Baseline 一致

- Release Candidate ID、拟发布版本、不可变源修订 / 内容摘要、制品摘要、配置、依赖、数据、AI、环境和文档 / 证据版本完整。
- 拟发布制品可追溯到获准 Testing 基线；Testing、Security、UAT、Deployment、Rollback、AI Evaluation 和 Monitoring 均引用同一 Manifest。
- Test Report 中的实际测试对象与拟进入 RELEASE 的制品相同；不存在未测试的重建、重新打包、配置漂移或环境差异。
- Release Approval Gate 的生效基线与本门禁冻结基线逐字段一致，且批准后未触发失效条件。

### 6.3 Testing 状态

- 全部必需功能、非功能、系统、集成、端到端、兼容、性能 / 容量、可靠性 / 恢复、安全、回归及适用 AI 测试实际完成。
- 必需 Test Case 的 PASS 结论对应当前候选基线；FAIL、BLOCKED、INVALIDATED 和未获批准的 NOT_RUN / SKIPPED 数量均为 0。
- 测试证据包含环境、数据、步骤、预期、实际、执行人、时间和原始记录；重试、不稳定和 N/A 处置符合 Release Approval Gate。
- Testing 范围和验收标准全部关闭，没有把开发级测试、局部演示或自动化汇总当作完整 Testing。

### 6.4 Bug 状态

- Bug 优先级映射已冻结为 P0 Blocker、P1 Critical、P2 Major、P3 Minor，且未在门禁时降级；P0 Blocker 与 P1 Critical 未关闭、重开、待验证数量均为 0。
- 每个已关闭 P0 / P1 Bug 有当前候选版本的修复、Review、定向测试、回归和关闭证据。
- 保留的 P2 / P3 不破坏测试、安全、UAT、数据完整性、回滚或核心用户旅程，并有 Owner、期限、监控和有权接受记录。

### 6.5 安全状态

- Security Review Record 按[安全评审标准](../testing/SECURITY_REVIEW_STANDARD.md)覆盖 API Key、用户数据、权限、第三方、数据存储和日志敏感信息。
- Security Result 精确为 `APPROVED`，基线与 Release Version Baseline 一致，硬阻断和未关闭 CRITICAL / HIGH 均为 0。
- 安全批准后的代码、配置、依赖、数据流、权限、第三方、日志或环境变化均已重新评审；新漏洞或事件未使批准失效。

### 6.6 验收状态

- UAT 必需场景在当前候选版本实际执行并 PASS，发现已按优先级关闭。
- 用户 / 业务责任人的签署明确引用当前范围、候选版本和结果；Development Gate 的 Testing 范围确认不冒充 UAT。
- 若 UAT 否定核心范围、价值或业务规则，项目已按生命周期退回相应阶段，不能进入 RELEASE。

### 6.7 部署与回滚状态

- 部署方案包含候选制品、目标环境、前置条件、权限、依赖、配置、数据迁移、步骤、责任人、窗口、通信、成功 / 停止条件和发布后验证。
- 回滚方案包含触发器、决策人、旧版本 / 配置、数据备份与恢复、反向迁移或等价恢复、步骤、时限、通信和回滚后验证。
- 部署与回滚均通过演练、预演、等价验证或逐步复核证明可执行；破坏性 / 不可逆变更有可信恢复与遏制路径。
- 目标环境、权限、第三方和发布窗口仍可用，方案版本与 Release Version Baseline 一致。

### 6.8 AI 评测与监控状态

- AI 项目正式评测的模型、Prompt、检索数据、工具、权限、评测集和阈值与候选基线一致，全部发布硬阈值 PASS；非 AI 项目有有效 N/A。
- 关键用户、业务、可用性、错误、容量、依赖、数据、安全和适用 AI 质量指标可观测。
- Dashboard 或等价入口、告警、值守、升级、运行手册、发布后观察和停止 / 回滚信号均已验证就绪。
- 监控日志和告警数据符合安全 `APPROVED` 基线，不引入新的秘密或用户数据泄露。

### 6.9 Release Approval Gate 当前有效

- Release Gate Record 结果精确为 `READY_FOR_RELEASE`，全部逐项结论 PASS，硬阻断为 0。
- Record 引用当前 `APPROVED_FOR_TESTING`、TESTING 状态证据、Release Version Baseline、Security `APPROVED`、UAT、部署、回滚、AI 评测与监控证据。
- Gate Result 未过期、未被新记录取代，且第 6.2 节基线核对后没有任何失效触发器。
- Record 明确声明 PROJECT_STATE 仍为 TESTING、已部署 / 已发布为 `NO`，并把本 Testing Release Gate 作为实际阶段转换入口。

## 7. 硬阻断项

出现以下任一情况，本门禁结果必须为 `BLOCKED`，且不得修改 PROJECT_STATE 为 RELEASE：

- `APPROVED_FOR_TESTING` 缺失、无效、对应旧基线，或 DEVELOPMENT → TESTING 状态转换证据不存在。
- 当前 `PROJECT_STATE.Current Stage` 不是 TESTING，尤其是仍处于 DEVELOPMENT 或已经无证据地写成 RELEASE。
- Release Version Baseline 无法唯一确定、来源 / 制品完整性无法证明，或测试对象与拟发布对象不同。
- Release Approval Gate 为 `BLOCKED`，或其硬阻断、授权链、基线与当前性记录无效。
- 存在开放 P0 Bug、安全硬阻断、灾难性数据风险、核心范围被 UAT 否定或适用红线禁止发布。
- 关键 Testing 无法可信执行，或破坏性 / 不可逆变更没有安全回滚、恢复或遏制路径。
- 必要发布权限、目标环境、关键责任人、外部依赖或监控 / 响应能力不可获得，且当前授权范围内无可验证替代方案。

Release Approval Gate 为 `CHANGES_REQUIRED`、必需测试失败、P1 Bug 未关闭、安全结果为 `CHANGES_REQUIRED`、UAT 未完成或部署准备缺口，在未触发上述硬阻断时，本门禁为 `CHANGES_REQUIRED`。所有未通过情况都禁止阶段转换。

## 8. 执行流程

1. Testing Release Gate Owner 冻结第 5 节全部输入、Release Candidate 与 Release Version Baseline。
2. 核验 Development Gate Record 与 PROJECT_STATE，证明 DEVELOPMENT → TESTING 已合法完成且授权仍对应当前候选基线。
3. Test、Quality、Security、UAT、Deployment、Rollback、AI Evaluation 与 Monitoring 责任人分别确认第 6 节状态和证据。
4. 核验 Release Approval Gate Record 的结果、逐项结论、硬阻断、生效基线和当前性。
5. 复算必需测试、P0 / P1 Bug、安全发现、UAT、AI 阈值、部署 / 回滚 / 监控缺口、基线不一致和硬阻断数量。
6. Gate Owner 只记录三个结果之一。仅当结果为 `READY_FOR_RELEASE` 时，执行第 9 节状态更新。
7. 保存不可覆盖的 Testing Release Gate Record；复审创建新 Record ID 并引用上一记录。

## 9. `READY_FOR_RELEASE` 的状态更新

只有全部检查 PASS、Release Approval Gate 为当前有效 `READY_FOR_RELEASE` 且硬阻断为 0 时，State Record Owner 才能：

1. 将 `PROJECT_STATE.Current Stage` 从 `TESTING` 更新为 `RELEASE`。
2. 更新 Confidence，并在 Evidence 中引用 Development Gate Record、Testing 完成证据、Security Review Record、UAT、Deployment / Rollback、AI Evaluation / N/A、Monitoring、Release Gate Record 和本 Gate Record。
3. 将 Next Action 写为受控发布活动中的第一项具体动作，包含 Owner 与 Completion Condition；不得写成“已发布”。
4. 在 PROJECT_MEMORY 的“历史修改”和“当前状态”记录阶段转换、Release Version Baseline、已知限制、剩余风险和下一动作。
5. 保持发布执行记录、部署结果、回滚结果和发布后指标为待实际活动产生的证据，不得在门禁时预填成功。

结果为 `CHANGES_REQUIRED` 或 `BLOCKED` 时，Current Stage 保持 TESTING，或按问题性质以单独证据退回 DEVELOPMENT / 更早阶段；不得把失败结果与 RELEASE 状态同时记录。

## 10. 门禁记录格式

### 10.1 基本信息

| 字段 | 必须记录的内容 |
|---|---|
| Testing Release Gate Record ID | 唯一、不可复用标识 |
| 项目与范围 | 版本化范围与非范围 |
| Development Gate Record | 当前 `APPROVED_FOR_TESTING` ID 与链接 |
| TESTING 状态记录 | DEVELOPMENT → TESTING 转换与当前状态链接 |
| Release Gate Record | 当前 Gate ID、结果与链接 |
| Release Candidate / Version | 唯一候选标识与拟发布版本 |
| Release Version Baseline | Manifest、源 / 内容与制品不可变摘要 |
| Gate Owner / State Record Owner | 姓名或有权限责任角色 |
| 执行时间 | 含时区时间戳 |
| 上一记录 | 记录链接；首次为 `NONE` |

### 10.2 逐项结论

| 检查项 | 当前基线证据 | Reviewer | 结论 | 未关闭项 / 不一致数 |
|---|---|---|---|---|
| Development 授权链与阶段 | Gate / State / Memory | 责任角色 | PASS / FAIL | 整数 |
| Release Version Baseline | Manifest / Provenance | 责任角色 | PASS / FAIL | 整数 |
| Testing 状态 | Test Report | 责任角色 | PASS / FAIL | 整数 |
| Bug 状态 | Bug Register | 责任角色 | PASS / FAIL | P0 / P1 两个整数 |
| 安全状态 | Security Review Record | 责任角色 | PASS / FAIL | 硬阻断 / CRITICAL / HIGH 三个整数 |
| UAT 状态 | UAT Record | 责任角色 | PASS / FAIL | 整数 |
| 部署与回滚 | 两份方案与验证 | 责任角色 | PASS / FAIL | 两个整数 |
| AI 评测与监控 | Evaluation / N/A、Readiness | 责任角色 | PASS / FAIL | 两个整数 |
| Release Gate 当前性 | Release Gate Record | 责任角色 | PASS / FAIL | 整数 |

### 10.3 最终结果与转换记录

| 字段 | 必须记录的内容 |
|---|---|
| Gate Result | `READY_FOR_RELEASE`、`CHANGES_REQUIRED` 或 `BLOCKED` |
| 决定理由 | 与逐项事实和证据一致的摘要 |
| 硬阻断数量 | 整数；`READY_FOR_RELEASE` 时必须为 0 |
| 授权的 Release Version Baseline | Manifest 与不可变版本；未授权时为 `NONE` |
| 转换前 Current Stage | 必须为 `TESTING` |
| 转换后 Current Stage | `READY_FOR_RELEASE` 时为 `RELEASE`；否则为 `TESTING` 或有单独证据的前序阶段 |
| PROJECT_STATE 更新 | Current Stage、Confidence、Evidence、Next Action 的记录链接 |
| PROJECT_MEMORY 更新 | 历史修改与当前状态链接 |
| 第一项 Release Next Action | 动作、Owner、Completion Condition |
| 已部署 / 已发布 | `NO` |

## 11. 未通过、变更与复审

### 11.1 `CHANGES_REQUIRED`

- 保持 TESTING，不得执行 Release 阶段活动。
- 为每个失败项记录 Issue / Bug / Finding / Change ID、Owner、修订动作、完成条件和所需复核证据。
- 若修复改变候选内容、配置、依赖、数据、AI 或 Test Case 基线，退回 DEVELOPMENT 或相应前序阶段，重新取得 `APPROVED_FOR_TESTING`，再次进入 TESTING 并重跑受影响测试。
- 缺口关闭后，以新 Release Gate Record 和新 Testing Release Gate Record 执行完整评审，不只复查旧失败项。

### 11.2 `BLOCKED`

- 停止发布准备并执行必要遏制、升级、外部协调或阶段回退。
- 记录阻断事实、风险、所需权限 / 决策、责任人、解除条件和恢复评审触发器。
- 阻断解除后重新冻结全部输入；旧 `READY_FOR_RELEASE`、安全批准或测试证据只有在仍对应新基线且未失效时才可重新引用。

### 11.3 授权后基线变化

进入 RELEASE 前或进入 RELEASE 后尚未实际部署时，任何影响门禁事实的变化都会使旧授权立即失去当前性。按变化对象执行以下唯一回退规则：

1. **候选行为基线变化**：源代码、Artifact 或重新打包、运行配置、Feature Flag、依赖、Schema / Migration、模型、Prompt、检索、工具 / 权限或 Test Case 任一变化，都视为新的 Development 候选。继续发布的 Gate Result 为 `BLOCKED`，禁止部署，`PROJECT_STATE.Current Stage` 必须退回 `DEVELOPMENT`。完成 Change Impact、实现与 Review 后，重新取得 `APPROVED_FOR_TESTING`，再次进入 TESTING，并重跑受影响测试、安全、AI Evaluation、UAT 和两级 Release Gate；若变化证明设计或需求失效，再以单独证据退回 DESIGN 或更早阶段。
2. **仅发布就绪证据变化**：候选内容与行为完全未变，仅目标环境可用性、发布窗口、责任人或 Deployment / Rollback / Monitoring 方案与证据变化时，尚在 TESTING 则保持 TESTING，已进入 RELEASE 但未部署则退回 TESTING。旧 Gate 失效，通常记录 `CHANGES_REQUIRED`；若环境、权限、责任主体或恢复路径不可获得并命中硬阻断，则记录 `BLOCKED`。关闭缺口后重新执行受影响审核、Release Approval Gate 和本门禁。
3. **已经实际部署**：不再用旧 Testing Release Gate 吸收变化或伪装为未部署候选。Current Stage 保持 RELEASE，按 Deployment / Rollback 与 Monitoring 规范创建 Incident / Bug，执行暂停、隔离、回滚或恢复，并记录实际发布结果。

不允许以“变更很小”“只重新打包”“只改配置”或“仍是同一版本号”为由沿用旧授权。新增配置 Commit 属于第 1 类：结果为 `BLOCKED`、退回 DEVELOPMENT、禁止部署。

## 12. RELEASE 阶段不等于发布完成

本门禁通过后的含义仅是：当前冻结候选版本已获准进入 RELEASE 阶段，按已批准部署、监控和回滚方案执行发布活动。

进入 RELEASE 后仍必须实际记录：部署开始与结束、执行步骤、制品与环境、数据迁移、Smoke / 健康 / 数据完整性验证、关键指标观察、告警、异常、回滚决定、用户影响和最终发布结果。只有版本已实际发布、关键指标可观测且结果已记录后，才满足[项目生命周期](../protocol/PROJECT_LIFECYCLE.md)中 RELEASE 的退出条件；`READY_FOR_RELEASE` 或 `PROJECT_STATE.Current Stage = RELEASE` 均不能单独证明已部署或已发布。
