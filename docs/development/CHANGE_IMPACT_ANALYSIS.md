# Change Impact Analysis

## 1. 目的与适用范围

本标准用于在 DEVELOPMENT 期间识别并关闭修改的上下游影响，防止“修改 A、破坏 B”。它与 [Traceability Matrix 模板](../design/TRACEABILITY_MATRIX_TEMPLATE.md)、[Development Status Standard](./DEVELOPMENT_STATUS_STANDARD.md)、[Development Approval Gate](./DEVELOPMENT_APPROVAL_GATE.md) 和 [ADR-0004](../adr/ADR-0004-DEVELOPMENT-EVIDENCE-AND-TESTING-AUTHORIZATION.md) 共同构成开发证据链。

任何修改都必须建立或关联一份变更影响记录，包括需求、设计、源代码、测试代码、配置、依赖、数据库对象、API 契约、基础设施、构建与部署脚本、运行手册和其他文档修改。纯文字或格式修改也不能跳过分析；其影响维度可以判定为 N/A，但必须提供第 7 节要求的事实证据。

变更影响分析不替代 PRD、Architecture、Development Plan、ADR、测试计划或 Traceability Matrix。各源文档仍是对应事实的权威来源；本文记录修改前后差异、影响范围、处置和关闭证据。

## 2. 核心原则

1. 先分析、后实施。紧急止损可先执行最小可逆隔离，但必须同时登记 Change ID，并在继续扩展修改前补齐分析与批准。
2. 一项逻辑变更使用一个稳定且唯一的 Change ID；不同目标、不同回滚边界或需要独立批准的修改必须拆分。
3. 分析必须覆盖修改内容、影响模块、影响数据库、影响 API、影响测试、风险等级和回滚方案，不得只写“无影响”。
4. 影响检查必须同时向上追踪意图、向下追踪实现与验证，并覆盖 Requirement → Design → Task → Commit → Test 五层链。
5. 一对多、多对一关系按原子链逐行展开，不得把多个 ID 隐藏在逗号列表或自由文本中。
6. 任何未分析、未批准、未重新基线化或未验证的影响都保持打开；风险接受不能替代修复、测试、回滚或硬门禁。
7. 批准仅对记录中的精确范围和版本有效。实现或基线发生额外变化时，原批准失去当前性。

## 3. Change ID 与记录边界

### 3.1 Change ID

- 格式：`CHG-XXXX`，其中 `XXXX` 为项目内递增且不复用的编号。
- Change ID 在创建后不可改名；被放弃的记录保留并标记关闭原因，不得把编号分配给其他变更。
- Commit、Review、Test、Bug、ADR 和 Traceability Matrix 必须引用对应 Change ID；一个 Commit 涉及多个变更时，每个变更分别建立原子映射。
- 一个 Change ID 的范围必须具有单一目标、明确的受影响基线和可独立执行的回滚边界。

### 3.2 触发条件

出现以下任一情况时，必须在实施或合并前创建新记录，或重新打开现有记录：

- 新增、修改、删除或替代 Requirement、Design、Task、Commit 映射或 Test Case。
- 修改模块职责、公共行为、业务规则、错误处理、权限、安全、隐私、性能、容量、可观测性或外部依赖。
- 修改数据库 Schema、约束、索引、查询、事务、迁移、种子数据、缓存、备份、恢复、保留或删除策略。
- 修改同步或异步 API、事件、消息、文件格式、CLI、SDK、认证授权、错误码、速率限制或版本兼容策略。
- 修改测试用例、测试数据、Mock、断言、覆盖范围、门槛、环境或证据保存方式。
- 修改配置、Feature Flag、Secret 引用、构建、部署、基础设施、运行手册或回滚步骤。
- 修复 Bug、处理安全事件、升级依赖、解决合并冲突，或发现实现偏离批准基线。
- 已批准记录的 N/A 复核触发器发生、风险升高、回滚不可用、测试失败或出现未预期影响。

多个文件只要服务于同一目标且共享批准、验证和回滚边界，可以属于同一 Change ID。仅因同一次提交而把无关修改合并为一个 Change ID 不合格。

## 4. 角色与责任

