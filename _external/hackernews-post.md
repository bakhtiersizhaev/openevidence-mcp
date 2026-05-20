Show HN: OpenEvidence MCP - unofficial browser-session MCP server

I built an unofficial TypeScript MCP server that connects OpenEvidence to Codex, Claude, Cursor, Cline, Continue, and other MCP-compatible clients through your own authenticated browser session.

Tools:

- auth status
- history list
- article fetch by ID
- ask a research question with optional polling

No official API token is required. The project uses local Playwright session state and treats that state as sensitive.

Boundaries: not affiliated with OpenEvidence, not medical advice, and not a way to bypass authentication or access controls.

Repo: https://github.com/bakhtiersizhaev/openevidence-mcp
