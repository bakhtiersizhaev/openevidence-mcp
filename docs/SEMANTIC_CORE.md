# Semantic Core

Purpose: intent map for humans, search engines, and AI agents using OpenEvidence MCP.

## What Is OpenEvidence (Semantic Definition)

OpenEvidence is a clinical evidence assistant used by physicians and medical teams to ask medical questions and review literature-backed answers.
OpenEvidence MCP is an open-source bridge that connects OpenEvidence to MCP clients.

## Core Audience

- physicians
- residents and fellows
- clinical researchers
- hospital/clinic AI enablement teams
- medical AI operators building MCP workflows

## Core Intents

- clinical question lookup with evidence-backed context
- medical follow-up continuation via `original_article_id`
- article payload extraction by `article_id`
- medical conversation history browsing
- auth validation and recovery for OpenEvidence browser sessions
- multi-client MCP setup (Codex CLI, Claude Code, OpenClaw, Cursor, Cline, Continue)

## Core Entities

- `question`
- `article_id`
- `original_article_id`
- `history`
- `status`
- `citations`
- `structured_article`
- `auth_status`

## Tool-to-Intent Mapping

- `oe_auth_status` -> auth preflight for medical workflows
- `oe_history_list` -> browse prior clinical questions
- `oe_article_get` -> retrieve full answer payload for reuse/reporting
- `oe_ask` -> ask a new medical question and optionally wait for completion

## Search Intent Clusters (EN)

- openevidence mcp
- openevidence for doctors
- medical mcp server
- openevidence codex integration
- openevidence claude integration
- openevidence cursor mcp
- evidence based medicine ai workflow
- clinical ai mcp server
- openevidence api alternative
- medical research mcp tools

## Search Intent Clusters (RU)

- openevidence mcp
- mcp сервер для врачей
- медицинский mcp сервер
- openevidence для codex
- openevidence для claude
- интеграция openevidence mcp
- ai workflow для доказательной медицины
- клинический ai через mcp
- open evidence api альтернатива
- медицинские mcp инструменты

## Search Intent Clusters (ES)

- openevidence mcp
- servidor mcp para médicos
- mcp médico open source
- integración openevidence codex
- integración openevidence claude
- openevidence cursor mcp
- flujo clínico con ia basada en evidencia
- servidor mcp para investigación médica
- alternativa api openevidence

## Search Intent Clusters (ZH)

- openevidence mcp
- 医生 医疗 mcp 服务器
- openevidence codex 集成
- openevidence claude 集成
- openevidence cursor mcp
- 循证医学 ai workflow mcp
- 临床研究 mcp 工具
- openevidence api 替代

## Search Intent Clusters (HI)

- openevidence mcp
- medical mcp server for doctors
- openevidence codex integration
- openevidence claude integration
- openevidence cursor mcp
- evidence based medicine ai workflow mcp
- clinical research mcp tools
- openevidence api alternative

## Specialty Query Clusters (EN)

- cardiology evidence assistant mcp
- endocrinology clinical workflow mcp
- oncology literature review mcp server
- emergency medicine quick evidence mcp
- differential diagnosis support mcp doctors

## Specialty Query Clusters (RU)

- кардиология доказательная медицина mcp
- эндокринология clinical workflow mcp
- онкология обзор литературы mcp сервер
- emergency medicine быстрый ответ mcp
- дифференциальная диагностика поддержка mcp

## Specialty Query Clusters (ES)

- cardiología medicina basada en evidencia mcp
- endocrinología flujo clínico mcp
- oncología revisión de literatura mcp server
- medicina de emergencia respuesta rápida mcp
- apoyo diagnóstico diferencial mcp médicos

## Specialty Query Clusters (ZH)

- 心内科 循证医学 mcp
- 内分泌 临床 workflow mcp
- 肿瘤学 文献检索 mcp server
- 急诊医学 快速证据 mcp
- 鉴别诊断 支持 mcp 医生

## Specialty Query Clusters (HI)

- cardiology evidence based medicine mcp
- endocrinology clinical workflow mcp
- oncology literature review mcp server
- emergency medicine quick evidence mcp
- differential diagnosis support mcp doctors

## MCP Client Query Variants

- codex cli mcp
- claude desktop mcp
- claude code mcp
- openclaw mcp
- cursor mcp server
- cline mcp server
- continue mcp
- ai agent medical mcp

## AI Agent & System Discovery Terms

- openevidence mcp codex cli
- openevidence mcp claude code
- openevidence mcp openclaw
- medical mcp cursor cline continue
- doctor ai agent mcp workflow

## Canonical Flows

1. preflight -> `oe_auth_status` -> ask -> poll -> fetch article
2. preflight -> history list -> pick article -> follow-up ask
3. auth failed -> login -> smoke -> retry tools
