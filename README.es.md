# OpenEvidence MCP (No oficial)

**El primer servidor MCP de OpenEvidence de código abierto (publicado en febrero de 2026).** Consulte OpenEvidence desde Codex, Claude Code, Claude Desktop, Cursor, Windsurf y cualquier cliente compatible con MCP a través de su propia sesión de navegador autenticada. Sin clave de API. Instalador de un solo comando para 7 clientes MCP. Preguntas en modo fire-and-forget con sondeo (polling). Citas estructuradas con exportación a BibTeX.

[![CI](https://github.com/bakhtiersizhaev/openevidence-mcp/actions/workflows/test.yml/badge.svg)](https://github.com/bakhtiersizhaev/openevidence-mcp/actions/workflows/test.yml)
[![npm](https://img.shields.io/npm/v/openevidence-mcp)](https://www.npmjs.com/package/openevidence-mcp)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-2d72d9)](https://www.apache.org/licenses/LICENSE-2.0)
[![Node.js 20+](https://img.shields.io/badge/node-%3E%3D20-339933)](https://nodejs.org/)
[![auth](https://img.shields.io/badge/auth-your%20own%20browser%20session-8250df)](#flujo-de-inicio-de-sesión)
[![citations](https://img.shields.io/badge/citations-BibTeX%20%2B%20Crossref-b60205)](#funcionalidades)

> [!IMPORTANT]
> Este proyecto no es oficial y no está afiliado a OpenEvidence. No proporciona asesoramiento médico y solo debe utilizarse con su propia cuenta de OpenEvidence en cumplimiento con los términos aplicables, las normas de privacidad y los requisitos de gobernanza clínica.

Traducciones: [English](README.md) | [Русский](README.ru.md) | [简体中文](README.zh-Hans.md) | [繁體中文（台灣）](README.zh-Hant-TW.md) | [한국어](README.ko.md) | [हिन्दी](README.hi.md)

## Cómo funciona

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

Usted inicia sesión una sola vez en una ventana de navegador real (`npm run login:session`). Después, el servidor MCP controla un navegador local minimizado sobre ese perfil: las cookies nunca salen del navegador, no se exporta nada, no se instala ninguna extensión y no se abren puertos.

## Qué hace

- comprueba si la sesión guardada está autenticada;
- lista su historial de preguntas/artículos de OpenEvidence;
- obtiene los datos completos de un artículo por su ID;
- formula una pregunta de investigación a OpenEvidence — en modo bloqueante o **fire-and-forget** (`wait_for_completion=false`, luego sondeo);
- sondea un artículo existente de OpenEvidence hasta que se complete, con un flag `timed_out` explícito;
- extrae **citas estructuradas** de un artículo completado y exporta **BibTeX** (con enriquecimiento opcional de DOI mediante Crossref).

No se requiere ningún token oficial de la API de OpenEvidence.

## Qué NO hace

- No está afiliado, respaldado ni aprobado por OpenEvidence.
- No proporciona asesoramiento médico ni reemplaza el criterio clínico.
- No recopila credenciales ni solicita su contraseña.
- No envía el estado de la sesión de su navegador a ningún lugar excepto a OpenEvidence mediante solicitudes locales desde su máquina.
- No debe utilizarse para diagnósticos específicos de pacientes ni decisiones de tratamiento sin la revisión humana adecuada.

## A quién va dirigido

- profesionales clínicos que utilizan su propia cuenta de OpenEvidence;
- investigadores médicos que necesitan citas que puedan incorporar directamente a un gestor de referencias;
- operadores de IA que construyen flujos de trabajo de investigación basada en evidencia;
- desarrolladores de MCP que integran herramientas locales con Codex, Claude, Cursor, Cline, Continue o clientes similares.

## Integración e instalación guiada por agente

¿Utiliza Codex, Claude Code, Cursor u otro agente de programación de IA local? Deje que el agente se encargue de toda la configuración:

```text
Please install OpenEvidence MCP for me: clone https://github.com/bakhtiersizhaev/openevidence-mcp, install dependencies, run build, auto-configure this MCP server in my local client (Claude Desktop/Codex/Cursor), guide me through the one-time Edge/Chrome login using `npm run login:session`, and run `npm run smoke` to verify. Keep everything strictly local and secure.
```

Para el manual de configuración completo, paso a paso, con sus reglas, consulte **[docs/AGENT_INSTALL_PROMPT.md](docs/AGENT_INSTALL_PROMPT.md)**.

## Funcionalidades

| Herramienta | Propósito | Requiere autenticación | Efectos secundarios |
| --- | --- | --- | --- |
| `oe_auth_status` | Comprueba si la sesión de navegador de OpenEvidence guardada está autenticada. | Sí, el perfil de navegador local debe tener la sesión iniciada. | Ninguno. |
| `oe_history_list` | Lista artículos anteriores de OpenEvidence con paginación y búsqueda opcionales. Devuelve una lista con privacidad reducida a menos que se solicite explícitamente `include_raw=true`. | Sí. | Ninguno. |
| `oe_article_get` | Obtiene un artículo por su ID y devuelve campos normalizados (`status`, `is_complete`, `question`, `answer_text`, `citations`). El payload en bruto es opcional con `include_raw=true`. | Sí. | Ninguno. |
| `oe_article_wait` | Espera a que un ID de artículo existente se complete; devuelve `timed_out=true` cuando el tiempo de espera transcurre antes de la finalización. | Sí. | Ninguno. |
| `oe_ask` | Crea una pregunta de investigación en OpenEvidence y, opcionalmente, espera a que el artículo se complete. Configure `wait_for_completion=false` para el modo fire-and-forget. | Sí. | Crea una pregunta/artículo en su cuenta de OpenEvidence. |
| `oe_citations_get` | Extrae citas estructuradas de un artículo completado y devuelve JSON + BibTeX. `validate_crossref=true` enriquece las entradas con DOI mediante metadatos de Crossref. | Sí. | Ninguno. |

## Clientes probados y objetivo

| Cliente | Estado | Notas |
| --- | --- | --- |
| OpenAI Codex / Codex CLI / Aplicación Codex | Objetivo | Flujo de trabajo MCP local recomendado. |
| Claude Code | Objetivo | Flujo de trabajo con agente recomendado. |
| Claude Desktop / Aplicación Claude con soporte MCP | Objetivo | Configuración local del servidor MCP. |
| Cursor | Compatible | Flujo de trabajo en IDE compatible con MCP. |
| Cline | Compatible | Flujo de trabajo de agente en VS Code. |
| Continue | Compatible | Flujo de trabajo de asistente de IDE de código abierto. |
| Entornos VS Code / GitHub Copilot con soporte MCP | Experimental | Depende del soporte MCP local y de la configuración del cliente. |
| Hosts MCP tipo Windsurf / Zed / Replit / Sourcegraph | Experimental | Windsurf está cubierto por el instalador. |
| Gemini CLI / Entornos de agentes tipo Google Antigravity | Experimental | Antigravity está cubierto por el instalador. |

## Notas sobre el uso de herramientas para agentes

El servidor MCP incluye instrucciones integradas y un prompt llamado `openevidence_research_workflow` para clientes que exponen prompts de MCP.

Flujo de trabajo de agente recomendado:

1. Llame a `oe_auth_status` cuando el estado de autenticación sea desconocido.
2. Utilice `oe_history_list` solo cuando el usuario quiera trabajo previo de OpenEvidence o un ID de artículo.
3. Utilice `oe_article_get` cuando ya disponga de un ID de artículo.
4. Para preguntas de investigación extensas, llame a `oe_ask` con `wait_for_completion=false` y luego llame a `oe_article_wait` con el `article_id` devuelto.
5. Utilice `original_article_id` solo para una continuidad real de seguimiento. Omítalo en preguntas nuevas para evitar contexto de hilo obsoleto.
6. Llame a `oe_citations_get` cuando el usuario necesite referencias o BibTeX de un artículo completado.
7. Trate los resultados como contexto de investigación basada en evidencia, no como asesoramiento médico, diagnóstico ni órdenes clínicas.

Comandos relacionados:

| Comando | Propósito |
| --- | --- |
| `npm run login:session` | Inicio de sesión único. Abre Chrome/Edge con el perfil local de OpenEvidence MCP. |
| `npm run smoke` | Verifica la autenticación y la conectividad básica con OpenEvidence. |

## Requisitos

- Node.js 20+
- npm 10+
- Cuenta de OpenEvidence
- macOS, Windows o Linux
- Chrome, Edge o Chromium instalado en su sistema

## Nota sobre disponibilidad

La disponibilidad de OpenEvidence puede depender de la región, la elegibilidad de la cuenta y las políticas de OpenEvidence. Los materiales públicos de mayo de 2026 indican acceso centrado en profesionales sanitarios (HCP/NPI) verificados de EE. UU. y falta de disponibilidad en la UE y el Reino Unido; este proyecto no cambia esas restricciones.

Referencias útiles:

- [Página de inicio de OpenEvidence](https://www.openevidence.com/)
- [Página de producto/API de OpenEvidence](https://www.openevidence.com/product/api)
- [Política de privacidad de OpenEvidence](https://www.openevidence.com/policies/privacy)

## Inicio rápido

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

## Flujo de inicio de sesión

Inicio de sesión único:

```bash
npm run login:session
```

El comando abre Chrome o Edge con un perfil de navegador local de OpenEvidence MCP. Inicie sesión en OpenEvidence con su propia cuenta, confirme que la página normal de OpenEvidence carga correctamente, cierre esa ventana del navegador, vuelva a la terminal y pulse Enter.

Ruta predeterminada del perfil local:

- macOS/Linux: `~/.openevidence-mcp/browser-profile`
- Windows: `%USERPROFILE%\.openevidence-mcp\browser-profile`

El servidor MCP reutiliza este mismo perfil local durante la vida de su proceso. Puede iniciar un proceso de navegador local minimizado para las llamadas a OpenEvidence, pero no instala ninguna extensión, no expone ningún servicio de red público, no exporta cookies ni solicita su contraseña.

No comparta archivos del perfil de navegador, cookies, capturas de pantalla con datos privados de la cuenta ni información identificable de pacientes.

## Configuración del cliente MCP

Compile antes de registrar el servidor:

```bash
npm run build
```

### Configuración automática (recomendada)

Registre el servidor OpenEvidence MCP en su cliente mediante el instalador integrado:

| Cliente | Comando |
| --- | --- |
| Claude Desktop | `npx openevidence-mcp install --client claude-app` |
| Codex Desktop | `npx openevidence-mcp install --client codex-app` |
| Claude Code | `npx openevidence-mcp install --client claude-code` |
| Codex CLI | `npx openevidence-mcp install --client codex-cli` |
| Google Antigravity | `npx openevidence-mcp install --client antigravity` |
| Cursor | `npx openevidence-mcp install --client cursor` |
| Windsurf | `npx openevidence-mcp install --client windsurf` |

Cada cliente también tiene un atajo de npm, por ejemplo `npm run install:cursor`. Para desinstalar:

```bash
npx openevidence-mcp uninstall --client <client-id>
```

### Configuración manual

#### Codex

Añada esto a `~/.codex/config.toml`:

```toml
[mcp_servers.openevidence]
command = "node"
args = ["/ABSOLUTE/PATH/openevidence-mcp/dist/server.js"]
startup_timeout_sec = 60
```

Ejemplo para Windows:

```toml
[mcp_servers.openevidence]
command = "node"
args = ["C:\\Users\\<user>\\openevidence-mcp\\dist\\server.js"]
startup_timeout_sec = 60
```

#### Claude Desktop

Añada esto a `claude_desktop_config.json`:

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

Utilice la misma definición de servidor stdio si su cliente admite la configuración de servidores MCP mediante comando/argumentos:

```json
{
  "command": "node",
  "args": ["/ABSOLUTE/PATH/openevidence-mcp/dist/server.js"]
}
```

Hay configuraciones de ejemplo en `examples/`.

## Verificación

```bash
npm run smoke
```

Resultado esperado con una sesión válida:

- `ok: true`
- `authenticated: true`
- una vista previa ofuscada del historial

Si la prueba smoke falla con un error de autenticación, vuelva a ejecutar `npm run login:session`. La prueba smoke requiere una sesión real de una cuenta de OpenEvidence y no pasará en un entorno CI limpio a menos que haya un perfil de sesión local disponible.

Por defecto, la salida de smoke oculta el contenido de la cuenta y del historial. Utilice `npm run smoke -- --verbose` solo en una terminal privada si necesita los payloads en bruto de la cuenta/historial para depuración.

Comprobaciones para desarrolladores:

```bash
npm test
npm run build
npm run check
```

## Notas de seguridad

- Trate los perfiles de navegador y las cookies como secretos.
- No envíe al control de versiones archivos `.env`, estados de sesión, capturas de pantalla con datos de la cuenta ni información identificable de pacientes.
- Utilice únicamente su propia cuenta de OpenEvidence.
- Mantenga las configuraciones de los clientes MCP apuntando a la ruta local del servidor compilado que usted controla.
- Revise las llamadas a herramientas de los agentes autónomos antes de usar los resultados en flujos de trabajo clínicos u operativos.
- Consulte `SECURITY.md` para el reporte de vulnerabilidades y el alcance con soporte.

## Resolución de problemas

Consulte `docs/TROUBLESHOOTING.md` para ver los pasos detallados de recuperación.

Soluciones comunes:

- `authenticated: false`: vuelva a ejecutar `npm run login:session`.
- El cliente MCP no puede iniciar el servidor: confirme que `npm run build` se completó con éxito y utilice una ruta absoluta hacia `dist/server.js`.
- Problemas con rutas en Windows: escape las barras invertidas en JSON/TOML o utilice rutas absolutas completas.
- Errores de Node: confirme que `node --version` es 20 o superior.
- Cambios en la UI/API de OpenEvidence: abra un issue con registros saneados, sin datos privados de la cuenta ni de pacientes.
- `oe_ask` no encuentra el campo de pregunta o el botón de envío: puede que la UI de OpenEvidence haya cambiado; abra un issue con registros saneados, sin datos privados de la cuenta ni de pacientes.

## Hoja de ruta

- Publicar en el MCP Registry oficial (el manifiesto `server.json` está listo).
- Caché de metadatos de citas validadas mediante Crossref.
- Artefactos opcionales del artículo en disco (answer.md, citations.bib).
- Mantener los ejemplos de configuración de clientes MCP a medida que evolucionen los formatos de configuración.

## Licencia y atribuciones

Apache-2.0 (`LICENSE`) + `NOTICE`.

Este es el repositorio original de OpenEvidence MCP, publicado en febrero de 2026. Si redistribuye, bifurca (fork) o desarrolla versiones derivadas, conserve la atribución a:

- Autor original: Bakhtier Sizhaev
- Repositorio original: `https://github.com/bakhtiersizhaev/openevidence-mcp`

Línea de atribución sugerida:

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
