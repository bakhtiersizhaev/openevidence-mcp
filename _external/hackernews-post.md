## Title
Show HN: OpenEvidence MCP - Open-source MCP server for the #1 clinical AI platform

## URL
https://github.com/bakhtiersizhaev/openevidence-mcp

## Text (if self-post)
OpenEvidence is used by 430K+ US physicians for clinical decision support (NEJM, JAMA, NCCN content). I built an MCP server that connects it to Claude Desktop, Codex CLI, Cursor, and other MCP clients.

Uses browser-session auth via Playwright - no API key required. You log in once, the session persists locally.

4 tools: auth check, history list, article fetch, ask with completion polling. TypeScript, MCP SDK 1.26.0, Apache-2.0.
