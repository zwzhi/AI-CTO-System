# 测试策略标准

## 1. 目的与边界

本标准规定项目在 Phase 6 TESTING 阶段如何定义测试目标、范围、类型、环境、数据、指标、责任与结果记录，并为可复核的测试结论提供统一最低要求。它与[项目生命周期状态机](../protocol/PROJECT_LIFECYCLE.md)、[Development Approval Gate](../development/DEVELOPMENT_APPROVAL_GATE.md)和[Traceability Matrix 模板](../design/TRACEABILITY_MATRIX_TEMPLATE.md)共同使用。

Development Gate 的 `APPROVED_FOR_TESTING` 只证明当前实现基线具备进入 TESTING 的条件，不证明 Phase 6 已执行或通过。测试结论只对记录的范围、文档版本、Base SHA、HEAD SHA、环境与数据有效；口头结论、旧基线结果或只有汇总数字而没有证据的结果无效。

本标准保持平台、语言、框架和测试工具中立。项目可以选择具体实现方式，但不得降低本标准规定的可执行性、可判定性、可追踪性和证据要求。

## 2. 测试目标

每份 Test Strategy 必须把目标写成可验证结果，至少包括：

- 证明当前批准 Requirement 及验收标准在冻结实现基线上得到满足；
- 验证核心成功路径、关键失败路径、边界、权限、数据完整性、恢复和外部依赖行为；
- 发现阻碍用户价值、业务连续性、安全、隐私、合规或发布质量的缺陷；
- 量化功能、非功能、回归和适用的 AI 能力是否达到预先批准的阈值；
- 为用户验收、Testing 退出和后续 Release 决策提供可复核证据。

“测试系统是否正常”“尽量覆盖主要功能”等不可判定表述不能作为测试目标。每项目标必须关联 Requirement ID、风险或批准的质量阈值，并给出完成条件。

## 3. 策略基线与必填信息

Test Owner 必须在执行前冻结 Test Strategy。执行中的范围或基线变化必须按第 13 节重新评估，不得覆盖原记录。

| 类别 | 必填内容 |
|---|---|
| 标识与版本 | Strategy ID、版本、状态、Owner、评审人、批准人、批准时间 |
| 授权基线 | 有效 `APPROVED_FOR_TESTING` 记录、项目范围版本、Repository、Branch、Base SHA、HEAD SHA |
| 测试目标 | 可判定目标、关联 Requirement / Risk、完成条件 |
| 测试范围 | 范围内与范围外对象、核心功能、变更、接口、数据流、平台边界及批准依据 |
| 测试类型 | Unit、Integration、System、UAT、Regression，以及适用的功能、非功能、安全、恢复和 AI 评测 |
| 环境 | Environment ID、拓扑、配置、依赖、差异、访问控制和环境就绪证据 |
| 数据 | Dataset ID / 版本、来源、构造方式、隐私分类、重置方法和预期结果 |
| 指标与阈值 | 指标名称、公式、分母、数据源、分片、阈值、批准人和判定规则 |
| 责任与顺序 | Test Owner、设计人、执行人、领域评审人、UAT 责任人、执行顺序和首个动作 |
| 结果与证据 | Test Case 集、Execution Record、Bug Register、原始证据位置、Test Report 位置和保留规则 |
| 风险与适用性 | 已知限制、阻塞条件、范围排除及逐项可审计 N/A 记录 |

策略状态只允许 `DRAFT`、`IN_REVIEW`、`APPROVED`、`SUPERSEDED`。只有 `APPROVED` 且指向当前 Testing 基线的策略可以授权正式执行；基线变化后旧策略标记为 `SUPERSEDED`，修订版重新批准。

## 4. 测试范围

### 4.1 范围内项目

测试范围必须从当前批准的 PRD、设计、Development Plan、变更影响和五层 Traceability Matrix 全量推导，至少覆盖：

- 每个当前批准 Requirement 及其验收标准；
- 每个核心功能的成功、失败、边界和恢复路径；
- 当前 Base..HEAD 引入或影响的模块、接口、数据、配置、依赖和运行流程；
- 权限、安全、隐私、合规、兼容性、性能、可靠性、可观测性和回滚中被需求或风险触发的部分；
- 所有修复 Bug 的定向验证与受影响回归范围；
- AI 项目的正式 AI 评测，按 [AI 评测标准](./AI_EVALUATION_STANDARD.md)执行；
- 需要用户或业务责任人判定的正式 UAT。

