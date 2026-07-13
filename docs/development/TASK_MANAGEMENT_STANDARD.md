# Development Task 管理标准

## 1. 目的与适用范围

本标准规定如何把已确认的 Design 文档转换为可计划、可执行、可独立验证且可追溯的 Development Task。它适用于 DESIGN 阶段的任务拆分、Development Plan 编制、DEVELOPMENT 阶段的任务执行与变更，以及后续测试和审计。

本标准与[文档关联规则](../protocol/DOCUMENT_RELATIONSHIP.md)、[Design Approval Gate](../design/DESIGN_APPROVAL_GATE.md)和[Traceability Matrix 模板](../design/TRACEABILITY_MATRIX_TEMPLATE.md)共同使用。Development Plan 是具体任务、顺序、依赖和验证方法的权威来源；本标准定义每项 Task 必须满足的结构与治理规则，不复制 PRD 或 Design 文档中的权威内容。

Task 可以在 DESIGN 阶段定义、评审和基线化，但不得因此开始实现。只有当前 Task 所引用的精确文档基线已取得有效的 `APPROVED_FOR_DEVELOPMENT`，Task 才能进入执行状态。

## 2. Design 转换为 Task

### 2.1 转换输入

开始拆分前必须具备以下输入，并记录可访问的路径、精确版本或提交、状态和适用章节：

- 已批准且属于当前范围的 PRD，所有范围内需求具有稳定 Requirement ID 和可判定验收标准；
- 已确认且引用同一 PRD 基线的 Architecture，相关设计项具有稳定 Design ID；
- 适用的 Database Design、Agent Design、接口契约及其确认版本，或有效的可审计 N/A 记录；
- 与相关 Design ID 有关且状态为 Accepted 的 ADR；
- 测试策略、验收用例来源、风险与回滚约束，以及已知环境和资源限制；
- 当前范围基线与尚未关闭的评审问题清单。

任一上游引用缺失、版本不明确、状态不满足要求，或 PRD、Architecture 与专项设计之间存在冲突时，只能记录拆分缺口，不能把假设写成可执行 Task。

### 2.2 转换步骤

1. 冻结输入基线，按 Requirement ID 和 Design ID 建立设计覆盖清单。
2. 对每个 Design ID 识别可观察的交付结果、输入、输出、边界、依赖和验证责任；一个 Design ID 可以产生多个 Task。
3. 按单一结果和单一验证边界拆分 Task；共享任务可以关联多个上游项，但每一条关系都必须在 Traceability Matrix 中展开为独立原子链。
4. 在定义实现工作前先定义验收标准、Test Case ID、测试环境、测试数据、预期结果和证据位置。
5. 建立 Task 间有向依赖，识别阻断项、资源约束、集成点和风险；存在循环依赖时必须继续拆分或调整设计。
6. 为通过原子性检查的 Task 分配永久 Task ID，纳入 Development Plan 的阶段、顺序、里程碑和责任安排。
7. 执行 Requirement → Design → Task → Commit 状态 → Test 的正向、反向和孤儿项检查；评审通过后，Task 才可进入门禁就绪状态。

转换过程只定义要达到的结果、约束与验证方式，不以具体实现代码代替任务说明，也不得在 Task 中偷偷改变产品范围或设计决策。

## 3. Task 必填字段

每个 Task 必须包含以下字段。字段不得留空；确经核验没有依赖或已识别风险时，应记录受控值 `NONE`、核验依据和核验人，不得省略字段。

