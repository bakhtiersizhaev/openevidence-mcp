# OpenEvidence MCP（非官方）

OpenEvidence MCP 是一个非官方 MCP 服务器，通过你自己的已认证浏览器会话，将 OpenEvidence 连接到 Codex、Claude Code、Claude Desktop、Cursor、Cline、Continue 和其他 MCP 客户端。

> [!IMPORTANT]
> 本项目不隶属于 OpenEvidence，不提供医疗建议，不绕过访问控制，并且只应与你自己的 OpenEvidence 账号一起使用。

Canonical README: [English](README.md)

## 功能

- 检查已保存的 OpenEvidence 会话是否仍然已认证；
- 列出问题/文章历史；
- 通过 ID 获取文章 payload；
- 向 OpenEvidence 提交研究问题，并可选择等待完成。

不需要官方 OpenEvidence API token。

## 不做什么

- 不是 OpenEvidence 官方产品；
- 不替代临床判断或医疗建议；
- 不收集 credentials；
- 不绕过 authentication、paywalls 或 access controls；
- 不应在没有人工审核的情况下用于 patient-specific diagnosis。

## MCP 客户端

| Client | Status | Notes |
| --- | --- | --- |
| OpenAI Codex / Codex CLI / Codex app | Target | 推荐的本地 MCP workflow。 |
| Claude Code | Target | 推荐的 agent workflow。 |
| Claude Desktop / Claude app with MCP support | Target | 本地 MCP server configuration。 |
| Cursor | Compatible | MCP-compatible IDE workflow。 |
| Cline | Compatible | VS Code agent workflow。 |
| Continue | Compatible | Open-source IDE assistant workflow。 |
| VS Code / GitHub Copilot environments with MCP support | Experimental | 取决于本地 MCP support 和 client configuration。 |
| Windsurf / Zed / Replit / Sourcegraph-style MCP hosts | Experimental | 未测试则不保证。 |
| Gemini CLI / Google Antigravity-style agent environments | Experimental | Ecosystem/watchlist，不是 maintained example。 |

## OpenEvidence 可用性

OpenEvidence 可用性可能取决于地区、账号资格和 OpenEvidence 政策。2026 年 5 月的公开材料显示访问以 verified U.S. HCP/NPI 为中心，并且 EU/U.K. 不可用；本项目不会绕过这些限制。

## 快速开始

```bash
git clone https://github.com/bakhtiersizhaev/openevidence-mcp.git
cd openevidence-mcp
npm ci
npx playwright install chromium
npm run build
npm run login:session
npm run smoke
```

本地浏览器配置文件保存在你的机器上。不要公开 browser profile files、`storage-state.json`、cookies、包含私人账号数据的截图或可识别患者信息。

## Codex 配置

```toml
[mcp_servers.openevidence]
command = "node"
args = ["/ABSOLUTE/PATH/openevidence-mcp/dist/server.js"]
startup_timeout_sec = 60
```

## 验证

如果存在有效 OpenEvidence session，`npm run smoke` 应返回 `ok: true` 和 `authenticated: true`。

License: Apache-2.0 + NOTICE.
