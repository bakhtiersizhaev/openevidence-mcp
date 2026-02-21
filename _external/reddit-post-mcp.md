## Title
OpenEvidence MCP - browser-session MCP server for the #1 clinical AI platform

## Body
Built an MCP server that connects OpenEvidence to any MCP client (Claude Desktop, Codex, Cursor, Cline, Continue).

OpenEvidence is used by 40%+ of US physicians for clinical decision support. No official API token needed - uses Playwright browser session auth.

**Tools:**
- `oe_auth_status` - validate session
- `oe_history_list` - read past conversations
- `oe_article_get` - fetch article by ID
- `oe_ask` - ask a question, optionally wait for completion

**Stack:** TypeScript, MCP SDK 1.26.0, Playwright 1.58.2

Repo: https://github.com/bakhtiersizhaev/openevidence-mcp

Looking for feedback on the tool surface and auth flow. PRs welcome.
