# OpenEvidence MCP (неофициально)

OpenEvidence MCP - неофициальный MCP-сервер, который подключает OpenEvidence к Codex, Claude Code, Claude Desktop, Cursor, Cline, Continue и другим MCP-клиентам через вашу собственную авторизованную browser session.

> [!IMPORTANT]
> Проект не связан с OpenEvidence, не является медицинской консультацией, не обходит контроль доступа и должен использоваться только с вашим собственным аккаунтом OpenEvidence.

Canonical README: [English](README.md)

Если вы используете Codex или Claude Code, можно скопировать prompt из [`docs/AGENT_INSTALL_PROMPT.md`](docs/AGENT_INSTALL_PROMPT.md) и попросить агента установить проект, прописать MCP config, провести через авторизацию и проверить `npm run smoke`.

## Что делает проект

- проверяет, активна ли сохранённая OpenEvidence session;
- показывает историю вопросов/статей;
- получает article payload по ID;
- задаёт исследовательский вопрос в OpenEvidence и при необходимости ждёт завершения.

Официальный OpenEvidence API token не требуется.

## Чего проект не делает

- не является официальным продуктом OpenEvidence;
- не заменяет врача или клиническое решение;
- не собирает credentials;
- не обходит authentication, paywalls или access controls;
- не должен использоваться для patient-specific diagnosis без человеческой проверки.

## Клиенты MCP

| Client | Status | Notes |
| --- | --- | --- |
| OpenAI Codex / Codex CLI / Codex app | Target | Основной локальный MCP workflow. |
| Claude Code | Target | Основной agent workflow. |
| Claude Desktop / Claude app with MCP support | Target | Локальная MCP server configuration. |
| Cursor | Compatible | MCP-compatible IDE workflow. |
| Cline | Compatible | VS Code agent workflow. |
| Continue | Compatible | Open-source IDE assistant workflow. |
| VS Code / GitHub Copilot environments with MCP support | Experimental | Зависит от MCP support и client configuration. |
| Windsurf / Zed / Replit / Sourcegraph-style MCP hosts | Experimental | Не гарантируется без тестирования. |
| Gemini CLI / Google Antigravity-style agent environments | Experimental | Ecosystem/watchlist, не maintained example. |

## Доступность OpenEvidence

Доступность OpenEvidence может зависеть от региона, eligibility аккаунта и политики OpenEvidence. Публичные материалы на май 2026 указывают на verified U.S. HCP/NPI-centered access и недоступность в EU/U.K.; этот проект не обходит такие ограничения.

## Быстрый старт

```powershell
git clone https://github.com/bakhtiersizhaev/openevidence-mcp.git
cd openevidence-mcp
npm ci
npx playwright install chromium
npm run build
npm run login
npm run smoke
```

Session state хранится локально. Не публикуйте `storage-state.json`, cookies, screenshots с private account data или patient-identifiable information.

Если Google пишет, что browser/app небезопасен, используйте system-browser flow:

```bash
npm run login:browser
```

Он откроет Chrome или Edge, попросит завершить OpenEvidence login и сохранит local auth state после Enter в терминале.

## Codex config

```toml
[mcp_servers.openevidence]
command = "node"
args = ["C:\\path\\to\\openevidence-mcp\\dist\\server.js"]
startup_timeout_sec = 60
```

## Проверка

`npm run smoke` должен вернуть `ok: true` и `authenticated: true`, если есть валидная OpenEvidence session.

License: Apache-2.0 + NOTICE.