### 4.2 范围外与 N/A

范围外对象必须逐项写明对象、边界、事实依据、批准人、证据和复核触发器。范围内 Requirement、核心功能、五层追踪、Bug 检查和测试结果记录不得标记为 N/A。未列入范围不等于 N/A，也不能通过删减 Test Case 使覆盖率达到目标。

## 5. 测试类型的精确定义

| 类型 | 精确定义 | 最低判定要求 |
|---|---|---|
| Unit Test | 对最小可独立验证的程序单元进行隔离测试；外部依赖由受控替身隔离，验证输入、输出、状态变化、边界和错误处理。 | 失败必须能定位到被测单元；替身行为有明确契约；Unit PASS 不能证明组件交互、完整系统或 UAT 通过。 |
| Integration Test | 验证两个或以上真实组件、服务、模块、数据存储或外部契约之间的交互，覆盖数据、控制、事务、权限、超时和失败传播。 | 明确集成边界与真实依赖；任何替身均记录原因和限制；开发期定向 Integration PASS 不自动等于 Phase 6 的完整集成验证。 |
| System Test | 在代表性且版本化的完整环境中，把冻结产品作为一个集成系统验证端到端功能与非功能行为。 | 使用当前 HEAD 和批准配置；必需依赖不得被未批准 Mock 替代；覆盖核心旅程、失败、恢复和系统级质量属性。 |
| User Acceptance Test（UAT） | 由获授权的用户或业务责任人，依据已批准 Requirement 与业务验收标准，对代表性业务旅程和结果作接受或拒绝判断。 | 记录参与人、场景、数据、基线、实际结果、意见与签署；开发者自测、Testing 范围确认或产品演示均不能替代 UAT。UAT PASS 也不单独构成发布授权。 |
| Regression Test | 在修复、变更、升级或重新基线后，重新执行先前有效的测试集合，以证明受影响能力和关键未变能力没有退化。 | 集合由变更影响和风险推导，至少包含定向用例、所有受影响链和核心冒烟路径；必须产生针对新基线的新 Execution ID 与证据。 |

项目还必须按需求与风险选择以下类型，并在策略中说明它们与上述层级的组合：

- 功能、端到端、契约、数据与迁移测试；
- 性能、容量、并发、可靠性、可用性与长稳测试；
- 安全、权限、隐私、合规与对抗测试；
- 兼容性、可访问性、恢复、容灾、回滚与可观测性验证；
- Smoke / Sanity 检查；它们只能快速判断环境或候选基线是否值得继续，不能替代完整测试；
- 按 [AI 评测标准](./AI_EVALUATION_STANDARD.md)执行的 AI 输出、稳定性、幻觉、Prompt、Agent、成本和时延评测。

## 6. 开发级已通过与 Phase 6 执行

| 维度 | DEVELOPMENT 中的开发级测试 | Phase 6 TESTING |
|---|---|---|
| 目的 | 支持 TDD、任务完成、代码评审和进入 Testing 的质量门槛 | 对冻结系统开展完整、独立、正式的系统、非功能、AI 评测和验收 |
| 常见内容 | RED / GREEN / REFACTOR、Unit、组件、定向 Integration、静态检查、开发级回归与 Validation | 完整 Integration / System / E2E、兼容、性能、安全、恢复、正式 AI 评测、UAT 和发布候选回归 |
| 进入 TESTING 前结果 | 开发阶段必跑项必须为 `PASS` | 用例必须完整且可执行；尚未正式执行时必须为 `NOT_RUN` |
| 执行基线 | 对开发任务记录的精确 Commit、环境和数据有效 | 对 `APPROVED_FOR_TESTING` 冻结的 HEAD、环境、数据和策略版本有效 |
| 证据用途 | 证明任务达到完成定义并满足 Development Gate | 证明 Phase 6 的验收与质量阈值是否满足 |

必须遵守以下边界：

