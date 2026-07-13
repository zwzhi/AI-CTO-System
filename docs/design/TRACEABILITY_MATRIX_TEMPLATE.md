# Traceability Matrix 模板

## 1. 用途

本模板建立 Requirement ID → Design ID / 设计文档 → Development Task ID → Commit SHA → Test Case ID 的端到端对应关系，是 [文档关联规则](../protocol/DOCUMENT_RELATIONSHIP.md) 定义的权威追踪索引。源文档仍是具体内容的单一事实来源，矩阵只保存稳定 ID、版本化引用、状态和影响关系。

完成后的矩阵同时用于 [Design Approval Gate](./DESIGN_APPROVAL_GATE.md) 与 [Development Approval Gate](../development/DEVELOPMENT_APPROVAL_GATE.md)。它必须支持从需求到测试的正向追踪，以及从测试、Commit、任务或设计回到需求的反向追踪。

## 2. 使用规则

1. 已批准需求使用稳定且唯一的 REQ-XXXX；设计使用 DES-XXXX；开发任务使用 TASK-XXXX；Git 提交使用不可变 Commit SHA；测试案例使用 TC-XXXX。ID 废弃后不得复用。
2. 主矩阵每一行表示一条完整的五层原子链：一个 Requirement ID、一个 Design ID、一个 Task ID、一个 Commit SHA 和一个 Test Case ID。
3. 一对多关系通过重复上游 ID 并新增行表达；多对一关系通过重复共享的下游 ID 并新增行表达。核心 ID 单元格不得放逗号分隔列表。
4. 一对多和多对一允许存在，但每一行的五层关系都必须完整。处于当前批准范围的链不得留空，也不得在五个核心字段使用 N/A。
5. 每个文档引用必须使用可访问的相对 Markdown 链接，并附文档版本或提交及章节。只写文件名、写“最新版”或引用无版本网页均不合格。
6. 每个 Task ID 必须同时引用其实现的 Requirement ID 和 Design ID；每个 Commit 必须引用 Task ID；每个 Test Case ID 必须引用其验证的 Requirement ID、Design ID、Task ID 和相关 Commit。
7. 状态和版本取自源文档，不在矩阵中创造与源文档不同的事实。发现冲突时先修订权威源文档，再更新矩阵。
8. 任何需求、设计、任务、Commit 映射、测试或基线版本变化，都必须登记变更影响并重新执行正向、反向和孤儿项检查。
9. 复制本模板使用时，必须替换所有花括号字段并删除示例行。门禁评审前不得残留模板占位符。

### 2.1 阶段化完整性

- 申请 DESIGN → DEVELOPMENT 时，Requirement、Design、Task 与 Test Case 必须完整；Commit 字段使用 `NOT_CREATED`，Test Result 使用 `NOT_RUN`。这是尚未实现的明确状态，不是 N/A。
- DEVELOPMENT 执行中，每次重要修改后将 `NOT_CREATED` 替换或展开为实际 Commit SHA，并保存 Task、Review 与测试证据。
- 申请 DEVELOPMENT → TESTING 时，所有完成 Task 的 Commit 字段必须为实际 SHA，五层正反向追踪完整；不得残留 `NOT_CREATED`。

## 3. 文档信息

| 项目 | 内容 |
|---|---|
| 项目名称 | {PROJECT_NAME} |
| 当前批准范围 | {SCOPE_BASELINE_REFERENCE} |
| Matrix 版本 | {MATRIX_VERSION} |
| Matrix 状态 | {DRAFT_OR_IN_REVIEW_OR_APPROVED} |
| 责任人 | {OWNER} |
| 评审人 | {REVIEWERS} |
| 最后更新日期 | {YYYY-MM-DD} |
| 对应 Design Gate 记录 | {DESIGN_GATE_RECORD_REFERENCE} |

## 4. 文档版本基线

适用性为 N/A 的 Database Design 或 Agent Design 只能在已有可审计 N/A 批准记录时填写，并必须引用该记录。N/A 不会取消 Architecture Design 对需求的追踪责任。

