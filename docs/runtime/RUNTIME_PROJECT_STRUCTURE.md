# Runtime 项目结构设计

## 未来目录建议

```text
runtime/
├── workflow/
├── task/
├── capability/
├── audit/
├── permission/
├── models/
├── services/
└── tests/
```

该结构仅定义未来代码边界，不创建目录、不绑定语言、框架、数据库或部署方式。

| 模块 | 责任 | 禁止职责 |
|---|---|---|
| `workflow/` | Workflow State、生命周期、转换校验与编排入口。 | 调用能力、写业务决策、绕过 Gate。 |
| `task/` | Task Entity、输入输出、单 Task 约束与 Task 状态。 | 多 Agent 调度或 Agent 协作。 |
| `capability/` | Capability Adapter Contract、Mock Capability、Invocation Result。 | 对具体工具、Codex 或 MCP 的直接依赖。 |
| `audit/` | Execution Record、Audit Event、Evidence 的追加与查询合同。 | 改写历史、批准业务或授权 Gate。 |
| `permission/` | Permission / Budget Guard 与控制结论。 | 替代项目审批、ADR 或人类最终决策。 |
| `models/` | 技术栈中立 Entity、Pseudo Type、枚举与引用类型。 | 持久化 Schema、ORM 映射。 |
| `services/` | Workflow、Task、Guard、Adapter、Audit 的协调接口。 | 直接执行外部副作用。 |
| `tests/` | 单元、集成、失败和审计验证。 | 调用真实工具、生产环境或真实 Agent。 |

## 依赖方向

`services/` 可依赖 `models/` 与各端口合同；`workflow/` 和 `task/` 不依赖 `capability/` 的具体实现；`capability/` 只通过 Result / Evidence 回传；`audit/` 不能反向授权或改变 Workflow。未来所有 Agent 流转仍必须经过 Workflow Engine，而非目录之间的直接调用。
