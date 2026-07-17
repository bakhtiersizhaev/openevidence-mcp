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
   - Run `npm ci` to install packages cleanly (this also compiles TypeScript to `dist/server.js` via the `prepare` script).
   - Run `npx playwright install chromium` to ensure local browser drivers are ready.
   - Run `npm test` to verify the test suite passes (20 tests expected).
   - If `dist/server.js` is missing, run `npm run build` explicitly.

4. Client Configuration (Auto-Configure MCP):
   - First, identify which AI client you (the agent) are running inside right now, and configure that client.
   - Prefer the built-in installer CLI. It edits/backs up config files safely and prints a diff. From the repo root, run the command matching the client:
     * Claude Code (CLI):        `node dist/server.js install --client claude-code`
     * Codex CLI:                `node dist/server.js install --client codex-cli`
     * Claude Desktop App:       `node dist/server.js install --client claude-app`
     * Codex Desktop App:        `node dist/server.js install --client codex-app`
     * Google Antigravity:       `node dist/server.js install --client antigravity`
     * Cursor:                   `node dist/server.js install --client cursor`
     * Windsurf:                 `node dist/server.js install --client windsurf`
   - To preview changes without writing anything, use `show-config` instead of `install`, e.g. `node dist/server.js show-config --client antigravity`.
   - OpenCode is not yet supported by the installer CLI. For OpenCode, merge this entry into the active OpenCode JSON config (project `opencode.json` / `.opencode.json` or the user-level OpenCode config), preserving all existing `mcpServers`:
     {
       "mcpServers": {
         "openevidence": {
           "type": "stdio",
           "command": "node",
           "args": ["<absolute-path-to-openevidence-mcp>/dist/server.js"],
           "env": []
         }
       }
     }
   - For any other agent (e.g. Cline), provide a clear, copyable config card using `node` as the command and the absolute path to `dist/server.js` as the single argument.
   - Optional env var if the default browser detection needs an override: `OE_MCP_BROWSER=chrome` (or `edge` on Windows if Chrome has active profile locks).

5. Guide One-Time Browser Login:
   - Launch the login session helper by running:
     `npm run login:session` (or `OE_MCP_BROWSER=edge npm run login:session` on Windows if preferred).
   - Stop and output a prominent message to the user:
     "I have opened a secure, normal Chrome/Edge browser window. Please complete your OpenEvidence login in that window, confirm you are signed in on the home page, close that browser window completely, and then return here and press Enter."
   - Wait for the user to press Enter.

6. Smoke Test & Validation:
   - Run `npm run smoke` (or with environment variables matching the selected browser) to confirm that the server can securely access the local profile and verify authorization.
   - Print a clean success message confirming the setup is complete, and advise me to restart my AI/MCP client so the new tools (`oe_auth_status`, `oe_history_list`, `oe_article_get`, `oe_ask`, `oe_article_wait`, `oe_citations_get`) are activated.
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
