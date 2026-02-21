---
title: "Building an MCP Server for Medical Evidence: Connecting OpenEvidence to AI Agents"
published: false
tags: mcp, ai, healthcare, typescript
---

OpenEvidence is the most widely used clinical AI platform in the United States. Over 430,000 verified physicians use it daily for evidence-based clinical decisions, backed by content from NEJM, JAMA, and NCCN.

But there's a gap: OpenEvidence lives in its own browser tab. If you're working inside Claude Desktop, Codex CLI, or Cursor, you have to context-switch to ask a clinical question.

I built **OpenEvidence MCP** to close that gap.

## What It Does

It's a Model Context Protocol (MCP) server that proxies your OpenEvidence browser session to any MCP-compatible client. No official API key - it uses Playwright to persist your authenticated session locally.

Four tools:

| Tool | What it does |
|------|-------------|
| `oe_auth_status` | Validates your session via `/api/auth/me` |
| `oe_history_list` | Lists your past conversations |
| `oe_article_get` | Fetches full article payload by ID |
| `oe_ask` | Asks a new question with optional completion polling |

## Why Browser-Session Auth?

OpenEvidence requires NPI verification for full access. There's no public API token system for third-party integrations (yet). Browser-session auth solves this: you log in once, Playwright saves the state, and the MCP server reuses it for all subsequent requests.

The session state is stored locally at `~/.openevidence-mcp/auth/storage-state.json` and never leaves your machine.

## Quick Start

```bash
git clone https://github.com/bakhtiersizhaev/openevidence-mcp.git
cd openevidence-mcp
npm install && npm run build
npm run login   # opens browser, you sign in
npm run smoke   # verifies everything works
```

Then add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "openevidence": {
      "command": "node",
      "args": ["/path/to/openevidence-mcp/dist/server.js"]
    }
  }
}
```

Or Codex CLI (`~/.codex/config.toml`):

```toml
[mcp_servers.openevidence]
command = "node"
args = ["/path/to/openevidence-mcp/dist/server.js"]
startup_timeout_sec = 60
```

## Real Workflow Example

You're in Claude Desktop reviewing a case. Instead of opening a new tab:

> "Using OpenEvidence, what is the current evidence for SGLT2 inhibitors in heart failure with preserved ejection fraction?"

Claude calls `oe_ask`, OpenEvidence processes the query against peer-reviewed literature, and the response comes back into your conversation with full citations.

Follow up right there:

> "What are the contraindications in patients with eGFR below 20?"

The server handles the polling, timeout, and response extraction. You stay in flow.

## What's Next

- npm package for `npx openevidence-mcp` install
- Docker container for restricted IT environments
- Streaming responses for long queries
- Config templates for Cursor, Cline, Windsurf

## Links

- **GitHub:** https://github.com/bakhtiersizhaev/openevidence-mcp
- **Docs:** https://bakhtiersizhaev.github.io/openevidence-mcp/
- **License:** Apache-2.0

Feedback, issues, and PRs welcome.
