# Development Approval Gate

## 1. 目的与授权边界

本门禁是 DEVELOPMENT → TESTING 转换的唯一授权记录，与 [阶段门禁检查清单](../evaluation/PHASE_GATE_CHECKLIST.md)、[ADR-0004](../adr/ADR-0004-DEVELOPMENT-EVIDENCE-AND-TESTING-AUTHORIZATION.md)、[Traceability Matrix 模板](../design/TRACEABILITY_MATRIX_TEMPLATE.md)、[Change Impact Analysis](./CHANGE_IMPACT_ANALYSIS.md) 和 [Development Status Standard](./DEVELOPMENT_STATUS_STANDARD.md) 一致。

开发任务完成不等于获得 Testing 授权。只有本门禁针对当前代码、文档和测试用例基线给出 `APPROVED_FOR_TESTING`，项目才能转换到 TESTING。口头同意、自动评分、旧版本记录、风险接受、部分通过或“先进入测试再补证据”都不构成授权。

本门禁只判断当前实现是否具备进入 Phase 6 Testing 的条件。它不证明完整系统测试、非功能测试、正式 AI 评测、用户验收或发布验证已经完成，也不授权发布、生产部署、数据迁移执行或项目交付。

## 2. 唯一门禁结果

本门禁只允许两个结果：

| Gate Result | 含义 | 是否授权进入 TESTING |
|---|---|---|
| `APPROVED_FOR_TESTING` | 全部逐项标准通过，硬阻断为 0，当前基线已冻结并获 Testing 授权 | 是 |
| `CHANGES_REQUIRED` | 任一输入、证据、检查或批准未满足；保持 DEVELOPMENT 或按问题性质退回更早阶段 | 否 |

不设置条件性批准、暂缓、部分批准或第三种结果。即使缺口预计很快关闭，也必须先记录 `CHANGES_REQUIRED`，修订后以新门禁记录重新评审。

## 3. 角色与职责

| 角色 | 职责 |
|---|---|
| Gate Owner | 冻结评审基线、组织逐项检查、确认硬阻断数量、记录唯一结果 |
| Development Lead | 证明门禁范围、P0 关联任务、核心功能和开发任务验收状态 |
| Task Owner | 提供任务范围、Commit、Review、开发级测试和完成证据 |
| Code Reviewer | 对精确 Diff、Commit 与基线给出独立评审结论，核对阻断意见关闭情况 |
| Test Owner | 核对开发级测试结果和 Phase 6 测试用例就绪度，冻结 Testing 范围、环境与首个动作 |
| 数据 / API / 安全 / 运维评审人 | 在适用范围内核对契约、迁移、权限、部署、监控和回滚证据 |
| Change Owner | 证明全部变更影响记录关闭、重新基线完成、活动链恢复 ALIGNED |
| 用户 / 业务责任人 | 确认当前 Testing 范围、核心功能清单和用户可见变更基线；该确认不是用户验收或发布批准 |

Gate Owner、Agent 或自动化工具不能代替 Code Reviewer、Test Owner、领域责任人或用户 / 业务责任人的明确结论。作者不得独自批准自己负责的 HIGH / CRITICAL 变更或消除自己的阻断意见。

## 4. 术语定义

### 4.1 P0 Requirement 与 P0 关联任务

`P0 Requirement` 是当前已批准 PRD / Requirement Priority 基线中明确标记为 P0、对目标价值或最小可用闭环不可缺失的需求。门禁期间不得由开发人员临时降级、拆散或重新解释 P0。

`P0 关联任务` 包括：

- Traceability Matrix 中直接映射到 P0 Requirement 的全部 Task。
- P0 Requirement 完成所必需的共享、集成、数据迁移、安全、权限、可观测性、恢复、文档和测试支持 Task。
- 如果移除会使 P0 验收标准无法满足、五层链断裂或核心流程不可运行的前置 / 依赖 Task。

P0 关联任务必须按原子链全部列出；不能只选择代表任务。若当前批准基线确实没有 P0 Requirement，必须提供产品 / 用户责任人批准的优先级基线、全量 Requirement 查询和原因记录；这不豁免核心功能完成、任务证据或其他门禁标准。

### 4.2 核心功能

核心功能是 PRD、Architecture、Development Plan 或获批范围基线中预先列出的关键用户旅程、业务闭环、系统能力和必要失败 / 恢复路径。核心功能清单必须在门禁前冻结，包含 Core Function ID、关联 Requirement / Design / Task / Test、完成条件和责任人；不能在评审时通过删减清单获得通过。

