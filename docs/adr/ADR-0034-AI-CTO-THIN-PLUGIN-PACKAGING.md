# ADR-0034：AI CTO System 采用薄 Plugin 分发，不复制执行层

- **状态：** Accepted for Design
- **日期：** 2026-09-01
- **决策者：** AI CTO System 发起人、AI CTO

## 背景

AI CTO System 已完成 Governance Plane、Codex Execution Plane 对齐、Portable Skill Gateway 和 v2 分发准备。外部 Codex 长期助手项目证明 Plugin 可以把 Skill、安装、版本和工作流发现统一起来，但同时带有多 Skill、多 Reviewer、Hook、Runtime、事件链和模型策略。若整体迁入，会和 AI CTO 现有的 Skill、Runtime、Project Memory、Self Evolution、Permission 和 Gate 形成重复权威。

## 决策

1. AI CTO System 继续以 Git 仓库作为使命、治理、文档、证据和记忆的唯一权威源。
2. 创建薄 Plugin 作为版本化分发包装，只暴露现有 `ai-cto-system` Skill 和必要的 Plugin 元数据。
3. Plugin 第一版不声明 Hooks、Apps、MCP、外部 Provider、第二套 Runtime、第二套 Memory 或第二套 Evolution。
4. Plugin 发行制品采用白名单 staging，排除创建者 User Brain、Project Memory、真实项目反馈、Secrets、Git 元数据、工作树和缓存。
5. 外部项目中值得吸收的项目指纹、模型证据分离、Skill 路由预算和 Self Evolution 证据门槛，只能作为现有 Module 的扩展，不改变 AI CTO 的核心权威关系。
6. Plugin 安装或启用不产生模型切换、工具调用、Capability Activation、自动执行或核心治理修改授权；`Execution Authorization` 继续为 `NONE`。

## 后果

### 正面

- 新用户可以通过 Codex Plugin 发现和安装 AI CTO；
- Skill 仍可按 Intent、风险和复杂度隐式介入，减少重复唤醒；
- 治理仓库、个人记忆和项目反馈可保持独立，降低隐私泄露和项目串线风险；
- 未来可以独立升级 Plugin 包装而不复制 Runtime 或改变治理合同；
- 外部机制以字段、证据和策略形式吸收，避免引入第二套系统。

### 代价与限制

- Plugin 的实际发现和使用仍受 Codex surface、账户、Workspace、角色和安装状态影响；
- Plugin 不能自动收集全部跨聊天反馈；
- 发行包必须维护白名单构建和安装后读回；
- 当前不提供 Plugin Hook、MCP、App 或生产级自动执行能力。

## 不采用的方案

- 不整体安装外部仓库的 Skill / Reviewer / Hook / Runtime；
- 不让 Plugin 成为第二个 AI CTO 权威源；
- 不在 Plugin 中复制 Project Memory、Self Evolution 或 Permission 状态机；
- 不用固定模型天花板覆盖用户和 Codex Host 的模型选择；
- 不以 Plugin 安装完成替代 Fresh Session、权限、安全和项目 Gate 验证。

## 验证要求

- Plugin manifest 通过官方或本地 Plugin 校验；
- 发行 staging 不包含个人数据和敏感路径；
- 现有 Skill、安装器和 `212 / 212` Node 回归保持通过；
- 完成安装、重复安装、升级、冲突、回滚和 Fresh Session 验证；
- Plugin 失败时保留 `NOT_AVAILABLE` / `NOT_READY`，不冒充 Runtime 或 Capability 已执行。

## 参考

- [AI CTO Plugin 与选择性吸收设计规格](../superpowers/specs/2026-09-01-ai-cto-plugin-and-selective-absorption-design.md)
- [AI CTO–Codex Execution Plane Alignment](../architecture/CODEX_EXECUTION_PLANE_ALIGNMENT.md)
- [AI CTO–Codex Operating Model](../architecture/AI_CTO_CODEX_OPERATING_MODEL.md)
- [AI CTO Active Operating Core](../architecture/AI_CTO_ACTIVE_OPERATING_CORE.md)
- [OpenAI Plugins in ChatGPT and Codex](https://help.openai.com/en/articles/20001256-plugins-in-codex/)
