# Human Control Model

按风险、可逆性、数据影响、权限范围选择：`AUTO_EXECUTE`（低风险可逆）、`NOTIFY_AFTER`（低风险需留痕）、`CONFIRM_BEFORE`（中风险或影响用户）、`MANDATORY_APPROVAL`（新项目、重大架构、生产发布、权限提升、知识 ACTIVE）。不设计每一步审批；高风险不可由自动分类降级。
