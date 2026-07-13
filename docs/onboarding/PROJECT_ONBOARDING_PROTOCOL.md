# 已有项目接管协议

## 1. 目的与适用范围

当用户提供已有代码库、已上线系统、历史项目目录或需要交接的软件资产时，AI CTO 必须进入 `PROJECT_ONBOARDING_MODE`，并将生命周期 Current Stage 设为 `EXISTING_PROJECT_ONBOARDING`。

本模式用于建立可信的项目基线，而不是直接开始维护、重构或开发。它适用于完整仓库、部分源码、无 Git 目录的代码快照、多仓库系统和文档严重缺失的遗留项目。

新想法仍从 IDEA 开始。已有项目接管不需要伪装成新 Idea，但接管也不能绕过后续的 Evaluation、Design、Development、Testing 或 Release 门禁。

## 2. 接管原则

1. **先只读、后变更**：扫描、理解、恢复和评估阶段默认只读；未经用户授权不得修改源代码、配置、数据库、Git 历史或生产环境。
2. **冻结证据基线**：所有结论绑定项目路径、仓库、Branch、Commit、工作区状态、版本、环境和扫描时间。
3. **事实与推断分离**：观察到的事实、AI 推断、维护者确认、冲突和未知项分别记录。
4. **不清理用户现场**：未提交修改、未跟踪文件、异常分支和历史缺口必须保留并记录，不得自动 reset、checkout、commit、stash、rebase 或删除。
5. **不伪造历史**：无法从证据确认的原始需求、创建时间、决策原因、责任人和历史状态统一记录为 `UNKNOWN`。
6. **评分不替代门禁**：健康分、Confidence、风险红线和迁移检查分别判断，不能互相抵消。

## 3. 接管输入与授权

开始前至少记录：

- 项目名称、Original Source、用户授权的扫描范围和排除范围；
- 本地路径或仓库地址、访问方式、凭据边界和数据敏感级别；
- 是否生产运行、已知版本、部署环境、维护责任人与业务影响；
- 允许执行的只读命令、构建或测试，以及禁止操作；
- 当前已知故障、交接原因、截止时间和用户期望的接管结果。

缺少读取授权、项目来源不可识别、证据可能破坏生产或存在无法控制的敏感数据暴露风险时，记录 `ONBOARDING_BLOCKED`，不得自行扩大权限。

## 4. Step 1：项目扫描

### 4.1 扫描对象

| 扫描对象 | 最低检查内容 | 必须保存的证据 |
|---|---|---|
| 目录结构 | 根目录、主要子目录、生成物、Vendor、脚本、文档和大型文件 | 结构快照、扫描时间、排除规则 |
| 代码文件 | 语言、入口、模块、公共接口、测试、生成代码和废弃区域 | 文件清单、语言统计、入口引用 |
| 依赖文件 | Manifest、Lockfile、Runtime、包源、版本约束和供应链来源 | 文件版本、依赖快照、缺失项 |
| 配置文件 | 环境配置、Feature Flag、构建、部署、权限和秘密引用 | 配置键与版本；不得复制秘密值 |
| 数据库文件 | Schema、Migration、Seed、ORM、备份和数据访问层 | Schema / Migration 清单、漂移与缺口 |
| Git 历史 | Repository、Branch、HEAD、Tags、Remotes、状态、提交和主要演变 | 不可变 SHA、工作区状态、历史范围 |

### 4.2 Git 与现场保护

扫描必须记录当前 Branch / detached 状态、HEAD、已暂存修改、未暂存修改、未跟踪文件、冲突、进行中的 Git 操作、远程和最近 Tags。Git 不要求在接管前天然干净，但每项差异必须有来源、所有者和处置状态；来源不明且会改变基线的差异会阻断迁移门禁。

### 4.3 扫描输出

输出扫描清单、Evidence Register、无法读取项、敏感边界、项目基线 Manifest 和下一步理解问题。不得把文件存在等同于功能有效，也不得把依赖声明等同于实际部署版本。

## 5. Step 2：项目理解

使用 [项目逆向分析模板](../../templates/PROJECT_REVERSE_ANALYSIS_TEMPLATE.md) 分析：

