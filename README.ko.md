# OpenEvidence MCP (비공식)

OpenEvidence MCP는 사용자의 인증된 브라우저 세션을 통해 OpenEvidence를 Codex, Claude Code, Claude Desktop, Cursor, Cline, Continue 및 기타 MCP 클라이언트에 연결하는 비공식 MCP 서버입니다.

> [!IMPORTANT]
> 이 프로젝트는 OpenEvidence와 제휴되어 있지 않습니다. 의료 조언을 제공하지 않으며, 접근 제어를 우회하지 않습니다. 사용자는 본인의 OpenEvidence 계정으로만 사용해야 합니다.

Canonical README: [English](README.md)

## 기능

- 저장된 OpenEvidence 세션이 인증되어 있는지 확인합니다.
- 질문/아티클 기록을 조회합니다.
- 아티클 ID로 전체 payload를 가져옵니다.
- OpenEvidence research question을 제출하고, 선택적으로 완료될 때까지 기다립니다.

공식 OpenEvidence API token은 필요하지 않습니다.

## 하지 않는 것

- OpenEvidence의 공식 제품이 아닙니다.
- 임상 판단이나 의료 조언을 대체하지 않습니다.
- credentials를 수집하지 않습니다.
- authentication, paywalls 또는 access controls를 우회하지 않습니다.
- 인간 검토 없이 patient-specific diagnosis에 사용해서는 안 됩니다.

## MCP 클라이언트

| Client | Status | Notes |
| --- | --- | --- |
| OpenAI Codex / Codex CLI / Codex app | Target | 권장되는 local MCP workflow. |
| Claude Code | Target | 권장되는 agent workflow. |
| Claude Desktop / Claude app with MCP support | Target | Local MCP server configuration. |
| Cursor | Compatible | MCP-compatible IDE workflow. |
| Cline | Compatible | VS Code agent workflow. |
| Continue | Compatible | Open-source IDE assistant workflow. |
| VS Code / GitHub Copilot environments with MCP support | Experimental | Local MCP support 및 client configuration에 따라 달라집니다. |
| Windsurf / Zed / Replit / Sourcegraph-style MCP hosts | Experimental | 테스트되지 않은 환경은 보장되지 않습니다. |
| Gemini CLI / Google Antigravity-style agent environments | Experimental | Ecosystem/watchlist이며 maintained example은 아닙니다. |

## OpenEvidence availability

OpenEvidence availability는 지역, 계정 자격 및 OpenEvidence 정책에 따라 달라질 수 있습니다. 2026년 5월 공개 자료는 verified U.S. HCP/NPI-centered access와 EU/U.K. unavailability를 보여줍니다. 이 프로젝트는 그러한 제한을 우회하지 않습니다.

## Quick Start

```bash
git clone https://github.com/bakhtiersizhaev/openevidence-mcp.git
cd openevidence-mcp
npm ci
npx playwright install chromium
npm run build
npm run login
npm run smoke
```

Session state는 로컬에 저장됩니다. `storage-state.json`, cookies, private account data가 포함된 screenshots 또는 patient-identifiable information을 공개하지 마세요.

## Codex config

```toml
[mcp_servers.openevidence]
command = "node"
args = ["/ABSOLUTE/PATH/openevidence-mcp/dist/server.js"]
startup_timeout_sec = 60
```

## Verify

유효한 OpenEvidence session이 있으면 `npm run smoke`는 `ok: true` 및 `authenticated: true`를 반환해야 합니다.

License: Apache-2.0 + NOTICE.