“核心代码已写完”不等于核心功能完成。每个核心功能必须在当前集成基线中可运行，相关任务已验收，开发级必跑测试通过，关键依赖、权限、数据、错误处理和恢复路径达到批准的完成条件。

### 4.3 开发级测试与 Phase 6 Testing

开发级测试包括任务 TDD 的 RED / GREEN / REFACTOR 证据、单元测试、组件测试、定向集成测试、静态检查、安全 / 数据专项检查、回归和 Development Validation。凡被 Development Plan 或任务完成条件规定为开发阶段必跑的测试，门禁时必须 PASS。

Phase 6 Testing 包括在独立 Testing 阶段执行的完整系统、端到端、非功能、兼容、恢复、对抗 / AI 评测、正式验收和用户验收活动。门禁要求这些 Test Case 已存在、可执行、版本一致且责任 / 环境明确，但不要求在进入 TESTING 前虚构为 PASS；尚未执行时必须明确记录 `NOT_RUN`。

## 5. 门禁输入

发起评审时必须提供可访问、版本化、状态明确且指向同一基线的输入：

1. 当前范围有效的 `APPROVED_FOR_DEVELOPMENT` 记录及精确 Design 基线。
2. 当前 PRD、Requirement Priority、Architecture、Database / Agent Design（适用时）、Development Plan 与相关 Accepted ADR。
3. 按 [Development Status Standard](./DEVELOPMENT_STATUS_STANDARD.md) 更新的 Development Status，以及同步后的 PROJECT_STATE 与 PROJECT_MEMORY。
4. 当前 Traceability Matrix；Requirement → Design → Task → Commit → Test 五层正向、反向、孤儿项、失效引用和覆盖完整性结果。
5. 当前门禁范围全部 Task、P0 关联任务和核心功能清单及任务验收证据。
6. 实际 Commit SHA 清单、分支 / 合并记录、逐项 Code Review 记录和 Review 问题关闭证据。
7. TDD RED / GREEN / REFACTOR、开发级测试、Validation、回归和覆盖结果；失败 / 阻塞记录必须同时提供。
8. Phase 6 Test Plan / Test Case 集，包含环境、数据、步骤、预期结果、判定标准、Owner 和证据保存位置。
9. 按 [Change Impact Analysis](./CHANGE_IMPACT_ANALYSIS.md) 形成的全部 Change 记录、N/A、风险、回滚验证和关闭证据。
10. Bug Register，包含 Bug ID、优先级、影响链、状态、Owner、修复 Commit、Review、Test 和关闭证据。
11. 文档同步清单，覆盖所有受影响源文档、API / 数据契约、配置、运行手册、风险、回滚、状态与追踪矩阵。
12. Git 状态证据，包含 Repository、工作树、分支、Base SHA、HEAD SHA、上游同步、合并状态、采集命令、执行人和时间。
13. 当前风险清单、未关闭评审意见、安全 / 合规检查与剩余风险接受记录。
14. 用户 / 业务责任人对当前 Testing 范围、核心功能清单、用户可见变化和精确版本基线的确认记录。
15. 拟进入 TESTING 的范围、代码 / 文档版本、测试环境、数据策略、Test Owner 和第一项 Next Action。

任一强制输入缺失、不可访问、引用“最新版”、状态不明确或不属于同一基线时，门禁不能通过。

## 6. 适用性与 N/A

P0 / 核心功能检查、完成 Task 的 Commit / Review / Test 证据、五层追踪、Change 关闭、Bug 检查、文档同步、Git 状态、Development Status、门禁结果和 Testing 范围不得标记为 N/A。

只有确实不被当前范围触发的领域子检查可以使用 N/A，例如无持久化的数据迁移检查、无网络 / 消息契约的 API 兼容检查或没有远程仓库时的 upstream 同步检查。每项 N/A 必须独立记录：

| 字段 | 要求 |
|---|---|
| 检查项 | 精确到领域和边界 |
| 当前基线 | 范围、文档版本和 HEAD SHA |
| 事实依据 | 说明为何当前范围不触发检查，不接受“没有影响”等结论式理由 |
| 边界核验 | 已检查的文件、数据流、调用、Git 配置或自动化结果 |
| 责任与批准 | 申请人、领域评审人、批准人、时间和证据链接 |
| 复核触发器 | 范围、依赖、实现、数据、API、环境或 Git 拓扑变化 |
| 状态 | Proposed、Approved、Rejected 或 Superseded |

