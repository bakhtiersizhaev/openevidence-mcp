# OpenEvidence MCP (Неофициальный сервер)

**Первый open-source OpenEvidence MCP сервер (опубликован в феврале 2026).** Отправляйте запросы в OpenEvidence из Codex, Claude Code, Claude Desktop, Cursor, Windsurf и любого MCP-совместимого клиента через вашу собственную авторизованную сессию браузера. Без API-ключа. Установка в 7 MCP-клиентов одной командой. Асинхронные запросы в стиле fire-and-forget с последующим опросом статуса. Структурированные цитаты с экспортом в BibTeX.

[![CI](https://github.com/bakhtiersizhaev/openevidence-mcp/actions/workflows/test.yml/badge.svg)](https://github.com/bakhtiersizhaev/openevidence-mcp/actions/workflows/test.yml)
[![npm](https://img.shields.io/npm/v/openevidence-mcp)](https://www.npmjs.com/package/openevidence-mcp)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-2d72d9)](https://www.apache.org/licenses/LICENSE-2.0)
[![Node.js 20+](https://img.shields.io/badge/node-%3E%3D20-339933)](https://nodejs.org/)
[![auth](https://img.shields.io/badge/auth-your%20own%20browser%20session-8250df)](#процесс-авторизации)
[![citations](https://img.shields.io/badge/citations-BibTeX%20%2B%20Crossref-b60205)](#возможности-и-инструменты)

> [!IMPORTANT]
> Данный проект является неофициальным и никак не связан с OpenEvidence. Сервер не предоставляет медицинских консультаций и должен использоваться исключительно с вашей собственной учетной записью OpenEvidence в соответствии с применимыми условиями использования, правилами конфиденциальности и клиническими регламентами.

Языки: [English](README.md) | [Español](README.es.md) | [简体中文](README.zh-Hans.md) | [繁體中文（台灣）](README.zh-Hant-TW.md) | [한국어](README.ko.md) | [हिन्दी](README.hi.md)

## Как это работает

```
MCP client (Codex / Claude / Cursor / ...)
        │  stdio
        ▼
openevidence-mcp server (local Node process)
        │  Playwright on YOUR system Chrome/Edge
        ▼
dedicated local browser profile (~/.openevidence-mcp)
        │  your own logged-in OpenEvidence session
        ▼
openevidence.com
```

Вы входите в систему один раз в реальном окне браузера (`npm run login:session`). После этого MCP-сервер управляет свернутым локальным браузером на этом профиле — cookies никогда не покидают браузер, ничего не экспортируется, расширения не устанавливаются, порты не открываются.

## Что делает проект

- проверяет, авторизована ли сохраненная сессия;
- выводит список истории ваших вопросов и статей в OpenEvidence;
- загружает полные данные статьи по её идентификатору (ID);
- отправляет исследовательский вопрос в OpenEvidence — в блокирующем режиме или в стиле **fire-and-forget** (`wait_for_completion=false`, затем опрос статуса);
- отслеживает статус существующей статьи OpenEvidence до её завершения с явным флагом `timed_out`;
- извлекает **структурированные цитаты** из завершенной статьи и экспортирует **BibTeX** (опциональное обогащение DOI через Crossref).

Официальный токен API OpenEvidence не требуется.

## Чего проект НЕ делает

- Не связан с OpenEvidence, не спонсируется и не утверждается им.
- Не предоставляет медицинских консультаций и не заменяет профессиональное клиническое суждение.
- Не собирает учетные данные и не запрашивает ваш пароль.
- Не передает состояние вашей сессии браузера куда-либо, кроме OpenEvidence, через локальные запросы с вашей машины.
- Не должен использоваться для постановки диагноза конкретным пациентам или принятия решений о лечении без надлежащей проверки человеком.

## Для кого этот проект

- практикующие врачи, использующие собственную учетную запись OpenEvidence;
- медицинские исследователи, которым нужны цитаты, готовые к импорту в менеджер библиографии;
- специалисты по работе с ИИ, выстраивающие рабочие процессы доказательных исследований;
- разработчики MCP-решений, подключающие локальные инструменты к Codex, Claude, Cursor, Cline, Continue или аналогичным клиентам.

## Интеграция и установка с помощью ИИ-агента

Используете Codex, Claude Code, Cursor или другого локального ИИ-ассистента для программирования? Доверьте агенту всю настройку:

```text
Please install OpenEvidence MCP for me: clone https://github.com/bakhtiersizhaev/openevidence-mcp, install dependencies, run build, auto-configure this MCP server in my local client (Claude Desktop/Codex/Cursor), guide me through the one-time Edge/Chrome login using `npm run login:session`, and run `npm run smoke` to verify. Keep everything strictly local and secure.
```

Полное пошаговое руководство по установке и правила приведены в **[docs/AGENT_INSTALL_PROMPT.md](docs/AGENT_INSTALL_PROMPT.md)**.

## Возможности и инструменты

| Инструмент | Назначение | Требуется авторизация | Побочные эффекты |
| --- | --- | --- | --- |
| `oe_auth_status` | Проверяет, авторизована ли сохраненная сессия браузера OpenEvidence. | Да, локальный профиль браузера должен быть авторизован. | Нет. |
| `oe_history_list` | Выводит список прошлых статей OpenEvidence с возможностью пагинации и поиска. Возвращает список с сокращенными персональными данными, если явно не запрошен `include_raw=true`. | Да. | Нет. |
| `oe_article_get` | Извлекает статью по ID и возвращает нормализованные поля (`status`, `is_complete`, `question`, `answer_text`, `citations`). Исходный payload возвращается только по явному запросу `include_raw=true`. | Да. | Нет. |
| `oe_article_wait` | Ожидает завершения существующей статьи по ID; возвращает `timed_out=true`, если тайм-аут истек до завершения. | Да. | Нет. |
| `oe_ask` | Создает исследовательский вопрос в OpenEvidence и опционально ожидает завершения статьи. Укажите `wait_for_completion=false` для режима fire-and-forget. | Да. | Создает новый вопрос/статью в вашей учетной записи OpenEvidence. |
| `oe_citations_get` | Извлекает структурированные цитаты из завершенной статьи и возвращает JSON + BibTeX. `validate_crossref=true` обогащает записи с DOI метаданными Crossref. | Да. | Нет. |

## Протестированные и целевые клиенты

| Клиент | Статус | Примечания |
| --- | --- | --- |
| OpenAI Codex / Codex CLI / Приложение Codex | Целевой | Рекомендуемый локальный рабочий процесс MCP. |
| Claude Code | Целевой | Рекомендуемый рабочий процесс с ИИ-агентом. |
| Claude Desktop / Приложение Claude с поддержкой MCP | Целевой | Локальная конфигурация MCP-сервера. |
| Cursor | Совместим | Интеграция MCP в среду разработки (IDE). |
| Cline | Совместим | Сценарий агента в среде VS Code. |
| Continue | Совместим | Открытый ассистент для IDE. |
| Окружения VS Code / GitHub Copilot с поддержкой MCP | Экспериментально | Зависит от локальной поддержки MCP и настроек клиента. |
| Хосты MCP типа Windsurf / Zed / Replit / Sourcegraph | Экспериментально | Windsurf поддерживается встроенным установщиком. |
| Gemini CLI / Агентные окружения типа Google Antigravity | Экспериментально | Antigravity поддерживается встроенным установщиком. |

## Рекомендации по вызову инструментов для ИИ-агентов

MCP-сервер содержит встроенные инструкции и готовый шаблон запроса (prompt) под названием `openevidence_research_workflow` для клиентов, поддерживающих MCP-промпты.

Рекомендуемый сценарий работы агента:

1. Вызовите `oe_auth_status`, если текущий статус авторизации неизвестен.
2. Используйте `oe_history_list` только тогда, когда пользователю нужны прошлые исследования в OpenEvidence или ID статьи.
3. Используйте `oe_article_get`, если у вас уже есть ID статьи.
4. Для длительных исследовательских вопросов вызывайте `oe_ask` с параметром `wait_for_completion=false`, а затем вызывайте `oe_article_wait` с полученным `article_id`.
5. Передавайте `original_article_id` только при действительном продолжении существующей дискуссии. Для новых вопросов опускайте этот параметр, чтобы избежать влияния устаревшего контекста.
6. Вызывайте `oe_citations_get`, когда пользователю нужны источники или BibTeX из завершенной статьи.
7. Рассматривайте полученные ответы исключительно как справочную информацию для исследований, а не как медицинские рекомендации, диагнозы или клинические назначения.

Связанные команды:

| Команда | Назначение |
| --- | --- |
| `npm run login:session` | Одноразовая авторизация. Открывает Chrome/Edge с локальным профилем OpenEvidence MCP. |
| `npm run smoke` | Проверяет авторизацию и базовую доступность OpenEvidence. |

## Системные требования

- Node.js 20+
- npm 10+
- Учетная запись OpenEvidence
- Операционная система macOS, Windows или Linux
- Установленный в системе браузер Chrome, Edge или Chromium

## Доступность сервиса

Доступность OpenEvidence может зависеть от региона, статуса учетной записи и политики платформы OpenEvidence. Согласно публичным материалам за май 2026 года, доступ предоставляется подтвержденным медицинским работникам из США (на основе NPI-верификации) и недоступен в ЕС и Великобритании; данный проект не изменяет эти ограничения.

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
npm run login:session
npm run smoke
```

### Ubuntu/Linux

```bash
git clone https://github.com/bakhtiersizhaev/openevidence-mcp.git
cd openevidence-mcp
./scripts/setup-ubuntu.sh
npm run login:session
npm run smoke
```

### Windows PowerShell

```powershell
git clone https://github.com/bakhtiersizhaev/openevidence-mcp.git
cd openevidence-mcp
.\scripts\setup-windows.ps1
npm run login:session
npm run smoke
```

## Процесс авторизации

Одноразовая авторизация:

```bash
npm run login:session
```

Команда откроет Chrome или Edge с локальным профилем браузера OpenEvidence MCP. Войдите в OpenEvidence под своей учетной записью, убедитесь, что обычная страница OpenEvidence загрузилась, закройте окно браузера, вернитесь в терминал и нажмите **Enter**.

Путь к локальному профилю по умолчанию:

- macOS/Linux: `~/.openevidence-mcp/browser-profile`
- Windows: `%USERPROFILE%\.openevidence-mcp\browser-profile`

MCP-сервер переиспользует этот же локальный профиль на протяжении работы своего процесса. Он может запускать свернутый локальный процесс браузера для обращений к OpenEvidence, но не устанавливает расширения, не открывает публичный сетевой сервис, не экспортирует cookies и не запрашивает ваш пароль.

Никому не передавайте файлы профиля браузера, cookies, снимки экрана с личными данными аккаунта или конфиденциальную информацию о пациентах.

## Настройка клиентов MCP

Перед регистрацией сервера соберите проект:

```bash
npm run build
```

### Автоматическая настройка (рекомендуется)

Зарегистрируйте OpenEvidence MCP сервер в вашем клиенте с помощью встроенного установщика:

| Клиент | Команда |
| --- | --- |
| Claude Desktop | `npx openevidence-mcp install --client claude-app` |
| Codex Desktop | `npx openevidence-mcp install --client codex-app` |
| Claude Code | `npx openevidence-mcp install --client claude-code` |
| Codex CLI | `npx openevidence-mcp install --client codex-cli` |
| Google Antigravity | `npx openevidence-mcp install --client antigravity` |
| Cursor | `npx openevidence-mcp install --client cursor` |
| Windsurf | `npx openevidence-mcp install --client windsurf` |

Для каждого клиента также есть npm-ярлык, например `npm run install:cursor`. Для удаления:

```bash
npx openevidence-mcp uninstall --client <client-id>
```

### Ручная настройка

#### Codex

Добавьте следующий блок в файл `~/.codex/config.toml`:

```toml
[mcp_servers.openevidence]
command = "node"
args = ["/ABSOLUTE/PATH/openevidence-mcp/dist/server.js"]
startup_timeout_sec = 60
```

Пример для Windows:

```toml
[mcp_servers.openevidence]
command = "node"
args = ["C:\\Users\\<user>\\openevidence-mcp\\dist\\server.js"]
startup_timeout_sec = 60
```

#### Claude Desktop

Добавьте следующую конфигурацию в файл `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "openevidence": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/openevidence-mcp/dist/server.js"]
    }
  }
}
```

#### Cursor, Cline, Continue

Используйте аналогичную структуру stdio-сервера, если ваш клиент поддерживает конфигурацию MCP-сервера через указание команды и аргументов:

```json
{
  "command": "node",
  "args": ["/ABSOLUTE/PATH/openevidence-mcp/dist/server.js"]
}
```

Готовые примеры конфигурационных файлов находятся в папке `examples/`.

## Проверка работоспособности

```bash
npm run smoke
```

Ожидаемый результат при действующей сессии:

- `ok: true`
- `authenticated: true`
- превью истории со скрытыми персональными данными

Если проверка завершилась ошибкой авторизации, повторно выполните `npm run login:session`. Smoke-тест требует реальной сессии учетной записи OpenEvidence и не пройдет в чистой среде CI без доступного локального профиля сессии.

По умолчанию вывод smoke-теста скрывает данные учетной записи и истории. Используйте `npm run smoke -- --verbose` только в приватном терминале, если для отладки нужны сырые данные учетной записи или истории.

Команды разработчика для проверки:

```bash
npm test
npm run build
npm run check
```

## Меры безопасности

- Относитесь к профилям браузера и cookies как к секретным данным.
- Не фиксируйте в коммитах файлы `.env`, состояние сессии, снимки экрана с данными аккаунта или конфиденциальную информацию о пациентах.
- Используйте только свою собственную учетную запись OpenEvidence.
- Конфигурации клиентов MCP должны указывать на локально собранный путь сервера, который вы контролируете.
- Проверяйте вызовы инструментов со стороны автономных ИИ-агентов перед использованием результатов в клинических или операционных рабочих процессах.
- Подробности о сообщении об уязвимостях и области поддержки приведены в `SECURITY.md`.

## Устранение неполадок

Подробные шаги по восстановлению работоспособности приведены в `docs/TROUBLESHOOTING.md`.

Типичные решения проблем:

- `authenticated: false`: повторно запустите `npm run login:session`.
- Клиент MCP не может запустить сервер: убедитесь, что сборка `npm run build` прошла успешно, и используйте абсолютный путь к `dist/server.js`.
- Проблемы с путями в Windows: экранируйте обратные косые черты в JSON/TOML или используйте полные абсолютные пути.
- Ошибки Node: проверьте, что `node --version` возвращает версию 20 или новее.
- Изменился интерфейс OpenEvidence UI/API: создайте тикет (issue) с обезличенными логами без конфиденциальных данных учетной записи или пациентов.
- `oe_ask` не может найти поле ввода вопроса или кнопку отправки: интерфейс OpenEvidence мог измениться; создайте тикет (issue) с обезличенными логами без конфиденциальных данных учетной записи или пациентов.

## План развития

- Публикация в официальном MCP Registry (манифест `server.json` уже готов).
- Кэширование метаданных цитат, валидированных через Crossref.
- Опциональные артефакты статей на диске (answer.md, citations.bib).
- Обновление примеров настройки MCP-клиентов по мере эволюции их форматов конфигурации.

## Лицензия и указание авторства

Apache-2.0 (`LICENSE`) + `NOTICE`.

Это оригинальный репозиторий OpenEvidence MCP, опубликованный в феврале 2026 года. Если вы распространяете проект, делаете форк или создаете производные версии, сохраняйте указание авторства:

- Изначальный автор: Бахтиер Сижаев (Bakhtier Sizhaev)
- Оригинальный репозиторий: `https://github.com/bakhtiersizhaev/openevidence-mcp`

Рекомендуемая строка упоминания авторства:

```text
Based on OpenEvidence MCP by Bakhtier Sizhaev - https://github.com/bakhtiersizhaev/openevidence-mcp
```

## Star History

<a href="https://star-history.com/#bakhtiersizhaev/openevidence-mcp&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=bakhtiersizhaev/openevidence-mcp&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=bakhtiersizhaev/openevidence-mcp&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=bakhtiersizhaev/openevidence-mcp&type=Date" />
  </picture>
</a>