| 字段 | 填写要求 |
|---|---|
| Task ID | 使用稳定、唯一且不可复用的 `TASK-XXXX`；ID 不包含人员、优先级、版本或顺序 |
| Requirement ID | 引用本 Task 实现的已批准 Requirement ID，并附 PRD 路径、精确版本和章节；共享映射逐条展开 |
| Design ID | 引用本 Task 落实的 Design ID，并附设计文档路径、精确版本和章节；Design ID 必须能回溯到已列 Requirement ID |
| 任务目标 | 用一个可观察结果说明完成后改变了什么、为哪个需求提供什么价值；不得写成活动清单 |
| 任务描述 | 说明范围内工作、范围外工作、处理边界、关键约束和交接点；不得用阶段名称或笼统模块名称代替 |
| 输入 | 列出所需文档、契约、数据、环境、上游产物与前置状态，并记录版本、提供者和就绪判定 |
| 输出 | 列出可交付产物、可观察状态、证据、格式或存放位置，以及下游如何使用；输出必须能被单独检查 |
| 依赖 | 列出前置 Task、外部依赖、决策、资源或环境依赖，注明类型、责任人、满足条件和失败处理 |
| 风险 | 列出触发信号、概率与影响、受影响范围、缓解措施、应急动作、责任人和剩余风险；无已识别风险时也保留核验记录 |
| 验收标准 | 使用可重复判定的前置条件、操作或事件、预期结果、阈值和证据要求；每条标准均能回溯到 Requirement ID |
| 测试要求 | 列出 Test Case ID、测试层级、环境、数据、前置条件、预期结果、通过阈值、执行阶段、责任人和证据位置 |

除上述核心字段外，Task 记录还必须维护责任人、当前状态、所属阶段与里程碑、计划顺序、Test Case ID 集合、Commit 状态或实际 SHA、Review 状态、验证证据和最后变更记录。这些执行控制字段可以在任务明细、计划表或被 Development Plan 精确引用的版本化子记录中呈现，但必须属于同一计划基线。

## 4. 原子性与边界

### 4.1 原子 Task 的判定

一项 Task 只有同时满足以下条件才是原子 Task：

- 只有一个主要目标和一个清晰的交付结果；
- 输入和输出具体、有限且拥有明确交接责任；
- 范围内、范围外和失败边界明确，不依赖口头解释；
- 可以依据自身验收标准和 Test Case 独立判定通过或失败；
- 依赖已显式列出；“独立验证”不要求脱离所有依赖执行，但要求依赖可准备、可替代验证或可由证据确认；
- 有单一主要责任人和清晰的 Review 边界；
- 能在一个短执行周期内闭环，不需要以多人月规模的协调才能得到首个可验证结果。

Task 不应被拆成没有独立结果的机械步骤。创建文件、修改一个名称、召开会议等活动只有在其本身产生可验收交付物并能回溯到需求与设计时，才可作为独立 Task。

### 4.2 必须拆分的信号

出现以下任一情况必须拆分：

- 包含两个或更多可以分别通过或失败的结果；
- 同时跨越互不相干的 Requirement ID、Design ID、系统边界或发布边界；
- 不同部分需要不同责任人、不同环境、不同评审专业或不同回滚方式；
- 一个部分被阻断时，其他部分仍可独立交付；
- 无法为整项工作写出单一且可判定的完成条件；
- 估算只能用阶段、季度、团队或多人月表达；
- 标题或目标使用“完成某阶段”“实现整个系统”“处理全部功能”等无法限定边界的表述。

开发阶段、工作流泳道和里程碑是 Task 的容器或检查点，不是 Task。不得把一个阶段或多人月工作包装成一个 Task。

## 5. Readiness、状态与 Done

### 5.1 门禁就绪

Task 进入 `READY_FOR_GATE` 前必须满足：

- 十一个必填字段和执行控制字段完整，引用路径、版本与章节均有效；
- Requirement ID、Design ID 和 Task ID 的正向及反向映射完整，不存在孤儿项；
- 目标、边界、输入、输出、依赖、风险和验收标准经责任评审人确认；
- Test Case 已在实现前定义，测试要求可执行，预期结果和通过阈值明确；
- 依赖图无循环，前置产物、环境、权限、数据和资源有责任人及就绪计划；
- 阻断风险、设计冲突和未决重大决策为零；
- Traceability Matrix 已展开全部关系，Commit 状态为 `NOT_CREATED`，计划执行的测试结果为 `NOT_RUN`；
- Task 已纳入 Development Plan 的阶段、顺序、里程碑、Review 与验证安排。

`READY_FOR_GATE` 表示任务定义可接受 Design Approval Gate 评审，不表示可执行。

### 5.2 执行就绪

Task 在 DEVELOPMENT 中进入 `READY` 还必须满足：

- 当前范围和全部引用版本已有有效、无条件的 `APPROVED_FOR_DEVELOPMENT`；
- Gate 记录、Development Plan、Task 与 Traceability Matrix 指向同一基线；
- 当前 Task 的硬依赖已满足，所需环境、权限、数据和责任人可用；
- 没有在批准后发生但尚未完成影响分析的上游或计划变更。

