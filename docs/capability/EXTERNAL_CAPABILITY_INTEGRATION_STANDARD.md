# 外部 Capability 接入标准

## 1. 适用范围

本标准适用于未来接入的 Superpowers、Codex Skill、MCP 工具、第三方 Agent，以及其他外部代码、模型、服务或自动化能力。本文件只定义治理，不授权安装、连接、调用或授予凭据。

所有外部能力必须先执行 [Capability Admission](./CAPABILITY_ADMISSION_PROCESS.md)，取得 Registry ID，并遵守生命周期和质量评估规则。

## 2. 五项强制检查

### 来源确认

记录官方来源、Publisher、Repository / Distribution Channel、不可变版本、Artifact Hash、签名或等价完整性证据、维护者身份和供应链。Fork、镜像、压缩包与原项目必须分别识别。

### License 检查

确认主 License、版本、依赖 License、允许用途、修改 / 分发 / 署名 / 源码公开义务、商业限制、模型或数据条款。License 不明、冲突或超出批准用途时不得激活。

### 安全检查

枚举文件、网络、进程、Shell、代码执行、密钥、用户数据、模型、数据库、云资源和生产环境权限；执行最小权限、隔离、密钥引用、日志脱敏、供应链扫描、撤销和 Incident 方案。

### 功能验证

冻结输入输出、目标任务、测试集、成功阈值、失败行为、副作用、成本和 Evidence。营销说明、README 示例或单次成功不能替代独立验证。

### 兼容性验证

验证操作系统、Runtime、API、Schema、依赖、版本、并发、限流、项目架构、数据格式、升级和回滚。兼容性结论必须绑定当前版本和环境。

## 3. 不同外部形式的额外检查

| 形式 | 额外检查 |
|---|---|
| Superpowers / Codex Skill | Instruction 注入、触发范围、引用资源、脚本权限、Skill 冲突和输出约束 |
| MCP 工具 | Tool Schema、传输、认证、Server 权限、网络边界、副作用、超时、重试和撤销 |
| 第三方 Agent | 自主边界、子任务、Memory、工具链、模型、人工接管、终止和审计轨迹 |
| 外部模型 / API | 数据保留、训练使用、地域、配额、价格、可用性、模型漂移和供应商退出 |

## 4. 可替换性要求

外部 Capability 必须通过稳定 Capability Contract 或 Adapter 接入。AI CTO Core 只依赖抽象的输入、输出、错误、权限和 Evidence 合同，不直接依赖供应商专有调用方式。

每项外部能力必须定义：

- Fallback Capability 或人工流程；
- 替换判定和兼容测试；
- 数据导出、配置迁移和凭据撤销；
- Vendor / Project 停止维护时的退出方案；
- 失败时阻止级联影响的隔离边界。

“插件化”不等于自由安装。未经 Registry、Evaluation 和 Activation Approval 的实现不能接入 Core、项目或生产环境。

## 5. 权限与副作用

权限按 Capability 和场景分别授予，默认拒绝。只读、写入、执行、管理权限不得打包为单一“完全访问”。生产凭据、云资源变更、外部消息、交易、数据删除或其他高影响副作用必须有明确人类批准、预演、幂等 / 去重、停止条件和回滚证据。

## 6. 版本升级

外部版本、依赖、License、权限、Tool Schema、模型或行为变化时，旧 Evaluation 和 Activation Approval 默认失效。先完成 Change Impact、受影响测试、风险复核和 Registry 更新，再决定是否重新 `ACTIVATE_CAPABILITY`。禁止自动漂移到未评估的 `latest`。

## 7. Core 独立性检查

评审必须证明：禁用或替换该外部能力时，AI CTO Core 的身份、记忆、决策、工程规则和生命周期门禁仍可运行；功能降级、人工替代和数据恢复路径明确。无法证明时不得作为 Core 强依赖。

## 8. Phase 8.2 限制

本阶段不安装 Superpowers，不读取或执行外部 Skill，不连接 MCP，不调用第三方 Agent，不创建凭据，也不进行真实兼容或功能测试。所有外部名称仅用于未来架构说明。
