# OpenEvidence MCP (No oficial)

OpenEvidence MCP es un servidor no oficial del protocolo Model Context Protocol (MCP) que conecta OpenEvidence con Codex, Claude Code, Claude Desktop, Cursor, Cline, Continue y otros clientes compatibles con MCP a través de su propia sesión de navegador autenticada.

[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-2d72d9)](https://www.apache.org/licenses/LICENSE-2.0)
[![Node.js 20+](https://img.shields.io/badge/node-%3E%3D20-339933)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6)](https://www.typescriptlang.org/)
[![MCP SDK](https://img.shields.io/badge/MCP%20SDK-1.26.0-1d9a5a)](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
[![Playwright](https://img.shields.io/badge/Playwright-1.58.2-4f46e5)](https://playwright.dev/)

> [!IMPORTANT]
> Este proyecto no es oficial y no está afiliado a OpenEvidence. No proporciona asesoramiento médico, no elude los controles de acceso y solo debe utilizarse con su propia cuenta de OpenEvidence en cumplimiento con los términos aplicables, las normas de privacidad y los requisitos de gobernanza clínica.

Traducciones: [English](README.md) | [Русский](README.ru.md) | [简体中文](README.zh-Hans.md) | [繁體中文（台灣）](README.zh-Hant-TW.md) | [한국어](README.ko.md) | [हिन्दी](README.hi.md)

## Integración e instalación guiada por agente

¿Utiliza Codex, Claude Code u otro agente de programación de IA local? Copie este prompt en el agente y deje que se encargue de la configuración del entorno, la integración del servidor MCP, el inicio de sesión guiado y la validación final.

```text
Look into this repository: https://github.com/bakhtiersizhaev/openevidence-mcp

Install OpenEvidence MCP in my local AI CLI / agentic MCP setup. Add it as an MCP server for the CLI or app I am using. Follow the repository README and the agent install playbook at docs/AGENT_INSTALL_PROMPT.md.

Verify local prerequisites: Node.js 20+, npm, git, and Playwright Chromium. Clone or update the repo, run npm ci, npx playwright install chromium, npm run build, and npm run check.

Configure the MCP server with command "node" and args pointing to the absolute path of dist/server.js. Keep the server local and do not expose it over a public network.

Guide me through OpenEvidence login with my own account. First try npm run login. If Google says "This browser or app may not be secure", stop that flow and run npm run login:browser instead. I will complete login in the opened browser window and then press Enter in the terminal.

Do not ask for or expose my password, cookies, tokens, storage-state files, screenshots with private account data, patient-identifiable information, or account identifiers. Do not bypass OpenEvidence, Google, institutional, regional, or account access controls.

After login, run npm run smoke. If smoke returns ok: true and authenticated: true, show me the final MCP config and tell me to restart my AI agent / MCP client so the OpenEvidence tools become available.
```

Guía completa de instalación para agentes de IA: [`docs/AGENT_INSTALL_PROMPT.md`](docs/AGENT_INSTALL_PROMPT.md).

## Qué hace

OpenEvidence MCP ejecuta un servidor MCP stdio local que permite a los clientes MCP utilizar su sesión de navegador existente en OpenEvidence para:

- Comprobar si la sesión guardada del navegador sigue autenticada.
- Listar su historial de preguntas y artículos en OpenEvidence.
- Obtener los datos completos de un artículo por su ID.
- Formular preguntas de investigación médica a OpenEvidence y, opcionalmente, esperar a que finalice la generación de la respuesta.
- Monitorear un artículo existente de OpenEvidence hasta que se complete su análisis.

No se requiere un token oficial de la API de OpenEvidence.

## Qué no hace

- No está afiliado, respaldado ni aprobado por OpenEvidence.
- No proporciona asesoramiento médico ni reemplaza el criterio clínico profesional.
- No elude la autenticación, los muros de pago (paywalls) ni los controles de acceso.
- No recopila credenciales (contraseñas).
- No envía el estado de la sesión del navegador a ningún servidor externo (todas las solicitudes se realizan localmente a través de Playwright directamente a OpenEvidence).
- No debe utilizarse para diagnósticos específicos de pacientes ni decisiones de tratamiento sin la revisión y supervisión directa de un médico humano.

## A quién va dirigido

- Profesionales clínicos y médicos que utilizan su propia cuenta de OpenEvidence.
- Investigadores y científicos del ámbito de la salud.
- Operadores e ingenieros de IA que construyen flujos de trabajo basados en medicina basada en evidencia.
- Desarrolladores de MCP que integran herramientas locales con Codex, Claude, Cursor, Cline, Continue o clientes similares.

## Clientes probados y compatibles

Este proyecto está diseñado para clientes compatibles con MCP y flujos de trabajo con agentes locales. En este repositorio solo se mantienen ejemplos de configuración para Codex y la familia de herramientas de Claude, a menos que se indique lo contrario.

| Cliente | Estado | Notas |
| --- | --- | --- |
| OpenAI Codex / Codex CLI / Aplicación Codex | Principal | Flujo de trabajo de MCP local recomendado. |
| Claude Code | Principal | Flujo de trabajo con agente de IA recomendado. |
| Claude Desktop / Aplicación Claude con soporte MCP | Principal | Configuración local del servidor MCP. |
| Cursor | Compatible | Flujo de trabajo en IDE compatible con MCP. |
| Cline | Compatible | Flujo de trabajo de agente en VS Code. |
| Continue | Compatible | Asistente de IDE de código abierto. |
| VS Code / GitHub Copilot con soporte MCP | Experimental | Depende del soporte de MCP local y la configuración del cliente. |
| Hosts MCP tipo Windsurf / Zed / Replit / Sourcegraph | Experimental | No garantizado sin pruebas previas. |
| Gemini CLI / Entornos de agentes Google Antigravity | Experimental | Objetivo de seguimiento del ecosistema; no es un ejemplo mantenido activamente. |

Otros entornos compatibles con MCP pueden funcionar, pero los ejemplos de este repositorio se centran en Codex y Claude.

## Funcionalidades y herramientas

| Herramienta | Propósito | Requiere autenticación | Efectos secundarios |
| --- | --- | --- | --- |
| `oe_auth_status` | Verifica si la sesión de navegador de OpenEvidence guardada está autenticada. | Sí, el archivo de sesión local debe existir. | Ninguno. |
| `oe_history_list` | Muestra el historial de preguntas y artículos anteriores con paginación y búsqueda opcionales. | Sí. | Ninguno. |
| `oe_article_get` | Obtiene un artículo por su ID y devuelve campos estructurados (`status`, `is_complete`, `question`, `answer_text`) además del JSON de respuesta original. | Sí. | Ninguno. |
| `oe_article_wait` | Espera a que se complete la generación de un artículo existente; útil tras una llamada asíncrona de `oe_ask`. | Sí. | Ninguno. |
| `oe_ask` | Crea una pregunta de investigación en OpenEvidence y, opcionalmente, espera a que se genere el artículo completo. | Sí. | Crea una pregunta/artículo en su cuenta personal de OpenEvidence. |

## Notas sobre el uso de herramientas para agentes de IA

El servidor MCP incluye instrucciones integradas y una plantilla de prompt predefinida llamada `openevidence_research_workflow` para clientes que exponen prompts de MCP.

Flujo de trabajo de agente recomendado:

1. Llame a `oe_auth_status` cuando no conozca el estado actual de autenticación.
2. Utilice `oe_history_list` solo si el usuario solicita investigaciones previas o requiere un ID de artículo específico.
3. Utilice `oe_article_get` si ya dispone del ID de un artículo.
4. Para preguntas de investigación extensas, llame a `oe_ask` con el parámetro `wait_for_completion=false` y luego utilice `oe_article_wait` pasándole el `article_id` devuelto.
5. Pase el parámetro `original_article_id` únicamente para dar continuidad estricta a un hilo previo. Omítalo en preguntas nuevas para evitar interferencias de contexto antiguo.
6. Trate todas las respuestas obtenidas como contexto de investigación basada en evidencia, no como asesoramiento médico, diagnósticos clínicos ni órdenes terapéuticas.

Comandos de utilidad:

| Comando | Propósito |
| --- | --- |
| `npm run login` | Abre un navegador local para iniciar sesión en OpenEvidence y guardar el estado de sesión reutilizable. |
| `npm run login:browser` | Abre el navegador del sistema (Chrome/Edge) para casos de Google SSO donde el inicio estándar de Playwright se bloquea por motivos de seguridad. |
| `npm run smoke` | Realiza una prueba de validación rápida (smoke test) de autenticación y conectividad con OpenEvidence. |

## Requisitos del sistema

- Node.js 20+
- npm 10+
- Cuenta de OpenEvidence activa
- Sistema operativo macOS, Windows o Linux
- Navegador Chromium instalado mediante Playwright (`npx playwright install chromium`)

## Nota sobre disponibilidad territorial

La disponibilidad de OpenEvidence depende de su ubicación geográfica, elegibilidad de cuenta y políticas de OpenEvidence. Los informes públicos a mayo de 2026 indican acceso limitado a profesionales sanitarios (HCP/NPI) verificados de EE. UU. y falta de disponibilidad en la UE y el Reino Unido. Este proyecto no elude tales restricciones geográficas o institucionales.

Enlaces de referencia oficiales:

- [Página de inicio de OpenEvidence](https://www.openevidence.com/)
- [Información sobre productos y API de OpenEvidence](https://www.openevidence.com/product/api)
- [Política de privacidad de OpenEvidence](https://www.openevidence.com/policies/privacy)

## Inicio rápido

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

## Flujo de inicio de sesión

Ejecute:

```bash
npm run login
```

Este comando abrirá una ventana de navegador. Inicie sesión en OpenEvidence con su cuenta, vuelva a la terminal y pulse **Enter**. El script validará el endpoint `/api/auth/me` y guardará localmente el estado de la sesión.

Rutas de estado de sesión predeterminadas:

- macOS/Linux: `~/.openevidence-mcp/auth/storage-state.json`
- Windows: `%USERPROFILE%\.openevidence-mcp\auth\storage-state.json`

Puede importar un archivo de estado de sesión de Playwright existente:

```bash
npm run login -- --import /ruta/absoluta/storage-state.json
```

Si el inicio de sesión de Google muestra que "Este navegador o aplicación puede no ser seguro", utilice el flujo con navegador del sistema:

```bash
npm run login:browser
```

Esto abrirá Chrome o Edge utilizando un perfil local para OpenEvidence MCP. Complete el inicio de sesión en dicha ventana, regrese a la consola y pulse **Enter**. El script guardará el estado de la sesión local y verificará `/api/auth/me`.

> [!CAUTION]
> No comparta archivos `storage-state.json`, archivos de cookies, capturas de pantalla con información privada de su cuenta o datos de identificación de pacientes.

## Configuración del cliente MCP

Compile el proyecto antes de registrar el servidor:

```bash
npm run build
```

### Codex

Añada esta sección a su archivo `~/.codex/config.toml`:

```toml
[mcp_servers.openevidence]
command = "node"
args = ["/RUTA/ABSOLUTA/openevidence-mcp/dist/server.js"]
startup_timeout_sec = 60
```

Ejemplo para Windows:

```toml
[mcp_servers.openevidence]
command = "node"
args = ["C:\\Users\\<usuario>\\openevidence-mcp\\dist\\server.js"]
startup_timeout_sec = 60
```

### Claude Desktop

Añada esta entrada a `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "openevidence": {
      "command": "node",
      "args": ["/RUTA/ABSOLUTA/openevidence-mcp/dist/server.js"]
    }
  }
}
```

### Cursor, Cline, Continue

Utilice la misma definición de servidor stdio si su cliente admite la adición manual mediante comando y argumentos:

```json
{
  "command": "node",
  "args": ["/RUTA/ABSOLUTA/openevidence-mcp/dist/server.js"]
}
```

Dispone de ejemplos listos para usar en la carpeta `examples/`.

## Verificación

Ejecute la prueba de validación rápida (smoke test):

```bash
npm run smoke
```

Resultado esperado con una sesión válida:

- `ok: true`
- `authenticated: true`
- una vista previa ofuscada del historial (para resguardar su privacidad)

Si la prueba de validación falla por error de autenticación, vuelva a ejecutar `npm run login`. La prueba smoke requiere una sesión de cuenta real y activa en OpenEvidence, por lo que no superará entornos CI limpios a menos que se configure una sesión de forma segura.

Por defecto, la salida oculta detalles sensibles del historial y del usuario. Use `npm run smoke -- --verbose` solo en terminales privadas si necesita el payload bruto para tareas de depuración.

Comandos útiles para validaciones de desarrollo:

```bash
npm test
npm run build
npm run check
```

## Notas de seguridad

- Trate el archivo `storage-state.json`, las cookies y los perfiles de navegador como información secreta y confidencial.
- Nunca envíe al control de versiones (git) archivos `.env`, estados de sesión activa, capturas con datos de cuenta o información de pacientes.
- Utilice el servidor exclusivamente con su cuenta personal de OpenEvidence.
- Mantenga las rutas de configuración de sus clientes MCP apuntando únicamente al servidor compilado local que usted controla.
- Revise las llamadas a herramientas sugeridas por agentes de IA autónomos antes de usar los resultados en entornos operativos o de práctica clínica.
- Consulte `SECURITY.md` para conocer el proceso de reporte de vulnerabilidades y el alcance de soporte.

## Resolución de problemas

Consulte [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) para ver los pasos detallados de diagnóstico y recuperación.

Soluciones comunes:

- `authenticated: false`: vuelva a ejecutar `npm run login`.
- Google bloquea el inicio de sesión por motivos de seguridad: ejecute `npm run login:browser` (flujo con navegador del sistema).
- Errores de instalación del navegador: ejecute `npx playwright install chromium`.
- El cliente MCP no inicia el servidor: confirme que `npm run build` se completó con éxito y valide la ruta absoluta hacia `dist/server.js`.
- Problemas con rutas en Windows: escape las barras invertidas en TOML/JSON (`\\`) o emplee barras normales (`/`).
- Errores de Node: asegúrese de que la versión de `node --version` es 20 o superior.
- Cambios en el diseño UI/API de OpenEvidence: abra un reporte de error (issue) en el repositorio con registros limpios (sin datos privados de cuenta o pacientes).

## Plan de desarrollo

- Mantener descripciones de herramientas concisas y fáciles de procesar por agentes autónomos de IA.
- Incorporar pruebas exhaustivas enfocadas en análisis de respuestas y configuración.
- Perfeccionar los diagnósticos rápidos de validación sin exponer datos de sesión.
- Actualizar los esquemas de configuración de los clientes MCP a medida que evolucionen sus formatos nativos.

## Licencia y atribuciones

Apache-2.0 (`LICENSE`) + `NOTICE`.

Si redistribuye, bifurca (fork) o desarrolla derivados del software, conserve la mención al autor original:

- Autor original: Bakhtier Sizhaev
- Repositorio de origen: `https://github.com/bakhtiersizhaev/openevidence-mcp`

Línea de atribución sugerida:

```text
Based on OpenEvidence MCP by Bakhtier Sizhaev - https://github.com/bakhtiersizhaev/openevidence-mcp
```