### 5.3 状态词汇

| 状态 | 含义与进入条件 |
|---|---|
| DRAFT | 字段、边界、测试或映射仍在编制，不得执行 |
| READY_FOR_GATE | 定义完整并通过任务评审，等待或参与 Design Approval Gate |
| PLANNED | 已进入当前获批 Development Plan，但执行前置条件尚未满足 |
| READY | 当前精确基线已获开发授权且执行前置条件满足 |
| IN_PROGRESS | 已按测试先行顺序开始执行 |
| BLOCKED | 授权、依赖、环境、资源、风险、测试或决策阻断，受影响工作暂停 |
| IN_REVIEW | 输出与 Commit 已形成，正在进行代码或产物 Review |
| VALIDATING | Review 已满足验证条件，正在执行开发级测试与任务验收 |
| ACCEPTED | 满足本标准的完成定义，经指定验收责任人确认并具备完整证据 |
| CANCELLED | 经批准的拆分、合并、取消或范围变化使其退出活动 Task 基线，并保留替代关系 |

`DRAFT` 与 `READY_FOR_GATE` 用于 Design 期任务定义；取得开发授权后，Task 必须映射到 [Development Status Standard](./DEVELOPMENT_STATUS_STANDARD.md) 定义的 `PLANNED`、`READY`、`IN_PROGRESS`、`BLOCKED`、`IN_REVIEW`、`VALIDATING`、`ACCEPTED` 或 `CANCELLED`。状态必须有时间、责任人和证据；不得为了报表把未完成 Task 标记为 `ACCEPTED`。

### 5.4 Task 完成定义

Task 只有同时满足以下条件，并由 Development Plan 指定的验收责任人确认后，才可标记为 `ACCEPTED`：

- 约定输出全部存在，并符合范围、接口、质量和证据要求；
- 每项验收标准均有明确 PASS 证据，失败项和阻断项为零；
- 计划内测试、边界测试、失败场景、必要的集成与回归验证均已执行并通过；
- `NOT_CREATED` 已被一个或多个实际、不可变的 Commit SHA 替换，每个重要 Commit 可回溯到 Task ID；
- 规定的 Review 已完成，意见已关闭，Review 结论与证据可访问；
- Requirement → Design → Task → Commit → Test 五层链完整，活动链状态为 ALIGNED，无孤儿项或失效引用；
- 相关风险、依赖和偏差已关闭或由有权限的人接受，且不掩盖失败验收；
- Development Progress、必要文档和受影响基线已同步更新，下游交接已确认。

## 6. 测试先行与 Commit/Test 追踪

### 6.1 测试先行

每项 Task 必须先定义 Test Case，再开始实现。Test Case 必须引用对应 Requirement ID、Design ID 和 Task ID，并覆盖与风险相称的正常、边界、失败、权限、安全、兼容、恢复和回归场景。

执行顺序遵循文档关联规则定义的闭环：Test Case（RED）→ Implementation（GREEN）→ Refactor → Commit → Code Review → Validation。RED 证据必须表明测试因尚未具备目标行为而按预期失败，而不是因环境损坏、数据缺失或测试本身错误而失败。若产物不适合传统自动化测试，仍必须先建立能够判定失败的契约检查、静态核验、受控演练或人工验收步骤；没有前置失败判定方式的 Task 不具备执行就绪条件。

### 6.2 Commit 与测试证据

- DESIGN 阶段的 Commit 槽必须明确记录 `NOT_CREATED`，测试结果记录 `NOT_RUN`；两者都是阶段状态，不是 N/A。
- 每个重要 Git Commit 必须引用 Task ID；一个 Commit 涉及多个 Task 时，必须逐项展开映射并证明边界没有混淆。
- Commit 形成后，在 Traceability Matrix 中记录不可变 SHA、Review 证据和相关 Test Case；重写历史产生新 SHA 时保留替代关系，不修改旧证据。
- Test Result 至少区分 `NOT_RUN`、`PASS`、`FAIL` 和 `BLOCKED`，并记录被测 Commit、环境、数据、执行人、时间和证据位置。
- Task 完成时不得残留 `NOT_CREATED`，开发级必跑测试不得残留 `NOT_RUN`、`FAIL` 或 `BLOCKED`；Phase 6 测试可以按获批 Test Plan 保持 `NOT_RUN`，但用例必须完整、可执行且指向同一实现基线。

