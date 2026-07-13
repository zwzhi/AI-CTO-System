# 缺陷管理标准

## 1. 目的与适用范围

本标准规定 Bug 从发现、记录、分级、修复、验证到关闭的完整闭环，确保每个缺陷都能关联当前基线、影响链、修复 Commit、测试与证据。它适用于 DEVELOPMENT、TESTING、RELEASE 和 MAINTENANCE 中发现的产品、代码、配置、数据、接口、安全、文档、运维和 AI 行为缺陷。

本标准与[测试策略标准](./TEST_STRATEGY_STANDARD.md)、[Test-Driven Development 标准](../development/TEST_DRIVEN_DEVELOPMENT_STANDARD.md)、[Development Approval Gate](../development/DEVELOPMENT_APPROVAL_GATE.md)和[Traceability Matrix 模板](../design/TRACEABILITY_MATRIX_TEMPLATE.md)共同使用。

## 2. 管理原则

1. 所有可观察的预期与实际偏差都必须先记录，再决定优先级或处置；不得因“很快能修”“只在测试环境出现”而省略 Bug ID。
2. Bug 结论只对记录的 Requirement / Design / Task / Commit、环境、数据和时间有效。
3. Bug 历史不可覆盖。优先级、状态、Owner、根因、方案或结论变化必须追加时间、操作者、原因和证据。
4. 修复作者不能独自验证并关闭自己负责的 P0 Blocker / P1 Critical Bug。
5. 自动化检查可以发现、复现和采集证据，但不能代替有授权责任人的分级、风险接受或关闭决定。
6. Bug Register 是权威索引；具体 Requirement、Design、Task、Commit、Test Case 与 Evidence 仍由各自源记录负责。

## 3. 标准流程

| 阶段 | 必须完成的动作 | 阶段输出 |
|---|---|---|
| 发现 | 保留现场，记录预期与实际差异；涉及安全、数据或不可逆副作用时立即停止扩大影响 | 初始 Evidence、发现人、发现时间、受影响基线 |
| 记录 | 创建唯一 Bug ID，填写所有必填字段；尚未完成的分析字段使用受控初始值，不能留空 | 状态为 `NEW` 的 Bug Record |
| 分级 | 复现或记录不可稳定复现的证据，确认影响范围、优先级、受影响五层链、Owner 和下一动作 | 状态为 `TRIAGED`，优先级与责任明确 |
| 修复 | 完成原因分析、修复方案与回滚考虑；按 TDD 建立失败证据，实施最小修复、Review 和回归 | 修复 Commit、Review、RED / GREEN / REFACTOR 与回归证据 |
| 验证 | 在目标 Commit、环境和数据上由合格验证人重现旧失败、验证修复并检查回归 | 明确 Verification Result 与 Evidence |
| 关闭 | 核对字段、追踪、验证、文档和风险全部满足关闭条件，记录最终 Resolution | 状态为 `CLOSED` 的不可覆盖记录 |

流程不得把“提交了代码”当作修复完成，也不得把“无法复现”直接当作验证通过。任何阶段的阻塞都必须记录 Blocker ID、Owner、解除条件和下一次复核条件。

## 4. 优先级

项目的规范 Bug Priority 只允许以下四级，名称和含义不得改写：

| Priority | 精确定义 | 典型判定条件 | 处置边界 |
|---|---|---|---|
| `P0 Blocker` | 当前系统、核心业务闭环、Testing 或发布候选无法安全继续，且没有可接受的临时控制。 | 大面积不可用；不可逆数据丢失或破坏；正在发生的严重安全、隐私、合规或人身风险；关键恢复路径失效。 | 立即停止受影响执行或发布；未 `CLOSED` 前绝对阻断发布。 |
| `P1 Critical` | 核心功能或关键质量属性严重失效，造成重大但尚未达到全面阻断的用户、业务、安全或数据影响。 | 关键旅程对重要用户群失败；严重错误结果；高影响权限、安全、隐私或数据完整性缺陷；频繁崩溃；仅有脆弱或高成本绕行。 | 必须优先修复并独立验证；未 `CLOSED` 前阻断发布。 |
| `P2 Major` | 重要功能明显退化或错误，影响有界且存在可接受的临时绕行，不立即造成灾难性后果。 | 非核心但重要场景失败；可恢复的数据或兼容问题；明显性能、可用性或操作效率下降。 | 必须有计划、Owner 和回归范围；若未关闭，只有获授权的当前基线风险处置才能随发布候选继续。 |
| `P3 Minor` | 对核心功能、安全、数据完整性和主要验收无实质影响的低风险缺陷。 | 轻微视觉、文案、易用性或低频边界问题；结果仍正确且有简单绕行。 | 可进入后续排期；未关闭时仍须保留可追踪记录和明确处置。 |

