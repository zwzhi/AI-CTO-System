# Release Approval Gate

## 1. 目的与授权边界

本门禁定义从已获 Testing 授权的 Development 基线，到完成 Testing 并具备发布条件的端到端实质标准。它统一检查版本基线、测试、Bug、安全、用户验收、部署、回滚、AI 评测和监控就绪状态，形成候选版本是否 `READY_FOR_RELEASE` 的权威判定。

本门禁遵循 [项目生命周期](../protocol/PROJECT_LIFECYCLE.md) 与 [阶段门禁检查清单](../evaluation/PHASE_GATE_CHECKLIST.md)。DEVELOPMENT → TESTING 授权使用 [Development Approval Gate](../development/DEVELOPMENT_APPROVAL_GATE.md)，安全结论遵循 [安全评审标准](../testing/SECURITY_REVIEW_STANDARD.md)，分层授权决策见 [ADR-0005](../adr/ADR-0005-TESTING-AND-RELEASE-AUTHORIZATION.md)。

本门禁不是 DEVELOPMENT → RELEASE 的捷径，也不直接修改 `PROJECT_STATE`。必须先由 Development Approval Gate 针对精确基线给出有效 `APPROVED_FOR_TESTING`，完成 DEVELOPMENT → TESTING 的独立状态转换，再在 TESTING 中形成完整证据。只有本门禁为 `READY_FOR_RELEASE` 后，[Testing Release Gate](./TESTING_RELEASE_GATE.md) 才能执行 TESTING → RELEASE 的实际阶段转换。

`READY_FOR_RELEASE` 表示“允许进入 RELEASE 阶段执行受控发布活动”，不表示已部署、已对用户开放、已完成数据迁移、已发布成功或已进入 MAINTENANCE。

## 2. 不可跳过的授权链

标准授权链必须完整保留：

`APPROVED_FOR_DEVELOPMENT → DEVELOPMENT → APPROVED_FOR_TESTING → TESTING → READY_FOR_RELEASE → RELEASE`

其中：

1. `APPROVED_FOR_TESTING` 仍是 DEVELOPMENT → TESTING 的唯一授权，由 [Development Approval Gate](../development/DEVELOPMENT_APPROVAL_GATE.md) 产生。
2. Testing 证据必须在 `PROJECT_STATE.Current Stage = TESTING` 后，针对获准基线和批准测试范围实际形成；开发级测试不能冒充完整 Testing。
3. 本门禁必须引用有效的 `APPROVED_FOR_TESTING` 和进入 TESTING 的状态记录，不能仅因发布条件看似满足而补写或倒推阶段。
4. TESTING → RELEASE 的实际授权包装器是 [Testing Release Gate](./TESTING_RELEASE_GATE.md)；本门禁提供其必须引用的实质判定。
5. 任一候选内容变化使原精确基线失效时，必须按变化性质回到 DEVELOPMENT 或更早阶段重新授权，不得用 Release Gate 吸收未授权开发变更。

## 3. 唯一门禁结果

本门禁最终结果严格限定为以下三种，不设置条件批准、部分批准、自动批准、口头批准或第四种状态：

| Gate Result | 使用条件 | 生命周期影响 |
|---|---|---|
| `READY_FOR_RELEASE` | 第 6 节全部检查 PASS，适用 N/A 有效，P0 / P1 Bug 为 0，Security Result 为 `APPROVED`，硬阻断为 0，全部证据对应同一 Release Version Baseline | 可作为 Testing Release Gate 的 Release 授权输入；本记录自身不修改阶段，也不证明已部署 |
| `CHANGES_REQUIRED` | 没有硬阻断，但存在已知、边界明确、可在当前批准方向内修正的控制、测试、证据或准备缺口 | 保持 TESTING；完成修订、必要的重新授权和重测后，以新记录执行完整门禁 |
| `BLOCKED` | 存在硬阻断，或当前方向、权限、关键外部条件、证据可信度或风险状态使发布评审无法安全继续 | 停止发布准备；保持 TESTING 或按问题性质退回 DEVELOPMENT、DESIGN、EVALUATION / RESEARCH，先完成升级决策或解除阻断 |

### 3.1 `BLOCKED` 与 `CHANGES_REQUIRED` 的差异

