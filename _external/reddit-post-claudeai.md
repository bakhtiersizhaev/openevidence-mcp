I built an unofficial MCP server for OpenEvidence

It connects OpenEvidence to Claude Desktop, Codex, Cursor, Cline, Continue, and other MCP-compatible clients through your own authenticated browser session.

What it does:

- checks auth status
- lists OpenEvidence history
- fetches article payloads by ID
- asks research questions with optional completion polling

No official API token is required. You sign in locally and the Playwright storage state stays on your machine.

Important: this is unofficial, not affiliated with OpenEvidence, not medical advice, and not a way to bypass authentication or access controls.

Repo: https://github.com/bakhtiersizhaev/openevidence-mcp
