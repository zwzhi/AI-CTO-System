# Design Approval Gate

## 1. 目的与授权原则

本门禁是 DESIGN → DEVELOPMENT 转换的唯一授权记录，与 [阶段门禁检查清单](../evaluation/PHASE_GATE_CHECKLIST.md)、[文档关联规则](../protocol/DOCUMENT_RELATIONSHIP.md) 和 [ADR-0003](../adr/ADR-0003-DESIGN-AND-DEVELOPMENT-AUTHORIZATION.md) 一致。

Design 文档完成不等于获得开发授权。只有本门禁针对当前文档版本给出 APPROVED_FOR_DEVELOPMENT，项目才能转换到 DEVELOPMENT。任何其他结果、口头同意、沉默、自动评分、过往版本批准或“先开发后补文档”都不构成授权。

本门禁不提供条件性通过。硬阻断项不能通过风险接受、管理例外或缩小检查范围绕过；允许使用 N/A 的项目只有 Database Design 和非 AI 项目的 Agent Design，且必须满足本文的可审计 N/A 规则。

## 2. 角色与职责

| 角色 | 职责 |
|---|---|
| Gate Owner | 冻结版本基线、组织评审、收集证据、记录结果 |
| 文档责任人 | 修订对应文档、关闭评审问题、维护源文档状态 |
| 技术 / 产品 / 测试 / 安全评审人 | 按专业范围核验证据，不以作者声明代替检查 |
| 风险接受人 | 在权限范围内明确接受非阻断的剩余风险 |
| 用户批准人 | 对当前范围、版本、计划、验收、风险与回滚作最终明确批准 |

用户批准人必须是能够代表用户作出当前开发决定的人。Agent、自动化检查或 Gate Owner 不得代替用户批准。

## 3. 门禁输入

发起评审时必须提供可访问、版本化且状态明确的输入：

1. APPROVED_FOR_DESIGN 的立项门禁记录与当前范围基线。
2. PRD。
3. Architecture。
4. Database Design，或经批准的可审计 N/A 记录。
5. AI 项目的 Agent Design；非 AI 项目则提供经批准的可审计 N/A 记录。Agent Design 应符合 [AI 项目 Agent 设计标准](./AGENT_DESIGN_STANDARD.md)。
6. Development Plan。
7. Test Plan 或完整验收测试用例集。
8. 已填写的 Traceability Matrix；格式可使用 [Traceability Matrix 模板](./TRACEABILITY_MATRIX_TEMPLATE.md)。
9. 开发与交付风险清单。
10. 可执行的发布回滚方案。
11. 当前范围内全部重大决策的 ADR 清单与文档。
12. 当前 PROJECT_STATE 与 PROJECT_MEMORY。
13. 未关闭评审问题、已接受剩余风险和适用性判断记录。

PRD、Architecture、Database Design、Agent Design、Development Plan 和 ADR 可分别使用仓库中的 [PRD 模板](../../templates/PRD_TEMPLATE.md)、[Architecture 模板](../../templates/ARCHITECTURE_TEMPLATE.md)、[Database Design 模板](../../templates/DATABASE_TEMPLATE.md)、[Agent Design 模板](../../templates/AGENT_DESIGN_TEMPLATE.md)、[Development Plan 模板](../../templates/DEVELOPMENT_PLAN_TEMPLATE.md) 与 [ADR 模板](../../templates/ADR_TEMPLATE.md)。

## 4. 适用性与 N/A 规则

### 4.1 Database Design

只要项目创建、读取、更新、删除、迁移、缓存、索引、备份或长期保存业务数据，Database Design 就是必需项。仅当当前批准范围确实不存在持久化或需设计的数据状态时，才可申请 N/A。

### 4.2 Agent Design

当前批准范围属于 AI 项目并包含 Agent、模型驱动决策、模型编排工具或具有自主步骤的 AI 工作流时，Agent Design 是必需项。非 AI 项目必须记录 N/A；不能因为 Agent 简单、仅内部使用、使用第三方服务或计划后补而申请 N/A。

### 4.3 可审计 N/A 记录

每项 N/A 必须独立记录：

