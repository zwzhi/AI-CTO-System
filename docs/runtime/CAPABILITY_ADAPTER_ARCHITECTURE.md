# Capability Adapter Architecture

Codex、GitHub、MCP、文件系统、浏览器、数据库、部署工具均只能经 Capability Adapter 接入。Core 只依赖版本化 Invocation Contract（输入、输出、权限、副作用、预算、审计、失败 / 回滚），不直接依赖具体工具。当前无真实 Adapter、接入或调用。
