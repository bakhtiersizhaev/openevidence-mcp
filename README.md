# OpenEvidence MCP (Unofficial)

OpenEvidence MCP is an unofficial Model Context Protocol server that connects OpenEvidence to Codex, Claude Code, Claude Desktop, Cursor, Cline, Continue, and other MCP-compatible clients through your own authenticated browser session.

[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-2d72d9)](https://www.apache.org/licenses/LICENSE-2.0)
[![Node.js 20+](https://img.shields.io/badge/node-%3E%3D20-339933)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6)](https://www.typescriptlang.org/)
[![MCP SDK](https://img.shields.io/badge/MCP%20SDK-1.26.0-1d9a5a)](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
[![Playwright](https://img.shields.io/badge/Playwright-1.58.2-4f46e5)](https://playwright.dev/)

> [!IMPORTANT]
> This project is unofficial and is not affiliated with OpenEvidence. It does not provide medical advice, does not bypass access controls, and should only be used with your own OpenEvidence account in compliance with applicable terms, privacy rules, and clinical governance requirements.

Translations: [Русский](README.ru.md) | [Español](README.es.md) | [简体中文](README.zh-Hans.md) | [繁體中文（台灣）](README.zh-Hant-TW.md) | [한국어](README.ko.md) | [हिन्दी](README.hi.md)

## Agent Onboarding & Installation

Using Codex, Claude Code, Cursor, or another local AI coding agent? You can let the agent handle the entire setup, compilation, and local MCP configuration for you!

Copy and paste this short bootstrap prompt directly into your local AI coding assistant:

```text
Please install OpenEvidence MCP for me: clone https://github.com/bakhtiersizhaev/openevidence-mcp, install dependencies, run build, auto-configure this MCP server in my local client (Claude Desktop/Codex/Cursor), guide me through the one-time Edge/Chrome login using `npm run login:session`, and run `npm run smoke` to verify. Keep everything strictly local and secure.
```

For the comprehensive, step-by-step setup playbook and rules, see **[docs/AGENT_INSTALL_PROMPT.md](docs/AGENT_INSTALL_PROMPT.md)**.

## What it does

OpenEvidence MCP runs a local stdio MCP server that lets MCP clients use your existing OpenEvidence browser session for:

- checking whether the saved session is authenticated;
- listing your OpenEvidence question/article history;
- fetching a full article payload by ID;
- asking an OpenEvidence research question and optionally waiting for completion;
- polling an existing OpenEvidence article until it completes.

No official OpenEvidence API token is required.

## What it does NOT do

- It is not affiliated with, endorsed by, or approved by OpenEvidence.
- It does not provide medical advice or replace clinical judgment.
- It does not bypass authentication, paywalls, or access controls.
- It does not collect credentials.
- It does not send your browser session state anywhere except to OpenEvidence through local requests from your machine.
- It should not be used for patient-specific diagnosis or treatment decisions without appropriate human review.

## Who it is for

- clinicians using their own OpenEvidence account;
- medical researchers;
- AI operators building evidence-research workflows;
- MCP developers integrating local tools with Codex, Claude, Cursor, Cline, Continue, or similar clients.

## Tested / Target Clients

This project is designed for MCP-compatible clients and local agent workflows. Only Codex and Claude-style local configuration examples are maintained in this repository unless otherwise noted.

| Client | Status | Notes |
| --- | --- | --- |
| OpenAI Codex / Codex CLI / Codex app | Target | Recommended local MCP workflow. |
| Claude Code | Target | Recommended agent workflow. |
| Claude Desktop / Claude app with MCP support | Target | Local MCP server configuration. |
| Cursor | Compatible | MCP-compatible IDE workflow. |
| Cline | Compatible | VS Code agent workflow. |
| Continue | Compatible | Open-source IDE assistant workflow. |
| VS Code / GitHub Copilot environments with MCP support | Experimental | Depends on local MCP support and client configuration. |
| Windsurf / Zed / Replit / Sourcegraph-style MCP hosts | Experimental | Not guaranteed unless tested. |
| Gemini CLI / Google Antigravity-style agent environments | Experimental | Watchlist/ecosystem target, not a maintained example. |

Other MCP-compatible hosts may work as well, but the examples in this repository focus on Codex and Claude-style local MCP configuration.

## Features

| Tool | Purpose | Auth required | Side effects |
| --- | --- | --- | --- |
| `oe_auth_status` | Checks whether the saved OpenEvidence browser session is authenticated. | Yes, local browser profile must be logged in. | None. |
| `oe_history_list` | Lists prior OpenEvidence articles with optional pagination and search. Returns a privacy-reduced list unless `include_raw=true` is explicitly requested. | Yes. | None. |
| `oe_article_get` | Fetches an article by ID and returns normalized fields (`status`, `is_complete`, `question`, `answer_text`). Raw payload is opt-in with `include_raw=true`. | Yes. | None. |
| `oe_article_wait` | Waits for an existing article ID to complete; useful after non-blocking `oe_ask`. | Yes. | None. |
| `oe_ask` | Creates an OpenEvidence research question and optionally waits for the article to complete. | Yes. | Creates a question/article in your OpenEvidence account. |

## Agent Tool-Calling Notes

The MCP server includes built-in instructions and a prompt named `openevidence_research_workflow` for clients that expose MCP prompts.

Recommended agent workflow:

1. Call `oe_auth_status` when auth state is unknown.
2. Use `oe_history_list` only when the user wants prior OpenEvidence work or an article ID.
3. Use `oe_article_get` when you already have an article ID.
4. For long research questions, call `oe_ask` with `wait_for_completion=false`, then call `oe_article_wait` with the returned `article_id`.
5. Use `original_article_id` only for true follow-up continuity. Omit it for fresh questions to avoid stale thread context.
6. Treat outputs as evidence-research context, not medical advice, diagnosis, or clinical orders.

Related commands:

| Command | Purpose |
| --- | --- |
| `npm run login:session` | Recommended one-time login. Opens Chrome/Edge with the local OpenEvidence MCP profile. |
| `npm run login` | Legacy/development Playwright login flow that also uses the local profile. |
| `npm run login:browser` | Legacy system-browser login/export flow for debugging Google SSO issues. |
| `npm run smoke` | Verifies auth and basic OpenEvidence connectivity. |

## Requirements

- Node.js 20+
- npm 10+
- OpenEvidence account
- macOS, Windows, or Linux
- Chromium installed by Playwright (`npx playwright install chromium`)

## Availability Note

OpenEvidence availability may depend on region, account eligibility, and OpenEvidence policy. Public materials in May 2026 indicate verified U.S. HCP/NPI-centered access and EU/U.K. unavailability; this project does not bypass those restrictions.

Useful references:

- [OpenEvidence homepage](https://www.openevidence.com/)
- [OpenEvidence API/product page](https://www.openevidence.com/product/api)
- [OpenEvidence Privacy Policy](https://www.openevidence.com/policies/privacy)

## Quick Start

### macOS

```bash
git clone https://github.com/bakhtiersizhaev/openevidence-mcp.git
cd openevidence-mcp
./scripts/setup-macos.sh
npm run login:session
npm run smoke
```

### Ubuntu/Linux

```bash
git clone https://github.com/bakhtiersizhaev/openevidence-mcp.git
cd openevidence-mcp
./scripts/setup-ubuntu.sh
npm run login:session
npm run smoke
```

### Windows PowerShell

```powershell
git clone https://github.com/bakhtiersizhaev/openevidence-mcp.git
cd openevidence-mcp
.\scripts\setup-windows.ps1
npm run login:session
npm run smoke
```

## Login Flow

Recommended one-time login:

```bash
npm run login:session
```

The command opens Chrome or Edge with a local OpenEvidence MCP browser profile. Sign in to OpenEvidence with your own account, confirm the normal OpenEvidence page loads, close that browser window, return to the terminal, and press Enter.

Default local profile path:

- macOS/Linux: `~/.openevidence-mcp/browser-profile`
- Windows: `%USERPROFILE%\.openevidence-mcp\browser-profile`

The MCP server reuses this same local profile during its process lifetime. It may start a minimized local browser process for OpenEvidence calls, but it does not install an extension, expose a public network service, export cookies, or ask for your password.

Legacy/development flow:

```bash
npm run login
```

If Google sign-in says the browser or app may not be secure during the legacy flow, use the session login instead:

```bash
npm run login:session
```

Do not share browser profile files, storage-state files, cookies, screenshots with private account data, or patient-identifiable information.

## MCP Client Setup

Build before registering the server:

```bash
npm run build
```

### Automatic Setup (Recommended)

You can automatically register the OpenEvidence MCP server with your favorite client using the built-in installer:

* **Claude Desktop** (`claude-app`):
  ```bash
  npx openevidence-mcp install --client claude-app
  # or via npm shortcut:
  npm run install:claude-app
  ```
* **Codex Desktop** (`codex-app`):
  ```bash
  npx openevidence-mcp install --client codex-app
  # or via npm shortcut:
  npm run install:codex-app
  ```
* **Claude Code** (`claude-code`):
  ```bash
  npx openevidence-mcp install --client claude-code
  # or via npm shortcut:
  npm run install:claude-code
  ```
* **Codex CLI** (`codex-cli`):
  ```bash
  npx openevidence-mcp install --client codex-cli
  # or via npm shortcut:
  npm run install:codex-cli
  ```
* **Google Antigravity** (`antigravity`):
  ```bash
  npx openevidence-mcp install --client antigravity
  # or via npm shortcut:
  npm run install:antigravity
  ```
* **Cursor** (`cursor`):
  ```bash
  npx openevidence-mcp install --client cursor
  # or via npm shortcut:
  npm run install:cursor
  ```
* **Windsurf** (`windsurf`):
  ```bash
  npx openevidence-mcp install --client windsurf
  # or via npm shortcut:
  npm run install:windsurf
  ```

To uninstall, you can run:
```bash
npx openevidence-mcp uninstall --client <client-id>
```

---

### Manual Setup

### Codex

Add this to `~/.codex/config.toml`:

```toml
[mcp_servers.openevidence]
command = "node"
args = ["/ABSOLUTE/PATH/openevidence-mcp/dist/server.js"]
startup_timeout_sec = 60
```

Windows example:

```toml
[mcp_servers.openevidence]
command = "node"
args = ["C:\\Users\\<user>\\openevidence-mcp\\dist\\server.js"]
startup_timeout_sec = 60
```

### Claude Desktop

Add this to `claude_desktop_config.json`:

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

### Cursor, Cline, Continue

Use the same stdio server shape if your client supports MCP server command/args configuration:

```json
{
  "command": "node",
  "args": ["/ABSOLUTE/PATH/openevidence-mcp/dist/server.js"]
}
```

Example configs are in `examples/`.

## Verify

```bash
npm run smoke
```

Expected result with a valid session:

- `ok: true`
- `authenticated: true`
- a redacted history preview

If smoke fails with an auth error, run `npm run login:session` again. Smoke requires a real OpenEvidence account session and will not pass in a clean CI environment unless a local session profile is available.

By default, smoke output redacts account and history content. Use `npm run smoke -- --verbose` only in a private terminal if raw account/history payloads are needed for debugging.

Developer checks:

```bash
npm test
npm run build
npm run check
```

## Security Notes

- Treat browser profiles, `storage-state.json`, and cookies as secrets.
- Do not commit `.env`, session state, screenshots with account data, or patient-identifiable information.
- Use only your own OpenEvidence account.
- Keep MCP client configs pointed at the built local server path you control.
- Review tool calls from autonomous agents before using outputs in clinical or operational workflows.
- See `SECURITY.md` for vulnerability reporting and supported scope.

## Troubleshooting

See `docs/TROUBLESHOOTING.md` for detailed recovery steps.

Common fixes:

- `authenticated: false`: rerun `npm run login:session`.
- Google says browser is not secure in the legacy login flow: run `npm run login:session`.
- Browser install errors: run `npx playwright install chromium`.
- MCP client cannot start server: confirm `npm run build` succeeded and use an absolute path to `dist/server.js`.
- Windows path issues: escape backslashes in JSON/TOML or use full absolute paths.
- Node errors: confirm `node --version` is 20 or newer.
- OpenEvidence UI/API changed: open an issue with sanitized logs and no private account or patient data.
- `oe_ask` cannot find the question input or submit button: OpenEvidence UI may have changed; open an issue with sanitized logs and no private account or patient data.

## Roadmap

- Keep tool descriptions compact and agent-friendly.
- Add focused tests around config and response parsing.
- Improve smoke diagnostics without exposing session details.
- Track MCP client setup examples as client configuration formats evolve.

## License & Attribution

Apache-2.0 (`LICENSE`) + `NOTICE`.

If you redistribute, fork, or build derivative versions, keep attribution to:

- Original author: Bakhtier Sizhaev
- Original repository: `https://github.com/bakhtiersizhaev/openevidence-mcp`

Suggested attribution line:

```text
Based on OpenEvidence MCP by Bakhtier Sizhaev - https://github.com/bakhtiersizhaev/openevidence-mcp
```
