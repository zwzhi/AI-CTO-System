# Development Status Standard

## 1. 目的与边界

本标准规定 DEVELOPMENT 期间如何记录实际执行状态，并把当前任务、完成比例、阻塞问题、风险和下一步行动同步到 PROJECT_STATE。它与 [PROJECT_STATE 模板](../../templates/PROJECT_STATE_TEMPLATE.md)、[Development Plan 模板](../../templates/DEVELOPMENT_PLAN_TEMPLATE.md)、[Traceability Matrix 模板](../design/TRACEABILITY_MATRIX_TEMPLATE.md)、[Change Impact Analysis](./CHANGE_IMPACT_ANALYSIS.md) 和 [Development Approval Gate](./DEVELOPMENT_APPROVAL_GATE.md) 配套使用。

Development Plan 是任务范围、顺序、依赖和完成条件的权威来源；Development Status 是实际进度、证据、偏差、阻塞和下一动作的权威来源；PROJECT_STATE 只保存当前阶段和 Development Status 摘要。Status 不得静默修改计划、需求、设计、优先级或验收标准。

“代码已写完”“大致完成”“接近完成”等主观判断不能作为进度证据。完成比例只基于已通过任务验收的基线任务计算。

## 2. 维护责任

| 角色 | 责任 |
|---|---|
| Development Status Owner | 维护完整状态记录、计算完成比例、执行同步并保证链接可访问 |
| Task Owner | 更新任务状态、证据、阻塞、风险和下一动作；不能自行放宽验收条件 |
| Review Owner | 维护 Code Review 结论、阻断意见和针对精确 Commit 的批准证据 |
| Test Owner | 维护测试用例、环境、结果、失败、证据和开发级 Validation 状态 |
| Change Owner | 按 [Change Impact Analysis](./CHANGE_IMPACT_ANALYSIS.md) 维护变更、风险、重新基线和关闭状态 |
| Development Lead | 核对计划偏差、依赖、资源、里程碑和升级处理 |
| Gate Owner | 核对门禁候选状态、基线完整性及 PROJECT_STATE / PROJECT_MEMORY 同步 |
| 用户 / 业务责任人 | 确认影响范围、验收、优先级或用户可见行为的变化；不由 Agent 或自动化检查代替 |

Development Status Owner 对同步完整性负责，但每项事实由对应源责任人负责。自动化可以采集 Git、测试或覆盖率结果，不能替代责任人的结论与批准。

## 3. 状态词汇

状态必须使用本节词汇，不得用自由文本创造“基本完成”“待观察”等不可判定状态。补充说明写入证据或备注字段。

### 3.1 Task Status

| 状态 | 定义 | 允许的下一状态 |
|---|---|---|
| `PLANNED` | 已在当前 Development Plan 基线中定义，但前置条件尚未满足 | READY、CANCELLED |
| `READY` | 范围、依赖、责任人、Test Case 和验收条件齐全，可以开始 | IN_PROGRESS、BLOCKED、CANCELLED |
| `IN_PROGRESS` | 正在按批准范围实施；尚未达到 Review 或 Validation 条件 | BLOCKED、IN_REVIEW、READY |
| `BLOCKED` | 存在阻止下一可验证动作的明确问题 | READY、IN_PROGRESS、CANCELLED |
| `IN_REVIEW` | 实现 Commit 与证据已提交 Code Review | IN_PROGRESS、VALIDATING、BLOCKED |
| `VALIDATING` | Review 已满足进入验证的条件，正在执行开发级测试与任务验收 | IN_PROGRESS、BLOCKED、ACCEPTED |
| `ACCEPTED` | 第 9.1 节任务完成定义全部满足；这是唯一计入完成比例的状态 | IN_PROGRESS（仅因新影响而重新打开）、CANCELLED（仅经范围重新基线） |
| `CANCELLED` | 任务已通过批准的范围变更退出，并有替代 / 删除、影响分析和重新基线证据 | 不可恢复；恢复需求时创建新 Task ID |

