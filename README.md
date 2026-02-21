# OpenEvidence MCP (Unofficial)

OpenEvidence MCP server based on your own browser session.  
No official OpenEvidence API token is required.

Live docs page (retro dark scientific theme):  
`https://bakhtiersizhaev.github.io/openevidence-mcp/`

## Features

- `oe_auth_status` - checks auth via `/api/auth/me`
- `oe_history_list` - reads history from `/api/article/list`
- `oe_article_get` - gets full article payload by id
- `oe_ask` - creates question and optionally waits for completion
- `npm run login` - local login flow that stores reusable session state

## Platform Support

- macOS
- Windows
- Ubuntu/Linux

## Requirements

- Node.js 20+
- npm 10+
- OpenEvidence account

## Quick Start

### macOS

```bash
cd /path/to/openevidence-mcp
./scripts/setup-macos.sh
npm run login
npm run smoke
```

### Ubuntu/Linux

```bash
cd /path/to/openevidence-mcp
./scripts/setup-ubuntu.sh
npm run login
npm run smoke
```

### Windows (PowerShell)

```powershell
cd C:\path\to\openevidence-mcp
.\scripts\setup-windows.ps1
npm run login
npm run smoke
```

## Login Flow

Run:

```bash
npm run login
```

Browser opens, user signs in, then presses Enter in terminal.  
The tool validates `/api/auth/me` and saves local state.

Import existing state:

```bash
npm run login -- --import /absolute/path/storage-state.json
```

Default state path:
- macOS/Linux: `~/.openevidence-mcp/auth/storage-state.json`
- Windows: `%USERPROFILE%\\.openevidence-mcp\\auth\\storage-state.json`

## MCP Setup

### Codex (`~/.codex/config.toml`)

```toml
[mcp_servers.openevidence]
command = "node"
args = ["/ABSOLUTE/PATH/openevidence-mcp/dist/server.js"]
startup_timeout_sec = 60
```

### Claude Desktop (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "openevidence": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/openevidence-mcp/dist/server.js"]
    }
  }
}
```

Templates:
- `examples/codex-config.toml`
- `examples/codex-config-full.toml` (includes Playwright MCP + OpenEvidence MCP)
- `examples/claude-desktop-config.json`
- `examples/claude-desktop-config-full.json` (includes Playwright MCP + OpenEvidence MCP)

## Verify

```bash
npm run smoke
```

Expected:
- `ok: true`
- `authenticated: true`
- history results returned

## Session Notes

- Typical cookie expiry can be long, but session can still expire early.
- If auth fails, run `npm run login` again.

## AI-Agent Install Guide

Use `README.AI.md` when setup is performed by Codex, Claude Code, or another AI agent.

## Semantic Core

Semantic core and intent map: `docs/SEMANTIC_CORE.md`.

## SEO / GEO / AI Parser Files

- `docs/index.html` (semantic landing page)
- `docs/robots.txt`
- `docs/sitemap.xml`
- `docs/llms.txt`
- `docs/llms-full.txt`

## Environment Variables

Copy `.env.example` to `.env` if custom paths are needed.

- `OE_MCP_BASE_URL`
- `OE_MCP_ROOT_DIR`
- `OE_MCP_AUTH_STATE_PATH`
- `OE_MCP_USER_DATA_DIR`
- `OE_MCP_POLL_INTERVAL_MS`
- `OE_MCP_POLL_TIMEOUT_MS`

## License

MIT (`LICENSE`).