只有 Approved、引用当前基线且触发器未发生的 N/A 有效。无远程仓库不豁免工作树清洁、无冲突、Commit 可访问、分支正确和 HEAD 冻结等本地 Git 检查。

## 7. 逐项通过标准

### 7.1 授权与版本基线

- `APPROVED_FOR_DEVELOPMENT` 对当前范围有效，批准后发生的基线变更均已重新授权。
- 所有门禁输入记录路径、版本 / Commit、状态、Owner、批准人和日期，并指向同一 Base / HEAD。
- 实现没有超出 PRD、Architecture、Development Plan 和 Accepted ADR；偏差均有已关闭 Change、源文档更新和重新基线证据。
- PROJECT_STATE 的 Current Stage 仍为 DEVELOPMENT，Development Status 与 PROJECT_MEMORY 已同步到候选基线。

### 7.2 P0 关联任务

- 当前批准基线的 P0 Requirement 已全量枚举，直接和间接 P0 关联任务均已展开。
- 每个 P0 关联任务的 Task Status 为 ACCEPTED，验收条件逐项 PASS，Owner、验收人、日期和证据齐全。
- 每个 P0 关联任务都有 VERIFIED 实际 Commit、APPROVED Review、所需开发级 PASS 测试和 ALIGNED 五层链。
- P0 关联任务总数、ACCEPTED 数和未完成数可从 Development Plan、Status 和 Matrix 复算；未完成数必须为 0。

### 7.3 核心功能

- 核心功能清单与批准范围一致，每个 Core Function ID 映射到 Requirement、Design、Task 和 Test Case。
- 核心成功路径、关键失败路径、权限、数据、外部依赖、错误处理、可观测性和恢复行为达到预先定义的完成条件。
- 核心功能在冻结的集成基线和记录环境中完成开发级验证，结果为 PASS；证据包含版本、环境、数据、预期与实际结果。
- 不存在通过 Feature Flag 默认关闭、Mock 替代真实必需依赖、跳过错误路径或临时手工步骤掩盖的未完成功能，除非这些行为本身属于批准设计与验收条件。

### 7.4 Commit 与 Code Review

- 门禁范围内每个完成 Task 至少关联一个实际不可变 Commit SHA；所有范围 Commit 均能反向追踪到 Task、Design、Requirement 和验证它的 Test Case。
- Review 针对当前 Base、HEAD、完整 Diff 和实际 Commit 集进行；Review 后发生代码、配置、依赖或生成物变化时，旧批准标记 INVALIDATED 并重新评审。
- 评审覆盖正确性、边界 / 失败处理、安全、权限、数据、API 兼容、并发 / 性能（适用时）、可维护性、测试充分性、可观测性与回滚。
- 所有阻断和必改意见已通过修复 Commit、复审和验证关闭；未关闭阻断意见数量为 0。
- Review 记录包含评审人、时间、Base / HEAD、结论、问题 ID 和证据链接；作者声明或自动检查不能单独构成 APPROVED。

### 7.5 五层追踪

- Requirement → Design → Task → Commit → Test 每条活动原子链完整，Commit 槽均为实际 SHA，不得残留 `NOT_CREATED`。
- 正向与反向检查均 PASS；Requirement 下游、Design / Task 双向和 Test Case 上游覆盖率为 100%。
- 孤儿项、BROKEN 链、失效引用、模板占位符、未经批准 RETIRED 链和未关闭变更影响数量均为 0。
- 所有活动 Chain Status 为 ALIGNED，Matrix 链接、章节、版本、状态与当前代码 / 文档基线一致。

### 7.6 Change Impact 关闭

- 当前范围全部 Change ID 已按 [Change Impact Analysis](./CHANGE_IMPACT_ANALYSIS.md) 覆盖模块、数据库、API、测试、风险与回滚。
- N/A 均为 Approved、证据充分、引用当前基线且复核触发器未发生。
- Change Status 全部为 CLOSED；OPEN、IN_REVIEW 或仅 REBASELINED 而未完成验证的数量为 0。
- 所有实际差异、源文档、ADR、Development Plan、Test Plan、Matrix、Status、PROJECT_STATE 与 PROJECT_MEMORY 已同步。
- 未关闭 HIGH / CRITICAL Change Impact 为 0，回滚或等价恢复控制已验证。