`ACCEPTED` 不能由 Task Owner 主观声明；必须由 Development Plan 指定的验收责任人依据当前 Commit、Review、Test 和追踪证据判定。`CANCELLED` 不是完成状态，也不能用来隐藏未完成工作。

### 3.2 Commit Status

| 状态 | 定义 |
|---|---|
| `NOT_CREATED` | 尚无实际实现 Commit；Design 阶段或未开始任务的明确状态 |
| `RECORDED` | 已记录不可变 Commit SHA，并引用 Task ID 与 Change ID，但完整性尚未核验 |
| `VERIFIED` | SHA 可访问、属于当前 Git 基线、五层映射完整且未被后续未审查修改取代 |
| `INVALID` | SHA 缺失、不可访问、超出范围、映射错误、被错误基线取代或包含未解决问题 |

进入 TESTING 前，所有已完成和门禁范围内的任务必须为 `VERIFIED`，不得残留 `NOT_CREATED`。

### 3.3 Review Status

| 状态 | 定义 |
|---|---|
| `NOT_REQUESTED` | 尚未提交评审 |
| `IN_REVIEW` | 评审针对明确 Commit / Diff 和基线进行中 |
| `CHANGES_REQUIRED` | Code Review 存在未关闭的阻断或必改意见 |
| `REJECTED` | 变更方向与批准基线根本冲突或风险不可接受，必须退回设计、任务或授权流程 |
| `APPROVED` | 有权限的评审人已批准精确 Commit 和基线，阻断意见为 0 |
| `INVALIDATED` | 批准后 Commit、范围或相关基线变化，必须重新评审 |

### 3.4 Test Status 与 Test Result

| 状态 / 结果 | 定义 |
|---|---|
| `NOT_RUN` | 测试尚未执行；必须仍有完整可执行 Test Case |
| `RUNNING` | 测试正在已记录的环境中执行 |
| `PASS` | 实际结果满足预先定义的判定标准，且证据可访问 |
| `FAIL` | 实际结果不满足判定标准 |
| `BLOCKED` | 因环境、数据、依赖或前置条件无法得出结果 |
| `INVALIDATED` | 代码、用例、数据、环境或基线变化使旧结果失去当前性 |

Development Status 必须区分开发级测试与 Phase 6 Testing：任务的 TDD、单元、组件、定向集成、静态检查和开发级 Validation 可以在 DEVELOPMENT 中为 PASS；计划在 TESTING 阶段执行的完整系统、非功能、验收或正式评测可以为 NOT_RUN，但其用例必须存在、可执行并与当前基线一致。任何开发级必跑测试为 FAIL、BLOCKED 或 INVALIDATED 时，相关任务不能为 ACCEPTED。

### 3.5 Traceability、Blocker 与 Risk 状态

- Chain Status 使用 Traceability Matrix 的 `ALIGNED`、`IMPACT_REVIEW_REQUIRED`、`BROKEN`、`RETIRED`。
- Blocker Status 只允许 `OPEN`、`MITIGATING`、`RESOLVED`、`CLOSED`。`RESOLVED` 表示已实施解决动作但尚待验证；只有验证通过才可 `CLOSED`。
- Risk Status 只允许 `OPEN`、`MITIGATING`、`ACCEPTED`、`CLOSED`。`ACCEPTED` 仅表示有权限的人接受剩余风险，不表示风险消失，也不覆盖门禁硬阻断。
- Change Status 使用 `OPEN`、`IN_REVIEW`、`REBASELINED`、`CLOSED`，定义见 [Change Impact Analysis](./CHANGE_IMPACT_ANALYSIS.md)。

## 4. Development Status 必填结构

每个处于 DEVELOPMENT 的项目必须维护一份版本化 Development Status，至少包含以下内容。

### 4.1 文档信息与基线