`CHANGES_REQUIRED` 表示当前产品方向和发布候选仍成立，缺口有明确 Owner、修正动作、完成条件和可验证复审路径。例如：一项必需回归测试失败、P1 Bug 待修复、UAT 场景未执行、告警演练缺证或部署步骤需要补全。

`BLOCKED` 表示不能在现有条件下安全地继续准备发布，通常涉及缺失前序授权、无法识别候选基线、开放 P0 / 灾难性风险、安全评审为 `BLOCKED`、无法提供安全回滚、适用法律或合同禁止、核心验收否定当前范围，或必要权限 / 环境 / 责任主体不可获得。它不能靠接受风险、承诺稍后修复或缩小检查范围转为通过。

缺口数量多不自动等于 `BLOCKED`，预计修复很快也不自动等于 `CHANGES_REQUIRED`；判定依据是能否在当前获批方向、权限和安全边界内形成可信修正路径。

## 4. 角色与职责

| 角色 | 职责 |
|---|---|
| Release Gate Owner | 冻结 Release Version Baseline，组织逐项评审，确认硬阻断和唯一结果，保存不可覆盖记录 |
| Test Owner | 证明 Testing 范围、环境、数据、执行结果和 Test Report 完整且对应候选基线 |
| Development Owner | 证明候选基线仍有有效 `APPROVED_FOR_TESTING`；任何修复都已按生命周期重新授权与追踪 |
| Bug Owner / Quality Owner | 维护 Bug Register，证明 P0 / P1 Bug 全部关闭并完成定向测试与回归 |
| Security Reviewer | 提供当前基线的安全评审记录和唯一 `APPROVED` 结果 |
| UAT Owner / 用户或业务责任人 | 组织用户验收，确认验收范围、场景、结果和明确签署 |
| Deployment Owner | 维护可执行部署方案、权限、窗口、依赖、迁移、通信和部署验证步骤 |
| Rollback Owner | 维护回滚触发器、操作、数据恢复、验证和决策责任，证明方案可执行 |
| AI Evaluation Owner | AI 项目中冻结模型 / Prompt / 数据 / 工具基线，执行并判定正式 AI 评测 |
| Monitoring / Operations Owner | 证明发布监控、告警、值守、响应和发布后验证就绪 |
| Release Approver | 在组织授权范围内确认本门禁记录完整；不得覆盖任何失败项或硬阻断 |

同一人可以承担多个低冲突角色，但安全、用户验收和高风险发布决策须具备足够独立性。自动化报告可以提供证据，不能代替相应责任角色的明确结论。

## 5. 门禁输入

发起评审时必须提供可访问、版本化、状态明确且指向同一候选版本的输入：

1. 当前有效的 `APPROVED_FOR_TESTING` Gate Record ID、授权范围、精确代码 / 内容与文档基线、Test Owner、Testing 环境和第一项 Testing 动作。
2. `PROJECT_STATE` 从 DEVELOPMENT 转为 TESTING 的证据，以及当前 Current Stage 仍为 TESTING 的记录；同时提供 PROJECT_MEMORY 与 Progress 摘要。
3. Release Version Baseline Manifest，包含第 6.2 节定义的全部版本维度和候选制品可追溯关系。
4. Testing Plan、Test Case 基线、完整 Test Report、原始结果、环境与数据记录，以及失败、重试、豁免和 N/A 记录。
5. Bug Register，包含优先级映射、状态、Owner、修复版本、Review、定向测试、回归和关闭证据。
6. 按[安全评审标准](../testing/SECURITY_REVIEW_STANDARD.md)形成且对应当前 Release Version Baseline 的 Security Review Record。
7. UAT Plan、UAT 场景、参与者 / 授权依据、执行证据、发现处置和最终验收记录。
8. 部署方案、回滚方案、数据迁移 / 恢复方案、操作权限、发布窗口、责任人、演练或等价验证证据。
9. AI 项目的正式 AI Evaluation Report；非 AI 项目的适用性判定、事实依据和批准记录。
10. 监控就绪证据，包括关键指标、日志 / 追踪边界、Dashboard 或等价视图、告警、值守、升级、发布后验证和停止 / 回滚信号。
11. Release Notes、用户 / 运维沟通内容、已知限制、剩余风险、变更清单和受影响责任人。
12. 当前发布审批角色、时间窗口、外部依赖、适用合规 / 合同要求和前序记录链接。