| 角色 | 责任 |
|---|---|
| Change Owner | 创建记录、界定差异、组织影响分析、维护状态并收集关闭证据 |
| Task / 模块责任人 | 核对实现边界、依赖、兼容性和模块回归范围 |
| 数据责任人 | 核对 Schema、数据质量、迁移、备份、恢复、保留和不可逆影响 |
| API / 集成责任人 | 核对契约、调用方、版本、权限、错误语义和兼容性 |
| 测试责任人 | 核对测试用例、回归集合、环境、数据、结果与证据 |
| 安全 / 运维评审人 | 在适用时核对权限、隐私、Secret、部署、监控和恢复控制 |
| Gate Owner | 核对批准权限、版本基线、硬阻断、重新基线和关闭条件 |
| 用户 / 业务责任人 | 对范围、验收或用户可见行为变化作明确确认；不能由 Agent 或自动化检查代替 |

Change Owner 不得独自批准自己负责的 HIGH 或 CRITICAL 变更。评审人必须核验源文档和证据，不能只接受作者声明。

## 5. 必填分析内容

每份记录至少包含以下信息：

| 分类 | 必填内容 |
|---|---|
| 标识与基线 | Change ID、标题、触发条件、Change Owner、创建时间、当前范围、基线版本 / 基准 Commit、关联 Requirement / Design / Task / Bug / ADR |
| 修改内容 | 修改前行为、修改后行为、明确不修改的边界、文件或 Artifact 清单、实施顺序 |
| 影响模块 | 直接模块、间接依赖、调用方、被调用方、共享库、配置、部署单元、监控与运维边界 |
| 影响数据库 | Schema、数据、查询、事务、迁移、兼容、备份、恢复、保留、删除和回滚影响，或可审计 N/A |
| 影响 API | 提供方、消费方、同步 / 异步契约、版本、认证授权、错误码、幂等、兼容和弃用影响，或可审计 N/A |
| 影响测试 | 新增 / 修改 / 删除的 Test Case、回归集合、测试数据、环境、非功能与失败场景、预期结果和证据位置，或可审计 N/A |
| 五层追踪 | 每条受影响 Chain ID 的 Requirement、Design、Task、旧 / 新 Commit、Test Case、方向、动作和 Chain Status |
| 风险 | 风险等级、触发依据、概率与影响、风险责任人、缓解措施、剩余风险和监控信号 |
| 回滚 | 回滚触发器、步骤、执行人、数据保护、兼容窗口、验证、时间目标、通信路径；不可逆变化的补偿与恢复控制 |
| 批准与关闭 | 各领域评审、用户 / 业务确认（适用时）、批准决定、重新基线证据、Commit / Review / Test 证据、文档同步和关闭结论 |

“仅影响当前文件”“应该兼容”“测试已覆盖”或“可直接回退”等未经引用验证的表述不构成证据。

## 6. 五层上下游追踪

### 6.1 检查方向

| 变更起点 | 必须向上检查 | 必须向下检查 |
|---|---|---|
| Requirement | 当前范围、用户批准、验收标准 | 全部 Design、Task、Commit、Test Case |
| Design | Requirement、Architecture、相关 ADR | 全部 Task、Commit、Test Case、模块 / 数据库 / API 边界 |
| Task | Requirement、Design、依赖任务 | Commit、Review、Test Case、文档和交付动作 |
| Commit / 实现 | Task、Design、Requirement、Change ID | Test Case、调用方、数据 / API 契约、部署与回滚验证 |
| Test Case | Commit、Task、Design、Requirement | 验收覆盖、回归集合、环境与证据消费者 |

检查不能停在直接相邻层。例如，数据库迁移由某个 Task 引起时，仍需回溯 Requirement 与 Design，并向下检查实际 Commit 和验证迁移、兼容与恢复的 Test Case。

### 6.2 原子影响表

每条受影响链单独记录一行：

| Change ID | Chain ID | Requirement ID | Design ID | Task ID | 旧 Commit / 状态 | 新 Commit / 状态 | Test Case ID | 影响方向 | 所需动作 | 责任人 | 证据 | Chain Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `CHG-XXXX` | `CHAIN-XXXX` | `REQ-XXXX` | `DES-XXXX` | `TASK-XXXX` | 基线引用 | 当前引用 | `TC-XXXX` | 上游 / 下游 / 双向 | 明确动作 | 责任人 | 版本化链接 | `IMPACT_REVIEW_REQUIRED` / `ALIGNED` / `BROKEN` / `RETIRED` |

