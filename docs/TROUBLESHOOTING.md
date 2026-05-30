# Troubleshooting

This project is unofficial and uses your own authenticated OpenEvidence browser session. Do not paste cookies, session tokens, storage-state files, private screenshots, patient-identifiable information, or account identifiers into public issues.

## `authenticated: false`

Your saved session is missing, expired, or no longer accepted by OpenEvidence.

```bash
npm run login
npm run smoke
```

If you use a custom path, confirm `OE_MCP_AUTH_STATE_PATH` points to the intended `storage-state.json`.

`npm run smoke` redacts account and history content by default. Use `npm run smoke -- --verbose` only in a private terminal when raw payloads are needed for debugging.

## Expired Session

OpenEvidence session lifetime can vary. Rerun the login flow:

```bash
npm run login
```

The browser opens, you sign in with your own account, then press Enter in the terminal to save a fresh local state file.

## Google Says the Browser or App Is Not Secure

Google sign-in may block automation-controlled Chromium during `npm run login`. This can happen on Windows, macOS, or Linux and is a Google OAuth security behavior, not a password or OpenEvidence MCP error.

Use the system-browser login flow:

```bash
npm run login:browser
```

The script opens Chrome or Edge with a local OpenEvidence MCP profile. Complete OpenEvidence login in the opened browser, return to the terminal, and press Enter. It saves local session state and checks for an authenticated browser cookie. Run `npm run smoke` afterward for the API connectivity check.

This browser window is only used for manual login. Normal MCP tool calls do not open a browser window.

If auto-detection chooses the wrong browser, set one of:

```bash
OE_MCP_BROWSER=edge npm run login:browser
OE_MCP_BROWSER=chrome npm run login:browser
OE_MCP_BROWSER_PATH=/absolute/path/to/browser npm run login:browser
```

PowerShell example:

```powershell
$env:OE_MCP_BROWSER = "edge"
npm run login:browser
```

Do not use stealth flags, cookie-copying browser extensions, or instructions that bypass Google, OpenEvidence, institution, regional, or account controls.

## `oe_ask` Returns an Upstream Browser-Protection `403`

OpenEvidence may accept auth and read-only history requests while rejecting direct article creation with an upstream browser-protection response. In this state:

- `npm run smoke` may still pass;
- `oe_auth_status`, `oe_history_list`, and existing article reads may still work;
- the experimental local companion write path should be tested.

This is not fixed by repeatedly logging in, switching VPN endpoints, copying cookies, adding stealth flags, or replaying browser fingerprint values. Do not post the returned HTML, cookies, storage state, or account details in an issue.

For local development and UAT, use a normal browser profile with the unpacked companion extension:

```powershell
$env:OE_MCP_COMPANION_BROWSER = "edge"
$env:OE_MCP_COMPANION_DEV_EXTENSION = "true"
npm run login:companion
```

The companion bridge binds to `127.0.0.1` only and submits the question through the normal authenticated OpenEvidence web interface. It may start a minimized local browser for `oe_ask`; it does not require CDP. See [`COMPANION_UAT.md`](COMPANION_UAT.md).

Open an issue with sanitized logs and link to any existing upstream-protection report if the companion flow fails. Do not post cookies, storage state, raw upstream HTML, or account details.

## Playwright Browser Install Error

Install Chromium for Playwright:

```bash
npx playwright install chromium
```

On Linux, Playwright may require additional system packages. Use the error output from Playwright and install only the required packages for your OS.

## Windows PowerShell Path Problems

Use absolute paths. In JSON and TOML examples, escape backslashes:

```toml
args = ["C:\\Users\\<user>\\openevidence-mcp\\dist\\server.js"]
```

From PowerShell, run setup from the repository root:

```powershell
.\scripts\setup-windows.ps1
```

## Codex or Claude Cannot Start the MCP Server

Confirm the project builds:

```bash
npm run build
```

Then confirm the MCP config points to the built file:

```text
/ABSOLUTE/PATH/openevidence-mcp/dist/server.js
```

Restart the MCP client after changing config. Some clients do not reload MCP server definitions while a session is running.

## Absolute Path Required

Use an absolute path to `dist/server.js` in MCP client configs. Relative paths can resolve from the client process working directory, not the repository.

## Node Version Too Old

This project requires Node.js 20 or newer.

```bash
node --version
npm --version
```

Upgrade Node if `node --version` reports a version below 20.

## Network Timeout

OpenEvidence requests can fail because of network issues, VPN/proxy behavior, account state, or service changes. Retry after confirming you can access OpenEvidence in a normal browser with your own account.

For long `oe_ask` calls, prefer the non-blocking flow:

1. Call `oe_ask` with `wait_for_completion=false`.
2. Copy the returned `article_id`.
3. Call `oe_article_wait` with that `article_id`.

This avoids MCP host/client timeouts while OpenEvidence finishes the article.

You can tune wait behavior from the MCP call parameters:

- `wait_for_completion`
- `timeout_sec`
- `poll_interval_ms`

If a follow-up unexpectedly returns stale context from a large prior thread, ask a fresh question without `original_article_id`.

## OpenEvidence UI or API Changed

This project relies on the currently observed OpenEvidence web endpoints. If OpenEvidence changes its UI or API behavior, login, smoke, or tools may fail.

Open an issue with:

- OS and Node/npm versions;
- MCP client;
- install method;
- command used;
- sanitized logs;
- whether auth state exists;
- reproduction steps.

Do not include cookies, tokens, storage-state files, private screenshots, patient data, or account identifiers.
