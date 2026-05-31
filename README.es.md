# OpenEvidence MCP (no oficial)

OpenEvidence MCP es un servidor MCP no oficial que conecta OpenEvidence con Codex, Claude Code, Claude Desktop, Cursor, Cline, Continue y otros clientes MCP mediante tu propia sesión autenticada del navegador.

> [!IMPORTANT]
> Este proyecto no está afiliado a OpenEvidence, no ofrece consejo médico, no evita controles de acceso y debe usarse solo con tu propia cuenta de OpenEvidence.

README canónico: [English](README.md)

## Qué hace

- comprueba si la sesión guardada de OpenEvidence sigue autenticada;
- lista tu historial de preguntas/artículos;
- obtiene un artículo por ID;
- envía una pregunta de investigación a OpenEvidence y puede esperar el resultado.

No requiere un token oficial de la API de OpenEvidence.

## Qué no hace

- no es un producto oficial de OpenEvidence;
- no sustituye criterio clínico ni consejo médico;
- no recopila credenciales;
- no evita autenticación, paywalls ni controles de acceso;
- no debe usarse para diagnóstico específico de pacientes sin revisión humana.

## Clientes MCP

| Cliente | Estado | Notas |
| --- | --- | --- |
| OpenAI Codex / Codex CLI / Codex app | Target | Flujo MCP local recomendado. |
| Claude Code | Target | Flujo de agente recomendado. |
| Claude Desktop / Claude app with MCP support | Target | Configuración local de servidor MCP. |
| Cursor | Compatible | Flujo IDE compatible con MCP. |
| Cline | Compatible | Flujo de agente en VS Code. |
| Continue | Compatible | Asistente IDE open-source. |
| VS Code / GitHub Copilot environments with MCP support | Experimental | Depende del soporte MCP local y la configuración del cliente. |
| Windsurf / Zed / Replit / Sourcegraph-style MCP hosts | Experimental | No garantizado sin pruebas. |
| Gemini CLI / Google Antigravity-style agent environments | Experimental | Ecosistema/watchlist, no ejemplo mantenido. |

## Disponibilidad de OpenEvidence

La disponibilidad de OpenEvidence puede depender de región, elegibilidad de cuenta y política de OpenEvidence. Materiales públicos de mayo de 2026 indican acceso centrado en HCP/NPI verificados de EE. UU. y no disponibilidad en EU/U.K.; este proyecto no evita esas restricciones.

## Inicio rápido

```bash
git clone https://github.com/bakhtiersizhaev/openevidence-mcp.git
cd openevidence-mcp
npm ci
npx playwright install chromium
npm run build
npm run login:session
npm run smoke
```

El perfil local del navegador se guarda en tu máquina. No publiques browser profile files, `storage-state.json`, cookies, capturas con datos privados de cuenta o información identificable de pacientes.

## Configuración Codex

```toml
[mcp_servers.openevidence]
command = "node"
args = ["/ABSOLUTE/PATH/openevidence-mcp/dist/server.js"]
startup_timeout_sec = 60
```

## Verificación

`npm run smoke` debe devolver `ok: true` y `authenticated: true` si existe una sesión válida de OpenEvidence.

Licencia: Apache-2.0 + NOTICE.