任一强制输入缺失、不可访问、引用“最新版”、版本混用或无法证明属于当前 Release Version Baseline 时，不得给出 `READY_FOR_RELEASE`。

## 6. 逐项通过标准

### 6.1 前序授权与 Testing 完成

- Development Approval Gate 的 `APPROVED_FOR_TESTING` 对当前候选内容、文档和 Test Case 基线仍然有效。
- `PROJECT_STATE` 已按有效记录从 DEVELOPMENT 转为 TESTING；不存在从 DEVELOPMENT 直接发起 Release 授权的情况。
- Testing 范围、环境、数据、Owner 和全部必需活动与获准输入一致；新增范围已完成 Change Impact 与必要的重新授权。
- 功能、非功能、系统、集成、端到端、兼容、性能 / 容量、可靠性 / 恢复、安全、回归、AI 评测和验收测试均按适用性完成，不存在把开发级 PASS 当作 Testing 完成的情况。
- PROJECT_STATE、PROJECT_MEMORY、Progress、Test Report、Bug Register 和 Release Checklist 状态一致。

### 6.2 Release Version Baseline

Release Version Baseline 必须唯一、不可含糊并可复核，至少记录：

| 维度 | 必须记录的内容 |
|---|---|
| Release Candidate ID / Version | 唯一候选标识和拟发布版本 |
| Source / Content Baseline | 不可变源修订、内容摘要或等价版本标识 |
| Artifact Baseline | 构建产物、包、镜像或交付制品的不可变摘要；无构建产物时记录内容摘要与事实依据 |
| Configuration Baseline | 运行配置、Feature Flag、秘密引用和环境差异版本，不记录秘密值 |
| Dependency Baseline | 第三方服务、库、模型、运行时和外部 API 版本 |
| Data Baseline | Schema、迁移、种子 / 参考数据、备份与恢复方案版本 |
| AI Baseline | AI 项目中的模型、Prompt、系统指令、检索语料、评测集、工具与权限版本；非 AI 项目为有效 N/A |
| Environment Baseline | Testing 与目标部署环境标识、差异及等价性证据 |
| Document / Evidence Baseline | Requirement、Design、ADR、Test、Security、UAT、Deployment、Rollback、Monitoring 与 Release Notes 版本 |
| Provenance | 从获准 Development / Testing 基线到候选制品的可追溯构建、签名或等价完整性证据 |

所有门禁证据必须引用该 Manifest。候选制品无法由获准源与配置追溯、产物摘要不一致、测试对象与拟发布对象不同或存在未记录环境差异时，本项 FAIL。

### 6.3 测试通过

- Test Plan 中所有必需 Test Case 均在 Release Version Baseline 或经证明等价且未改变结论的环境中实际执行。
- 必需测试结果为 PASS；FAIL、BLOCKED、INVALIDATED 和未获批准的 NOT_RUN / SKIPPED 数量均为 0。
- 功能与非功能验收标准逐项可追溯，关键成功、失败、边界、权限、数据、依赖、恢复和回归路径均有证据。
- 测试记录包含 Case ID、需求 / 风险映射、环境、数据、步骤、预期、实际、时间、执行人和原始证据。
- 重试和不稳定测试记录全部尝试、根因与稳定性处理；偶然通过、删除失败结果或降低断言不能判为 PASS。
- N/A 仅适用于事实未触发的子域，须有范围依据、评审人和复核触发器；不能用 N/A 跳过批准需求或已知风险。

### 6.4 P0 / P1 Bug 全部关闭

- Bug 优先级按项目映射统一到 P0 Blocker、P1 Critical、P2 Major、P3 Minor；评审时不得临时降级。
- 未关闭、重开、待验证或仅通过 Feature Flag 隐藏的 P0 与 P1 Bug 数量均为 0。
- 每个已关闭 P0 / P1 Bug 都有根因、受影响范围、修复版本、Review、定向测试、必要回归和关闭人证据，并对应当前 Release Version Baseline。
- 风险接受、发布时间压力、低发生概率、手工规避或“不影响主流程”不能替代 P0 / P1 关闭。
- 保留的 P2 / P3 Bug 有影响评估、Owner、计划、监控和有权限的接受记录，不损害验收、安全、数据完整性、回滚或核心用户旅程。

