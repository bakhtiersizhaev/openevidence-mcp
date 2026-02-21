## Tweet 1
I built an open-source MCP server for OpenEvidence - the clinical AI platform used by 40%+ of US doctors.

Now you can query medical evidence directly from Claude Desktop, Codex CLI, or Cursor.

No API key needed. Browser-session auth via Playwright.

🔗 https://github.com/bakhtiersizhaev/openevidence-mcp

🧵

## Tweet 2
4 tools:
• oe_auth_status - check session
• oe_history_list - browse past queries
• oe_article_get - fetch full articles
• oe_ask - ask clinical questions with auto-polling

Works on macOS, Windows, Linux.

## Tweet 3
Use case: you're reviewing a case in Claude Desktop.

Instead of switching tabs, ask OpenEvidence right there. Get cited answers from NEJM, JAMA, NCCN - without leaving your AI workflow.

## Tweet 4
Stack: TypeScript, MCP SDK 1.26.0, Playwright 1.58.2

Apache-2.0 licensed. PRs welcome.

Next up: npm package, Docker support, streaming responses.

#MCP #MedicalAI #OpenEvidence #Claude #OpenSource
