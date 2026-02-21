# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] - 2026-02-21

### Added
- MCP server with stdio transport (MCP SDK 1.26.0)
- `oe_auth_status` tool - validate session via `/api/auth/me`
- `oe_history_list` tool - read conversation history via `/api/article/list`
- `oe_article_get` tool - fetch full article payload by ID
- `oe_ask` tool - ask a question with optional completion polling
- Browser-session authentication via Playwright (no API key required)
- `npm run login` - interactive login flow with state persistence
- `npm run smoke` - smoke test for auth and connectivity
- Cross-platform support: macOS, Windows, Ubuntu/Linux
- Setup scripts for all three platforms
- MCP client config examples: Codex CLI, Claude Desktop
- GitHub Pages landing with i18n (EN, RU, ES, ZH, HI)
- `llms.txt` and `llms-full.txt` for AI parser discovery
- `SEMANTIC_CORE.md` for structured metadata
- Apache-2.0 license with NOTICE attribution
