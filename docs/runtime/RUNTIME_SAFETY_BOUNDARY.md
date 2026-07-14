# Runtime Safety Boundary

禁止无授权执行、绕过 Gate / Approval、越权修改、Agent 直接调用、无限循环调用、敏感信息泄露、无限资源消耗。Kill Switch 支持用户和授权控制者人工停止：阻断新调用、保留 Audit、按可逆性安全停止或回滚；不删除 Evidence 或绕过 Gate。