1. 开发级 `PASS` 不得复制为 Phase 6 `PASS`，也不得计入 Phase 6 已执行数。
2. 即使 Phase 6 复用相同自动化脚本，也必须在冻结环境重新执行并生成新的 Execution ID、时间、实际结果和 Evidence。
3. `APPROVED_FOR_TESTING` 之后、正式执行之前，Phase 6 Test Case 保持 `NOT_RUN`；提前标记 `PASS` 属于无效证据。
4. 测试脚本、被测 Commit、配置、数据或环境发生影响判定的变化时，旧执行结果标记为 `INVALIDATED`，不得继续作为当前结论。
5. Phase 6 发现缺陷后按[缺陷管理标准](./BUG_MANAGEMENT_STANDARD.md)处理；修复引入新 Commit 后必须重新基线并执行定向验证与受影响回归。

## 7. 测试环境

每个正式环境必须有唯一 Environment ID 和不可覆盖的版本记录，至少包括：

- 环境用途、Owner、地域或隔离边界、拓扑和访问控制；
- 操作系统、运行时、依赖、服务、数据库 Schema、配置、Feature Flag、密钥类别和时钟设置的版本；
- Repository、Branch、Base SHA、HEAD SHA、构建物标识和部署时间；
- 外部服务、网络、权限、限流、队列和数据存储状态；
- 与目标生产环境的已知差异、差异影响、补偿测试和批准人；
- 环境健康检查、重置步骤、监控位置和就绪证据。

共享环境发生漂移、依赖不可用或配置无法复原时，相关执行结果为 `BLOCKED` 或 `INVALIDATED`，不能以“环境问题”从统计中静默删除。必需真实依赖被替身代替时必须在 Test Case 中声明；若替身改变验收含义，该用例不能用于 System、UAT 或发布候选结论。

## 8. 测试数据

每组正式数据必须记录 Dataset ID、版本或内容哈希、Owner、来源、授权、生成规则、Schema、规模、分片、预期结果和保留期限。数据策略必须覆盖正常、边界、异常、权限、安全、恢复和历史缺陷样本。

生产数据仅能在获得授权并完成最小化、脱敏、访问审计和保留控制后使用。合成数据必须说明它代表的真实分布和无法代表的限制。每次执行记录数据版本、随机种子或生成参数、初始快照与清理结果，使同一结论可重现。测试之间共享可变数据时必须隔离或按可验证顺序重置，避免顺序依赖污染结果。

AI 数据集还必须满足 [AI 评测标准](./AI_EVALUATION_STANDARD.md)的来源、切分、泄漏控制、重复运行和统计要求。

## 9. Test Case、五层追踪与证据绑定

权威五层链是 `Requirement → Design → Task → Commit → Test`。在测试域中，`Requirement → Test Case → Evidence` 是这条五层追踪的测试投影：它用于展示需求如何被用例验证、用例如何被执行证据证明，但不能替代或缩短五层 Traceability Matrix。

因此，每个 Test Case 都必须同时关联 Requirement ID、Design ID、Task ID，并在 Phase 6 绑定当前被测 Commit SHA 与本次执行 Evidence。一个 Test Case 对应多条上游链时，必须在 Matrix 中按原子行展开，不能把多个核心 ID 隐藏在逗号列表或自由文本中。

### 9.1 Test Case 必填字段

| 字段 | 要求 |
|---|---|
| Test Case ID / 版本 | 稳定唯一的 `TC-XXXX` 与不可覆盖版本；废弃 ID 不复用 |
| 名称与目的 | 描述被验证行为及失败所代表的风险 |
| Phase / 类型 / 优先级 | DEVELOPMENT 或 Phase 6；Unit / Integration / System / UAT / Regression 等；执行优先级 |
| Requirement ID | 至少一个当前批准 Requirement；多链在 Matrix 展开 |
| Design ID | 与 Requirement 和行为对应的批准 Design |
| Task ID | 实现或支撑该行为的 Development Task |
| Chain ID | 对应 Traceability Matrix 原子链 |
| 当前 Commit SHA | Phase 6 必须是当前冻结 HEAD 可达的实际 SHA；仅 DESIGN 阶段可按 Matrix 规则使用 `NOT_CREATED` |
| 前置条件 | 环境、权限、依赖、初始状态和阻断条件 |
| Environment / Dataset | 精确 Environment ID 与 Dataset ID / 版本 |
| 步骤与输入 | 可由另一执行人无歧义复现的步骤、参数和顺序 |
| 预期结果 / 判定标准 | 每一步及最终结果的可观察预期、容差和通过条件 |
| Owner / 执行责任 | 用例维护人、计划执行人和需要的独立评审人 |
| Evidence 绑定 | 证据目录或记录位置；执行后填写 Execution ID、Evidence ID / 相对链接、采集时间和完整性信息 |
| Result / Bug | 当前基线结果；失败或阻塞时关联 Bug ID / Blocker ID |

