# Semantic Core

Purpose: shared intent vocabulary for humans and AI agents using OpenEvidence MCP.

## Core Intents

- medical question lookup
- evidence-backed answer retrieval
- follow-up continuation by `original_article_id`
- article payload extraction
- history browsing and filtering
- auth state validation and recovery

## Core Entities

- `article_id`
- `original_article_id`
- `question`
- `history`
- `status`
- `citations`
- `structured_article`
- `auth_status`

## Tool-to-Intent Mapping

- `oe_auth_status` -> auth validation, preflight checks
- `oe_history_list` -> browse prior conversations
- `oe_article_get` -> fetch full response payload by id
- `oe_ask` -> ask a new question or create follow-up

## Search Keywords (EN)

- openevidence mcp
- openevidence automation
- medical research mcp
- evidence based ai workflow
- article polling api
- browser-session auth mcp

## Search Keywords (RU)

- openevidence mcp
- медицинский mcp сервер
- mcp для медицинских запросов
- ai агент и openevidence
- автоматизация медицинских ответов
- проверка auth через mcp

## Canonical Flows

1. preflight -> `oe_auth_status` -> ask -> poll -> fetch article
2. preflight -> history list -> pick article -> follow-up ask
3. auth failed -> login -> smoke -> retry tools

