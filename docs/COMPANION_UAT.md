# OpenEvidence MCP Companion UAT

The local companion is an experimental write path for `oe_ask`. It submits questions through the normal authenticated OpenEvidence web interface when direct Node.js article creation is rejected upstream.

The bridge binds to `127.0.0.1` only. Do not expose it over a public network. Do not paste cookies, storage-state files, private account data, patient-identifiable information, or raw upstream HTML into test reports.

## Current Status

- Windows 11 + Microsoft Edge: local automated integration verified.
- macOS + Chrome or Edge: requires clean-machine UAT before merge.
- Unpacked extension loading: development and UAT only.
- Packaged extension installation and `companion:doctor`: required before a stable release.

## Windows 11 UAT

```powershell
git checkout fix/browser-mediated-oe-ask
git pull
npm ci
npm run build
npm run check
npm test
npm audit --audit-level=moderate

$env:OE_MCP_COMPANION_BROWSER = "edge"
$env:OE_MCP_COMPANION_DEV_EXTENSION = "true"
npm run login:companion
npm run smoke
```

Complete OpenEvidence login in the opened Edge window, confirm the normal OpenEvidence page loads, close the window, and press Enter in the terminal.

Then restart the MCP host with the same environment variables and test:

1. `oe_auth_status` without printing private account details.
2. `oe_ask` with `wait_for_completion=false` for a fresh general evidence question.
3. `oe_article_wait` with the returned `article_id`.
4. A second fresh question to confirm a new thread ID is returned.
5. A follow-up question with `original_article_id` using only the test thread.

## macOS Clean-Machine UAT

```bash
git clone https://github.com/bakhtiersizhaev/openevidence-mcp.git
cd openevidence-mcp
git checkout fix/browser-mediated-oe-ask
npm ci
npx playwright install chromium
npm run build
npm run check
npm test
npm audit --audit-level=moderate

export OE_MCP_COMPANION_BROWSER=chrome
export OE_MCP_COMPANION_DEV_EXTENSION=true
npm run login:companion
npm run smoke
```

Repeat the MCP-host checks from the Windows section. If Chrome does not load the unpacked extension from CLI flags on the target macOS version, document the exact result and load the repository `extension/` directory manually from the browser extension developer screen for UAT.

## Expected Result

- Build, check, tests, and audit pass.
- Smoke returns `ok: true` and `authenticated: true`.
- Fresh `oe_ask` returns a new `article_id`.
- `oe_article_wait` returns a completed result.
- Follow-up requests remain attached to the intended test thread.
- No cookies, storage state, account identifiers, or unrelated history appear in logs.