### 7.7 测试用例与开发级测试证据

- 每个必须满足的 Requirement、P0 关联 Task 和核心功能至少有一项可执行 Test Case，并引用 Requirement、Design、Task 和实际 Commit。
- Test Case 覆盖功能、非功能、边界、失败、权限、安全、兼容、数据、恢复和回归；AI 项目还覆盖注入、越权、敏感数据、工具副作用、评测门槛和人工接管。
- 测试环境、前置条件、数据、步骤、预期结果、判定标准、Owner 和证据位置完整；用例与当前基线一致。
- 所有任务完成定义要求的 TDD、单元、组件、定向集成、回归和 Development Validation 均已实际执行并 PASS；FAIL、BLOCKED、INVALIDATED 数量为 0。
- RED 证据证明测试在实现前或缺失行为下按预期失败；GREEN 证明最小实现通过；REFACTOR 后重复验证仍 PASS。若采用经批准的非代码任务测试策略，必须引用该任务的可判定验证方法。
- Phase 6 的完整系统、非功能、正式 AI 评测和用户验收用例可以为 NOT_RUN，但数量、范围和原因必须明确；不得提前标记 PASS。Test Owner 已确认进入 TESTING 后的执行顺序与首个动作。

### 7.8 文档同步

- PRD、Requirement Priority、Architecture、Database / Agent Design、ADR、Development Plan 和 Test Plan 已反映全部获批范围变化。
- API / 事件 / 文件契约、数据库 Schema / 迁移、配置、依赖、运行手册、监控、风险和回滚文档与当前实现一致。
- Development Status、Traceability Matrix、PROJECT_STATE 和 PROJECT_MEMORY 引用同一 Base / HEAD 和文档版本。
- 文档中的 Task、Commit、Review、Test、Bug、Change 和风险状态与其权威记录一致；链接可访问，无旧章节、孤儿引用或“稍后补充”。
- 文档同步责任人、Review、完成时间和证据已记录。

### 7.9 Bug、风险与安全

- Bug 优先级取 Bug Register 与项目定义中的最高严重度；如果项目使用不同词汇，必须先映射到 P0 / Blocker、P1 / High、P2 / Medium、P3 / Low，不能在门禁时降级。
- 未关闭 P0 / Blocker 和 P1 / High Bug 数量必须为 0。风险接受、计划在 Testing 修复、Feature Flag 隐藏或“不影响主流程”不能绕过。
- 已关闭高优先级 Bug 具有修复 Commit、Review、定向测试、回归和五层追踪证据；重新出现时立即重新打开。
- 未关闭安全、隐私、合规、数据完整性红线，开发阻断和无可信回滚的 HIGH / CRITICAL 风险数量为 0。
- 非阻断剩余风险由有权限的人针对当前基线明确接受，并记录监控、触发器、Owner 和 Testing 期间的处置动作。

### 7.10 Git 状态正常的可验证定义

Git 只有在以下条件全部满足时才可标记为 PASS：

1. Repository 路径和对象数据库可访问；证据记录执行人、时间、Git 版本和仓库标识。
2. 当前分支是 Development Plan / 仓库策略允许的评审或集成分支，不处于 detached HEAD；例外必须由仓库策略明确批准。
3. Base SHA 与 HEAD SHA 已冻结；门禁范围所有 Commit 均可由 HEAD 到达并位于声明的 Base..HEAD 集合内。
4. 工作树和暂存区清洁：标准状态输出为空，包括未提交修改、已暂存修改和未跟踪文件；忽略文件仍受仓库忽略规则约束。
5. 未解决合并路径为 0，不存在 merge、rebase、cherry-pick、revert 或 bisect 等未完成操作，也不存在未关闭冲突标记。
6. 所有门禁范围 Commit 都有 Task / Change 引用、可访问 Review 和 Test 证据；没有未审查的合并后修改、孤儿 Commit 或把多个无关范围隐藏在提交中。
7. 配置了远程上游时，记录最近一次 fetch 时间；当前分支相对批准上游 behind 为 0，所有门禁 Commit 已存在于可供评审与 Testing 获取的远程基线，ahead / behind 数与仓库策略一致。
8. 未配置远程时，仅 upstream 子检查可使用 Approved N/A；必须证明 Testing 能取得冻结 Repository 与 HEAD 的可验证副本。
9. 分支保护、提交签名、线性历史、必需 CI 和合并策略等仓库特有规则均已通过；不适用项引用仓库策略或 Approved N/A。

