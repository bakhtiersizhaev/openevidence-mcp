# Agent Install Prompt

Copy this prompt into Codex, Claude Code, or another coding agent that can edit files and run terminal commands on your machine.

```text
You are helping me install OpenEvidence MCP on my local machine.

Goal:
- Clone or update https://github.com/bakhtiersizhaev/openevidence-mcp
- Install dependencies
- Build the project
- Configure this MCP server in my local AI client
- Guide me through OpenEvidence login
- Verify that auth works

Rules:
- Do not ask for my OpenEvidence password, Google password, cookies, tokens, storage-state file, screenshots with private account data, or patient-identifiable information.
- Do not bypass OpenEvidence, Google, institutional, regional, or account access controls.
- Use my own OpenEvidence account only.
- Treat `storage-state.json`, cookies, browser profiles, and `.env` files as secrets.
- Use absolute paths in MCP config.

Steps:
1. Detect my OS and shell.
2. Check `node --version`, `npm --version`, and `git --version`.
3. If the repo is missing, clone it. If it exists, pull the latest `main`.
4. Run `npm ci`, `npx playwright install chromium`, `npm test`, `npm run build`, and `npm run check`.
5. Configure OpenEvidence MCP for my current client:
   - Codex: add `[mcp_servers.openevidence]` to the active Codex config TOML.
   - Claude Desktop / Claude app: add `mcpServers.openevidence` to `claude_desktop_config.json`.
   - Other MCP clients: use command `node` and args pointing to the absolute `dist/server.js`.
6. Help me log in:
   - First try `npm run login`.
   - If Google says "This browser or app may not be secure", stop that flow and run `npm run login:browser`.
   - Tell me to complete login only in the opened browser window, then return to the terminal and press Enter.
7. Run `npm run smoke`.
8. If smoke succeeds, tell me to restart my MCP client session/app and verify the OpenEvidence tools appear.
9. If smoke fails, summarize the error without exposing private data and suggest the next safe fix.
10. For long OpenEvidence questions after setup, prefer `oe_ask` with `wait_for_completion=false`, then use `oe_article_wait` with the returned `article_id`.

Expected result:
- `npm run smoke` returns `ok: true` and `authenticated: true`.
- MCP config points to the local `dist/server.js`.
```

## Short Version

```text
Install OpenEvidence MCP from https://github.com/bakhtiersizhaev/openevidence-mcp, run `npm test`, build it, configure it in my MCP client using an absolute path to `dist/server.js`, guide me through `npm run login`, use `npm run login:browser` if Google blocks Playwright login, then run `npm run smoke`. Do not ask for or expose cookies, tokens, storage-state files, passwords, screenshots with private account data, or patient data. Do not bypass access controls.
```
