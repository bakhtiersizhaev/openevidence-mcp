# OpenEvidence MCP (Неофициальный сервер)

OpenEvidence MCP — это неофициальный сервер протокола Model Context Protocol (MCP), который позволяет подключать OpenEvidence к Codex, Claude Code, Claude Desktop, Cursor, Cline, Continue и другим MCP-совместимым клиентам через вашу собственную авторизованную сессию браузера.

[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-2d72d9)](https://www.apache.org/licenses/LICENSE-2.0)
[![Node.js 20+](https://img.shields.io/badge/node-%3E%3D20-339933)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6)](https://www.typescriptlang.org/)
[![MCP SDK](https://img.shields.io/badge/MCP%20SDK-1.26.0-1d9a5a)](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
[![Playwright](https://img.shields.io/badge/Playwright-1.58.2-4f46e5)](https://playwright.dev/)

> [!IMPORTANT]
> Данный проект является неофициальным и никак не связан с OpenEvidence. Сервер не предоставляет медицинских консультаций, не обходит средства контроля доступа и должен использоваться исключительно с вашей собственной учетной записью OpenEvidence в соответствии с применимыми условиями использования, правилами конфиденциальности и клиническими регламентами.

Языки: [English](README.md) | [Español](README.es.md) | [简体中文](README.zh-Hans.md) | [繁體中文（台灣）](README.zh-Hant-TW.md) | [한국어](README.ko.md) | [हिन्दी](README.hi.md)

## Интеграция и установка с помощью ИИ-агента

Используете Codex, Claude Code или другого локального ИИ-ассистента для программирования? Скопируйте этот запрос (prompt) в диалог с агентом, и он автоматически выполнит установку, настроит MCP-сервер, поможет пройти авторизацию и проверит работоспособность.

```text
Look into this repository: https://github.com/bakhtiersizhaev/openevidence-mcp

Install OpenEvidence MCP in my local AI CLI / agentic MCP setup. Add it as an MCP server for the CLI or app I am using. Follow the repository README and the agent install playbook at docs/AGENT_INSTALL_PROMPT.md.

Verify local prerequisites: Node.js 20+, npm, git, and Playwright Chromium. Clone or update the repo, run npm ci, npx playwright install chromium, npm run build, and npm run check.

Configure the MCP server with command "node" and args pointing to the absolute path of dist/server.js. Keep the server local and do not expose it over a public network.

Guide me through OpenEvidence login with my own account. First try npm run login. If Google says "This browser or app may not be secure", stop that flow and run npm run login:browser instead. I will complete login in the opened browser window and then press Enter in the terminal.

Do not ask for or expose my password, cookies, tokens, storage-state files, screenshots with private account data, patient-identifiable information, or account identifiers. Do not bypass OpenEvidence, Google, institutional, regional, or account access controls.

After login, run npm run smoke. If smoke returns ok: true and authenticated: true, show me the final MCP config and tell me to restart my AI agent / MCP client so the OpenEvidence tools become available.
```

Полное руководство для ИИ-агентов: [`docs/AGENT_INSTALL_PROMPT.md`](docs/AGENT_INSTALL_PROMPT.md).

## Что делает проект

OpenEvidence MCP запускает локальный stdio MCP-сервер, позволяющий MCP-клиентам использовать вашу существующую сессию браузера OpenEvidence для:

- проверки авторизации сохраненной сессии;
- получения списка истории ваших вопросов и статей в OpenEvidence;
- загрузки полных данных статьи по её идентификатору (ID);
- отправки исследовательских вопросов в OpenEvidence (с возможностью ожидания ответа);
- отслеживания статуса подготовки статьи в OpenEvidence до её завершения.

Официальный токен API OpenEvidence не требуется.

## Чего проект НЕ делает

- Не связан с OpenEvidence, не спонсируется и не утверждается им.
- Не предоставляет медицинских консультаций и не заменяет профессиональное клиническое суждение.
- Не обходит аутентификацию, платный доступ (paywalls) или средства контроля доступа.
- Не собирает ваши учетные данные (пароли).
- Не передает состояние вашей сессии браузера третьим лицам (все запросы выполняются локально через библиотеку Playwright напрямую к OpenEvidence).
- Не должен использоваться для постановки диагноза конкретным пациентам или принятия решений о лечении без участия врача.

## Для кого этот проект

- Практикующие врачи, использующие собственную учетную запись OpenEvidence;
- Медицинские исследователи и ученые;
- Специалисты по работе с ИИ, интегрирующие доказательную медицину в рабочие процессы;
- Разработчики MCP-решений, подключающие локальные инструменты к Codex, Claude, Cursor, Cline, Continue или аналогичным клиентам.

## Протестированные и поддерживаемые клиенты

Проект разработан для MCP-совместимых клиентов и локальных сценариев автоматизации. В репозитории поддерживаются примеры конфигурации в основном для Codex и Claude.

| Клиент | Статус | Примечания |
| --- | --- | --- |
| OpenAI Codex / Codex CLI / Приложение Codex | Поддерживается | Рекомендуемый локальный рабочий процесс MCP. |
| Claude Code | Поддерживается | Рекомендуемый рабочий процесс с ИИ-агентом. |
| Claude Desktop / Приложение Claude с поддержкой MCP | Поддерживается | Локальная конфигурация MCP-сервера. |
| Cursor | Совместим | Интеграция MCP в среду разработки (IDE). |
| Cline | Совместим | Сценарий агента в среде VS Code. |
| Continue | Совместим | Открытый ассистент для IDE. |
| Окружения VS Code / GitHub Copilot с поддержкой MCP | Экспериментально | Зависит от локальной поддержки MCP и настроек клиента. |
| Хосты MCP типа Windsurf / Zed / Replit / Sourcegraph | Экспериментально | Не гарантируется без предварительного тестирования. |
| Клиенты Gemini CLI / Агенты Google Antigravity | Экспериментально | Вектор развития экосистемы, примеры конфигурации не обновляются регулярно. |

Другие MCP-совместимые приложения также могут работать, но основные примеры в репозитории ориентированы на Codex и Claude.

## Возможности и инструменты

| Инструмент | Назначение | Требуется авторизация | Побочные эффекты |
| --- | --- | --- | --- |
| `oe_auth_status` | Проверяет, авторизована ли сохраненная сессия браузера OpenEvidence. | Да (файл сессии должен существовать). | Нет. |
| `oe_history_list` | Выводит список прошлых статей/вопросов OpenEvidence с возможностью пагинации и поиска. | Да. | Нет. |
| `oe_article_get` | Извлекает статью по ID и возвращает нормализованные поля (`status`, `is_complete`, `question`, `answer_text`), а также исходный JSON-ответ. | Да. | Нет. |
| `oe_article_wait` | Ожидает завершения генерации ответа для существующего ID статьи (полезно после асинхронного вызова `oe_ask`). | Да. | Нет. |
| `oe_ask` | Отправляет исследовательский вопрос в OpenEvidence и опционально ожидает завершения генерации. | Да. | Создает новый вопрос/статью в вашей учетной записи OpenEvidence. |

## Рекомендации по вызову инструментов для ИИ-агентов

MCP-сервер содержит встроенные инструкции и готовый шаблон запроса (prompt) под названием `openevidence_research_workflow` для клиентов, поддерживающих MCP-промпты.

Рекомендуемый сценарий работы агента:

1. Вызовите `oe_auth_status`, если текущий статус авторизации неизвестен.
2. Используйте `oe_history_list` только тогда, когда пользователю нужны прошлые исследования или конкретный ID статьи.
3. Используйте `oe_article_get`, если у вас уже есть ID статьи.
4. Для сложных или длительных медицинских вопросов вызывайте `oe_ask` с параметром `wait_for_completion=false`, а затем отслеживайте статус с помощью `oe_article_wait`, передав полученный `article_id`.
5. Передавайте `original_article_id` только при продолжении существующей дискуссии. Для новых вопросов опускайте этот параметр, чтобы избежать влияния устаревшего контекста.
6. Рассматривайте полученные ответы исключительно как справочную информацию для исследований, а не как готовые медицинские рекомендации, диагнозы или назначения.

Полезные скрипты управления:

| Команда | Назначение |
| --- | --- |
| `npm run login` | Открывает окно браузера для авторизации на OpenEvidence и сохраняет сессию для повторного использования. |
| `npm run login:browser` | Открывает системный браузер (Chrome/Edge) для авторизации через Google SSO в случаях, когда стандартный вход Playwright блокируется системой безопасности как небезопасный. |
| `npm run smoke` | Выполняет экспресс-проверку (smoke-тест) авторизации и доступности сервиса OpenEvidence. |

## Системные требования

- Node.js 20+
- npm 10+
- Учетная запись OpenEvidence
- Операционная система macOS, Windows или Linux
- Браузер Chromium, установленный через Playwright (`npx playwright install chromium`)

## Доступность сервиса

Доступность OpenEvidence зависит от вашего географического положения, типа учетной записи и политики платформы OpenEvidence. По состоянию на май 2026 года доступ предоставляется подтвержденным медицинским работникам из США (на основе NPI-верификации) и недоступен в ЕС и Великобритании. Данный MCP-сервер не обходит эти региональные ограничения.

Полезные ссылки:

- [Официальный сайт OpenEvidence](https://www.openevidence.com/)
- [Информация об API и продуктах OpenEvidence](https://www.openevidence.com/product/api)
- [Политика конфиденциальности OpenEvidence](https://www.openevidence.com/policies/privacy)

## Быстрый старт

### macOS

```bash
git clone https://github.com/bakhtiersizhaev/openevidence-mcp.git
cd openevidence-mcp
./scripts/setup-macos.sh
npm run login
npm run smoke
```

### Ubuntu/Linux

```bash
git clone https://github.com/bakhtiersizhaev/openevidence-mcp.git
cd openevidence-mcp
./scripts/setup-ubuntu.sh
npm run login
npm run smoke
```

### Windows (PowerShell)

```powershell
git clone https://github.com/bakhtiersizhaev/openevidence-mcp.git
cd openevidence-mcp
.\scripts\setup-windows.ps1
npm run login
npm run smoke
```

## Процесс авторизации

Запустите команду:

```bash
npm run login
```

Эта команда откроет окно браузера. Войдите в свой аккаунт OpenEvidence, вернитесь в терминал и нажмите **Enter**. Скрипт проверит эндпоинт `/api/auth/me` и сохранит состояние сессии браузера локально.

Пути сохранения сессии по умолчанию:

- macOS/Linux: `~/.openevidence-mcp/auth/storage-state.json`
- Windows: `%USERPROFILE%\.openevidence-mcp\auth\storage-state.json`

Вы можете импортировать уже существующий файл состояния сессии Playwright:

```bash
npm run login -- --import /абсолютный/путь/к/storage-state.json
```

Если вход через Google блокируется с сообщением «Этот браузер или приложение могут быть небезопасными», используйте авторизацию через системный браузер:

```bash
npm run login:browser
```

Это запустит Chrome или Edge с локальным профилем OpenEvidence MCP. Выполните вход в открывшемся окне, вернитесь в консоль и нажмите **Enter**. Скрипт сохранит авторизованный профиль браузера и верифицирует сессию.

> [!CAUTION]
> Никому не передавайте файлы `storage-state.json`, файлы cookies, снимки экрана с личными данными вашего аккаунта или конфиденциальную информацию о пациентах.

## Настройка клиентов MCP

Перед подключением сервера обязательно соберите проект:

```bash
npm run build
```

### Codex

Добавьте следующий блок в файл конфигурации `~/.codex/config.toml`:

```toml
[mcp_servers.openevidence]
command = "node"
args = ["/АБСОЛЮТНЫЙ/ПУТЬ/openevidence-mcp/dist/server.js"]
startup_timeout_sec = 60
```

Пример для Windows:

```toml
[mcp_servers.openevidence]
command = "node"
args = ["C:\\Users\\<имя_пользователя>\\openevidence-mcp\\dist\\server.js"]
startup_timeout_sec = 60
```

### Claude Desktop

Добавьте следующую конфигурацию в файл `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "openevidence": {
      "command": "node",
      "args": ["/АБСОЛЮТНЫЙ/ПУТЬ/openevidence-mcp/dist/server.js"]
    }
  }
}
```

### Cursor, Cline, Continue

Используйте аналогичную структуру stdio-сервера, если ваш клиент поддерживает добавление MCP-серверов через указание команды и аргументов:

```json
{
  "command": "node",
  "args": ["/АБСОЛЮТНЫЙ/ПУТЬ/openevidence-mcp/dist/server.js"]
}
```

Готовые примеры конфигурационных файлов можно найти в папке `examples/`.

## Проверка работоспособности

Запустите экспресс-проверку (smoke-тест):

```bash
npm run smoke
```

Ожидаемый результат при успешной авторизации:

- `ok: true`
- `authenticated: true`
- скрытое превью истории запросов (для безопасности данных)

Если экспресс-проверка завершилась ошибкой авторизации, повторно выполните `npm run login`. Тест smoke требует активной сессии учетной записи OpenEvidence и не пройдет в чистой среде CI без безопасной передачи сохраненной сессии.

По умолчанию smoke-тест скрывает персональные данные и историю. Используйте ключ `npm run smoke -- --verbose` только в приватном терминале, если для отладки вам нужны сырые данные учетной записи или истории.

Команды разработчика для проверки качества кода:

```bash
npm test
npm run build
npm run check
```

## Меры безопасности

- Относитесь к файлу `storage-state.json`, файлам cookies и профилям браузера как к секретным ключам.
- Никогда не фиксируйте в коммитах (git) файлы `.env`, сессии авторизации, снимки экрана с данными аккаунта или конфиденциальную информацию о пациентах.
- Используйте сервер только со своей личной учетной записью OpenEvidence.
- Конфигурации клиентов MCP должны указывать исключительно на путь к локально собранному серверу, который вы контролируете.
- Всегда перепроверяйте вызовы инструментов со стороны автономных ИИ-агентов перед использованием ответов в реальной клинической практике или лечебных процессах.
- Подробные правила сообщения об уязвимостях и область поддержки описаны в файле `SECURITY.md`.

## Устранение неполадок

Подробные инструкции по устранению неполадок и восстановлению работоспособности приведены в документе [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md).

Типичные решения проблем:

- `authenticated: false`: повторно запустите `npm run login`.
- Google блокирует вход из-за безопасности браузера: запустите `npm run login:browser` (вход через системный профиль Chrome/Edge).
- Ошибки установки браузера: выполните команду `npx playwright install chromium`.
- Клиент MCP не может запустить сервер: убедитесь, что сборка `npm run build` прошла успешно, и проверьте абсолютный путь к файлу `dist/server.js`.
- Проблемы с путями в Windows: экранируйте обратные косые черты в JSON/TOML файлах (`\\`) или используйте прямые косые черты (`/`).
- Ошибки среды выполнения Node: проверьте, что установлена версия `node --version` не ниже 20.
- Изменился интерфейс OpenEvidence UI/API: создайте тикет (issue) в репозитории, приложив обезличенные логи без конфиденциальных данных пациентов или учетной записи.

## План развития

- Поддерживать описания инструментов компактными и адаптированными под вызовы ИИ-агентов.
- Добавлять новые тесты для парсинга ответов и конфигураций.
- Улучшать экспресс-диагностику без раскрытия деталей пользовательской сессии.
- Обновлять примеры интеграции с MCP-клиентами по мере эволюции их форматов конфигурации.

## Лицензия и указание авторства

Проект распространяется под лицензией Apache-2.0 (`LICENSE`) + `NOTICE`.

Если вы делаете форк, распространяете проект или создаете производные версии, сохраняйте указание авторства:

- Изначальный автор: Бахтиер Сижаев (Bakhtier Sizhaev)
- Оригинальный репозиторий: `https://github.com/bakhtiersizhaev/openevidence-mcp`

Рекомендуемая строка упоминания авторства:

```text
Based on OpenEvidence MCP by Bakhtier Sizhaev - https://github.com/bakhtiersizhaev/openevidence-mcp
```