| 字段 | 要求 |
|---|---|
| Artifact | Database Design 或 Agent Design |
| 范围基线 | 精确引用 PRD 与 Architecture 当前版本 |
| 事实依据 | 说明为何当前范围不触发该设计，不接受“暂不需要”等循环理由 |
| 边界检查 | 列出已检查的数据流、状态、AI 能力、外部服务和相关需求 |
| 影响 | 说明 N/A 对任务、测试、风险与回滚的影响 |
| 责任与批准 | 申请人、评审人、批准人、日期和证据链接 |
| 复核触发器 | 新增持久化、缓存、AI 能力、Agent、工具编排、范围或架构变化等 |
| 状态 | Proposed、Approved、Rejected 或 Superseded |

只有状态为 Approved、引用当前范围基线且复核触发器未发生的 N/A 记录有效。PRD、Architecture、Development Plan、Test Plan、Traceability Matrix、风险清单、回滚方案、ADR 审查和用户批准不得标记为 N/A。

## 5. 逐项通过标准

### 5.1 立项与范围基线

- 立项结果为 APPROVED_FOR_DESIGN。
- 范围、成功标准、限制和批准条件均有版本化记录。
- 进入 DESIGN 时附带的批准条件已经关闭，没有被设计内容悄然改变。

### 5.2 PRD

- 目标用户、问题、目标、范围内、范围外、限制和成功指标明确。
- 每项功能与非功能需求具有稳定 Requirement ID、优先级和可判定的验收标准。
- 当前版本已由有权限的产品责任人与用户确认。
- 不存在未关闭的范围、优先级或验收歧义。

### 5.3 Architecture

- 引用当前 PRD 版本，组件、系统边界、接口、数据流、依赖和部署边界明确。
- 性能、容量、可用性、可观测性、安全、隐私、权限、故障与恢复满足非功能需求。
- 每个 Design ID 可追溯到 Requirement ID。
- 所有重大选择引用状态为 Accepted 的 ADR；Architecture 与 ADR 不冲突。

### 5.4 Database Design

- 适用时覆盖实体、字段、类型、关系、主外键、约束、索引、容量和查询模式。
- 覆盖数据所有权、分类、访问、加密、审计、生命周期、保留和删除。
- 迁移、兼容、备份、恢复和回滚步骤可执行，并有验证方法。
- Design ID 与 Requirement ID 的映射完整。
- 不适用时，N/A 记录满足第 4 节并已 Approved。

### 5.5 Agent Design

- AI 项目中的每个 Agent 均有稳定 Agent ID、Design ID 和需求追溯。
- 覆盖职责与非职责、输入、输出、Prompt 策略、工具调用、Memory 使用、失败处理和评估方式。
- 覆盖权限最小化、数据分类、工具契约与副作用、审批、Memory 读写与保留、Prompt 版本与注入防护、人工接管、可观测性和安全门槛。
- 评估方案包含数据集、指标、预先批准的门槛、责任人和执行阶段；开发前可完成的威胁、权限、工具副作用、Memory 与注入控制设计检查已经通过。
- 依赖具体实现的评测已经映射到 Development Task ID 和 Test Case ID，不得在实现前虚构通过结果。
- 非 AI 项目的 N/A 记录满足第 4 节并已 Approved。

### 5.6 Development Plan

- 引用当前 Architecture 版本和相关 Accepted ADR。
- 每项任务有稳定 Task ID，并引用其 Requirement ID 与 Design ID。
- 任务范围、顺序、依赖、责任人、环境、验证方法和完成条件可执行。
- 里程碑、集成、发布、迁移、回滚和文档更新责任已纳入计划。
- 计划没有在未更新 PRD、Architecture 或 ADR 的情况下偏离设计。

### 5.7 Traceability Matrix

- Requirement ID → Design ID → Development Task ID → Test Case ID 的四层链完整。
- 正向和反向检查全部通过，活动项不存在孤儿、空链、N/A 核心字段或隐藏列表。
- 一对多与多对一关系均按原子链展开。
- 所有文档链接、章节、状态和版本有效且对应当前基线。
- 变更影响全部关闭，活动 Chain Status 均为 ALIGNED。

### 5.8 Test Plan 与验收用例

- 每个必须满足的 Requirement ID 至少有一项可执行 Test Case。
- Test Case 引用 Requirement ID、Design ID 和 Task ID。
- 覆盖功能、非功能、边界、失败、权限、安全、兼容、恢复和回归场景；AI 项目还覆盖对抗、注入、越权、敏感数据、工具副作用和人工接管。
- 环境、前置条件、测试数据、步骤、预期结果、判定标准和证据保存位置明确。
- 开发前可完成的设计验证已经通过；开发阶段执行的测试有明确负责人和计划。