- 项目目标、用户对象、现有价值和实际运行边界；
- Frontend、Backend、Database、Infrastructure 和 AI 组件技术栈；
- 功能模块、核心流程、外部依赖和失败路径；
- 系统边界、模块关系、服务关系、数据流和部署拓扑；
- 代码结构、复杂模块、重复、技术债和已知风险。

每项关键结论必须引用 Evidence ID，标记事实 / 推断 / 用户确认 / 未知，并按 [Confidence 模型](../evaluation/CONFIDENCE_MODEL.md)给出 L1–L4。不能仅凭目录名推断业务目标，也不能仅凭代码存在证明线上正在使用。

## 6. Step 3：文档恢复

按 [项目文档恢复规范](./PROJECT_DOCUMENT_RECOVERY.md)恢复或校正：

- PRD；
- Architecture；
- Database Design；
- ADR；
- PROJECT_MEMORY。

恢复文档必须使用 `RECOVERED_DRAFT` 状态，保留原文档，不静默覆盖。每项恢复结论记录证据、Confidence、适用边界、冲突和待确认事项。无法证明的历史保持 `UNKNOWN`。

## 7. Step 4：健康评估

按 [项目健康检查标准](./PROJECT_HEALTH_CHECK_STANDARD.md)生成项目健康报告，至少包含：

- 八维 100 分制健康评分和等级；
- 各维分数、证据、Confidence 与未评估项；
- 安全、数据、测试、维护和扩展风险；
- 继续维护、优化、重构、迁移或停止的建议；
- 风险 Owner、处置顺序、停止条件和复核触发器。

证据不足时只能形成 Provisional Score，不得包装为最终健康结论。

## 8. Step 5：纳入 AI CTO 管理

执行 [项目迁移检查清单](./PROJECT_MIGRATION_CHECKLIST.md)，并创建或更新：

- `PROJECT_STATE.md`，基于 [接管状态模板](../../templates/PROJECT_ONBOARDING_STATE_TEMPLATE.md)与通用状态模板；
- `PROJECT_MEMORY.md`，记录来源、已确认事实、关键决策、风险、历史缺口和当前状态；
- 必要 ADR，记录当前接管和未来治理决策，不回填虚构历史；
- 健康报告、逆向分析、恢复文档、风险登记和 Evidence Register。

接管完成后按 [历史项目经验沉淀规则](./EXPERIENCE_EXTRACTION_STANDARD.md)提取可复用知识。

## 9. 接管结果与生命周期转换

接管最终结果只允许：

| 结果 | 含义 | Current Stage 与后续动作 |
|---|---|---|
| `ONBOARDING_COMPLETED` | 扫描、理解、恢复、健康评估、状态、风险、Git 与测试确认全部达到迁移检查要求 | 已上线且仍在运营的项目可在用户确认后转为 `MAINTENANCE`；其他项目必须满足目标阶段原有进入条件 |
| `ONBOARDING_BLOCKED` | 授权、来源、关键证据、状态、风险或基线存在无法安全关闭的阻断 | 保持 `EXISTING_PROJECT_ONBOARDING`，记录 Blocker、Owner、解除条件和 Next Action |

`ONBOARDING_COMPLETED` 只表示项目已建立可信管理基线，不是 `APPROVED_FOR_DEVELOPMENT`、`APPROVED_FOR_TESTING` 或 `READY_FOR_RELEASE`。任何新功能、重构、迁移或生产变更仍须按影响进入 Evaluation / Design，并通过现有门禁。

## 10. 强制输出契约

每次接管决策必须输出：

1. Mode：`PROJECT_ONBOARDING_MODE`；
2. Current Stage：`EXISTING_PROJECT_ONBOARDING` 或获准转换后的阶段；
3. 冻结基线：Source、Version / Commit、Git 状态、环境与扫描时间；
4. Evidence：已确认事实、推断、冲突、未知和 Missing Documents；
5. Health：Score / 100、等级、Confidence 和 Evidence Coverage；
6. Gate Result：`ONBOARDING_COMPLETED` 或 `ONBOARDING_BLOCKED`；
7. Next Action：动作、Owner 与 Completion Condition；
8. Code Change Authorization：接管阶段固定为 `NO`。

截止时间、负责人指令、历史投入、项目已上线或“先改代码再补文档”均不能改变上述输出结构或绕过接管门禁。
