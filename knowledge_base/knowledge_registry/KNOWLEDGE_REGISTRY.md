# AI CTO System Knowledge Registry

- Registry Version：`1.0.0`
- Updated Time：`2026-07-13T19:35:00+08:00`
- Registry Owner：AI CTO System Maintainer
- Source Project：`AI-CTO-System`

| Knowledge ID | Type | Source | Evidence | Confidence | Quality Score | Status | Record | Next Review |
|---|---|---|---|---|---:|---|---|---|
| `KN-ARC-0001` | Architecture Pattern | AI-CTO-System / `8666495`、`201b446`、`2ea04e2` | L3：ADR-0009、Architecture、Module Registry、后续 Module 归类 | L3 | 86 | `VALIDATED` | [Record](../architecture_patterns/KN-ARC-0001-layer-module-governance.md) | 2026-10-13 |
| `KN-ENG-0001` | Engineering Pattern | AI-CTO-System / `201b446`、`2ea04e2` | L3：Capability / Knowledge 压力测试、SKILL 契约和生命周期规则 | L3 | 84 | `VALIDATED` | [Record](../engineering_patterns/KN-ENG-0001-closed-status-output-contract.md) | 2026-10-13 |
| `KN-FAIL-0001` | Failure Experience | AI-CTO-System / `201b446`、`2ea04e2` | L3：两个内部失败场景与修正记录；跨项目因果未验证 | L2 | 73 | `VALIDATING` | [Record](../failures/KN-FAIL-0001-status-scope-premature-decision.md) | 2026-08-13 |

## Registry Review

- 三个 ID 唯一，Type 与目录一致。
- Evidence Level 与整体 Confidence 分开记录；`KN-FAIL-0001` 的 Confidence 低于 Evidence Level。
- 当前 `ACTIVE` 数量：0。
- 当前 `VALIDATED` 数量：2。
- 当前 `VALIDATING` 数量：1。
- 本 Registry 不授权任何项目 Architecture、Development、Testing 或 Release 行为。