### 5.9 风险清单

- 覆盖产品、技术、数据、安全、隐私、合规、成本、资源、依赖、交付和运营风险。
- 每项风险有触发信号、概率与影响、责任人、缓解措施、监控方式和剩余风险。
- 红线与开发阻断风险已经关闭。
- 非阻断的剩余风险由有权限的人基于当前版本明确接受，且接受记录不替代必要控制。

### 5.10 回滚方案

- 定义发布、迁移、数据错误、安全事件、性能退化和依赖故障等回滚触发条件。
- 步骤、执行身份、责任人、顺序、时间目标和通信路径明确。
- 覆盖数据备份、恢复、兼容性、部分成功、不可逆步骤和补偿方案。
- 回滚后的功能、数据、安全和监控验证可执行。
- 对无法回滚的变化提供等价的预防、隔离、预演和恢复控制，并获得明确批准。

### 5.11 ADR

- 影响架构、数据、接口、安全、成本、流程或长期维护的重大决策均有唯一 ADR。
- 当前采用的 ADR 状态为 Accepted；相关 Proposed 决策不得作为开发依据。
- Superseded ADR 正反向引用替代记录，源文档引用当前决策。
- ADR 的后果与后续行动已反映到设计、计划、测试、风险和回滚中。

### 5.12 一致性与版本基线

- PRD、Architecture、Database / Agent Design、Development Plan、Test Plan、Traceability Matrix、风险、回滚和 ADR 之间不存在未解决的范围、接口、数据、权限、环境或计划冲突。
- 每份输入的路径、版本或提交、状态、责任人、批准人和日期均已冻结。
- 所有评审证据针对同一版本基线，链接可访问，引用没有指向“最新版”或旧版本。

### 5.13 用户明确批准

- 门禁材料已向用户展示当前范围、完整版本基线、开发计划、验收方式、风险和回滚。
- 用户批准记录包含批准人、时间、明确决定、精确版本清单和适用范围。
- 批准无未关闭条件，不以沉默、会议出席、旧版本意见或 Agent 推断代替。
- 用户明确使用等价于“批准这些版本进入 DEVELOPMENT”的语言。

## 6. 硬阻断项

出现以下任一情况，结果不得为 APPROVED_FOR_DEVELOPMENT：

- 任一强制输入缺失、不可访问、状态未确认或版本不明确。
- Database Design 或 Agent Design 被错误豁免，或 N/A 未批准、依据不足、引用旧范围。
- PRD 缺少稳定需求 ID或可判定验收标准。
- Architecture 与 PRD、设计与 Architecture、计划与设计之间存在未解决冲突。
- 四层追踪存在空链、孤儿项、失效链接、旧版本、未展开关系或未关闭影响。
- Test Plan 不可执行、关键需求无测试、预期结果或通过标准不明确。
- AI Agent 的评估方案不完整，设计期安全检查未通过，或存在未关闭的注入绕过、越权、敏感数据泄露路径、未经批准副作用等关键设计缺陷。
- 存在未关闭红线、开发阻断风险、合规或安全问题。
- 回滚不可执行，数据保护或恢复验证缺失，且没有获准的等价控制。
- 必需 ADR 缺失、状态不是 Accepted 或与当前文档冲突。
- 评审问题未关闭，剩余风险没有有权限的接受人。
- 用户未明确批准、批准带有未关闭条件、批准对象是旧版本或批准范围不一致。

硬阻断项数量必须为零。不存在“总体分数足够高即可通过”的机制，也不得把多个部分通过合并成对一个失败项的豁免。

## 7. 评审流程

1. Gate Owner 确认立项结果，冻结范围和全部输入版本。
2. 判断 Database Design 与 Agent Design 的适用性，核验所有 N/A 记录。
3. 各责任评审人按第 5 节逐项核验源文档和证据。
4. 执行四层正向、反向、链接、版本、孤儿项和变更影响检查。
5. 核对 ADR、风险、回滚及跨文档一致性，登记全部阻断项。
6. 文档责任人关闭问题；任何修订都创建新基线并重新执行受影响检查。
7. 所有硬阻断为零后，向用户展示完整当前基线并取得明确批准。
8. Gate Owner 记录唯一门禁结果。只有 APPROVED_FOR_DEVELOPMENT 才能更新 PROJECT_STATE 为 DEVELOPMENT。
9. 更新 PROJECT_MEMORY，记录批准范围、关键决定、限制、剩余风险、回滚和开发启动摘要。