分级时适用多个条件，必须选择最高优先级。影响未知但可能触及 P0 Blocker / P1 Critical 时，在调查完成前按较高候选级别采取控制。不得通过缩小描述、拆分受影响用户、Feature Flag 隐藏或宣称“不影响主流程”来降低级别。

项目若使用其他缺陷词汇，必须在项目 Bug Policy 中建立到上述四级的一对一映射并记录批准人；门禁和发布检查一律使用本标准名称。优先级变更必须保留原级别、新级别、事实变化、申请人、批准人、时间和 Evidence，不能为了通过门禁或发布而降级。

## 5. Bug Record 必填字段

| 字段 | 必填要求 |
|---|---|
| Bug ID | 稳定唯一的 `BUG-XXXX`；关闭或废弃后不得复用 |
| 标题 / 摘要 | 一句话描述对象、条件与可观察偏差 |
| 发现时间 | 含时区的时间戳 |
| 发现人 / 来源 | 人员或责任角色，以及 Test Case、监控、用户反馈或审查来源 |
| 影响范围 | 受影响用户、业务、模块、数据、安全、环境、Requirement ID、Design ID、Task ID、Chain ID、Commit SHA 和 Test Case ID |
| 受影响基线 | Repository、Branch、Base SHA、HEAD / 失败 Commit、构建物、配置版本 |
| 环境与数据 | Environment ID、Dataset ID / 版本、权限、依赖和初始状态 |
| 复现步骤 | 可按顺序执行的前置条件、输入和步骤；间歇性问题还需记录频率、观测窗口和已尝试条件 |
| 预期结果 / 实际结果 | 引用批准的判定依据，并描述可观察差异 |
| 初始 Evidence | 日志、请求响应、截图上下文、数据前后状态、跟踪或其他可复核证据链接 |
| Priority | `P0 Blocker`、`P1 Critical`、`P2 Major` 或 `P3 Minor`，以及事实依据和批准人 |
| Status / 历史 | 当前允许状态、每次转换时间、操作者、原因和证据 |
| Owner | 当前阶段责任人；转移责任必须记录接受人和时间 |
| 原因分析 | 根因、触发条件、未被既有控制发现的原因和受影响链；初始受控值见第 5.1 节 |
| 修复方案 | 变更范围、替代方案、风险、数据处理、兼容与回滚；初始受控值见第 5.1 节 |
| 修复记录 | Fix Task ID、修复 Commit SHA、Change ID、Code Review 和文档更新链接 |
| TDD 与回归 | RED Test、GREEN、REFACTOR、定向 Test Case、回归集合与 Evidence |
| 验证结果 | Verification Result、验证 Commit、Environment / Dataset、执行人、时间、实际结果和 Evidence |
| Resolution | 初始为受控值 `UNRESOLVED`；最终为 `FIXED`、`DUPLICATE`、`NOT_A_BUG`，或开放风险处置 `RISK_ACCEPTED_OPEN`，并附授权证据 |
| 重开信息 | 重开次数、触发时间、复发条件、新 Evidence 和重新分级结果 |
| 关闭信息 | 关闭人、关闭时间、关闭依据和最终 Evidence |

### 5.1 受控初始值

必填字段不得为空。创建 `NEW` 记录时，调查尚未完成的字段只能使用下列受控值，并必须在相应状态退出前替换：

- 原因分析：`NOT_ANALYZED`，仅允许保留到进入 `IN_FIX` 之前；
- 修复方案：`NOT_PROPOSED`，仅允许保留到进入 `IN_FIX` 之前；
- 修复 Commit：`NOT_CREATED`，仅允许保留到进入 `READY_FOR_VERIFICATION` 之前；
- 验证结果：`NOT_VERIFIED`，仅允许保留到进入 `VERIFIED` 之前；
- Resolution：`UNRESOLVED`，仅允许保留到进入 `VERIFIED` 之前。

复现步骤不能使用空值代替。若暂时无法稳定复现，必须记录 `NON_DETERMINISTIC`、原始观察步骤、发生次数 / 尝试次数、日志和下一项诊断动作；Bug 保持打开。

## 6. 状态与转换

Bug Status 只允许以下值：