| 字段 | 要求 |
|---|---|
| 项目与当前阶段 | 项目名称；阶段必须为 DEVELOPMENT，除非已获得有效阶段转换记录 |
| Status 版本 | 唯一版本或 Commit 引用 |
| Development Plan 基线 | 路径、版本、状态和批准记录 |
| Design Gate 基线 | 有效 `APPROVED_FOR_DEVELOPMENT` 记录 |
| Git 基线 | Repository、分支、Base SHA、HEAD SHA、采集时间 |
| Traceability Matrix | 当前版本、完整性结果和未关闭影响数量 |
| Status Owner | 姓名或责任角色 |
| 用户 / 业务责任人 | 姓名或责任角色；负责范围 / 验收变更确认 |
| 更新时间 | 时间戳、更新人和触发原因 |

### 4.2 当前任务表

每个当前基线 Task ID 单独一行：

| Task ID | Requirement / Design | P0 关联 | 任务摘要 | Owner | Task Status | Commit Status / SHA | Review Status | Test Status | Chain Status | 验收证据 | Blocker / Risk | 下一动作与完成条件 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `TASK-XXXX` | 版本化引用 | YES / NO | 可判定范围 | 责任人 | 标准状态 | 标准状态与 SHA | 标准状态 | 标准状态 | 标准状态 | 证据链接 | ID 或 0 | 单一可执行动作 |

“当前任务”是处于 READY、IN_PROGRESS、BLOCKED、IN_REVIEW 或 VALIDATING 的任务。PROJECT_STATE 的 Current Task 只填写其中优先级最高且决定下一动作的 Task ID；完整并行清单保留在 Development Status。

### 4.3 阶段摘要

阶段摘要必须列出：

- 基线任务总数、ACCEPTED 数、CANCELLED 数、未验收数和按第 5 节计算的完成比例。
- P0 Requirement 数、P0 关联任务总数 / ACCEPTED 数，以及核心功能总数 / 完成数。
- 当前里程碑、计划与实际差异、关键路径、预计下一门禁候选条件。
- Commit VERIFIED / INVALID 数，Review APPROVED / 未通过数，开发级 Test PASS / FAIL / BLOCKED 数。
- ALIGNED / IMPACT_REVIEW_REQUIRED / BROKEN 活动链数量，OPEN / IN_REVIEW / REBASELINED Change 数。
- OPEN Blocker 和 HIGH / CRITICAL Risk 数，未关闭 P0 / P1 Bug 数。
- 本周期已完成内容、当前状态、风险、下一步和证据基线。

摘要数字必须能从任务表、风险 / 阻塞表、Bug Register、Change 记录和 Traceability Matrix 复算。

### 4.4 Blocker、Risk、Change 与 Next Action

Blocker 记录至少包含 Blocker ID、发现时间、受影响 Task / Chain、严重度、事实、责任人、解决动作、升级对象、目标时间、状态和关闭证据。

Risk 记录至少包含 Risk ID、受影响范围、等级、触发信号、概率、影响、责任人、缓解措施、监控、剩余风险、接受人 / 证据、状态和复核时间。风险必须引用事实或测试、日志、评审、变更记录，不得只写“风险较低”。

Change 记录必须列出 Change ID、目标、风险等级、批准决定、Change Status、受影响链、下一动作与 [Change Impact Analysis](./CHANGE_IMPACT_ANALYSIS.md) 的版本化链接。

Next Action 必须是单一、可执行、可分派、可验证的近期动作，包含 Owner 和 Completion Condition。不能填写“继续开发”“跟进问题”或“尽快完成”。

## 5. 完成比例

### 5.1 默认计算

完成比例按当前批准 Development Plan 基线中的适用任务计算：

`Completion Percentage = ACCEPTED 任务数 ÷（基线任务总数 - 已批准 CANCELLED 任务数）× 100%`

计算结果保留一位小数。READY、IN_PROGRESS、BLOCKED、IN_REVIEW 和 VALIDATING 均计为 0；不得按代码行、工时、文件数、个人感觉或“完成了一半”给予部分分值。

