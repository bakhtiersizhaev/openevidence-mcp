# OpenEvidence MCP - AI Agent Install Playbook

This guide is for AI agents (Codex, Claude Code, and similar) that set up OpenEvidence MCP for a human user.

## Goal

Install and validate OpenEvidence MCP end-to-end on macOS, Windows, or Ubuntu, with clear handoff steps for human login.

## Scope

- Agent checks runtime and MCP availability
- Agent installs missing MCP dependencies
- Agent sets up OpenEvidence MCP
- Human performs login in browser
- Agent verifies MCP tools are live

## Step 0: Detect Environment

- Identify OS: macOS, Windows, Ubuntu/Linux
- Identify host client:
  - Codex CLI
  - Claude Desktop / Claude Code
  - Other MCP client

## Step 1: Ensure Playwright MCP Exists (for agent browser automation workflows)

If Playwright MCP is missing, install/configure first.

### Codex config (`~/.codex/config.toml`)

```toml
[mcp_servers.playwright]
command = "npx"
args = ["-y", "@playwright/mcp"]
startup_timeout_sec = 60
```

### Claude Desktop config (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp"]
    }
  }
}
```

After config change:
- Restart MCP client session/app if tools do not appear immediately.

## Step 2: Install OpenEvidence MCP Repo

Clone repo and run platform setup.

### macOS

```bash
cd /path/where/repo/should/live
git clone <REPO_URL> openevidence-mcp
cd openevidence-mcp
./scripts/setup-macos.sh
```

### Ubuntu/Linux

```bash
cd /path/where/repo/should/live
git clone <REPO_URL> openevidence-mcp
cd openevidence-mcp
./scripts/setup-ubuntu.sh
```

### Windows (PowerShell)

```powershell
cd C:\path\where\repo\should\live
git clone <REPO_URL> openevidence-mcp
cd openevidence-mcp
.\scripts\setup-windows.ps1
```

## Step 3: Register OpenEvidence MCP in Client

### Codex (`~/.codex/config.toml`)

```toml
[mcp_servers.openevidence]
command = "node"
args = ["/ABSOLUTE/PATH/openevidence-mcp/dist/server.js"]
startup_timeout_sec = 60
```

Windows path example:

```toml
[mcp_servers.openevidence]
command = "node"
args = ["C:\\Users\\<user>\\openevidence-mcp\\dist\\server.js"]
startup_timeout_sec = 60
```

### Claude Desktop

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

After config change:
- Restart client session/app if MCP list does not refresh automatically.

## Step 4: Human Login Handoff

Agent asks user to run:

```bash
cd /ABSOLUTE/PATH/openevidence-mcp
npm run login
```

Human actions:
- Complete OpenEvidence login in browser
- Return to terminal
- Press Enter

Agent can alternatively use imported state:

```bash
cd /ABSOLUTE/PATH/openevidence-mcp
npm run login -- --import /path/to/storage-state.json
```

## Step 5: Validate

Run:

```bash
cd /ABSOLUTE/PATH/openevidence-mcp
npm run smoke
```

Then MCP-side checks:
- `oe_auth_status`
- `oe_history_list`
- `oe_ask`

## Step 6: Recovery Paths

- If `oe_auth_status` is not authenticated: rerun `npm run login`
- If MCP tool not visible: restart client session/app
- If dependencies broken: rerun platform setup script

## Clean Repository Rules for Agents

- Do not commit user session files
- Do not commit `.env` with secrets
- Keep `.gitignore` intact
- Keep examples in `examples/` for reusable config snippets