### 6.5 安全评审为 `APPROVED`

- Security Review Record 覆盖 API Key、用户数据、权限、第三方、数据存储和日志敏感信息六类强制检查。
- Security Result 必须精确为 `APPROVED`；`CHANGES_REQUIRED`、`BLOCKED`、旧版本批准、口头同意和条件批准均不合格。
- 安全评审中的源、产物、配置、依赖、数据、权限、第三方和环境基线与 Release Version Baseline 完全一致。
- CRITICAL / HIGH 未关闭安全发现和硬阻断均为 0；剩余风险接受未过期且重审触发器未发生。
- 安全批准后出现新漏洞、安全事件、秘密轮换、权限 / 数据流 / 依赖变化时，原批准已按标准失效并完成重新评审。

### 6.6 用户验收测试完成

- UAT 范围对应批准 Requirement、核心用户旅程、业务规则、用户可见变化、失败处理和验收标准。
- UAT 在声明的候选版本和代表性环境 / 数据条件下实际执行，场景、参与者、时间、预期、实际和证据完整。
- 所有必须 UAT 场景 PASS，UAT 发现已关闭或仅保留不影响验收的低风险项；P0 / P1 不得被验收签署覆盖。
- 有权限的用户 / 业务责任人明确签署当前范围、候选版本和结果；沉默、会议出席、演示完成或 Development Gate 的 Testing 范围确认不等于 UAT 完成。
- UAT 明确记录已知限制和剩余风险；若验收否定核心价值、范围或业务规则，须退回相应前序阶段重新决策。

### 6.7 部署方案完成

- 部署方案明确目标环境、候选制品、前置条件、依赖、权限、责任人、窗口、顺序、配置、Feature Flag、数据迁移和用户 / 运维通信。
- 每一步有可判定成功条件、失败处理、证据保存位置和责任角色；手工步骤可复核，自动步骤有输入、版本和结果边界。
- 环境差异、容量、并发、网络、第三方、证书、秘密引用、兼容和停机影响已验证或有批准控制。
- 部署前检查、部署后 Smoke / 健康 / 数据完整性检查、流量或功能开放策略和停止条件明确。
- 方案通过演练、预演、等价环境验证或逐步复核，证明权限、依赖和步骤可执行；只写概括性步骤不合格。

### 6.8 回滚方案完成

- 回滚触发器与决策权明确，至少覆盖健康指标恶化、错误率、数据完整性、安全事件、关键依赖失败和 UAT / 发布后验证失败。
- 回滚步骤、责任人、权限、时间目标、旧版本 / 配置可得性、Feature Flag、数据备份与恢复、第三方协调和通信完整。
- 数据迁移的向前修复、反向迁移、兼容窗口和不可逆部分已分别处理；不能回滚的变更有经批准且已验证的等价恢复 / 遏制方案。
- 回滚后验证覆盖服务、数据、权限、队列 / 缓存、外部副作用和用户影响；成功条件及再次发布条件明确。
- 演练或等价验证证明方案在候选环境可执行；备份存在但未验证恢复、只回滚代码不处理数据或无决策人均不合格。

### 6.9 AI 项目正式评测

当候选版本使用生成模型、分类 / 预测模型、Embedding / Retrieval、Prompt、AI 决策、AI 工具调用或其他会影响用户 / 系统行为的 AI 能力时，本项适用。仅当候选范围没有任何此类能力时，才能提交有事实依据和领域批准的 N/A。

AI 项目必须：

- 冻结模型、提供方、版本、Prompt / 系统指令、参数、检索语料、评测集、工具、权限、Guardrail 和人工接管基线。
- 预先定义任务质量、正确性 / 事实性、稳健性、拒绝与边界、安全、Prompt Injection、越权工具调用、敏感数据、偏差 / 公平性（适用时）、延迟、成本和失败恢复阈值。
- 在 Release Version Baseline 上执行代表性、边界、对抗、回归和人工复核；记录样本来源、版本、运行配置、统计方法、结果和原始证据。
- 所有发布硬阈值 PASS，关键失败与 P0 / P1 AI Bug 为 0；平均分不能掩盖灾难性个例或关键子群失败。
- 明确不确定性、降级、拒绝、人工接管、工具副作用限制、监控信号和模型 / 提供方变化后的重评触发器。