| Artifact | 文档链接 | 版本或提交 | 源文档状态 | 批准人 | 批准日期 | 适用性或 N/A 记录 |
|---|---|---|---|---|---|---|
| PRD / Requirement Source | {PRD_LINK} | {PRD_VERSION} | {STATUS} | {APPROVER} | {YYYY-MM-DD} | Applicable |
| Architecture | {ARCHITECTURE_LINK} | {ARCHITECTURE_VERSION} | {STATUS} | {APPROVER} | {YYYY-MM-DD} | Applicable |
| Database Design | {DATABASE_DESIGN_LINK_OR_NA_RECORD_LINK} | {VERSION_OR_NA_RECORD_VERSION} | {STATUS} | {APPROVER} | {YYYY-MM-DD} | {APPLICABLE_OR_AUDITED_NA} |
| Agent Design | {AGENT_DESIGN_LINK_OR_NA_RECORD_LINK} | {VERSION_OR_NA_RECORD_VERSION} | {STATUS} | {APPROVER} | {YYYY-MM-DD} | {APPLICABLE_OR_AUDITED_NA} |
| Development Plan | {DEVELOPMENT_PLAN_LINK} | {DEVELOPMENT_PLAN_VERSION} | {STATUS} | {APPROVER} | {YYYY-MM-DD} | Applicable |
| Test Plan | {TEST_PLAN_LINK} | {TEST_PLAN_VERSION} | {STATUS} | {APPROVER} | {YYYY-MM-DD} | Applicable |
| Git Repository / Baseline | {REPOSITORY_REFERENCE} | {BRANCH_AND_BASE_COMMIT} | {STATUS} | {OWNER} | {YYYY-MM-DD} | Applicable |

## 5. 端到端主矩阵

Chain Status 只允许：

- ALIGNED：当前阶段要求的引用完整、版本一致且检查通过；进入 TESTING 前必须是五层完整链。
- IMPACT_REVIEW_REQUIRED：发生变更，影响分析或同步尚未完成。
- BROKEN：存在缺失、冲突、失效引用或失败验证。
- RETIRED：整条链已按批准的范围变更退出，且有变更记录。

只有当前批准范围内的全部链按当前阶段规则均为 ALIGNED，才可通过相应门禁。Design Approval Gate 允许 Commit 为 `NOT_CREATED`、测试为计划状态；Development Approval Gate 还要求实际 Commit、Review 与开发级测试证据完整。IMPACT_REVIEW_REQUIRED、BROKEN 或未经批准的 RETIRED 在两个门禁中均为阻断项。

| Chain ID | Requirement ID | Requirement 文档链接 @ 版本 / 章节 | Design ID | Design 文档链接 @ 版本 / 章节 | Development Task ID | Development Plan 链接 @ 版本 / 章节 | Commit SHA / 状态 | Commit 证据链接 | Test Case ID | Test Plan 链接 @ 版本 / 章节 | Chain Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| CHAIN-0001 | REQ-0001 | {REQUIREMENT_REFERENCE} | DES-0001 | {DESIGN_REFERENCE} | TASK-0001 | {TASK_REFERENCE} | {COMMIT_SHA_OR_NOT_CREATED} | {COMMIT_REFERENCE_OR_PENDING} | TC-0001 | {TEST_REFERENCE} | {CHAIN_STATUS} |

## 6. 链路状态与验证记录

源状态必须使用源文档定义的词汇；Test Result 至少区分 NOT_RUN、PASS、FAIL、BLOCKED。Design Approval Gate 前，计划在 DEVELOPMENT 或 Phase 6 执行的测试可以为 NOT_RUN，但 Test Case 必须完整、可执行并有明确通过条件。Development Approval Gate 前，开发级必跑测试必须 PASS；Phase 6 的完整系统、非功能、正式评测与用户验收用例可以保持 NOT_RUN，但其范围、环境、数据、责任人和判定标准必须就绪。

