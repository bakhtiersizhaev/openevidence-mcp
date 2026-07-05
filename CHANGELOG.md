# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.3.0] - 2026-07-06

### Added
- `oe_citations_get` tool for structured citation extraction and BibTeX export, with optional Crossref DOI enrichment.
- Citation extraction on normalized article payloads via the `citations` field.
- Explicit `timed_out` flags for article waiting flows so agents can distinguish incomplete results from failures.
- Cross-platform CI matrix for Ubuntu, Windows, and macOS across Node.js 20, 22, and 24.
- `prepare` script so npm installs from git build the TypeScript output automatically.

### Changed
- `oe_ask` now exposes only parameters that are actually sent to OpenEvidence: `question`, optional `original_article_id`, and wait/poll controls.
- Server metadata now reads the package version instead of returning a hardcoded version.
- `oe_auth_status` no longer performs a redundant authenticated client check.
- README and all seven translated README files now document the `login:session` browser-profile flow, fire-and-forget asks, and citation export.
- `server.json` now uses real optional environment variables instead of placeholder API-key fields.

### Removed
- Removed legacy `npm run login`, `npm run login:browser`, and storage-state import flows from the package scripts and user docs.
- Removed unused legacy login entrypoints and local marketing/scratch artifacts from the repository.

## [0.2.1] - 2026-06-01

### Changed
- Documentation and install guidance were synchronized around the system-browser `login:session` workflow.
- Smoke-test and troubleshooting guidance clarified that a real local browser session is required.

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
- Browser-session login flow with local state persistence
- `npm run smoke` - smoke test for auth and connectivity
- Cross-platform support: macOS, Windows, Ubuntu/Linux
- Setup scripts for all three platforms
- MCP client config examples: Codex CLI, Claude Desktop
- GitHub Pages landing with i18n (EN, RU, ES, ZH, HI)
- `llms.txt` and `llms-full.txt` for AI parser discovery
- `SEMANTIC_CORE.md` for structured metadata
- Apache-2.0 license with NOTICE attribution
