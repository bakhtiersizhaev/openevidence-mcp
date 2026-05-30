# OpenEvidence MCP（非官方）

OpenEvidence MCP 是一個非官方 MCP 伺服器，透過你自己的已驗證瀏覽器工作階段，將 OpenEvidence 連接到 Codex、Claude Code、Claude Desktop、Cursor、Cline、Continue 和其他 MCP 用戶端。

> [!IMPORTANT]
> 本專案並非 OpenEvidence 官方產品，也未與 OpenEvidence 具有從屬或合作關係。本專案不提供醫療建議、不繞過存取控制，且只應搭配你自己的 OpenEvidence 帳號使用。

Canonical README: [English](README.md)

## 功能

- 檢查已儲存的 OpenEvidence session 是否仍已驗證；
- 列出問題/文章歷史；
- 透過文章 ID 取得完整 payload；
- 向 OpenEvidence 提交 research question，並可選擇等待完成。

不需要官方 OpenEvidence API token。

## 不做什麼

- 不是 OpenEvidence 官方產品；
- 不取代臨床判斷或醫療建議；
- 不收集 credentials；
- 不繞過 authentication、paywalls 或 access controls；
- 不應在沒有人類審閱的情況下用於 patient-specific diagnosis。

## MCP 用戶端

| Client | Status | Notes |
| --- | --- | --- |
| OpenAI Codex / Codex CLI / Codex app | Target | 建議的本機 MCP workflow。 |
| Claude Code | Target | 建議的 agent workflow。 |
| Claude Desktop / Claude app with MCP support | Target | 本機 MCP server configuration。 |
| Cursor | Compatible | MCP-compatible IDE workflow。 |
| Cline | Compatible | VS Code agent workflow。 |
| Continue | Compatible | Open-source IDE assistant workflow。 |
| VS Code / GitHub Copilot environments with MCP support | Experimental | 取決於本機 MCP support 與 client configuration。 |
| Windsurf / Zed / Replit / Sourcegraph-style MCP hosts | Experimental | 未測試的環境不保證可用。 |
| Gemini CLI / Google Antigravity-style agent environments | Experimental | Ecosystem/watchlist，不是 maintained example。 |

## OpenEvidence 可用性

OpenEvidence 可用性可能取決於地區、帳號資格與 OpenEvidence 政策。2026 年 5 月公開資料顯示，存取以 verified U.S. HCP/NPI 為中心，且 EU/U.K. 不可用；本專案不會繞過這些限制。

## Quick Start

```bash
git clone https://github.com/bakhtiersizhaev/openevidence-mcp.git
cd openevidence-mcp
npm ci
npx playwright install chromium
npm run build
npm run login:session
npm run smoke
```

本機瀏覽器設定檔會儲存在你的電腦上。請勿公開 browser profile files、`storage-state.json`、cookies、包含私人帳號資料的截圖或可識別患者資訊。

## Codex config

```toml
[mcp_servers.openevidence]
command = "node"
args = ["/ABSOLUTE/PATH/openevidence-mcp/dist/server.js"]
startup_timeout_sec = 60
```

## Verify

如果有有效的 OpenEvidence session，`npm run smoke` 應回傳 `ok: true` 和 `authenticated: true`。

License: Apache-2.0 + NOTICE.
