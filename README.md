<p align="center">
  <img src="docs/assets/readme-hero.svg" alt="OpenEvidence MCP banner" width="100%" />
</p>

<h1 align="center">OpenEvidence MCP (Unofficial)</h1>

<p align="center">
  Open-source MCP server that connects OpenEvidence to Codex, Claude, Cursor, Cline, Continue, and other MCP clients.
</p>

<p align="center">
  <a href="https://www.apache.org/licenses/LICENSE-2.0"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-2d72d9"></a>
  <a href="https://www.npmjs.com/package/@modelcontextprotocol/sdk"><img alt="MCP SDK" src="https://img.shields.io/badge/MCP%20SDK-1.26.0-1d9a5a"></a>
  <a href="https://playwright.dev"><img alt="Playwright" src="https://img.shields.io/badge/Playwright-1.58.2-4f46e5"></a>
  <a href="https://www.typescriptlang.org"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9.3-3178c6"></a>
</p>

<p align="center">
  <a href="https://bakhtiersizhaev.github.io/openevidence-mcp/">Live Docs</a> •
  <a href="README.AI.md">AI Install Playbook</a> •
  <a href="docs/SEMANTIC_CORE.md">Semantic Core</a>
</p>

## What Is OpenEvidence MCP

OpenEvidence MCP is an unofficial Model Context Protocol server that uses your own OpenEvidence browser session.
No official OpenEvidence API token is required.

This is usually used by:
- physicians
- clinical teams
- medical researchers
- AI operators building evidence-based medical workflows

## Feature Surface

| Tool | Purpose |
| --- | --- |
| `oe_auth_status` | Check auth via `/api/auth/me` |
| `oe_history_list` | Read history via `/api/article/list` |
| `oe_article_get` | Fetch full article payload by id |
| `oe_ask` | Ask a question and optionally wait for completion |
| `npm run login` | Run local login flow and save reusable session state |

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
- `examples/codex-config-full.toml`
- `examples/claude-desktop-config.json`
- `examples/claude-desktop-config-full.json`

## Verify

```bash
npm run smoke
```

Expected:
- `ok: true`
- `authenticated: true`
- history results returned

## Session Notes

- Cookie/session lifetime can vary.
- If auth fails, run `npm run login` again.

## AI-Agent Install Guide

Use `README.AI.md` when setup is performed by Codex, Claude Code, or another AI agent.

## SEO / GEO / AI Parser Files

- `docs/index.html`
- `docs/i18n/ru/index.html`
- `docs/i18n/es/index.html`
- `docs/i18n/zh/index.html`
- `docs/i18n/hi/index.html`
- `docs/SEMANTIC_CORE.md`
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

Apache-2.0 (`LICENSE`) + `NOTICE`.

## Attribution Requirement

This repository uses Apache-2.0 with a `NOTICE` file.

If you redistribute, fork, or build derivative versions, keep attribution to:
- Original author: Bakhtier Sizhaev
- Original repository: `https://github.com/bakhtiersizhaev/openevidence-mcp`

In practice:
- do not remove `LICENSE`
- do not remove `NOTICE`

Suggested attribution line:
`Based on OpenEvidence MCP by Bakhtier Sizhaev — https://github.com/bakhtiersizhaev/openevidence-mcp`