最低 Git 证据包含：仓库顶层路径、当前分支、Base SHA、HEAD SHA、Base..HEAD Commit 清单、简洁状态、未合并文件检查、进行中操作检查、上游名称、ahead / behind、fetch 时间和执行日志。只写“Git 正常”或提供截图而无可复核文本不合格。

### 7.11 Development Status 与 Testing 准备

- Development Status 已按标准即时更新，完成比例由 ACCEPTED Task 复算，P0 与核心功能比例单列且均满足门禁范围要求。
- Current Task、Blocker、Risk、Git、Traceability、Review、Test 和 Next Action 已同步到 PROJECT_STATE；PROJECT_MEMORY 记录开发摘要、决定、限制和剩余风险。
- Testing 范围、冻结版本、环境、数据策略、责任人、Phase 6 用例集和第一项 Next Action 明确。
- 用户 / 业务责任人确认的是当前 Testing 范围、核心功能和精确版本；记录明确声明该确认不是用户验收或发布批准。

## 8. 硬阻断项

出现以下任一情况，Gate Result 必须为 `CHANGES_REQUIRED`：

- `APPROVED_FOR_DEVELOPMENT` 缺失、失效、对应旧范围或批准后变化未重新授权。
- 任一 P0 关联任务未 ACCEPTED，P0 间接依赖未纳入，或核心功能未达到冻结完成条件。
- 任一完成 Task 缺少实际 Commit、当前 Review、开发级 PASS 测试、验收或 ALIGNED 五层链证据。
- Matrix 残留 `NOT_CREATED`、孤儿项、BROKEN / IMPACT_REVIEW_REQUIRED 活动链、失效引用或未关闭影响。
- 任一 Change 为 OPEN、IN_REVIEW、仅 REBASELINED 未验证，或 N/A / 回滚证据无效。
- Test Case 缺失、不可执行、与当前基线不一致，或开发阶段必跑测试存在 FAIL、BLOCKED、INVALIDATED。
- Phase 6 用例被提前虚构为 PASS，或 Testing 范围、环境、数据、Owner 与首个动作未明确。
- 文档未同步，Development Status / PROJECT_STATE / PROJECT_MEMORY / Matrix 与代码或彼此冲突。
- 存在未关闭 P0 / P1 Bug、安全 / 隐私 / 合规红线、开发阻断或无可信恢复的 HIGH / CRITICAL 风险。
- Git 工作树不清洁、分支错误、HEAD / Base 不明确、存在冲突 / 进行中操作、范围 Commit 不可达 / 未评审，或适用的上游 / 仓库策略检查失败。
- Code Review 阻断意见未关闭、批准被后续修改失效，或评审对象与门禁 HEAD 不一致。
- 任一强制输入、责任人、版本、证据或用户 / 业务 Testing 范围确认缺失。

硬阻断数量必须为 0。不存在以完成比例、测试通过率、评审数量或风险接受抵消单个失败项的机制。

## 9. 评审流程

1. Gate Owner 核验当前 `APPROVED_FOR_DEVELOPMENT`，冻结范围、文档版本、Base SHA、HEAD SHA 和门禁输入清单。
2. Development Lead 从优先级基线枚举全部 P0 Requirement、直接 / 间接关联任务和核心功能，核对完成与验收证据。
3. Code Reviewer 与 Test Owner 核验每个门禁范围 Task 的 Commit、Review、TDD、开发级测试和 Phase 6 用例就绪度。
4. 执行五层正向、反向、孤儿、失效引用、覆盖和 Change Impact 检查；确认 Commit 均为实际 SHA、活动链均为 ALIGNED。
5. 领域评审人核对数据库、API、安全、运维、文档、风险和回滚；核验所有 N/A 与 Change 均针对当前基线。
6. 按第 7.10 节采集 Git 证据，确认工作树、分支、Commit、上游和仓库策略全部 PASS。
7. 核对 Bug Register、Review 问题、Blocker 和 Risk；硬阻断数量必须为 0。
8. Test Owner 冻结 Testing 范围、环境、数据、用例和第一项 Next Action；用户 / 业务责任人确认当前范围与版本边界。
9. Gate Owner 记录逐项结果和两个允许结果之一。只有 `APPROVED_FOR_TESTING` 才能更新 PROJECT_STATE 的 Current Stage。
10. 更新 PROJECT_STATE 与 PROJECT_MEMORY，保留完整不可覆盖门禁记录；任何基线变化都使该记录失去当前性。

