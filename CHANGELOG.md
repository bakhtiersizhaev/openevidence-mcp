# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.2.0] - 2026-05-31

### Added
- `npm run login:browser` to guide users through Edge/Chrome Google SSO login using system profiles.
- Modular, robust `npm run login:session` and automated login runners.
- Node.js test workflow CI pipeline (`.github/workflows/test.yml`).
- Compact "Agent Onboarding & Installation" copyable prompts with dedicated `docs/AGENT_INSTALL_PROMPT.md` runbook.

### Changed
- Refactored `oe_ask` for headless and headful session runner stability.
- Enhanced security: redacted browser verification HTML and raw HTML dumps in error states to prevent private data exposure.
- Standardized technical and medical terms for clinical researchers across all files.
- Fully synchronized and polished all 7 translations: `README.ru.md`, `README.es.md`, `README.zh-Hans.md`, `README.zh-Hant-TW.md`, `README.ko.md`, `README.hi.md`, and `README.AI.md`.

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