Test Case 内容发生影响输入、预期或判定的变化时必须升版；不得修改旧版本来改变既有执行结论。

## 10. 执行与状态词汇

Test Case 生命周期只允许 `DRAFT`、`READY`、`RETIRED`。只有字段完整、经评审、版本与当前策略一致的用例才能为 `READY`。

每次执行必须创建独立 Execution Record。Test Result 只允许：

| Test Result | 可判定含义 |
|---|---|
| `NOT_RUN` | 当前基线没有开始有效执行；计划存在不等于已运行。 |
| `PASS` | 在记录的基线、环境和数据上完成全部步骤，所有预先定义的判定标准满足，证据完整。 |
| `FAIL` | 已执行且至少一项预先定义的判定标准未满足；必须关联 Bug 或经评审的非缺陷处置记录。 |
| `BLOCKED` | 因前置条件、环境、数据、权限或依赖无法完成执行；必须记录 Blocker、Owner 和解除条件，不能计为 PASS。 |
| `INVALIDATED` | 既有结果因 Commit、用例、环境、数据、配置或证据完整性变化而不再能证明当前基线。 |

不得使用“基本通过”“有条件通过”“大致正常”或百分比分数代替单个 Test Result。执行顺序至少包括：冻结策略与 HEAD、核验环境和数据、执行并采集原始证据、记录实际结果、登记缺陷、修复后定向验证、受影响回归、汇总报告。

## 11. 指标与判定

所有指标必须在执行前冻结名称、公式、分母、数据源、时间窗口、分片、阈值和批准人。范围变化必须重新计算分母；不得在看到结果后删除失败样本、改变权重或调整阈值。

| 指标 | 统一计算口径 |
|---|---|
| Requirement 覆盖率 | 有至少一个 `READY` Test Case 的当前批准 Requirement 数 ÷ 当前批准 Requirement 总数 |
| 五层追踪完整率 | `ALIGNED` 活动原子链数 ÷ 当前范围活动原子链总数 |
| Phase 6 执行率 | 具有当前有效 Execution Record 的计划 Test Case 数 ÷ 计划 Test Case 总数 |
| Test Pass Rate | `PASS` 数 ÷（`PASS` 数 + `FAIL` 数）；同时单列 `NOT_RUN`、`BLOCKED`、`INVALIDATED`，不得从退出判断中隐藏 |
| Regression Pass Rate | 当前回归集合中 `PASS` 数 ÷ 回归集合总数 |
| 缺陷关闭率 | 已按标准 `CLOSED` 的确认 Bug 数 ÷ 确认 Bug 总数；按 P0 Blocker / P1 Critical / P2 Major / P3 Minor 分层报告 |
| 证据完整率 | 具备全部必填执行字段和可访问 Evidence 的 Execution 数 ÷ 已执行总数 |

功能覆盖百分比不能抵消一个必选验收标准失败，汇总平均值不能抵消关键分片失败，自动化用例数量也不能替代风险覆盖。AI 指标使用 [AI 评测标准](./AI_EVALUATION_STANDARD.md)的附加口径。

## 12. 责任分工

| 角色 | 职责 |
|---|---|
| Test Owner | 冻结策略、范围、环境、数据、用例、顺序和指标；维护总结果并提出 Testing 结论 |
| Test Designer | 从 Requirement、Design、Task、风险与变更设计可执行 Test Case，维护五层映射 |
| Test Executor | 在指定基线执行，记录实际结果和原始证据，不修改判定标准 |
| Development Lead / Task Owner | 解释实现边界，处理缺陷，提供修复 Commit、TDD、Review 与回归支持 |
| Bug Owner | 按[缺陷管理标准](./BUG_MANAGEMENT_STANDARD.md)完成分析、修复与证据 |
| 领域评审人 | 对安全、数据、API、性能、运维、合规或 AI 评测给出独立结论 |
| 用户 / 业务责任人 | 执行或批准 UAT，并对业务验收标准作接受或拒绝判断 |
| Testing / Release 决策人 | 核对 Test Report 与阻断项；Testing PASS 不自动替代 Release 阶段授权 |