影响分析开始后，相关活动链必须标记为 `IMPACT_REVIEW_REQUIRED`。只有源文档、实现、测试、版本和审批同步完成，且正向、反向与孤儿项检查均通过后，才能恢复为 `ALIGNED`。删除或替代链必须有获批的范围变更记录，才可标记为 `RETIRED`。

### 6.3 完整性检查

- 当前范围内每个受影响 Requirement 的所有下游分支均已展开。
- 每个受影响 Test Case、Commit、Task 和 Design 均能反向回到已批准 Requirement。
- 新增 ID 无孤儿项；删除或替代 ID 无活动引用；共享关系没有隐藏分支。
- 文档链接、章节、版本、Commit SHA 和状态指向同一当前基线。
- Traceability Matrix 的变更记录已引用 Change ID，OPEN / IN_REVIEW 影响数量为 0 才能关闭。

## 7. 适用性与 N/A 证据

### 7.1 通用规则

“影响模块”“影响数据库”“影响 API”“影响测试”四个维度必须分别标记 `Applicable` 或 `N/A`。N/A 不是空白、待确认或风险接受；每一项 N/A 必须独立包含：

| 字段 | 要求 |
|---|---|
| 维度 | 模块、数据库、API 或测试 |
| 当前基线 | 精确范围、版本和基准 Commit |
| 事实依据 | 说明为什么该修改不触达该维度，不接受“这次不改”或“暂不需要”等循环理由 |
| 边界检查 | 列出实际检查的文件、调用关系、数据流、契约、测试映射或自动化结果 |
| 责任与复核 | 申请人、领域评审人、复核日期和证据链接 |
| 复核触发器 | 范围扩大、实现差异、依赖变化、契约变化、测试失败或发现间接引用等 |
| 状态 | Proposed、Approved、Rejected 或 Superseded |

只有状态为 Approved、引用当前基线且复核触发器未发生的 N/A 有效。任何基线变化都会使相关 N/A 回到 Proposed。

### 7.2 各维度最低证据

- 数据库 N/A：证明未触达 Schema、迁移、持久化模型、查询、事务、索引、缓存、种子数据、备份、恢复、保留和删除路径。
- API N/A：证明未改变对外或内部调用契约、事件 / 消息、文件格式、CLI / SDK、认证授权、错误语义、幂等、版本和消费方行为。
- 测试 N/A：仅允许不改变行为、契约、数据、权限、构建或运行结果的修改；必须证明现有测试映射与判定标准未变化，并提供至少一项适合该修改的静态、链接、渲染或一致性验证。行为修改、Bug 修复、依赖升级和配置修改不得把测试影响标记为 N/A。
- 模块 N/A：仅允许不改变任何可执行或运行边界的独立文档 / 元数据修改，并证明不存在生成物、构建、部署、运行手册或消费者引用影响。

风险等级和回滚方案不得标记为 N/A。即使是 LOW 风险的文档修改，也必须给出风险判断以及恢复到修改前版本的可执行方式。

## 8. 风险分级

风险按最高触发条件定级，不得用平均分降低等级：

| 等级 | 典型触发条件 | 最低控制 |
|---|---|---|
| LOW | 不改变行为或契约的局部文档、注释、已证明等价的内部重构 | Change Owner 分析，模块责任人复核，定向验证和可执行回退 |
| MEDIUM | 向后兼容的多模块修改、非核心依赖升级、配置 / 性能调整、有限用户可见变化 | 技术与测试评审，完整回归范围，监控和已验证回滚 |
| HIGH | P0 Requirement、核心功能、数据库迁移、公共 API、认证授权、敏感数据、跨服务行为、重大依赖或交付路径变化 | Gate Owner 与领域负责人批准，用户 / 业务确认，安全 / 数据评审（适用时），预演回滚，不得有未关闭高风险影响 |
| CRITICAL | 可能造成不可逆数据损失、大范围不可用、安全 / 隐私 / 合规红线、权限突破，或没有可信回滚 / 恢复路径 | 暂停受影响实施；由有权限的用户、技术、安全 / 数据和 Gate Owner 明确决定，完成隔离、恢复演练与重新基线后才可继续 |