## 7. 依赖、风险与阻断管理

每条依赖必须记录依赖类型、前置方、后继方、所需输入或状态、责任人、满足条件、目标时间、当前状态、失败影响和替代路径。硬依赖未满足时后继 Task 不得进入执行；软依赖可以在已记录风险、缓解措施和批准范围内继续。依赖图不得存在未解释的循环。

每项风险必须能回溯到受影响 Task、Requirement 或 Design，并记录触发信号、概率、影响、预防或缓解措施、应急动作、责任人、监控方式和剩余风险。安全、合规、数据完整性或其他开发阻断风险不能通过一般风险接受绕过。

Task 进入 `BLOCKED` 时必须立即记录：阻断编号、阻断类型、事实原因、受影响 Task 与里程碑、发现时间、责任人、升级路径、解除条件、下一次复核时间和证据。只暂停受影响范围；能够证明无共享依赖、无安全或一致性影响的其他 Task 可以继续。解除阻断必须提供满足解除条件的证据，不能只修改状态文本。

## 8. 拆分、合并与变更

### 8.1 拆分与合并

- 拆分 Task 时，原 Task 标记为 `CANCELLED`，对应 Traceability Chain 标记为 `RETIRED`，为每个新 Task 分配新 ID，记录替代关系和未完成范围；原 ID 不得复用。
- 合并 Task 时，为合并后的新边界分配新 ID，原 Task 保留历史状态并标记替代关系；不得把一个旧 ID 的含义静默扩大。
- 只有目标、输入输出、验证边界、依赖和责任安排一致的工作才允许合并；为减少行数或掩盖延期而合并不被接受。
- 拆分或合并后必须重新检查估算、顺序、依赖、里程碑、风险、资源、Test Case、Commit 映射和正反向追踪。

### 8.2 变更控制

任何改变 Task 目标、范围、Requirement ID、Design ID、输入输出、验收、测试、依赖、风险、顺序或完成条件的变更，都必须：

1. 登记变更原因、旧值、新值、提出人、责任人和批准人；
2. 向上检查 PRD、Architecture、专项设计和 ADR，向下检查 Commit、Test Case、里程碑、风险、回滚与交付；
3. 更新 Development Plan、Traceability Matrix 和 Development Progress，并执行正向、反向与孤儿项检查；
4. 对语义或边界实质变化分配新 Task ID；纯文字修正可以保留 ID，但必须保留版本和变更记录；
5. 若变更影响已批准基线，暂停受影响工作，重新基线化并取得对应范围的新开发授权后再继续。

已完成 Task 不得通过改写验收标准来维持 `ACCEPTED`。新要求或新设计应形成新 Task 或经批准的替代链。

## 9. 禁止事项

以下 Task 不得进入门禁或执行：

- 用开发阶段、项目名称、模块总称、团队工作包或多人月工作充当一个 Task；
- 缺少 Task ID、Requirement ID 或 Design ID，或使用 N/A、空值和自由文本列表代替核心映射；
- 输入、输出、边界、验收或测试只有“完成”“正常”“优化”“视情况”等不可判定表述；
- 把多个可独立通过或失败的结果绑定成一个总括 Task；
- 先实现再补 Test Case、验收标准、任务记录或追踪矩阵；
- 在没有当前 `APPROVED_FOR_DEVELOPMENT` 时开始实现、配置不可逆环境或创建实施 Commit；
- 让 Commit、Review 或 Test Case 脱离 Task，或让 Task 脱离 Requirement 和 Design；
- 通过删除历史、复用 ID、静默改写范围或更改通过标准掩盖偏差与失败。

## 10. Task 评审检查

Task 评审必须确认：必填字段完整；引用版本精确；原子性和边界成立；输入输出可交接；依赖图有效；风险和阻断可管理；测试在实现前定义；验收可独立判定；Commit、Review 与 Test 槽位已规划；拆分、合并和变更历史完整；Traceability Matrix 正反向检查通过。任一项失败时，Task 保持 `DRAFT` 或 `BLOCKED`，不得通过总体评分、口头解释或风险接受视为就绪。