| Status | 进入条件 | 允许的下一状态 |
|---|---|---|
| `NEW` | 已创建 Bug ID，发现信息、影响基线、复现信息和初始 Evidence 完整 | `TRIAGED` |
| `TRIAGED` | Priority、影响范围、受影响链、Owner、复现结论和下一动作已批准 | `IN_FIX`；非代码处置可进入 `READY_FOR_VERIFICATION` |
| `IN_FIX` | 原因分析与修复方案已批准，Fix Task / Change、TDD RED 和回滚考虑已记录 | `READY_FOR_VERIFICATION` |
| `READY_FOR_VERIFICATION` | 修复或处置已完成；当前 Commit、Review、GREEN / REFACTOR、定向测试和回归证据齐全 | `VERIFIED` 或 `REOPENED` |
| `VERIFIED` | 独立验证结果为 `PASS`，目标基线与 Evidence 完整，Resolution 已确定 | `CLOSED`；证据失效或问题复发时为 `REOPENED` |
| `CLOSED` | 关闭检查通过，追踪、文档和风险处置完整 | 问题复发或结论失效时为 `REOPENED` |
| `REOPENED` | 先前修复未生效、问题复发、回归失败或验证证据失效，且新 Evidence 已记录 | `TRIAGED` |

除表中路径外不得跳转。`VERIFIED` 不是 `CLOSED`，合并代码、Review APPROVED、自动化 GREEN 或单次人工确认都不能直接关闭 Bug。项目可以记录 Blocked 标记，但 Blocked 不替代 Status；被阻塞 Bug 仍按其当前开放状态计数。

`DUPLICATE` 和 `NOT_A_BUG` 是 Resolution，不是跳过验证的状态。它们必须由独立评审人核对主 Bug 或批准 Requirement / Design 证据，经 `READY_FOR_VERIFICATION → VERIFIED → CLOSED` 留下完整处置链。`RISK_ACCEPTED_OPEN` 只适用于仍然存在且获授权携带的 P2 Major / P3 Minor；该 Bug 保持开放，不能进入 `VERIFIED` 或 `CLOSED`。

## 7. 分级与原因分析

Triage Owner 必须核对复现证据、影响人群、数据与安全后果、核心功能、环境差异、发生概率和可恢复性，再确定 Priority。分级不得只依据修复工作量；容易修复的严重缺陷仍是 P0 Blocker / P1 Critical。

原因分析至少回答：

1. 哪个技术或流程条件直接导致偏差；
2. 哪些输入、环境、数据或时间条件触发；
3. 哪些 Requirement / Design / Task / Commit / Test 链受影响；
4. 为什么现有测试、Review、监控或控制没有更早发现或阻止；
5. 是否存在同源缺陷、数据修复、安全处置、回滚或预防动作。

仅写“代码问题”“模型不稳定”“配置错误”不构成原因分析。根因未确认时 Bug 不能进入 `IN_FIX`；紧急止损可以先执行，但必须记录为独立控制动作，不得冒充最终修复。

## 8. TDD 修复要求

确认需要修复的 Bug 必须按 [Test-Driven Development 标准](../development/TEST_DRIVEN_DEVELOPMENT_STANDARD.md)执行：

1. 将复现条件转成新的或已修订的 Test Case，绑定 Bug ID、Requirement ID、Design ID、Fix Task ID 和失败 Commit。
2. 在修复前的基线运行并保存 `RED` Evidence，证明测试因该缺陷按预期失败，而不是因环境或测试脚本错误失败。
3. 实施满足行为的最小修复，在修复 Commit 上取得 `GREEN`。
4. 完成必要重构后重复执行，证明 `REFACTOR` 后仍为 `PASS`。
5. 执行定向测试、全部受影响五层链、核心路径和历史缺陷回归。
6. 关联不可变 Fix Commit、Code Review、Change Impact、Matrix 更新和全部 Evidence。

对无法合理自动化的非代码、硬件、人机流程或偶发缺陷，必须由 Test Owner 在修复前批准可判定的手工 RED / GREEN 方法，记录批准理由、步骤、双人复核和原始 Evidence。不能自动化不等于可以省略复现、验证或回归。

## 9. 验证规则

Verification Result 使用[测试策略标准](./TEST_STRATEGY_STANDARD.md)定义的 `PASS`、`FAIL`、`BLOCKED` 或 `INVALIDATED`；`NOT_RUN` 只能在尚未开始验证时使用。

验证人必须：

- 在目标 Fix Commit、代表性环境和指定数据上执行，不得验证旧构建物；
- 核对原始缺陷在失败基线可观察，并在修复基线不再出现；
- 检查所有验收标准、失败路径、数据修复、副作用、回滚和回归集合；
- 记录 Execution ID、实际结果、时间、Evidence 和当前 Matrix 链；
- 对 P0 Blocker / P1 Critical 保持相对修复作者的独立性，并由领域责任人复核安全、数据或合规影响。

验证为 `FAIL`、`BLOCKED` 或 `INVALIDATED` 时不能进入 `VERIFIED`，必须转为 `REOPENED` 或保持 `READY_FOR_VERIFICATION` 并记录明确阻塞。只验证原复现步骤而不执行受影响回归不构成完整验证。

