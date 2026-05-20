# OpenEvidence MCP: unofficial browser-session MCP server

OpenEvidence MCP is an unofficial Model Context Protocol server that connects OpenEvidence to Codex, Claude, Cursor, Cline, Continue, and other MCP-compatible clients through your own authenticated browser session.

It is intentionally small:

| Tool | Purpose |
| --- | --- |
| `oe_auth_status` | Check whether the saved OpenEvidence browser session is authenticated. |
| `oe_history_list` | List prior OpenEvidence articles/questions. |
| `oe_article_get` | Fetch an article payload by ID. |
| `oe_ask` | Ask an OpenEvidence research question and optionally wait for completion. |

No official API token is required. You sign in once through a local Playwright browser flow, and the session state is stored locally at `~/.openevidence-mcp/auth/storage-state.json` unless configured otherwise.

Important boundaries:

- unofficial and not affiliated with OpenEvidence;
- not medical advice;
- does not bypass authentication, paywalls, or access controls;
- does not collect credentials;
- session state should be treated like a secret.

Repository: https://github.com/bakhtiersizhaev/openevidence-mcp