### 6.10 监控与响应就绪

- 关键用户旅程、业务结果、可用性、延迟、错误、容量、依赖、数据完整性、安全和 AI 质量（适用时）均有可判定信号。
- 每个发布关键指标定义名称、来源、维度、正常基线、阈值、时间窗口、Owner 和与停止 / 回滚条件的对应关系。
- Dashboard、查询或等价观测入口在目标环境可访问；采集、脱敏、保留和访问符合安全批准，不因监控泄露秘密或用户数据。
- 关键告警已通过测试事件、历史回放或等价方法验证能触达当前值守责任人；告警路由、升级、静默、去重和恢复通知明确。
- 发布窗口值守、事件负责人、沟通渠道、供应商升级、运行手册和发布后观察时长明确。
- 部署后 Smoke、核心指标确认、数据一致性、安全检查、AI 质量抽样和是否继续 / 回滚的决策时间点已写入发布方案。

### 6.11 文档、风险与发布沟通

- Release Notes 准确列出版本、范围、用户可见变化、兼容影响、配置 / 数据变化、已知限制和支持 / 回滚入口。
- 未关闭风险与 P2 / P3 Bug 逐项记录影响、Owner、接受人、期限、监控和触发器，不与安全、验收、P0 / P1 或硬阻断冲突。
- 用户、支持、运维、数据、安全和第三方责任人的发布前 / 中 / 后沟通内容、时间与 Owner 明确。
- PROJECT_STATE、PROJECT_MEMORY、Progress、Test、Security、UAT、Deployment、Rollback、Monitoring 和 Release 记录引用同一版本基线且无矛盾。

## 7. 硬阻断项

出现以下任一情况，本门禁结果必须为 `BLOCKED`：

- 缺少当前有效 `APPROVED_FOR_TESTING`，`PROJECT_STATE` 未进入 TESTING，或候选版本不属于获准 Testing 基线。
- Release Candidate 无法唯一标识、来源 / 制品完整性无法建立、证据混用不同基线，或拟发布对象与测试对象不一致且无法可信重建。
- 存在未关闭 P0 Blocker Bug、灾难性数据损坏 / 泄露风险、不可恢复故障或禁止发布的适用红线。
- Security Result 为 `BLOCKED`，或出现[安全评审标准](../testing/SECURITY_REVIEW_STANDARD.md)定义的安全硬阻断。
- 核心测试环境、数据、权限或证据不可获得，导致关键范围无法测试或结果无法可信判定。
- UAT 明确否定核心范围、价值或业务规则，继续需要重新设计、重新立项或新的有权决策。
- 破坏性或不可逆变更没有可信回滚、向前修复、数据恢复或遏制路径。
- 适用法律、合同、监管、组织政策或第三方约束明确禁止当前数据用途、部署区域、版本或发布时间。
- AI 项目存在未受控的高影响越权、敏感数据泄露、危险工具副作用或发布硬阈值的灾难性失败。
- 目标环境、关键外部依赖、发布权限、必要责任人或监控 / 响应能力不可获得，且没有在当前授权范围内可验证的替代方案。

其他未满足项通常记录为 `CHANGES_REQUIRED`，但若调查发现触发上述条件，必须升级为 `BLOCKED`。硬阻断为 0 是 `READY_FOR_RELEASE` 的必要条件，不能用通过率、发布日期或审批人数抵消。

## 8. 评审流程

1. Release Gate Owner 核验当前 `APPROVED_FOR_TESTING` 与 TESTING 状态，冻结 Release Version Baseline Manifest 和门禁输入清单。
2. Development Owner 与 Test Owner 证明候选版本未跳过授权、Testing 活动完整、测试对象与拟发布对象一致。
3. Quality Owner 核对 Test Report 和 Bug Register，复算必需 PASS、失败 / 跳过与 P0 / P1 未关闭数量。
4. Security Reviewer 核验当前基线 Security Result 为 `APPROVED`，且批准后无失效触发器。
5. UAT、Deployment、Rollback、AI Evaluation 和 Monitoring Owner 分别逐项核验第 6 节证据与适用 N/A。
6. Release Gate Owner 核对版本、文档、风险、Release Notes、角色、时间窗口和全部硬阻断，确认逐项结论相互一致。
7. 只记录 `READY_FOR_RELEASE`、`CHANGES_REQUIRED` 或 `BLOCKED` 之一；重新评审创建新 Gate Record ID，不覆盖旧记录。
8. 结果为 `READY_FOR_RELEASE` 时，将记录交给 Testing Release Gate；此时仍保持 TESTING，且不得把结果写成已部署或已发布。

