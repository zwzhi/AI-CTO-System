# Environment Compatibility Standard

记录 Development、Testing、Production、User Environment 的差异和兼容矩阵；每项标记 `Supported`、`Unsupported` 或 `Conditional`，并列出版本、限制、验证 Evidence 与替代方案。

| OS | Runtime | 状态 | 说明 |
|---|---|---|---|
| Windows 11 | Python 3.11 | Supported | 已按项目验证。 |
| Windows 10 | Python 3.9 | Unsupported | 不满足项目最低规格。 |

开发环境成功不证明用户环境兼容；缺失 Evidence 时使用 `UNVERIFIED`，不得推断支持。