## 10. 门禁记录格式

每次评审保存一份不可覆盖的记录；重新评审创建新 Gate Record ID 并引用上一记录。

### 10.1 基本信息

| 字段 | 内容 |
|---|---|
| Gate Record ID | `DEV-GATE-XXXX` |
| 项目 | 项目名称 |
| 评审范围 | 版本化范围链接 |
| Design Gate 记录 | 当前 `APPROVED_FOR_DEVELOPMENT` 链接 |
| 评审日期与时间 | 时间戳 |
| Gate Owner | 姓名或责任角色 |
| Development Lead | 姓名或责任角色 |
| Test Owner | 姓名或责任角色 |
| 用户 / 业务责任人 | 姓名或责任角色 |
| 上一门禁记录 | 记录链接或 NONE |
| Repository / Branch | 仓库标识与分支 |
| Base SHA / HEAD SHA | 不可变 Commit SHA |
| Status / Matrix 版本 | 版本化链接 |

### 10.2 逐项结论

| 检查项 | 当前基线证据 | 评审人 | 结论 | 发现数量 | 问题 / 关闭证据 |
|---|---|---|---|---|---|
| 授权与版本基线 | 版本化链接 | 评审人 | PASS / FAIL | 整数 | 链接 |
| P0 关联任务 | 任务与验收链接 | 评审人 | PASS / FAIL | 整数 | 链接 |
| 核心功能 | Core Function 清单 | 评审人 | PASS / FAIL | 整数 | 链接 |
| Commit 与 Code Review | SHA 与 Review 链接 | 评审人 | PASS / FAIL | 整数 | 链接 |
| 五层追踪 | Matrix 与检查结果 | 评审人 | PASS / FAIL | 整数 | 链接 |
| Change Impact 关闭 | Change 汇总 | 评审人 | PASS / FAIL | 整数 | 链接 |
| 开发级测试 | TDD / Validation 证据 | 评审人 | PASS / FAIL | 整数 | 链接 |
| Phase 6 用例就绪 | Test Plan / Case 基线 | 评审人 | PASS / FAIL | 整数 | 链接 |
| 文档同步 | 同步清单 | 评审人 | PASS / FAIL | 整数 | 链接 |
| Bug、风险与安全 | Register 与检查证据 | 评审人 | PASS / FAIL | 整数 | 链接 |
| Git 状态 | Git 证据包 | 评审人 | PASS / FAIL | 整数 | 链接 |
| Status 与 Testing 准备 | Status / State / Memory | 评审人 | PASS / FAIL | 整数 | 链接 |

### 10.3 可复算数量

| 指标 | 数值 |
|---|---|
| P0 Requirement 总数 | 整数 |
| P0 关联 Task 总数 / ACCEPTED 数 / 未完成数 | 三个整数 |
| 核心功能总数 / 完成数 / 未完成数 | 三个整数 |
| 门禁范围 Task 总数 / ACCEPTED 数 | 两个整数 |
| VERIFIED Commit / INVALID Commit 数 | 两个整数 |
| APPROVED Review / 未关闭阻断意见数 | 两个整数 |
| 开发级 PASS / FAIL / BLOCKED / INVALIDATED 数 | 四个整数 |
| Phase 6 Test Case 总数 / NOT_RUN 数 | 两个整数 |
| ALIGNED / BROKEN / IMPACT_REVIEW_REQUIRED 活动链数 | 三个整数 |
| 孤儿项 / 失效引用 / 未关闭 Change 数 | 三个整数 |
| 未关闭 P0 / P1 Bug 数 | 两个整数 |
| HIGH / CRITICAL 未关闭风险数 | 两个整数 |
| Git 未提交 / 未跟踪 / 冲突文件数 | 三个整数 |
| 硬阻断项数量 | 整数 |

### 10.4 Git 证据

| 字段 | 内容 |
|---|---|
| Repository Top Level | 规范化路径或仓库标识 |
| Current Branch | 分支名称 |
| Base / HEAD | 两个 SHA |
| Base..HEAD Commits | 不可变清单链接 |
| Worktree / Index | 清洁结论、原始输出与采集时间 |
| Unmerged / In-progress Operation | 数量、结论与原始证据 |
| Upstream | 远程 / 分支、fetch 时间、ahead / behind，或 Approved N/A |
| Repository Policy | Branch protection、CI、签名、合并规则结论 |
| Evidence Collector | 执行人、时间和工具版本 |