| Chain ID | Requirement 状态 | Design 状态 | Task 状态 | Commit / Review 状态 | Test Case 状态 | Test Result | 验证环境 / 证据链接 | 责任人 | 最后核验日期 |
|---|---|---|---|---|---|---|---|---|---|
| CHAIN-0001 | {REQUIREMENT_STATUS} | {DESIGN_STATUS} | {TASK_STATUS} | {COMMIT_AND_REVIEW_STATUS} | {TEST_CASE_STATUS} | {TEST_RESULT} | {EVIDENCE_REFERENCE} | {OWNER} | {YYYY-MM-DD} |

## 7. 正向追踪检查

正向检查从每个已批准 Requirement ID 出发，确认其所有设计、任务和测试分支均在主矩阵中展开。

| Requirement ID | 源文档版本 | 预期 Design ID | 对应 Chain ID | 全部 Task 已覆盖 | 全部 Commit 已覆盖 | 全部 Test Case 已覆盖 | 结果 | 证据 / 说明 |
|---|---|---|---|---|---|---|---|---|
| REQ-0001 | {REQUIREMENT_VERSION} | DES-0001 | CHAIN-0001 | {YES_OR_NO} | {YES_NO_OR_NOT_CREATED} | {YES_OR_NO} | {PASS_OR_FAIL} | {EVIDENCE_REFERENCE} |

正向检查通过条件：

- 每个当前范围内的已批准 Requirement ID 至少有一个 Design ID。
- 每个 Design ID 至少有一个 Development Task ID。
- 每个 Development Task ID 在进入 TESTING 前至少有一个实际 Commit SHA。
- 每个 Commit SHA 关联至少一个 Task ID 和相应 Test Case ID。
- 每个 Development Task ID 至少有一个 Test Case ID。
- 一项需求存在多个设计、任务或测试时，所有分支都已列出，不能只验证其中一条代表链。

## 8. 反向追踪检查

反向检查从每个 Test Case ID 出发回溯到 Commit、Task、Design 和 Requirement，随后分别从所有 Commit、Task ID 与 Design ID 再做一次上游检查，防止无需求依据的实现或测试进入范围。

| 起点类型 | 起点 ID | 对应 Chain ID | 回溯 Commit SHA | 回溯 Task ID | 回溯 Design ID | 回溯 Requirement ID | 引用版本有效 | 结果 | 证据 / 说明 |
|---|---|---|---|---|---|---|---|---|---|
| Test Case | TC-0001 | CHAIN-0001 | {COMMIT_SHA} | TASK-0001 | DES-0001 | REQ-0001 | {YES_OR_NO} | {PASS_OR_FAIL} | {EVIDENCE_REFERENCE} |
| Commit | {COMMIT_SHA} | CHAIN-0001 | {COMMIT_SHA} | TASK-0001 | DES-0001 | REQ-0001 | {YES_OR_NO} | {PASS_OR_FAIL} | {EVIDENCE_REFERENCE} |
| Development Task | TASK-0001 | CHAIN-0001 | {COMMIT_SHA_OR_NOT_CREATED} | TASK-0001 | DES-0001 | REQ-0001 | {YES_OR_NO} | {PASS_OR_FAIL} | {EVIDENCE_REFERENCE} |
| Design | DES-0001 | CHAIN-0001 | {COMMIT_SHA_OR_NOT_CREATED} | TASK-0001 | DES-0001 | REQ-0001 | {YES_OR_NO} | {PASS_OR_FAIL} | {EVIDENCE_REFERENCE} |

反向检查通过条件：

- 每个 Test Case ID 在进入 TESTING 前都能回溯到至少一个 Commit SHA、Task ID、Design ID 和 Requirement ID。
- 每个 Commit SHA 都能回溯到 Task ID、Design ID 和 Requirement ID，并关联验证它的 Test Case ID。
- 每个 Task ID 都能回溯到其实现的 Design ID 与 Requirement ID。
- 每个 Design ID 都能回溯到至少一个已批准 Requirement ID。
- 共享任务、共享设计或共享测试的所有上游关系均已展开，没有隐藏在自由文本中。

## 9. 变更影响记录

Change Status 只允许 OPEN、IN_REVIEW、REBASELINED 或 CLOSED。只要存在 OPEN 或 IN_REVIEW 的变更影响，相关链必须标记为 IMPACT_REVIEW_REQUIRED，不得通过门禁。

