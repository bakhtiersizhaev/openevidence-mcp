## Title
I built an open-source MCP server for OpenEvidence (clinical AI used by 40% of US doctors)

## Body
OpenEvidence is the fastest-growing clinical decision support platform - used daily by 430K+ verified US physicians with partnerships with NEJM, JAMA, NCCN, and Mayo Clinic.

I built an unofficial MCP server that connects it to Claude Desktop, Codex CLI, Cursor, and other MCP clients.

**How it works:**
- Uses your own browser session (Playwright) - no API key needed
- 4 tools: check auth, browse history, fetch articles, ask questions with completion polling
- Works on macOS, Windows, Linux
- Config examples for Claude Desktop and Codex CLI included

**Use cases:**
- Differential diagnosis follow-ups with cited sources
- Treatment comparisons from your AI workflow
- Clinical literature review without leaving your editor

GitHub: https://github.com/bakhtiersizhaev/openevidence-mcp

Apache-2.0 licensed. Feedback and contributions welcome.
