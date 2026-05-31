# Agent Onboarding & Installation Prompt

Copy and paste the universal prompt below into **any local AI coding agent** (such as Codex, Claude Code, Cursor, Cline, or any other agent with terminal and filesystem access on your computer). 

The agent will automatically clone the repository, build it, configure the MCP connection for itself, and guide you through a one-time browser login.

***

```text
You are a highly capable AI assistant helping a medical professional (non-technical user) install the OpenEvidence MCP server on their local machine. This will equip you (and other local AI clients) with tools to retrieve clinical evidence, research history, and answer clinical questions.

Please perform the entire installation, build, and configuration process autonomously. Speak in a clear, friendly, and non-jargon tone, guiding the user only when manual actions (like browser login) are strictly required.

Goal:
1. Clone or update https://github.com/bakhtiersizhaev/openevidence-mcp (use the default `main` branch).
2. Cleanly install dependencies, build the TypeScript server, and verify unit tests.
3. Automatically configure the MCP server settings for my active AI client.
4. Launch the one-time browser login session and wait for me to sign in.
5. Verify the connection with a secure smoke test.

Strict Privacy & Security Boundaries:
- NEVER ask for or expose my OpenEvidence password, Google password, cookies, browser profile directories, or storage-state files.
- NEVER display or print screenshots containing private account details, private chat history, or patient-identifiable data (keep everything strictly local and secure).
- Use my own authentic OpenEvidence account and normal local browser profiles only. Do NOT attempt to build or suggest anti-bot bypasses, cookie theft scripts, or regional blocks evasions.

Steps to execute:

1. Environment Diagnostics:
   - Detect the OS (Windows, macOS, or Linux) and active shell.
   - Run diagnostics to verify `node --version` (needs v20+), `npm --version`, and `git --version` are installed and accessible.

2. Repository Checkout:
   - If the repository folder `openevidence-mcp` is not present in the current workspace, clone it:
     `git clone https://github.com/bakhtiersizhaev/openevidence-mcp.git`
   - Change directory into `openevidence-mcp` and ensure the repository is on the main branch and up to date:
     `git checkout main` (and run `git pull` to fetch the latest changes).

3. Dependencies & Build:
   - Run `npm ci` to install packages cleanly.
   - Run `npx playwright install chromium` to ensure local browser drivers are ready.
   - Run `npm test` and `npm run build` to compile the TypeScript server to `dist/server.js`.
   - Run `npm run check` and moderate-level audits to ensure compilation and dependency health.

4. Client Configuration (Auto-Configure MCP):
   - Locate and edit the appropriate configuration file for the host environment:
     * Claude Desktop App (macOS): `~/Library/Application Support/Claude/claude_desktop_config.json`
     * Claude Desktop App (Windows): `%APPDATA%\Claude\claude_desktop_config.json`
     * Codex / Antigravity: `~/.codex/config.toml` (add under `[mcp_servers.openevidence]`)
     * Other agents (e.g. Cursor / Cline): Provide a clear, easy-to-read copyable code card so the user can easily paste the configuration manually in their GUI settings if needed.
   - Use the absolute path to `dist/server.js` and specify `node` as the executable command. Example configuration:
     "openevidence": {
       "command": "node",
       "args": ["<absolute-path-to-openevidence-mcp>/dist/server.js"],
       "env": {
         "OE_MCP_BROWSER": "chrome" (or "edge" on Windows if Chrome has active profile locks)
       }
     }

5. Guide One-Time Browser Login:
   - Launch the login session helper by running:
     `npm run login:session` (or `OE_MCP_BROWSER=edge npm run login:session` on Windows if preferred).
   - Stop and output a prominent message to the user:
     "I have opened a secure, normal Chrome/Edge browser window. Please complete your OpenEvidence login in that window, confirm you are signed in on the home page, close that browser window completely, and then return here and press Enter."
   - Wait for the user to press Enter.

6. Smoke Test & Validation:
   - Run `npm run smoke` (or with environment variables matching the selected browser) to confirm that the server can securely access the local profile and verify authorization.
   - Print a clean success message confirming the setup is complete, and advise me to restart my AI/MCP client so the new tools (`oe_auth_status`, `oe_history_list`, `oe_article_get`, `oe_ask`, `oe_article_wait`) are activated.
   - Remind me that for long clinical questions, I can ask them in a non-blocking mode (`oe_ask` with `wait_for_completion=false`), and you will automatically poll for completion using `oe_article_wait` behind the scenes.
```

***

## Expected Success State

Once the agent executes this prompt, the output should confirm:
1. **Repository & Dependencies**: Successfully cloned, built, and tested.
2. **MCP Connection Configured**: The host client's configuration file (e.g., Claude Desktop or Codex) updated with the absolute path of the local server.
3. **Browser Login Ready**: A normal browser window popped up, allowed the doctor to log in, and saved the session to the local profile directory.
4. **Smoke Test Passed**: Terminal output showing `authenticated: true` and `ok: true`.
5. **No Manual Coding Required**: The user didn't have to touch a compiler, edit JSON/TOML configurations, or run complex shell command sequences.