风险记录必须包含触发信号、概率、影响、责任人、缓解措施、监控、剩余风险和接受证据。HIGH / CRITICAL 风险不能以“接受风险”为由绕过失败测试、缺失回滚、未关闭安全问题或其他硬阻断。

## 9. 批准、重新基线、暂停与关闭

### 9.1 状态与决定

为与 Traceability Matrix 一致，Change Status 只允许：

- `OPEN`：记录已创建，分析或处置未完成。
- `IN_REVIEW`：分析、实施方案、测试和回滚材料齐全，正在评审。
- `REBASELINED`：受影响源文档、计划、矩阵和批准基线已经更新；实现与验证可能仍未完成。
- `CLOSED`：实施、Review、验证、文档同步和追踪恢复均已完成。

批准决定与状态分开记录，只允许 `APPROVED_FOR_IMPLEMENTATION`、`CHANGES_REQUIRED`、`PAUSED` 或 `REJECTED`。`REBASELINED` 和 `CLOSED` 不是实施前批准的替代品。

### 9.2 批准规则

- LOW：Change Owner 完成分析，由模块 / 文档责任人复核。
- MEDIUM：技术责任人和测试责任人批准；涉及运维、数据或 API 时增加对应领域评审。
- HIGH：Gate Owner、技术责任人、测试责任人及所有适用领域负责人批准；范围、验收或用户可见行为变化必须取得用户 / 业务责任人明确确认。
- CRITICAL：保持 `PAUSED`，直至有权限的用户 / 业务、技术、安全 / 数据和 Gate Owner 对精确基线作明确批准，并证明隔离、回滚或等价恢复控制有效。

任一必填维度缺失、N/A 证据无效、五层链不完整、测试方案不可执行、回滚不可验证、重大 ADR 缺失或存在硬阻断时，只能给出 `CHANGES_REQUIRED` 或 `PAUSED`。

### 9.3 重新基线规则

以下变化必须重新基线：批准范围、Requirement / Design / Task / Test Case、公共契约、数据库、核心模块、风险等级、回滚方案、依赖版本或计划中的 Commit 边界发生变化。

重新基线必须按权威来源顺序修订 PRD / ADR / Architecture / Development Plan / Test Plan，随后更新 Traceability Matrix、Development Status、PROJECT_STATE 和 PROJECT_MEMORY。所有受影响链接和批准必须指向同一新版本；旧批准不得沿用。只有这些更新及其评审证据齐全后，Change Status 才能标记为 `REBASELINED`。

### 9.4 暂停规则

出现未预期影响、风险升为 HIGH / CRITICAL、测试失败、回滚失效、数据或安全异常、实现偏离批准范围、N/A 触发器发生、五层链变为 BROKEN，或用户撤回确认时，立即停止受影响工作并将批准决定记为 `PAUSED`。先隔离或回退，再补充分析；不得继续合并、部署或把缺口转移到 TESTING。

如果影响范围不能被可靠隔离，暂停整个相关基线。若变更暴露设计、范围、价值或关键可行性失效，按 [阶段门禁检查清单](../evaluation/PHASE_GATE_CHECKLIST.md) 退回 DESIGN、EVALUATION 或 RESEARCH。

### 9.5 关闭条件

Change Status 只有在以下条件全部满足时才可为 `CLOSED`：

- 修改内容与批准范围一致，全部实际 Commit SHA 已记录且可访问。
- Code Review 对当前 Commit 和基线通过，阻断意见为 0。
- 新增 / 修改测试及规定回归均已执行，结果满足判定标准，证据可访问。
- 数据库、API、模块、测试和回滚动作均已完成或具有有效 Approved N/A。
- 所有受影响源文档、ADR、计划、运行手册、Development Status、PROJECT_STATE 和 PROJECT_MEMORY 已同步。
- Traceability Matrix 已重新执行正向、反向、孤儿项、失效引用和变更影响检查；活动链均为 ALIGNED。
- 未关闭 HIGH / CRITICAL 风险、P0 / P1 Bug、硬阻断和未预期影响数量均为 0。

## 10. 执行流程