P0 Blocker / P1 Critical Bug、UAT、关键安全或高风险 AI 评测的验证人不得仅为修复作者或输出所有者。自动化工具可以采集和计算证据，但不能代替需要授权责任人的签署。

## 13. 变更、重测与回归

测试期间发生 Requirement、Design、Task、Commit、配置、依赖、环境、数据、Prompt、模型或工具变化时，Test Owner 必须：

1. 登记 Change ID 并执行影响分析；
2. 标记受影响 Execution 为 `INVALIDATED`，保留原证据；
3. 更新 Test Case、Matrix、策略版本与当前 HEAD；
4. 重新确认 Development Gate 或更早门禁是否仍有效；
5. 执行修复定向验证、全部受影响链和核心路径回归；
6. 以新 Execution ID 记录结果，禁止覆盖旧结论。

## 14. 结果记录与证据

每个 Execution Record 至少包含 Execution ID、Test Case ID / 版本、Requirement / Design / Task / Chain、Commit SHA、Environment ID、Dataset ID、执行人、开始与结束时间、步骤实际结果、Test Result、Evidence 链接、Bug / Blocker ID 和复核人。

Evidence 必须可访问、只读或具备完整性校验，并能证明执行对象、时间、输入和输出。原始日志、报告、截图、请求响应、数据库前后状态、监控数据和人工签署均可作为证据；只有截图而缺少可复核上下文时不能单独构成关键结论。敏感信息必须按最小权限、脱敏和保留策略处理。

最终 Test Report 至少记录：

- Strategy、Test Case、Matrix、Bug Register 和 `APPROVED_FOR_TESTING` 的版本化链接；
- 范围、Base / HEAD、环境、数据、执行时间窗和参与角色；
- 按类型、优先级和 Requirement 汇总的 `NOT_RUN` / `PASS` / `FAIL` / `BLOCKED` / `INVALIDATED` 数量；
- 指标公式、分母、阈值、实际值、关键分片与原始 Evidence；
- P0 Blocker / P1 Critical / P2 Major / P3 Minor Bug 的状态、重开情况、剩余风险和批准记录；
- UAT、非功能和 AI 评测结论；
- 偏差、限制、失效结果、回归范围与下一动作；
- 最终 `PASS` 或 `FAIL`、Test Owner、评审人、批准人和时间。

## 15. Phase 6 进入与退出

### 15.1 进入条件

只有以下条件全部满足才能开始正式 Phase 6 执行：

- 当前精确基线存在有效 `APPROVED_FOR_TESTING`；
- Test Strategy 为 `APPROVED`，范围、HEAD、环境、数据、Owner 与首个动作一致；
- Phase 6 Test Case 均为 `READY`，五层链完整，计划结果为 `NOT_RUN`；
- 环境和数据就绪，证据存储可用，阻断项为 0。

### 15.2 PASS 条件

最终 Testing 结论只有 `PASS` 或 `FAIL`。只有以下条件全部满足才能为 `PASS`：

- 当前范围全部计划 Test Case 已执行，`NOT_RUN`、`BLOCKED`、`INVALIDATED` 数均为 0；
- 所有必须通过的功能、System、UAT、非功能、回归和 AI 评测均为 `PASS`；
- Requirement 覆盖率和五层追踪完整率均为 100%，全部活动链为 `ALIGNED`；
- 未关闭或重开的 P0 Blocker、P1 Critical Bug 数均为 0；P2 Major / P3 Minor 均已关闭或有针对当前基线的授权风险处置；
- 所有预设指标和关键分片达到阈值，证据完整且可访问；
- Test Report 已完成独立评审并记录明确结论。

任一条件不满足时结论为 `FAIL`，修复并重新基线后按影响范围重测。Testing `PASS` 只满足进入 RELEASE 的测试前提，不等于发布、生产部署或项目交付授权。

## 16. 审计检查

评审人必须确认：目标可判定、范围可复算、五类测试定义未混用、环境和数据可复现、Test Case 绑定 Requirement / Design / Task / 当前 Commit / Evidence、开发级结果未冒充 Phase 6、指标阈值在执行前批准、状态词汇合法、Bug 与 Test Report 链接可访问。任一项失败都必须修订后重新评审。