不得先取得空白授权再补版本，也不得在用户批准后修改基线而沿用原批准。

## 8. 门禁结果

| 结果 | 含义 | 是否授权 DEVELOPMENT |
|---|---|---|
| APPROVED_FOR_DEVELOPMENT | 所有通过标准满足，硬阻断为零，用户批准当前基线 | 是 |
| CHANGES_REQUIRED | 缺口可在 DESIGN 内修订，需关闭后重新执行完整门禁 | 否 |
| RETURN_TO_EVALUATION | 价值、范围、成功标准或关键可行性假设失效，需退回 EVALUATION 或 RESEARCH | 否 |
| DEFERRED | 用户或项目决定暂缓，已记录重启条件 | 否 |

不设置 CONDITIONAL_APPROVAL。即使预计很快补齐，也必须先给出 CHANGES_REQUIRED，完成修订、重新基线化和用户批准后再评审。

## 9. 门禁记录格式

每次评审必须保存一份不可覆盖的记录；重新评审创建新记录并引用上一记录。

### 9.1 基本信息

| 字段 | 内容 |
|---|---|
| Gate Record ID | {GATE_RECORD_ID} |
| 项目 | {PROJECT_NAME} |
| 评审范围 | {SCOPE_BASELINE_REFERENCE} |
| 评审日期 | {YYYY-MM-DD} |
| Gate Owner | {OWNER} |
| 上一记录 | {PREVIOUS_RECORD_REFERENCE_OR_NONE} |

### 9.2 输入基线与逐项结论

| 检查项 | 文档或证据链接 | 版本或提交 | 适用性 | 评审人 | 结论 | 问题记录 |
|---|---|---|---|---|---|---|
| PRD | {REFERENCE} | {VERSION} | Applicable | {REVIEWER} | {PASS_OR_FAIL} | {ISSUE_REFERENCE_OR_NONE} |
| Architecture | {REFERENCE} | {VERSION} | Applicable | {REVIEWER} | {PASS_OR_FAIL} | {ISSUE_REFERENCE_OR_NONE} |
| Database Design | {REFERENCE} | {VERSION} | {APPLICABLE_OR_APPROVED_NA} | {REVIEWER} | {PASS_OR_FAIL} | {ISSUE_REFERENCE_OR_NONE} |
| Agent Design | {REFERENCE} | {VERSION} | {APPLICABLE_OR_APPROVED_NA} | {REVIEWER} | {PASS_OR_FAIL} | {ISSUE_REFERENCE_OR_NONE} |
| Development Plan | {REFERENCE} | {VERSION} | Applicable | {REVIEWER} | {PASS_OR_FAIL} | {ISSUE_REFERENCE_OR_NONE} |
| Test Plan | {REFERENCE} | {VERSION} | Applicable | {REVIEWER} | {PASS_OR_FAIL} | {ISSUE_REFERENCE_OR_NONE} |
| Traceability Matrix | {REFERENCE} | {VERSION} | Applicable | {REVIEWER} | {PASS_OR_FAIL} | {ISSUE_REFERENCE_OR_NONE} |
| Risk Register | {REFERENCE} | {VERSION} | Applicable | {REVIEWER} | {PASS_OR_FAIL} | {ISSUE_REFERENCE_OR_NONE} |
| Rollback Plan | {REFERENCE} | {VERSION} | Applicable | {REVIEWER} | {PASS_OR_FAIL} | {ISSUE_REFERENCE_OR_NONE} |
| ADR Set | {REFERENCE} | {VERSION} | Applicable | {REVIEWER} | {PASS_OR_FAIL} | {ISSUE_REFERENCE_OR_NONE} |
| Cross-document Consistency | {EVIDENCE_REFERENCE} | {BASELINE_VERSION} | Applicable | {REVIEWER} | {PASS_OR_FAIL} | {ISSUE_REFERENCE_OR_NONE} |

### 9.3 N/A、风险与阻断项

