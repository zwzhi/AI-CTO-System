# AI CTO Capabilities

本目录用于保存 AI CTO 可评估、启用、弃用或移除的 Capability Registry Record。Capability 是 AI CTO 可以调用的内部或外部能力，不是 AI CTO System 的功能 Module。

## 目录结构

| Directory | Capability Type |
|---|---|
| `engineering/` | Engineering Capability |
| `testing/` | Testing Capability |
| `security/` | Security Capability |
| `deployment/` | Deployment Capability |
| `research/` | Research Capability |
| `documentation/` | Documentation Capability |
| `data/` | Data Capability |
| `ai_model/` | AI Model Capability |

## 管理规则

1. 每项正式记录必须遵守 [Capability Governance](../docs/capability/CAPABILITY_GOVERNANCE_STANDARD.md) 和 [Registry Standard](../docs/capability/CAPABILITY_REGISTRY_STANDARD.md)。
2. 文件名建议使用 `{Capability-ID}-{slug}.md`；ID 一经分配永久保留。
3. Registry 不保存密钥、Token 或敏感凭据，只保存受控引用和权限范围。
4. 只有 `ACTIVE` 且当前授权有效的 Capability 可以进入选择；登记、评分或示例都不构成调用授权。
5. 外部能力必须经过来源、License、安全、功能和兼容验证，并保持可替换。
6. `REMOVED` 记录保留 Tombstone 和历史链接，不物理删除审计事实。

## 当前状态

当前已有一个正式 Documentation Capability Record：`CAP-DOC-0001`，状态为 `EVALUATING`，只获准在隔离范围内完成受控执行桥评估；`Selection: PROHIBITED`，`Activation Scope: NONE`。当前仍没有安装、激活或接入任何外部 Skill、MCP、Agent、Provider 或工具。
