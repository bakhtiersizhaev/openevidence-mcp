# Browser Session UAT

Use this checklist to validate the one-time local browser-session transport on Windows and macOS.

## Scope

- No browser extension.
- No cookie export.
- No public network listener.
- One local OpenEvidence MCP browser profile under `~/.openevidence-mcp/browser-profile`.
- The MCP server may start a minimized local browser process while it is running.

## Windows 11

```powershell
cd D:\projects\openevidence-mcp
git pull
npm ci
npx playwright install chromium
npm test
npm run build
npm run check
$env:OE_MCP_BROWSER = "edge"
npm run login:session
npm run smoke
```

Then test from an MCP client:

1. Call `oe_auth_status`.
2. Call `oe_history_list` with a small `limit`.
3. Call `oe_ask` with `wait_for_completion=false`.
4. Call `oe_article_wait` with the returned `article_id`.

## macOS

```bash
cd ~/projects/openevidence-mcp
git pull
npm ci
npx playwright install chromium
npm test
npm run build
npm run check
OE_MCP_BROWSER=chrome npm run login:session
npm run smoke
```

Then repeat the MCP-client tool checks above.

## Report

Record:

- OS version.
- Browser selected by `OE_MCP_BROWSER`.
- Node/npm versions.
- `npm test`, `npm run build`, `npm run check`, and `npm run smoke` result.
- Whether `oe_ask` returned an `article_id`.

Do not include cookies, browser profile files, storage-state files, private screenshots, account identifiers, patient data, or raw OpenEvidence answers unless you are working in a private local terminal.