| 类型 | ID | 说明 | 责任人 | 批准或关闭证据 | 状态 |
|---|---|---|---|---|---|
| N/A Record | {NA_RECORD_ID_OR_NONE} | {RATIONALE_OR_NONE} | {OWNER} | {EVIDENCE_OR_NONE} | {STATUS_OR_NONE} |
| Residual Risk | {RISK_ID_OR_NONE} | {RISK_OR_NONE} | {RISK_ACCEPTOR} | {ACCEPTANCE_OR_NONE} | {STATUS_OR_NONE} |
| Hard Blocker | {BLOCKER_ID_OR_NONE} | {BLOCKER_OR_NONE} | {OWNER} | {CLOSURE_OR_NONE} | {STATUS_OR_NONE} |

### 9.4 追踪与用户批准

| 字段 | 内容 |
|---|---|
| Traceability Matrix 结果 | {PASS_OR_FAIL} |
| 活动完整链数量 | {INTEGER} |
| 孤儿项数量 | {INTEGER} |
| 失效引用数量 | {INTEGER} |
| 未关闭变更影响数量 | {INTEGER} |
| 硬阻断项数量 | {INTEGER} |
| 用户批准人 | {USER_APPROVER} |
| 用户批准时间 | {TIMESTAMP} |
| 用户批准的精确版本清单 | {VERSION_BASELINE_REFERENCE} |
| 用户批准原文或证据 | {APPROVAL_EVIDENCE_REFERENCE} |

### 9.5 最终结果

| 字段 | 内容 |
|---|---|
| Gate Result | {APPROVED_FOR_DEVELOPMENT_OR_CHANGES_REQUIRED_OR_RETURN_TO_EVALUATION_OR_DEFERRED} |
| 决定理由 | {DECISION_RATIONALE} |
| 生效范围 | {AUTHORIZED_SCOPE_OR_NONE} |
| 下一动作 | {NEXT_ACTION} |
| PROJECT_STATE 更新证据 | {STATE_UPDATE_REFERENCE_OR_NOT_AUTHORIZED} |
| PROJECT_MEMORY 更新证据 | {MEMORY_UPDATE_REFERENCE} |

若结果为 APPROVED_FOR_DEVELOPMENT，硬阻断项、孤儿项、失效引用和未关闭变更影响必须全部为 0，所有强制检查必须为 PASS，且用户批准证据必须指向同一版本基线。否则记录本身无效。

## 10. 未通过与变更后的处理

- 结果为 CHANGES_REQUIRED 时保持 DESIGN，禁止开始编码、配置生产环境或执行不可逆实施。将缺口退回对应责任人，修订后重新冻结全部相关版本并执行完整门禁。
- 发现范围、价值、成功标准或关键可行性假设失效时，结果为 RETURN_TO_EVALUATION；必要时继续退回 RESEARCH，并记录受影响文档与重启条件。
- 用户不批准或决定暂缓时，结果为 DEFERRED；记录原因、条件和下一次评审触发点，不得把未回复视为同意。
- 任一已批准基线在开发开始前发生变化，原 APPROVED_FOR_DEVELOPMENT 自动失去当前性，项目退回 DESIGN 重新评审。
- 开发期间发生影响范围、架构、数据、Agent、接口、安全、任务、测试、风险或回滚的基线变化时，暂停受影响工作，更新源文档、ADR 与 Traceability Matrix，完成影响分析并重新取得对应范围授权。
- 关闭问题不得只修改门禁记录；必须先修订权威源文档、补充证据、完成验证，再更新门禁记录。

## 11. 门禁输出

通过时必须形成：

- APPROVED_FOR_DEVELOPMENT 门禁记录及精确版本基线。
- Database Design 与 Agent Design 的批准版本或有效 N/A 记录。
- 四层 Traceability Matrix、正反向检查与零孤儿证明。
- 已关闭评审问题、已接受剩余风险和可执行回滚证据。
- 用户对当前版本的明确批准记录。
- PROJECT_STATE 转换证据、PROJECT_MEMORY 摘要和 DEVELOPMENT 的首个 Next Action。

未通过时必须形成：

- 非授权门禁结果、全部缺口与责任人。
- 项目保持或退回的阶段、修订范围和下一动作。
- 重新评审所需证据与触发条件。

无论 Design 材料看起来多完整，只要没有一份有效且当前的 APPROVED_FOR_DEVELOPMENT 记录，就不得进入 DEVELOPMENT。