### 10.5 用户与 Testing 确认

| 字段 | 内容 |
|---|---|
| 用户 / 业务责任人 | 姓名或有权限的责任角色 |
| 确认时间 | 时间戳 |
| 确认的 Testing 范围 | 范围基线链接 |
| 确认的核心功能清单 | 版本化链接 |
| 确认的精确版本 | 文档版本、Base SHA、HEAD SHA |
| 用户可见变化摘要 | Change ID 与证据链接；没有时记录 0 |
| 确认原文或证据 | 可访问记录 |
| 非发布声明 | 明确记录“仅确认进入 Testing 的范围与版本，不构成用户验收、发布或生产部署批准” |

### 10.6 最终结果

| 字段 | 内容 |
|---|---|
| Gate Result | `APPROVED_FOR_TESTING` 或 `CHANGES_REQUIRED` |
| 决定理由 | 逐项事实与证据摘要 |
| 硬阻断项数量 | 整数 |
| 授权的 Testing 范围 | 版本化范围；未授权时记录 NONE |
| Testing 代码 / 文档基线 | Base、HEAD 与文档版本；未授权时记录 NONE |
| Testing 环境与 Test Owner | 环境引用与责任人；未授权时记录修订责任人 |
| 第一项 Next Action | 动作、Owner 与 Completion Condition |
| PROJECT_STATE 更新 | 更新证据；未授权时保持 DEVELOPMENT |
| PROJECT_MEMORY 更新 | 决定、证据、限制与下一动作链接 |
| 发布 / 生产授权 | `NO` |

`APPROVED_FOR_TESTING` 记录只有在所有逐项结论为 PASS、硬阻断为 0、P0 与核心未完成数为 0、开发级 FAIL / BLOCKED / INVALIDATED 为 0、五层缺口与未关闭 Change 为 0、Git 检查 PASS，并且用户 / 业务确认指向同一基线时才有效。

## 11. 未通过处理

当结果为 `CHANGES_REQUIRED` 时：

1. Current Stage 保持 DEVELOPMENT，不得将缺口转移到 TESTING、把 Phase 6 当作开发修复阶段或提前标记用例 PASS。
2. 每个失败项登记 Issue / Bug / Blocker / Change ID、受影响 Task / Chain、责任人、下一动作、完成条件和复核证据要求。
3. 修复代码、Review、开发级测试、文档、Matrix、Status、PROJECT_STATE 和 PROJECT_MEMORY；任何基线变化都使旧门禁记录不可继续使用。
4. P0 / 核心、架构、数据、API、安全、范围或验收变化必须先执行 Change Impact、修订权威源文档并重新基线；需要时重新取得 Design 授权。
5. 若实现暴露范围、设计、价值或关键可行性假设失效，项目按 [阶段门禁检查清单](../evaluation/PHASE_GATE_CHECKLIST.md) 退回 DESIGN、EVALUATION 或 RESEARCH，但本次 Development Gate 的记录结果仍为 `CHANGES_REQUIRED`。
6. 所有缺口关闭后创建新 Gate Record ID，冻结新基线并重新执行全部检查；不得只复查上次失败项。

## 12. 门禁输出

通过时必须形成：

- `APPROVED_FOR_TESTING` 门禁记录及精确范围、Base / HEAD、文档和 Test Case 基线。
- P0 关联任务与核心功能完成证明、Commit / Review / 开发级测试证据和完整五层追踪。
- Change 全部关闭、无高优先级 Bug、文档同步与 Git 正常证据。
- 用户 / 业务责任人对 Testing 范围的明确确认，以及“非用户验收、非发布授权”声明。
- PROJECT_STATE 转换证据、PROJECT_MEMORY 摘要、Testing 环境、Test Owner 和第一项 Next Action。

未通过时必须形成：

- `CHANGES_REQUIRED` 记录、全部失败项、硬阻断数量、责任人、修订动作和完成条件。
- 项目保持 DEVELOPMENT 或退回更早阶段的记录，以及重新评审所需的新基线和证据。

无论开发完成比例多高，只要没有一份针对当前精确基线的有效 `APPROVED_FOR_TESTING` 记录，就不得进入 TESTING。进入 TESTING 后仍必须执行 Phase 6 的完整测试与验收门禁；本记录不能作为发布完成证明。