1. 创建 Change ID，冻结修改前范围、文档版本和 Git 基线。
2. 描述前后差异与非目标，识别直接文件、模块、数据、API、测试、配置和运行影响。
3. 从变更起点执行五层正向和反向追踪，把相关链标记为 `IMPACT_REVIEW_REQUIRED`。
4. 对四个必填影响维度逐项判定 Applicable 或提交可审计 N/A，按最高触发条件确定风险等级。
5. 制定实施、验证、监控和回滚方案，取得与风险等级匹配的批准。
6. 按批准范围实施；实际差异触发暂停和重新分析，不能静默扩大范围。
7. 更新源文档和版本，完成必要的重新基线、Code Review、测试与回滚验证。
8. 更新 Traceability Matrix、Development Status、PROJECT_STATE 和 PROJECT_MEMORY，执行完整性检查。
9. Gate Owner 核对第 9.5 节；条件全部满足后关闭记录，否则保持 OPEN / IN_REVIEW / REBASELINED。

## 11. 变更影响记录格式

每次复审保存不可覆盖的记录；基线变化时创建新版本并引用上一版本。

### 11.1 基本信息

| 字段 | 内容 |
|---|---|
| Change ID | `CHG-XXXX` |
| 标题与目标 | 明确、单一的变更目标 |
| 触发条件 | 触发本记录的事实与证据 |
| Change Owner | 姓名或责任角色 |
| 用户 / 业务责任人 | 姓名或责任角色；不涉及范围、验收或用户行为时附 Approved N/A 记录 |
| 当前范围基线 | 版本化链接 |
| 修改前 Git 基线 | 分支与 Commit SHA |
| 关联 ID | Requirement / Design / Task / Bug / ADR |
| 创建与最后更新时间 | 时间戳 |
| Change Status | OPEN / IN_REVIEW / REBASELINED / CLOSED |
| 批准决定 | APPROVED_FOR_IMPLEMENTATION / CHANGES_REQUIRED / PAUSED / REJECTED |

### 11.2 必填影响摘要

| 检查项 | 适用性 | 影响与证据 | 所需动作 | 责任人 | 评审结论 |
|---|---|---|---|---|---|
| 修改内容 | Applicable | 前后差异与非目标 | 实施动作 | 责任人 | PASS / FAIL |
| 影响模块 | Applicable / Approved N/A | 模块、依赖与调用证据 | 同步与验证动作 | 责任人 | PASS / FAIL |
| 影响数据库 | Applicable / Approved N/A | 数据与迁移证据 | 迁移、恢复或验证动作 | 责任人 | PASS / FAIL |
| 影响 API | Applicable / Approved N/A | 契约与消费方证据 | 兼容、版本或验证动作 | 责任人 | PASS / FAIL |
| 影响测试 | Applicable / Approved N/A | Test Case 与回归证据 | 新增、修改和执行动作 | 责任人 | PASS / FAIL |
| 风险等级 | Applicable | 等级、依据和风险记录 | 缓解与监控动作 | 风险责任人 | PASS / FAIL |
| 回滚方案 | Applicable | 触发器、步骤与验证证据 | 回滚或补偿动作 | 责任人 | PASS / FAIL |

### 11.3 重新基线与关闭摘要

| 字段 | 内容 |
|---|---|
| 新范围 / 文档基线 | 版本化链接或“范围未变化”的核验证据 |
| 实际 Commit SHA | 不可变 SHA 与证据链接 |
| Review 结果 | 评审人、结论、时间与当前 SHA |
| Test 结果 | Test Case、环境、结果、时间与证据链接 |
| 回滚验证 | 演练 / 静态验证结果与证据 |
| Traceability 结果 | Matrix 版本、完整性结果、OPEN 影响数量 |
| 文档同步 | 已更新 Artifact 与版本清单 |
| 用户 / 业务确认 | 确认人、时间、精确版本和证据，或有效 Approved N/A |
| 剩余风险 | 风险 ID、等级、接受人和证据；没有时记录 0 |
| 关闭结论 | CLOSED 或未关闭原因与下一动作 |

## 12. 与 Testing 门禁的关系

存在 `OPEN`、`IN_REVIEW` 或仅 `REBASELINED` 但未完成验证的变更时，不得通过 Development Approval Gate。申请进入 TESTING 前，当前范围内全部 Change ID 必须为 `CLOSED`，Traceability Matrix 的未关闭变更影响数量必须为 0，相关活动链必须为 `ALIGNED`。

变更关闭只证明当前开发基线的影响已经处理，不代表完成正式 Testing、用户验收、发布批准或生产部署。