### 5.2 权重计算

仅当 Development Plan 在任务开始前已经为所有任务定义正整数权重、权重依据和批准人时，允许使用：

`Completion Percentage = ACCEPTED 任务权重之和 ÷ 当前基线适用任务权重之和 × 100%`

中途新增或修改权重必须执行变更影响分析和重新基线。不能为了提高进度而降低未完成任务权重。项目必须在 Status 中明确采用“任务数”或“预批准权重”，同一基线不得混用。

### 5.3 计算约束

- Task 只有满足第 9.1 节才能计入分子。
- BLOCKED 任务仍在分母中；延期、资源不足和风险接受不改变分母。
- CANCELLED 任务只有在范围变更获批、五层影响关闭、Matrix 标记 RETIRED / 替代关系且重新基线后才从分母移除。
- 新增任务在新基线生效后立即进入分母；不得延迟登记以保持高比例。
- 总体比例、P0 关联任务比例和核心功能比例必须分别报告，不能用非关键任务完成掩盖 P0 或核心缺口。
- 100% 仅表示当前 Development Plan 基线中的任务均已通过任务验收，不表示已完成 Phase 6 Testing、用户验收、发布批准或生产部署。

## 6. 更新频率与触发器

### 6.1 最低频率

- 每个发生开发活动的工作会话结束前更新一次；连续开发时至少每个工作日更新一次。
- 状态交接、阶段评审或 Development Approval Gate 发起前必须即时更新，不能依赖上一工作日记录。
- 没有状态变化时也记录核验时间、核验人和“无变化”的证据来源，不得无限沿用旧快照。

### 6.2 即时更新触发器

以下事件发生后，在继续依赖该状态、交接或合并前完成更新：

- Task 开始、阻塞、解除阻塞、提交 Review、进入 Validation、验收通过、重新打开或经批准取消。
- 创建 / 替换 Commit、Review 结论变化、测试开始 / 通过 / 失败 / 阻塞 / 失效。
- 新增 Bug、Blocker、Risk、Change，风险等级变化，或剩余风险被接受 / 撤回。
- Requirement、Design、Development Plan、Test Plan、API、数据库、依赖、回滚或范围基线变化。
- Traceability Chain 进入 IMPACT_REVIEW_REQUIRED、BROKEN、RETIRED 或恢复 ALIGNED。
- Git 分支、Base / HEAD、合并状态或工作区状态改变。
- 用户 / 业务责任人改变优先级、范围、验收或暂停 / 恢复决定。
- 门禁评审发起、结果记录或旧批准因基线变化失效。

## 7. PROJECT_STATE 同步

### 7.1 同步字段

Development Status 更新后，必须把以下摘要同步到 PROJECT_STATE 的 `Development Status` 区域：

| PROJECT_STATE 字段 | 同步规则 |
|---|---|
| Current Task | 优先级最高且决定下一动作的活动 Task ID、状态和版本化 Status 链接；没有活动任务时说明可验证原因 |
| Completion Percentage | 第 5 节公式、分子 / 分母、结果和 Status 版本 |
| Blockers | OPEN / MITIGATING Blocker ID、最高严重度、Owner 和下一升级动作；没有时记录 0 |
| Risks | OPEN / MITIGATING / ACCEPTED 风险 ID、最高等级、Owner 和监控动作；没有时记录 0 |
| Git Baseline | Repository、分支、Base SHA、HEAD SHA 和核验时间 |
| Traceability Status | Matrix 版本、ALIGNED / IMPACT_REVIEW_REQUIRED / BROKEN 数和未关闭 Change 数 |
| Review Status | 当前任务 Review 状态汇总、阻断意见数和证据链接 |
| Test Status | 开发级测试结果汇总，并单独注明 Phase 6 用例的 NOT_RUN 数 |
| Next Development Action | 动作、Owner、Completion Condition 和目标核验点 |
| Last Updated | 与 Development Status 相同或更晚的时间戳 |