| Change ID | 变更对象类型 / ID | 旧版本 | 新版本 | 受影响 Chain ID | 受影响 Requirement ID | 受影响 Design ID | 受影响 Task ID | 受影响 Commit SHA | 受影响 Test Case ID | 风险与所需动作 | 责任人 | Change Status | 新 Matrix 版本 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CHG-0001 | {ARTIFACT_TYPE_AND_ID} | {OLD_VERSION} | {NEW_VERSION} | {CHAIN_IDS} | {REQUIREMENT_IDS} | {DESIGN_IDS} | {TASK_IDS} | {COMMIT_SHAS} | {TEST_CASE_IDS} | {IMPACT_AND_ACTION} | {OWNER} | {CHANGE_STATUS} | {MATRIX_VERSION} |

执行变更影响分析时：

1. 需求变更向下检查所有 Design、Task、Commit 和 Test Case。
2. 设计变更向上确认 Requirement，向下检查 Task、Commit 和 Test Case。
3. 任务变更向上确认 Requirement 与 Design，向下检查 Commit 和 Test Case。
4. Commit 映射变化时确认 Task、Design、Requirement 与 Test Case，并保留不可变 SHA。
5. 测试变更向上确认 Commit、Task、Design 与 Requirement，并确认验收覆盖没有下降。
6. 删除或替代任何 ID 时，检查旧 ID 的全部引用并记录 RETIRED 或替代链。
7. 完成源文档更新、回归验证和批准后，才能把变更标记为 REBASELINED 或 CLOSED。

## 10. 孤儿项与完整性检查

结果只允许 PASS 或 FAIL。发现数量必须填写整数；为零时填写 0，不得留空。

| Check ID | 检查项 | 检查方法 | 发现数量 | 结果 | 证据链接 | 处置记录 |
|---|---|---|---|---|---|---|
| ORPHAN-REQ | 已批准 Requirement 无 Design | 对比 PRD Requirement ID 与主矩阵 Requirement ID，并检查每项下游 Design | {INTEGER} | {PASS_OR_FAIL} | {EVIDENCE_REFERENCE} | {RESOLUTION_REFERENCE} |
| ORPHAN-DES-UP | Design 无 Requirement | 对比全部设计文档 Design ID 与主矩阵，并检查上游 Requirement | {INTEGER} | {PASS_OR_FAIL} | {EVIDENCE_REFERENCE} | {RESOLUTION_REFERENCE} |
| ORPHAN-DES-DOWN | Design 无 Task | 对比全部 Design ID 与 Development Plan Task 映射 | {INTEGER} | {PASS_OR_FAIL} | {EVIDENCE_REFERENCE} | {RESOLUTION_REFERENCE} |
| ORPHAN-TASK-UP | Task 无 Requirement 或 Design | 对比 Development Plan 与主矩阵的两个上游字段 | {INTEGER} | {PASS_OR_FAIL} | {EVIDENCE_REFERENCE} | {RESOLUTION_REFERENCE} |
| ORPHAN-TASK-COMMIT | 已完成 Task 无 Commit | 对比已完成 Task、Git 历史与主矩阵；DESIGN 阶段的 NOT_CREATED 不计入 | {INTEGER} | {PASS_OR_FAIL} | {EVIDENCE_REFERENCE} | {RESOLUTION_REFERENCE} |
| ORPHAN-COMMIT | Commit 无 Task、Design、Requirement 或 Test | 从全部范围内 Commit 反向检查上下游 | {INTEGER} | {PASS_OR_FAIL} | {EVIDENCE_REFERENCE} | {RESOLUTION_REFERENCE} |
| ORPHAN-TASK-DOWN | Task 无 Test Case | 对比全部 Task ID 与 Test Plan 引用 | {INTEGER} | {PASS_OR_FAIL} | {EVIDENCE_REFERENCE} | {RESOLUTION_REFERENCE} |
| ORPHAN-TEST | Test Case 无 Commit、Task、Design 或 Requirement | 从全部 Test Case 反向检查四类上游对象 | {INTEGER} | {PASS_OR_FAIL} | {EVIDENCE_REFERENCE} | {RESOLUTION_REFERENCE} |
| STALE-REF | 链接失效、章节失效或版本不一致 | 校验全部链接、锚点、版本和状态 | {INTEGER} | {PASS_OR_FAIL} | {EVIDENCE_REFERENCE} | {RESOLUTION_REFERENCE} |
| RETIRED-REF | 已删除或废弃 ID 仍被活动链引用 | 对比变更记录、源文档状态和活动链 | {INTEGER} | {PASS_OR_FAIL} | {EVIDENCE_REFERENCE} | {RESOLUTION_REFERENCE} |
| OPEN-CHANGE | 未关闭变更影响 | 对比变更影响记录与 Chain Status | {INTEGER} | {PASS_OR_FAIL} | {EVIDENCE_REFERENCE} | {RESOLUTION_REFERENCE} |
| PLACEHOLDER | 空单元格或未替换模板字段 | 扫描空值、花括号字段和五层 N/A | {INTEGER} | {PASS_OR_FAIL} | {EVIDENCE_REFERENCE} | {RESOLUTION_REFERENCE} |

