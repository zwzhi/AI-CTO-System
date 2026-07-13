# Knowledge 冲突处理规则

## 1. 冲突定义

当两项 Knowledge 对相同或相近问题给出不同结论、条件、因果、风险或建议时，创建 Conflict Record。差异可能来自范围、时间、版本、数据、规模或目标不同，不应立即判断其中一项错误。

禁止简单覆盖旧 Knowledge。旧内容、Evidence、状态和使用历史必须保留。

## 2. 比较依据

按以下四项核心依据比较，并记录其他风险：

1. **Evidence 等级：** L1–L4、来源独立性、验证方法和反例。
2. **时间：** Evidence 日期、技术 / 业务变化速度和是否仍在有效期。
3. **适用范围：** 用户、规模、负载、数据、环境、版本、团队和目标是否相同。
4. **实际效果：** 真实项目结果、失败、成本、稳定性、维护和长期影响。

“更新”不自动优于“更旧”，“L4”也不自动适用于不同范围。架构草稿、职位意见、截止时间和沉没投入不属于 Knowledge Evidence。

## 3. 处理流程

1. 冻结两项 Knowledge 的 ID、版本、状态和 Evidence。
2. 确认是否真冲突，或只是适用范围不同。
3. 比较 Evidence Level、Confidence、Quality、时间、范围和实际效果。
4. 列出共同点、差异、未知项、潜在风险和需要验证的问题。
5. 选择处理结果并由适当责任人批准。
6. 更新关系、状态、适用范围和受影响消费者；保留旧版本。

## 4. Conflict Result

- `COEXIST_BY_SCOPE`：结论在不同范围内都成立，分别收窄适用条件。
- `SUPERSEDE_WITH_EVIDENCE`：新知识在相同范围内有更强证据，旧项转 `DEPRECATED`，不删除。
- `MERGE_AS_PATTERN`：两项可抽象为包含条件分支的更高层 Pattern，原项保留来源关系。
- `REVALIDATE`：证据不足或冲突未决，相关项转 `VALIDATING` 并补证。
- `REJECT_NEW_CLAIM`：新结论无法达到证据要求，保留为 `CAPTURED` 或 `ARCHIVED`。

Conflict Result 不是 Knowledge Lifecycle Status。

## 5. SQLite 与 PostgreSQL 示例

旧 Knowledge：SQLite 在三个小型、离线优先项目中取得 L4 重复验证。新资料：公开 L2 Evidence 支持 PostgreSQL 用于高并发 SaaS。新项目是中等并发 SaaS，离线需求未知。

正确处理不是覆盖 SQLite 或直接把 PostgreSQL 设为统一标准：

- SQLite Knowledge 保持原状态和 L4 历史，但适用范围明确为小型、离线优先；
- PostgreSQL 资料以 `CAPTURED` 或 `VALIDATING` 保存，Evidence Level 最高 L2；
- 当前项目创建范围验证，确认并发、离线、同步、一致性、运维和成本要求；
- 在项目 Architecture / ADR 中形成当前选择，不用 Knowledge Status 代替项目决策；
- 若两者服务不同层次，可形成 PostgreSQL System of Record + SQLite Local Store 的候选组合，但必须验证同步和冲突风险；
- 初始 Conflict Result 通常为 `COEXIST_BY_SCOPE` 或 `REVALIDATE`，取决于需求证据。

## 6. Conflict Record

至少记录 Conflict ID、Knowledge IDs / Versions、Question、Evidence / Confidence / Quality、Time、Scope、Observed Outcomes、Common Ground、Differences、Unknowns、Risk、Result、Status Changes、Affected Consumers、Validation Plan、Approver、Date 和 Next Review。
