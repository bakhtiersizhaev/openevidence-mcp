# OpenEvidence MCP (비공식)

OpenEvidence MCP는 사용자의 인증된 브라우저 세션을 통해 OpenEvidence를 Codex, Claude Code, Claude Desktop, Cursor, Cline, Continue 및 기타 MCP 호환 클라이언트에 연결하는 비공식 Model Context Protocol (MCP) 서버입니다.

[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-2d72d9)](https://www.apache.org/licenses/LICENSE-2.0)
[![Node.js 20+](https://img.shields.io/badge/node-%3E%3D20-339933)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6)](https://www.typescriptlang.org/)
[![MCP SDK](https://img.shields.io/badge/MCP%20SDK-1.26.0-1d9a5a)](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
[![Playwright](https://img.shields.io/badge/Playwright-1.58.2-4f46e5)](https://playwright.dev/)

> [!IMPORTANT]
> 이 프로젝트는 비공식이며 OpenEvidence와 제휴되어 있지 않습니다. 의료 조언을 제공하지 않으며, 접근 제어를 우회하지 않습니다. 관련 이용 약관, 개인정보 보호 규칙 및 임상 거버넌스(clinical governance) 요구 사항을 준수하여 본인의 OpenEvidence 계정으로만 사용해야 합니다.

언어 버전 (Translations): [English](README.md) | [Русский](README.ru.md) | [Español](README.es.md) | [简体中文](README.zh-Hans.md) | [繁體中文 (台灣)](README.zh-Hant-TW.md) | [हिन्दी](README.hi.md)

## 에이전트 자동 설치 프롬프트 (Copy/Paste Agent Install Prompt)

Codex, Claude Code 또는 기타 로컬 AI 코딩 에이전트(Agent)를 사용 중이신가요? 아래 프롬프트를 복사하여 에이전트에 보내면 환경 구축, MCP 설정, 로그인 안내 및 기능 검증을 자동으로 처리하도록 할 수 있습니다.

```text
Look into this repository: https://github.com/bakhtiersizhaev/openevidence-mcp

Install OpenEvidence MCP in my local AI CLI / agentic MCP setup. Add it as an MCP server for the CLI or app I am using. Follow the repository README and the agent install playbook at docs/AGENT_INSTALL_PROMPT.md.

Verify local prerequisites: Node.js 20+, npm, git, and Playwright Chromium. Clone or update the repo, run npm ci, npx playwright install chromium, npm run build, and npm run check.

Configure the MCP server with command "node" and args pointing to the absolute path of dist/server.js. Keep the server local and do not expose it over a public network.

Guide me through OpenEvidence login with my own account. First try npm run login. If Google says "This browser or app may not be secure", stop that flow and run npm run login:browser instead. I will complete login in the opened browser window and then press Enter in the terminal.

Do not ask for or expose my password, cookies, tokens, storage-state files, screenshots with private account data, patient-identifiable information, or account identifiers. Do not bypass OpenEvidence, Google, institutional, regional, or account access controls.

After login, run npm run smoke. If smoke returns ok: true and authenticated: true, show me the final MCP config and tell me to restart my AI agent / MCP client so the OpenEvidence tools become available.
```

더 자세한 에이전트 실행 가이드: [`docs/AGENT_INSTALL_PROMPT.md`](docs/AGENT_INSTALL_PROMPT.md).

## 주요 기능 (What it does)

OpenEvidence MCP는 로컬 stdio MCP 서버를 구동하여, MCP 클라이언트가 사용자의 기존 OpenEvidence 브라우저 세션을 사용하여 다음 작업을 수행할 수 있도록 합니다.

- 저장된 세션이 인증(로그인)되어 있는지 확인합니다.
- OpenEvidence 질문/아티클 기록 목록을 조회합니다.
- 아티클 ID로 전체 아티클 데이터(payload)를 가져옵니다.
- OpenEvidence 연구 질문을 요청하고, 선택적으로 완료될 때까지 기다립니다.
- 기존 OpenEvidence 아티클의 생성이 완료될 때까지 주기적으로 상태를 확인(polling)합니다.

공식 OpenEvidence API 토큰은 필요하지 않습니다.

## 제한 사항 및 안전 원칙 (What it does NOT do)

- OpenEvidence와 제휴되거나 공식 승인 및 보증을 받은 제품이 아닙니다.
- 의료 조언을 제공하지 않으며 의사의 임상적 판단을 대체하지 않습니다.
- 로그인 자격 증명(비밀번호 등)을 절대 수집하지 않습니다.
- 인증 절차, 결제 장벽(paywalls) 또는 접근 제어를 우회하지 않습니다.
- 브라우저 세션 상태(Session state)를 로컬 Playwright 요청을 통한 OpenEvidence와의 직접 인터랙션 외에 외부로 전송하지 않습니다.
- 적절한 의료 전문가의 검토 없이 환자 특정적 진단(patient-specific diagnosis)이나 치료 결정에 직접 사용해서는 안 됩니다.

## 사용 대상 (Who it is for)

- 본인의 OpenEvidence 계정을 보유한 임상 의사
- 의학 연구원
- 의학 근거 검색 AI 워크플로우를 구축하려는 AI 운영자
- 로컬 도구를 Codex, Claude, Cursor, Cline, Continue 또는 유사 클라이언트와 연동하려는 MCP 개발자

## 대상 및 테스트 완료된 클라이언트 (Tested / Target Clients)

이 프로젝트는 MCP 호환 클라이언트 및 로컬 에이전트 워크플로우를 위해 설계되었습니다. 별도의 명시가 없는 한, 이 저장소는 Codex 및 Claude 스타일의 로컬 MCP 설정 예시만 유지 관리합니다.

| 클라이언트 | 상태 | 비고 |
| --- | --- | --- |
| OpenAI Codex / Codex CLI / Codex 앱 | 대상 클라이언트 | 권장되는 로컬 MCP 워크플로우. |
| Claude Code | 대상 클라이언트 | 권장되는 에이전트(Agent) 워크플로우. |
| Claude Desktop / MCP 지원 Claude 앱 | 대상 클라이언트 | 로컬 MCP 서버 설정. |
| Cursor | 호환됨 | MCP 호환 IDE 워크플로우. |
| Cline | 호환됨 | VS Code 에이전트 워크플로우. |
| Continue | 호환됨 | 오픈소스 IDE 어시스턴트 워크플로우. |
| MCP를 지원하는 VS Code / GitHub Copilot 환경 | 실험적 지원 | 로컬 MCP 지원 및 클라이언트 설정에 따라 달라집니다. |
| Windsurf / Zed / Replit / Sourcegraph 스타일 MCP 호스트 | 실험적 지원 | 테스트되지 않은 환경은 가용성이 보장되지 않습니다. |
| Gemini CLI / Google Antigravity 스타일 에이전트 환경 | 실험적 지원 | 생태계 관심 목록 대상이며 지속 관리되는 예시는 아닙니다. |

## 도구 및 기능 상세 (Features)

| 도구명 | 용도 | 로그인 인증 필요 여부 | 사이드 이펙트 |
| --- | --- | --- | --- |
| `oe_auth_status` | 저장된 OpenEvidence 브라우저 세션의 로그인 상태를 확인합니다. | 예 (저장된 세션 파일이 존재해야 함) | 없음. |
| `oe_history_list` | 기존 OpenEvidence 아티클/질문 기록을 페이지네이션 및 검색 옵션과 함께 나열합니다. | 예 | 없음. |
| `oe_article_get` | ID로 아티클을 가져오고 정규화된 필드(상태, 완료 여부, 질문, 답변 텍스트)와 원본 데이터를 반환합니다. | 예 | 없음. |
| `oe_article_wait` | 기존 아티클 ID의 생성이 완료될 때까지 대기합니다. 비차단 `oe_ask` 이후 활용하기 좋습니다. | 예 | 없음. |
| `oe_ask` | OpenEvidence 연구 질문을 등록하고 선택적으로 아티클 생성이 완료될 때까지 기다립니다. | 예 | 사용자의 OpenEvidence 계정에 질문/아티클이 새로 생성됩니다. |

## 에이전트 도구 호출 참고 사항 (Agent Tool-Calling Notes)

이 MCP 서버는 MCP 프롬프트를 공개하는 클라이언트를 위해 내장된 가이드라인과 `openevidence_research_workflow`라는 이름의 프롬프트 템플릿을 포함하고 있습니다.

권장 에이전트 워크플로우:

1. 로그인 상태를 알 수 없을 때는 먼저 `oe_auth_status`를 호출합니다.
2. 사용자가 이전의 연구 이력이나 특정 아티클 ID를 필요로 할 때만 `oe_history_list`를 사용합니다.
3. 이미 아티클 ID를 확보한 경우에는 `oe_article_get`을 직접 호출합니다.
4. 처리 시간이 긴 연구 질문의 경우, `wait_for_completion=false` 옵션으로 `oe_ask`를 호출한 후 반환된 `article_id`를 사용하여 `oe_article_wait`를 호출합니다.
5. 후속 연속 질의인 경우에만 `original_article_id`를 사용하고, 완전히 새로운 질문의 경우에는 오래된 컨텍스트 누적을 방지하기 위해 생략합니다.
6. 모든 출력 정보는 어디까지나 의료 근거 검색 컨텍스트이며, 전문적인 의료 조언, 진단 또는 처방이 아님을 명심하십시오.

관련 스크립트 명령 요약:

| 명령어 | 용도 |
| --- | --- |
| `npm run login` | 재사용 가능한 브라우저 세션 상태를 생성하고 저장하기 위해 로컬 브라우저 창을 엽니다. |
| `npm run login:browser` | Google SSO 로그인 시 Playwright가 브라우저 보안 이슈로 차단될 경우, 시스템의 실제 크롬/엣지 브라우저를 통해 로그인을 진행합니다. |
| `npm run smoke` | 로그인 인증 상태 및 기본적인 OpenEvidence 서버 연동을 검증합니다. |

## 실행 환경 요구 사항 (Requirements)

- Node.js 20+
- npm 10+
- OpenEvidence 계정
- macOS, Windows 또는 Linux
- Playwright를 통해 설치된 Chromium 브라우저 (`npx playwright install chromium`)

## OpenEvidence 서비스 가용성 참고 (Availability Note)

OpenEvidence의 이용 가능 여부는 국가/지역, 계정의 자격 요건 및 OpenEvidence 자체 정책에 따라 달라질 수 있습니다. 2026년 5월 기준 공개 자료에 따르면, 해당 서비스는 미국 의료 전문의(HCP/NPI) 인증을 통과한 계정 중심으로 접근이 허용되며 EU 및 영국(U.K.) 지역에서는 접근할 수 없습니다. 이 프로젝트는 지역, 계정 또는 정책 제한을 우회하지 않습니다.

유용한 참고 링크:

- [OpenEvidence 공식 홈페이지](https://www.openevidence.com/)
- [OpenEvidence API/제품 정보 페이지](https://www.openevidence.com/product/api)
- [OpenEvidence 개인정보 처리방침](https://www.openevidence.com/policies/privacy)

## 빠른 시작 (Quick Start)

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

### Windows PowerShell

```powershell
git clone https://github.com/bakhtiersizhaev/openevidence-mcp.git
cd openevidence-mcp
.\scripts\setup-windows.ps1
npm run login
npm run smoke
```

## 로그인 워크플로우 (Login Flow)

다음 명령을 실행합니다:

```bash
npm run login
```

이 명령은 새로운 브라우저 창을 엽니다. 본인의 OpenEvidence 계정으로 로그인한 뒤, 터미널로 돌아와 Enter 키를 누르십시오. 로그인 스크립트가 `/api/auth/me`를 검증하고 로컬 세션 상태를 저장합니다.

기본 세션 파일 저장 경로:

- macOS/Linux: `~/.openevidence-mcp/auth/storage-state.json`
- Windows: `%USERPROFILE%\.openevidence-mcp\auth\storage-state.json`

기존의 Playwright 저장 상태 파일을 직접 가져올 수도 있습니다:

```bash
npm run login -- --import /절대경로/storage-state.json
```

만약 Google 로그인을 시도할 때 보안 수준이 낮거나 안전하지 않은 브라우저/앱이라는 메시지가 표시되면 시스템 브라우저 로그인 워크플로우를 사용하십시오:

```bash
npm run login:browser
```

이 명령은 로컬 OpenEvidence MCP 프로필이 적용된 상태로 시스템 크롬(Chrome) 또는 엣지(Edge) 브라우저를 엽니다. 해당 브라우저에서 로그인을 완료하고 터미널로 돌아와 Enter 키를 누르면, 스크립트가 자동으로 로컬 세션 상태를 저장하고 `/api/auth/me`를 통한 통신을 확인합니다.

> [!WARNING]
> 브라우저 세션 상태(Session state)는 온전히 사용자의 로컬 컴퓨터에만 안전하게 저장됩니다. **절대로** `storage-state.json` 파일, 쿠키, 민감한 개인 정보가 표시된 스크린샷, 환자 개인 식별 정보(patient-identifiable information) 등을 공개적으로 공유하거나 커밋하지 마십시오.

## MCP 클라이언트 설정 (MCP Client Setup)

서버를 등록하기 전에 먼저 프로젝트를 빌드해야 합니다.

```bash
npm run build
```

### Codex

`~/.codex/config.toml` 파일에 다음 내용을 추가합니다.

```toml
[mcp_servers.openevidence]
command = "node"
args = ["/절대경로/openevidence-mcp/dist/server.js"]
startup_timeout_sec = 60
```

Windows 설정 예시:

```toml
[mcp_servers.openevidence]
command = "node"
args = ["C:\\Users\\<사용자명>\\openevidence-mcp\\dist\\server.js"]
startup_timeout_sec = 60
```

### Claude Desktop

`claude_desktop_config.json` 파일에 다음 내용을 추가합니다.

```json
{
  "mcpServers": {
    "openevidence": {
      "command": "node",
      "args": ["/절대경로/openevidence-mcp/dist/server.js"]
    }
  }
}
```

### Cursor, Cline, Continue

사용하는 클라이언트가 stdio 방식의 MCP 서버 명령/인자 구성을 지원하는 경우 동일한 형식을 사용합니다.

```json
{
  "command": "node",
  "args": ["/절대경로/openevidence-mcp/dist/server.js"]
}
```

다양한 클라이언트 설정 예제는 `examples/` 디렉토리에서 확인할 수 있습니다.

## 검증 및 테스트 (Verify)

스모크 테스트 (기본 기능 검증) 실행:

```bash
npm run smoke
```

세션이 유효할 경우 정상적인 예상 반환값은 다음과 같습니다:
- `ok: true`
- `authenticated: true`
- 개인정보가 비식별 처리(redacted)된 간단한 질문 기록 정보

만약 스모크 테스트가 인증 오류로 인해 실패한다면 `npm run login`을 다시 수행해 주십시오. 스모크 테스트는 실제 활성화된 OpenEvidence 계정 세션 세이트를 기반으로 작동하기 때문에 깨끗한 CI 환경에서는 통과하지 못합니다.

기본적으로 스모크 테스트 결과 정보 중 민감한 계정 및 이력 데이터는 비식별화(redact) 처리되어 표시됩니다. 디버깅 등을 위해 원본 통신 페이로드를 직접 확인해야 하는 경우에만 로컬 프라이빗 터미널에서 `npm run smoke -- --verbose` 명령어를 활용하십시오.

개발자 편의 확인 명령어:

```bash
npm test          # 단위 테스트 실행
npm run build     # 프로젝트 빌드
npm run check     # TypeScript 타입 및 코드 규칙 체크
```

## 보안 및 안전 주의 사항 (Security Notes)

- `storage-state.json` 파일, 쿠키 및 연동된 브라우저 프로필은 **보안이 요구되는 민감한 정보(Secrets)**로 취급하십시오.
- `.env` 설정 파일, 로컬 세션 상태 정보, 민감한 개인 계정 화면 스크린샷, 환자 개인 식별 정보(patient-identifiable information)는 절대 깃(Git) 저장소에 커밋하거나 공유하지 마십시오.
- 오직 본인이 합법적으로 보유한 OpenEvidence 계정으로만 사용해야 합니다.
- MCP 클라이언트 설정에서 대상 파일의 경로가 실제 로컬에 빌드된 `dist/server.js` 파일의 올바른 절대 경로를 가리키는지 확인하십시오.
- 자율 에이전트(Autonomous Agents)가 수행하는 도구 호출 출력물을 임상 진료나 현업 워크플로우에 직접 도입하기 전에는 반드시 인간 전문가의 상호 검토 및 확인 과정을 거치시기 바랍니다.
- 취약점 제보 및 상세 보안 정책 범위는 `SECURITY.md`를 참고하십시오.

## 문제 해결 및 디버깅 (Troubleshooting)

이용 중 발생한 연동 문제 등은 `docs/TROUBLESHOOTING.md` 문서를 통해 상세한 복구 단계를 확인할 수 있습니다.

가장 대표적인 자가 조치 조치 사항:
- `authenticated: false` 표시됨: `npm run login`을 다시 실행해 세션을 갱신하십시오.
- Google 로그인 시 안전하지 않은 브라우저 오류 발생: `npm run login:browser` 명령어를 통해 로그인을 수행하십시오.
- 브라우저 설치 오류가 나타남: `npx playwright install chromium` 명령어로 크로미움을 재설치하십시오.
- MCP 클라이언트가 서버를 시작하지 못함: `npm run build`가 정상적으로 빌드 완료되었는지, 그리고 설정 파일에 작성한 절대 경로가 올바른지 확인하십시오.
- 윈도우(Windows) 경로 문자열 관련 문제: JSON 이나 TOML 설정 파일에 작성 시 역슬래시(`\`)를 두 번 연달아 입력해 이스케이프(`\\`) 처리하거나 슬래시(`/`)를 대신 활용하십시오.
- Node.js 관련 오류: `node --version` 실행 결과가 v20 이상을 만족하는지 검사하십시오.
- OpenEvidence의 화면 UI 나 내부 API 통신 체계가 크게 변경됨: 임상 환자 정보나 개인 계정 비공개 데이터를 제외한 순수 디버깅용 비식별화 로그를 첨부하여 깃허브 이슈(Issue)를 생성해 주십시오.

## 로드맵 (Roadmap)

- 에이전트가 쉽게 인지할 수 있도록 도구 설명(Descriptions)을 간결하고 최적화된 형태로 유지 관리합니다.
- 설정 구성 및 API 응답 파싱 논리에 대한 전용 단위 테스트를 보완합니다.
- 세션 프라이버시를 완벽히 지키면서도 스모크 테스트 수행 시 상세 진단 기능을 고도화합니다.
- 클라이언트들의 설정 양식 진화 방향에 맞춰 지속적으로 MCP 연동 설정 예시를 최신 포맷으로 현행화합니다.

## 라이선스 및 기여 표기 (License & Attribution)

이 프로젝트는 Apache-2.0 (`LICENSE`) 규약 및 `NOTICE` 조항을 따릅니다.

만약 이 프로젝트를 배포하거나, 포크(fork)하여 사용하거나, 파생된 다른 버전을 재개발하는 경우에는 반드시 원저작자에 대한 기여 표시를 유지해야 합니다.

- 원작자: Bakhtier Sizhaev
- 원본 저장소 주소: `https://github.com/bakhtiersizhaev/openevidence-mcp`

권장되는 기여 표기 행:

```text
Based on OpenEvidence MCP by Bakhtier Sizhaev - https://github.com/bakhtiersizhaev/openevidence-mcp
```
