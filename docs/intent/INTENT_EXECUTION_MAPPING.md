# Intent Execution Mapping

| Intent | Complexity 候选 | Suggested Workflow | Required Capability 候选 |
|---|---|---|---|
| `NEW_PROJECT` | L4 | CTO Workflow | Research + Product + Architecture Capability |
| `FEATURE_REQUEST` | L2–L3 | Engineering 或设计 + Engineering | Product + Engineering + Testing Capability |
| `BUG_FIX` | L1/L2 | Instant / Engineering Workflow | Engineering + Testing Capability |
| `INCIDENT` | L3–L4 | Incident + CTO / Engineering | Security + Engineering + Deployment Capability |
| `REFACTOR` | L2–L3 | Engineering 或设计 + Engineering | Engineering + Testing Capability |
| `ARCHITECTURE_CHANGE` | L3–L4 | CTO Workflow | Architecture + Security + Deployment Capability |
| `RESEARCH_REQUEST` | L1–L3 | Instant / CTO Workflow | Research Capability |
| `KNOWLEDGE_UPDATE` | L1–L2 | Instant / Engineering Workflow | Documentation + Knowledge Governance |
| `PROJECT_STATUS_QUERY` | L1 | Instant Workflow | Documentation / Portfolio Context |
| `GENERAL_CONVERSATION` | L0 | 不进入 AI CTO | 无 |

Intent Gateway 仅提供候选；Execution Routing 根据风险、Evidence、Gate 和上下文确认路径。Confidence 不足时不得把映射作为执行事实。
