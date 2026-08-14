# AI CTO Review Profile & Packet Standard

## 1. 定位与所有权

Review Profile、Review Packet 和 Review Result 是既有 Layer 3 `Code Review` 与 Layer 5 Runtime 之间的受控数据合同。它们用于根据风险和变更范围选择最小必要评审职责、冻结评审输入并记录结构化发现；不创建新的 Reviewer Agent、Capability、Gate 或批准层。

权威评审要求仍是 [代码评审标准](./CODE_REVIEW_STANDARD.md)。该标准的六项强制评审和唯一结果 `APPROVED` / `CHANGES_REQUIRED` / `REJECTED` 不被本合同替换、降级或自动化。

## 2. 七个候选 Review Profile

| Profile | 关注边界 | 典型触发范围 |
|---|---|---|
| `FUNCTIONAL_BUSINESS` | 需求、业务规则、用户可见行为 | product、business、domain、requirement |
| `COMPATIBILITY_REGRESSION` | API、依赖、版本、发布和回归影响 | api、compatibility、dependency、production、release |
| `SECURITY_ACCESS` | 身份、权限、秘密、隐私和越权 | security、permission、auth、access、privacy |
| `PERFORMANCE_RESOURCES` | 延迟、容量、资源、缓存和退化 | performance、resource、latency、capacity、cache |
| `DATA_CONTRACT` | 数据结构、Schema、迁移和持久化合同 | database、data、schema、migration、storage |
| `STATE_CONCURRENCY` | 状态机、异步、队列、事务和并发 | async、concurrency、state、queue、transaction |
| `TEST_DELIVERY` | 测试证据、交付完整性、文档和回归 | test、testing、documentation、local |

Profile 是职责标签，不是必须启动的 Agent 数量。相同 Profile 可以由主评审人、专项评审人或一个确定性检查步骤承担；是否实际执行由当前任务授权、证据和预算决定。

## 3. 风险与预算选择

`ReviewProfilePolicy` 使用现有 `TaskComplexity`、`RiskLevel`、`ExecutionProfile`、变更领域和证据当前性，输出冻结的 `ReviewPlan`：

- `L0` / `L1`、低风险、可逆变更优先选择 `ECONOMY`，通常只保留一个最小职责和 `TEST_DELIVERY`。
- `L2` / `L3` 或中风险变更使用 `BALANCED`，按数据、状态、兼容、性能等受影响边界增加必要 Profile。
- `L4`、`HIGH` 或 `CRITICAL` 使用 `DEEP`，通常需要 `SECURITY_ACCESS`、`COMPATIBILITY_REGRESSION` 和受影响专项，但仍受 `maxProfiles`、`maxRounds`、`maxTotalReviewers` 限制。
- 实际 Profile 上限为 `min(maxProfiles, maxTotalReviewers)`；实际轮次上限还会按 `floor(maxTotalReviewers / selectedProfiles)` 收窄，避免计划声明的 Reviewer 总量超过预算。`STRICT` Execution Profile 强制使用 `DEEP`，并产生显式升级条件。
- 证据不是当前或未捕获时，计划设置 `evidenceRequired: true` 和可解释的 `escalationConditions`；不会静默增加 Reviewer 数量。
- `isolationLevel` 默认是 `UNKNOWN`。Review effort、Profile 数量或独立上下文不能推导 `SYSTEM_READONLY`。

## 4. Review Packet

`ReviewPacketService` 只处理调用方提供的快照，不读取仓库、Git、网络或文件系统。Packet 至少绑定：

- 评审边界、阶段和 Profile 列表；
- 精确 `baselineCommit`、`headCommit` 和 `diffSha256`；
- 排序去重后的 changed files、related files、untracked files；
- 验证记录与约束；
- `packetSha256`：由以上规范化字段的确定性 JSON 计算。

敏感的未跟踪路径（例如 `.env`、Secret/Credential、私钥文件）不进入 Packet 内容，只记录排除原因。Packet 不携带源代码正文，不代表文件读取或写入授权。

`isCurrent(packet, observation)` 只在完整基线和 Diff 指纹一致时返回 `CURRENT`；发现任一已捕获指纹变化返回 `STALE`；没有完整观测返回 `NOT_CAPTURED`。`STALE` 或 `NOT_CAPTURED` 不得作为当前评审的批准依据。

当 Review Packet 进入受控 Handoff 时，L2–L4 Envelope 可绑定 `review.requiredProfiles` 与 `review.packetSha256`；Packet SHA 必须出现在 Envelope 的 `evidence.reviews` 中。路由结果为 `ESCALATE_FOR_REVIEW` 而缺少该绑定时，Handoff 在创建 Workflow / Task 前阻断。这个绑定只校验证据关联，不等于已执行评审或已获得批准。

## 5. Review Result 与隔离等级

Reviewer 只能返回结构化发现。每个 Finding 必须包含：严重级别、Evidence 引用、位置、描述、影响、是否由当前变更引入、建议边界和验证方法。Result 还绑定 Review ID、Profile、阶段、轮次、基线 Commit、Packet SHA、Reviewer 身份、未验证项目和结构化状态。

隔离等级是独立事实字段：

- `SYSTEM_READONLY`：由宿主或权限系统实际证明的系统级只读隔离；不能由 Reviewer 自行声明。
- `LOGICAL_READONLY`：仅表示合同/上下文层面限制为只读，不等于操作系统权限隔离。
- `SELF_REVIEW`：作者或同一执行主体的自检，不能冒充独立评审。
- `UNKNOWN`：证据不足，不能推断更强隔离。

Result 禁止携带 `approval`、`executionAuthorization`、写入/提交/部署/重启授权或 Execution Record。Reviewer 不得修改文件、创建 Commit、部署、调用外部工具或派生新的 Reviewer。

Result 的 `PASS`、`NON_BLOCKING_FINDINGS`、`BLOCKING_FINDINGS`、`INCOMPLETE` 只是结构化评审状态，不能替代 Code Review 的三种最终结果。主评审人仍须按六项强制评审输出 `APPROVED`、`CHANGES_REQUIRED` 或 `REJECTED`。

## 6. 停止与复审

出现以下任一情况，评审数据必须停止或标记不完整：Packet 过期、基线或 Diff 不一致、强制 Evidence 缺失、预算达到上限、范围超出批准 Task、发现权限/安全红线，或 Reviewer 试图执行副作用。

任何会改变 Commit、Requirement、Architecture、ADR、Task、Test、依赖、配置、环境或风险基线的变化都要求按代码评审标准重新生成 Packet 并复审；旧 Result 不自动延伸到新基线。

## 7. 采用边界

本合同吸收 ZIP 中有价值的职责分工、冻结 Packet、预算上限、独立上下文记录和集中 Evidence 归并思想；没有复制 ZIP 的固定七 Reviewer 启动规则、通用长记忆包、权限隔离声明或自动修复链路。只有当真实评审数据证明某 Profile 带来稳定收益且成本可接受时，才可通过新的设计、Evidence 和 Gate 调整策略。