## 10. 重开规则

出现以下任一事实必须重开：

- 相同症状或同一根因在当前或后续基线再次出现；
- 修复仅掩盖症状、绕开测试或没有覆盖批准范围；
- 受影响回归、数据修复、安全检查或 UAT 失败；
- 验证使用了错误 Commit、环境、数据、配置或 Test Case；
- 原 Evidence 不可访问、被篡改或因基线变化失效。

重开时保留原 Bug ID 和全部历史，Status 改为 `REOPENED`，记录新发现时间、Commit、环境、复现步骤、Evidence、重开次数，并重新执行影响评估和 Priority 分级。不得复制新 Bug 来隐藏重开率；只有根因和影响链独立时才创建新 Bug，并双向链接。

P0 Blocker / P1 Critical 重开立即使此前依赖其关闭结论的 Testing 或 Release 候选失效，相关结果标记为 `INVALIDATED` 并重新评审。

## 11. 关闭条件

`FIXED` Bug 只有以下条件全部满足才能从 `VERIFIED` 转为 `CLOSED`：

- 原因分析和修复方案完整，Fix Task、Commit、Review 与 Change 记录可访问；
- TDD RED / GREEN / REFACTOR、定向验证和受影响回归均针对当前基线且为 `PASS`；
- Requirement → Design → Task → Commit → Test 活动链恢复 `ALIGNED`；
- 数据、安全、文档、配置、监控、运行手册和回滚中受影响部分已同步；
- Verification Result、验证人、时间、环境、数据和 Evidence 完整；
- 没有未处理的同源影响，关闭人具备权限且不是 P0 Blocker / P1 Critical 的唯一修复作者。

关闭后不得删除或重写记录。任何关闭证据与当前基线不一致时，必须重开或标记相关结果失效。

## 12. P0 Blocker / P1 Critical 发布阻断

任一 `P0 Blocker` 或 `P1 Critical` Bug 只要未处于 `CLOSED`，包括 `NEW`、`TRIAGED`、`IN_FIX`、`READY_FOR_VERIFICATION`、`VERIFIED` 或 `REOPENED`，就必须阻断 Testing PASS 和 RELEASE。未分级但可能影响发布候选的 Bug 也先作为阻断项，直至 Triage 完成。

下列情况不能解除 P0 Blocker / P1 Critical 阻断：

- 风险接受、延期承诺、临时绕行或声称发生概率低；
- Feature Flag 默认关闭、隐藏入口或限制部分用户；
- 修复 Commit 已存在但未独立验证和关闭；
- 自动化通过率、整体覆盖率或其他指标足以“抵消”该 Bug；
- 只在非生产环境复现，但原因可能存在于发布基线。

P2 Major / P3 Minor 未关闭时，只有有权限的业务、技术和风险责任人针对当前精确基线批准 `RISK_ACCEPTED_OPEN`，并记录影响、期限、监控、触发器、Owner、回滚与 Evidence，发布候选才可以继续；该处置不会把 Bug 改为 `CLOSED`。范围、Commit 或风险条件变化后原接受失效。

## 13. Bug Register、指标与证据

Bug Register 每行至少包含 Bug ID、标题、Priority、Status、Owner、发现时间、受影响 Requirement / Design / Task / Commit / Test / Chain、修复 Commit、Verification Result、Resolution、重开次数和证据链接。详细记录保存在版本化 Bug Record 中。

每个 Testing / Release 候选至少报告：

- P0 Blocker / P1 Critical / P2 Major / P3 Minor 的发现数、开放数、`CLOSED` 数与重开数；
- 按 Status 的当前数量和最长开放项，而不使用平均值隐藏个别高优先级问题；
- Bug 发现阶段、受影响 Requirement、根因类别和缺陷逃逸情况；
- 验证 `FAIL` / `BLOCKED` / `INVALIDATED` 数与 Evidence 完整率；
- 当前基线未关闭 P0 Blocker / P1 Critical 数，必须为 0 才能通过。

如果当前基线没有发现 Bug，Bug Register 仍必须记录范围、Base / HEAD、查询方法、执行人、时间、Evidence 和结果数量 0；Bug 检查不得标记 N/A。

## 14. 审计检查

评审人必须确认流程六阶段均可追溯，Priority 仅使用四个规范值，所有必填字段非空，状态转换合法，P0 Blocker / P1 Critical 没有通过降级或风险接受绕过，修复具备 TDD 与当前 Commit 证据，验证独立且可复现，关闭和重开历史完整，所有相对链接可访问。任一项不满足时 Bug 不能关闭，相关门禁不能通过。
