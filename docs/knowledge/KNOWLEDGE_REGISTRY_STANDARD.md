# Knowledge Registry 标准

## 1. 目的

Knowledge Registry 为重要知识资产提供唯一标识、分类、证据、状态、质量、范围和关系记录。未经登记的重要 Knowledge 不得成为 `ACTIVE` 或默认复用候选。

正式 Knowledge Record 存放在根 `knowledge_base/{type}/`。目录和记录构成权威 Registry；未来可以生成索引或搜索投影，但投影不能改写权威记录。

## 2. 哪些 Knowledge 必须登记

- 被两个或以上项目复用或计划复用；
- 影响 Architecture、Security、Data、Agent、Prompt、成本或 Release；
- 作为组织标准、默认模式、禁止规则或投资依据；
- 来自重大 Bug、Incident、Postmortem、Evolution 或项目失败；
- 与其他 Knowledge 冲突、替代或存在迁移关系；
- 需要长期 Owner、复核、License、隐私或审计。

低价值一次性事实可以留在 Project Memory，不强制提升为 Knowledge Asset。

## 3. 必填字段

| Field | 要求 |
|---|---|
| Knowledge ID | 稳定唯一标识 |
| Title | 描述问题和结论，不使用空泛“最佳实践” |
| Type | 九种规范 Type 之一 |
| Source Project | Project ID / Version；外部来源写 `EXTERNAL` 并列证据 |
| Evidence Level | L1–L4 及 Evidence 链接 |
| Confidence | L1–L4、理由、冲突和限制 |
| Quality Score | 0–100、评分版本、日期和评审人 |
| Applicable Scenario | 用户、问题、规模、技术、环境、版本和约束 |
| Status | 六种 Knowledge Lifecycle Status 之一 |
| Created Time | ISO 8601 时间和时区 |

## 4. 扩展字段

同时记录 Summary、Background、Problem、Cause、Solution / Pattern、Applicability、Limitations、Counterexamples、Owner、Source Links、Evidence Package、Version、Last Validated、Next Review、Related Knowledge、Conflict Records、Security / Privacy / License、Reuse Count、Reuse Records、Change History 和 Deprecation / Archive Plan。

未知项写 `UNKNOWN`，不得留空、推测或用高 Quality Score 掩盖。

## 5. Knowledge ID

建议前缀：

| Type | Prefix |
|---|---|
| Project Experience | `KN-PRJ-XXXX` |
| Architecture Pattern | `KN-ARC-XXXX` |
| Engineering Pattern | `KN-ENG-XXXX` |
| Agent Pattern | `KN-AGT-XXXX` |
| Prompt Pattern | `KN-PRM-XXXX` |
| Bug Solution | `KN-BUG-XXXX` |
| Decision Record | `KN-DEC-XXXX` |
| Failure Experience | `KN-FAIL-XXXX` |
| Business Insight | `KN-BIZ-XXXX` |

ID 永久唯一。Knowledge 进入 `ARCHIVED` 后仍保留 ID、Tombstone、关系和引用，禁止重用。

## 6. 注册与激活

1. 提取时创建 `CAPTURED` Record 和 ID。
2. 分类、去重、冲突、隐私和 License 检查后进入 `VALIDATING`。
3. Evidence、Confidence、Quality 和适用范围通过后进入 `VALIDATED`。
4. Owner、复核日期、复用边界和无高影响冲突得到批准后进入 `ACTIVE`。

登记不等于验证，`VALIDATED` 不等于默认复用，`ACTIVE` 不等于当前项目适用。

## 7. Registry 审计

定期检查重复 ID、孤儿关系、无 Owner、Evidence 失效、过期 Review、Quality 漂移、未解决 Conflict、错误状态、无适用范围、敏感信息和 Legacy 双重权威。发现问题时转 `VALIDATING`、`DEPRECATED` 或 `ARCHIVED`，并通知受影响项目。
