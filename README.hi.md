# OpenEvidence MCP (unofficial)

OpenEvidence MCP एक unofficial MCP server है जो OpenEvidence को Codex, Claude Code, Claude Desktop, Cursor, Cline, Continue और अन्य MCP clients से आपके अपने authenticated browser session के ज़रिए जोड़ता है।

> [!IMPORTANT]
> यह project OpenEvidence से affiliated नहीं है, medical advice नहीं देता, access controls bypass नहीं करता, और इसे केवल अपने OpenEvidence account के साथ use करना चाहिए।

Canonical README: [English](README.md)

## यह क्या करता है

- saved OpenEvidence session authenticated है या नहीं, check करता है;
- question/article history list करता है;
- article ID से payload fetch करता है;
- OpenEvidence research question पूछता है और optional completion wait कर सकता है।

Official OpenEvidence API token required नहीं है।

## यह क्या नहीं करता

- OpenEvidence का official product नहीं है;
- clinical judgment या medical advice replace नहीं करता;
- credentials collect नहीं करता;
- authentication, paywalls या access controls bypass नहीं करता;
- patient-specific diagnosis के लिए human review के बिना use नहीं होना चाहिए।

## MCP clients

| Client | Status | Notes |
| --- | --- | --- |
| OpenAI Codex / Codex CLI / Codex app | Target | Recommended local MCP workflow. |
| Claude Code | Target | Recommended agent workflow. |
| Claude Desktop / Claude app with MCP support | Target | Local MCP server configuration. |
| Cursor | Compatible | MCP-compatible IDE workflow. |
| Cline | Compatible | VS Code agent workflow. |
| Continue | Compatible | Open-source IDE assistant workflow. |
| VS Code / GitHub Copilot environments with MCP support | Experimental | Local MCP support और client configuration पर निर्भर. |
| Windsurf / Zed / Replit / Sourcegraph-style MCP hosts | Experimental | Tested नहीं है तो guaranteed नहीं. |
| Gemini CLI / Google Antigravity-style agent environments | Experimental | Ecosystem/watchlist, maintained example नहीं. |

## OpenEvidence availability

OpenEvidence availability region, account eligibility और OpenEvidence policy पर depend कर सकती है। May 2026 public materials verified U.S. HCP/NPI-centered access और EU/U.K. unavailability दिखाते हैं; यह project restrictions bypass नहीं करता।

## Quick Start

```bash
git clone https://github.com/bakhtiersizhaev/openevidence-mcp.git
cd openevidence-mcp
npm ci
npx playwright install chromium
npm run build
npm run login:session
npm run smoke
```

Local browser profile आपकी machine पर रहता है। browser profile files, `storage-state.json`, cookies, private account screenshots या patient-identifiable information public न करें।

## Codex config

```toml
[mcp_servers.openevidence]
command = "node"
args = ["/ABSOLUTE/PATH/openevidence-mcp/dist/server.js"]
startup_timeout_sec = 60
```

## Verify

Valid OpenEvidence session होने पर `npm run smoke` को `ok: true` और `authenticated: true` return करना चाहिए।

License: Apache-2.0 + NOTICE.