## 11. 覆盖完整性汇总

| 层级 | 源文档活动项总数 | 已进入主矩阵数量 | 具备完整上游数量 | 具备完整下游数量 | 孤儿数量 | 结果 |
|---|---|---|---|---|---|---|
| Requirement | {INTEGER} | {INTEGER} | Not Applicable | {INTEGER} | {INTEGER} | {PASS_OR_FAIL} |
| Design | {INTEGER} | {INTEGER} | {INTEGER} | {INTEGER} | {INTEGER} | {PASS_OR_FAIL} |
| Development Task | {INTEGER} | {INTEGER} | {INTEGER} | {INTEGER} | {INTEGER} | {PASS_OR_FAIL} |
| Commit | {INTEGER} | {INTEGER} | {INTEGER} | {INTEGER} | {INTEGER} | {PASS_OR_FAIL} |
| Test Case | {INTEGER} | {INTEGER} | {INTEGER} | Not Applicable | {INTEGER} | {PASS_OR_FAIL} |

完整性检查只有在以下条件全部满足时才为 PASS：

- 当前阶段适用的五层活动项总数均已核对，主矩阵覆盖数量与范围一致。
- Requirement 的下游、Design 与 Task 的双向、Test Case 的上游完整率均为 100%。
- 所有孤儿项、失效引用、未关闭影响和模板占位符数量均为 0。
- 所有活动 Chain Status 均为 ALIGNED。
- 正向与反向检查均为 PASS，且引用当前批准版本。

## 12. 评审与签署

| 评审项 | 结果 | 评审人 | 日期 | 证据或意见 |
|---|---|---|---|---|
| 文档基线与链接有效 | {PASS_OR_FAIL} | {REVIEWER} | {YYYY-MM-DD} | {EVIDENCE_REFERENCE} |
| 五层正向追踪完整 | {PASS_OR_FAIL} | {REVIEWER} | {YYYY-MM-DD} | {EVIDENCE_REFERENCE} |
| 五层反向追踪完整 | {PASS_OR_FAIL} | {REVIEWER} | {YYYY-MM-DD} | {EVIDENCE_REFERENCE} |
| 变更影响全部关闭 | {PASS_OR_FAIL} | {REVIEWER} | {YYYY-MM-DD} | {EVIDENCE_REFERENCE} |
| 孤儿项与占位符为零 | {PASS_OR_FAIL} | {REVIEWER} | {YYYY-MM-DD} | {EVIDENCE_REFERENCE} |
| Matrix 最终结果 | {PASS_OR_FAIL} | {APPROVER} | {YYYY-MM-DD} | {APPROVAL_RECORD_REFERENCE} |

Matrix 最终结果为 FAIL 时不得推进下一阶段，修订源文档和矩阵后重新执行全部检查。部分抽查、口头说明或风险接受均不能替代当前阶段要求的完整链。