### 7.2 同步顺序与一致性

先更新权威源文档、Change 记录和 Traceability Matrix，再更新 Development Status，最后更新 PROJECT_STATE 摘要与 PROJECT_MEMORY。所有引用必须指向同一 Git / 文档基线。

PROJECT_STATE 与 Development Status 的 Task、比例、Blocker、Risk、Git、Review、Test 或 Next Action 任一冲突时，状态视为不可信，必须先纠正源记录和同步，不得进入下一门禁。不得只改 PROJECT_STATE 数字而不修订 Development Status 的可复算明细。

## 8. 阻塞升级

### 8.1 严重度

| 严重度 | 判定 | 升级要求 |
|---|---|---|
| `CRITICAL` | 安全 / 隐私 / 合规红线、不可逆数据风险、核心环境不可用、P0 路径全面停滞或无可信回滚 | 立即暂停受影响工作；通知 Development Lead、Gate Owner 及安全 / 数据 / 用户责任人；先隔离或回退 |
| `HIGH` | P0 关联 Task、核心功能、公共 API、数据库迁移、关键依赖或门禁必需证据被阻断 | 在当前工作会话内升级给 Development Lead 与 Gate Owner，明确 Owner、决策时限和替代方案 |
| `STANDARD` | 不影响 P0 / 核心路径且有已验证绕行方案的局部阻塞 | 在下一次状态更新前由 Task Owner 处理；超过目标时间或影响扩大时升为 HIGH |

严重度取最高适用条件。Blocker 超过承诺解决时间、重复出现、影响更多 Chain、使风险升高或令测试 / 回滚失效时必须升级，不能仅延后日期。

### 8.2 升级动作

1. 冻结受影响 Task 和 Chain，Task Status 设为 BLOCKED，Chain 设为 IMPACT_REVIEW_REQUIRED 或 BROKEN。
2. 记录事实、影响、Owner、目标时间、临时隔离、永久解决和验证条件。
3. 需要范围、设计、优先级、资源或风险接受决定时，升级给对应有权限的人；Agent 不得代替用户 / 业务决定。
4. 若涉及基线变化，创建 Change ID，更新源文档并重新基线。
5. 解决动作完成后先标记 RESOLVED；验证通过、追踪恢复和证据齐全后才标记 CLOSED，并恢复任务状态。

## 9. 完成定义

### 9.1 Task 完成

Task 只有同时满足以下条件才可标记 `ACCEPTED`：

- 实现范围与当前 Development Plan、Requirement、Design 和获批 Change 一致。
- 实际 Commit SHA 已记录且 Commit Status 为 VERIFIED。
- Code Review 针对当前 Commit 与基线为 APPROVED，阻断意见为 0。
- Development Plan 规定的任务测试、TDD / Validation 和相关回归为 PASS，证据可访问。
- Requirement → Design → Task → Commit → Test 原子链完整且为 ALIGNED，无孤儿、失效引用或未关闭影响。
- 任务验收条件逐项通过，验收责任人、日期和证据已记录。
- 相关代码说明、API / 数据文档、运行手册、计划、Status、PROJECT_STATE 和 PROJECT_MEMORY 已同步。
- 相关 OPEN Blocker、P0 / P1 Bug 和 HIGH / CRITICAL Change Impact 为 0；剩余风险有权责明确的记录且不构成硬阻断。

任一证据因新 Commit、测试变化或重新基线而失效时，Task 必须从 ACCEPTED 重新打开到适当状态，完成比例随即重算。

### 9.2 里程碑完成

里程碑只有在其当前基线内全部必需 Task 均为 ACCEPTED、依赖与集成验证通过、里程碑文档同步、Blocker 为 0，并由 Development Plan 指定的责任人确认后才可完成。里程碑完成不授权阶段转换。

### 9.3 DEVELOPMENT 完成候选

只有达到以下条件，Status 才可标记为 `READY_FOR_DEVELOPMENT_GATE`：