## 9. 门禁记录格式

### 9.1 基本信息

| 字段 | 必须记录的内容 |
|---|---|
| Release Gate Record ID | 唯一、不可复用的标识 |
| 项目与范围 | 版本化范围与非范围 |
| Development Gate Record | 有效 `APPROVED_FOR_TESTING` 的 ID 与链接 |
| TESTING 状态证据 | PROJECT_STATE 转换记录与当前状态链接 |
| Release Candidate | Candidate ID、Version 和 Manifest 链接 |
| Source / Artifact Baseline | 不可变源修订 / 内容摘要与制品摘要 |
| Environment | Testing 与目标环境标识及差异记录 |
| Gate Owner / Approver | 姓名或有权限责任角色 |
| 评审时间 | 含时区时间戳 |
| 上一记录 | 记录链接；首次为 `NONE` |

### 9.2 逐项结论

| 检查项 | 基线证据 | Owner / Reviewer | 结论 | 未关闭项 | 关闭 / N/A 证据 |
|---|---|---|---|---|---|
| 前序授权与 Testing 完成 | 版本化链接 | 责任角色 | PASS / FAIL | 整数 | 链接或 `NONE` |
| Release Version Baseline | Manifest | 责任角色 | PASS / FAIL | 整数 | 链接或 `NONE` |
| 测试通过 | Test Report | 责任角色 | PASS / FAIL | 整数 | 链接或 `NONE` |
| P0 / P1 Bug 关闭 | Bug Register | 责任角色 | PASS / FAIL | 两个整数 | 链接或 `NONE` |
| Security `APPROVED` | Security Review Record | 责任角色 | PASS / FAIL | 整数 | 链接或 `NONE` |
| UAT 完成 | UAT Record | 责任角色 | PASS / FAIL | 整数 | 链接或 `NONE` |
| 部署方案 | Deployment Plan | 责任角色 | PASS / FAIL | 整数 | 链接或 `NONE` |
| 回滚方案 | Rollback Plan | 责任角色 | PASS / FAIL | 整数 | 链接或 `NONE` |
| AI 评测 | AI Evaluation / N/A | 责任角色 | PASS / FAIL | 整数 | 链接或 `NONE` |
| 监控就绪 | Monitoring Readiness | 责任角色 | PASS / FAIL | 整数 | 链接或 `NONE` |
| 文档、风险与沟通 | 版本化链接 | 责任角色 | PASS / FAIL | 整数 | 链接或 `NONE` |

### 9.3 可复算指标

| 指标 | 数值 |
|---|---|
| 必需 Test Case 总数 / PASS / FAIL / BLOCKED / INVALIDATED / 未批准未执行 | 六个整数 |
| P0 / P1 Bug 未关闭数 | 两个整数；`READY_FOR_RELEASE` 时均为 0 |
| Security CRITICAL / HIGH 未关闭数与硬阻断数 | 三个整数；`READY_FOR_RELEASE` 时均为 0 |
| 必需 UAT 场景总数 / PASS / 未完成 | 三个整数 |
| AI 发布硬阈值总数 / PASS / FAIL / 未执行 | 四个整数；非 AI 项目引用有效 N/A |
| 部署 / 回滚 / 监控未关闭项 | 三个整数 |
| 版本或证据不一致项 | 整数 |
| Release 硬阻断项 | 整数；`READY_FOR_RELEASE` 时必须为 0 |

### 9.4 最终结果

