# Configuration Management Standard

管理 Environment Variables、API Keys、Secrets、Database Config、External Service Config。敏感信息禁止进入代码、提交记录、公开日志和交付包；使用配置模板、`.example` 文件、最小权限、环境隔离、轮换和访问控制。配置模板只含键名、说明、格式、必填性与安全来源，不含真实值。配置变更必须记录版本、影响、验证与回滚方式。