- 当前门禁范围内所有 P0 Requirement 关联 Task 与核心功能均已 ACCEPTED。
- 每个门禁范围 Task 均有 VERIFIED Commit、APPROVED Review、所需开发级 PASS 测试和 ALIGNED 五层链。
- 测试用例集、文档、Change、Bug、风险、回滚、Git 与状态证据满足 [Development Approval Gate](./DEVELOPMENT_APPROVAL_GATE.md)。
- PROJECT_STATE 与 PROJECT_MEMORY 已同步到同一候选基线。

`READY_FOR_DEVELOPMENT_GATE` 只是申请评审的状态，不是阶段结果。Development Approval Gate 给出 `APPROVED_FOR_TESTING` 之前，Current Stage 必须保持 DEVELOPMENT。

### 9.4 阶段转换完成

只有当前精确基线取得有效 `APPROVED_FOR_TESTING`，并完成 PROJECT_STATE、PROJECT_MEMORY、Testing 范围、环境和首个 Next Action 的更新，才可把阶段从 DEVELOPMENT 转换到 TESTING。

进入 TESTING 不表示完整系统验收已通过，更不表示用户验收、发布批准、生产部署或项目交付完成。

## 10. Development Status 记录格式

### 10.1 当前摘要

| 字段 | 内容 |
|---|---|
| Current Stage | DEVELOPMENT |
| Status Version | 版本或 Commit |
| Current Task | Task ID、状态与链接 |
| Completion Percentage | 公式、分子 / 分母与结果 |
| P0 Task Completion | ACCEPTED / 总数 |
| Core Function Completion | 完成 / 总数 |
| Blockers | ID、最高严重度与数量 |
| Risks | ID、最高等级与数量 |
| Git Baseline | Repository、Branch、Base SHA、HEAD SHA、时间 |
| Traceability Status | Matrix 版本、Chain 汇总、未关闭 Change 数 |
| Review Status | APPROVED / IN_REVIEW / CHANGES_REQUIRED / REJECTED / INVALIDATED 数 |
| Development Test Status | PASS / FAIL / BLOCKED / INVALIDATED 数 |
| Phase 6 Test Cases | 已定义数与 NOT_RUN 数 |
| Next Development Action | 动作、Owner、Completion Condition |
| Last Updated | 时间戳与更新人 |

### 10.2 阶段结论

| 字段 | 内容 |
|---|---|
| 已完成内容 | 本周期新增 ACCEPTED Task 与证据链接 |
| 当前状态 | ACTIVE / BLOCKED / READY_FOR_DEVELOPMENT_GATE |
| 计划偏差 | Change ID、原因、影响和重新基线证据；没有时记录 0 |
| 门禁缺口 | 未满足项、Owner、下一动作；没有时记录 0 |
| 用户 / 业务确认 | 确认人、时间、范围 / 验收变化证据，或当前周期无此类变化的核验记录 |
| PROJECT_STATE 同步 | 路径、版本和时间 |
| PROJECT_MEMORY 同步 | 路径、版本和时间 |

## 11. 质量检查

每次发布 Status 前必须确认：

- 当前基线全部 Task 均在任务表中，ID、Owner、状态和证据不为空。
- 完成比例可复算，只有 ACCEPTED 进入分子，P0 与核心比例单列。
- Commit、Review、Test、Traceability 状态使用标准词汇并指向当前基线。
- OPEN Blocker、Risk、Bug 和 Change 没有被摘要遗漏；下一动作具有 Owner 与完成条件。
- Development Status、PROJECT_STATE、PROJECT_MEMORY、Development Plan 和 Matrix 不冲突。
- 链接可访问，时间和版本明确，没有引用“最新版”、口头结论或主观百分比。
- 阶段仍为 DEVELOPMENT，除非存在当前有效的 `APPROVED_FOR_TESTING`；没有把开发完成写成 Testing、验收或发布完成。