| 字段 | 必须记录的内容 |
|---|---|
| Gate Result | `READY_FOR_RELEASE`、`CHANGES_REQUIRED` 或 `BLOCKED` |
| 决定理由 | 逐项事实与证据摘要 |
| 生效的 Release Version Baseline | Manifest 与不可变版本；非 `READY_FOR_RELEASE` 时为 `NONE` |
| 硬阻断项数量 | 整数 |
| 剩余风险 | 接受人、权限、期限、监控与触发器；没有时为 `NONE` |
| Testing Release Gate 输入 | `READY_FOR_RELEASE` 时记录本 Gate Record ID；否则为 `NONE` |
| PROJECT_STATE | 仍为 TESTING；本门禁不执行阶段转换 |
| Next Action | 动作、Owner 与可验证完成条件 |
| 已部署 / 已发布 | `NO` |

## 10. 未通过处理与复审

结果为 `CHANGES_REQUIRED` 时：

1. 项目保持 TESTING，不得提前进入 RELEASE。
2. 每个失败项记录 Issue / Bug / Finding / Change ID、影响、Owner、修订动作、完成条件和复核证据。
3. 若修订改变源内容、配置、依赖、Schema、模型 / Prompt、权限或候选制品，旧 `APPROVED_FOR_TESTING` 与相关测试 / 安全 / UAT 证据失效；按变化性质返回 DEVELOPMENT 或更早阶段，重新授权后再进入 TESTING。
4. 仅补充不改变候选内容的证据时，仍须验证证据对应当前基线，并重新执行完整 Release Gate。

结果为 `BLOCKED` 时：

1. 停止发布准备并先执行必要遏制、升级、外部协调或阶段回退。
2. 记录阻断事实、影响、所需权限 / 决策、责任人、解除条件和恢复评审触发器；不得用预计日期代替解除条件。
3. 阻断解除后创建新 Gate Record ID，重新冻结 Release Version Baseline 并执行全部适用检查。

## 11. 基线失效

`READY_FOR_RELEASE` 只对记录中的精确 Release Version Baseline 生效。下列任一变化使旧结果立即失去当前性：

- 源内容、制品、配置、Feature Flag、依赖、Schema / 迁移、模型、Prompt、检索数据、工具或权限改变。
- Testing、Security、UAT、Deployment、Rollback、Monitoring、Release Notes 或风险证据与候选版本不再一致。
- P0 / P1 Bug 重开，必需测试失效 / 失败，安全批准失效，UAT 决定撤回或出现新的发布硬阻断。
- 目标环境、第三方、证书 / 密钥引用、数据区域、发布窗口、值守与响应能力发生足以改变结论的变化。
- Candidate ID、产物摘要、构建来源或证据完整性无法继续验证。

失效后不得继续引用旧 `READY_FOR_RELEASE`。源、Artifact / 重新打包、运行配置、Feature Flag、依赖、Schema / Migration、模型、Prompt、检索、工具 / 权限或 Test Case 等候选行为基线变化时，继续发布的结果为 `BLOCKED`，项目退回 DEVELOPMENT，重新取得 `APPROVED_FOR_TESTING` 并重跑受影响验证；设计或需求失效时再按证据退回更早阶段。候选内容完全未变、只有目标环境、发布窗口、责任人或 Deployment / Rollback / Monitoring 证据变化时，项目保持或退回 TESTING，结果通常为 `CHANGES_REQUIRED`，命中硬阻断时为 `BLOCKED`。已经部署的版本按 Release 事件、监控与回滚流程处置，不复用旧门禁吸收变化。

## 12. 门禁输出与非部署声明

通过时必须形成一份针对当前精确基线的 `READY_FOR_RELEASE` 记录、完整逐项证据、可复算指标、硬阻断为 0 的证明，以及交给 [Testing Release Gate](./TESTING_RELEASE_GATE.md) 的 Record ID。

未通过时必须形成 `CHANGES_REQUIRED` 或 `BLOCKED` 记录、全部失败 / 阻断项、责任人、修订或解除条件、生命周期落点和下一动作。

无论测试通过率、开发完成度或审批人数多高，本门禁都不能直接把 DEVELOPMENT 或 TESTING 修改为 RELEASE。只有 Testing Release Gate 可以基于当前有效 `READY_FOR_RELEASE` 执行 TESTING → RELEASE；进入 RELEASE 后仍需按部署方案实际执行、验证、观察并记录发布结果，才能证明版本已部署或已发布。
