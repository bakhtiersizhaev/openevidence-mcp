# OpenEvidence MCP (비공식)

**최초의 오픈소스 OpenEvidence MCP 서버(2026년 2월 공개)입니다.** 사용자의 인증된 브라우저 세션을 통해 Codex, Claude Code, Claude Desktop, Cursor, Windsurf 및 모든 MCP 호환 클라이언트에서 OpenEvidence를 조회할 수 있습니다. API 키가 필요 없습니다. 7개 MCP 클라이언트를 지원하는 원커맨드 설치 프로그램을 제공합니다. 폴링(polling) 기반의 fire-and-forget 비동기 질문을 지원합니다. BibTeX 내보내기가 가능한 구조화된 인용을 제공합니다.

[![CI](https://github.com/bakhtiersizhaev/openevidence-mcp/actions/workflows/test.yml/badge.svg)](https://github.com/bakhtiersizhaev/openevidence-mcp/actions/workflows/test.yml)
[![npm](https://img.shields.io/npm/v/openevidence-mcp)](https://www.npmjs.com/package/openevidence-mcp)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-2d72d9)](https://www.apache.org/licenses/LICENSE-2.0)
[![Node.js 20+](https://img.shields.io/badge/node-%3E%3D20-339933)](https://nodejs.org/)
[![auth](https://img.shields.io/badge/auth-your%20own%20browser%20session-8250df)](#로그인-워크플로우-login-flow)
[![citations](https://img.shields.io/badge/citations-BibTeX%20%2B%20Crossref-b60205)](#도구-및-기능-상세-features)

> [!IMPORTANT]
> 이 프로젝트는 비공식이며 OpenEvidence와 제휴되어 있지 않습니다. 의료 조언을 제공하지 않으며, 관련 이용 약관, 개인정보 보호 규칙 및 임상 거버넌스(clinical governance) 요구 사항을 준수하여 본인의 OpenEvidence 계정으로만 사용해야 합니다.

언어 버전 (Translations): [English](README.md) | [Русский](README.ru.md) | [Español](README.es.md) | [简体中文](README.zh-Hans.md) | [繁體中文（台灣）](README.zh-Hant-TW.md) | [हिन्दी](README.hi.md)

## 작동 방식 (How it works)

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

실제 브라우저 창에서 한 번만 로그인하면 됩니다(`npm run login:session`). 이후 MCP 서버는 해당 프로필로 최소화된 로컬 브라우저를 구동합니다. 쿠키는 브라우저 밖으로 나가지 않으며, 어떤 것도 내보내지 않고, 확장 프로그램을 설치하지 않으며, 포트를 열지도 않습니다.

## 주요 기능 (What it does)

- 저장된 세션이 인증(로그인)되어 있는지 확인합니다.
- OpenEvidence 질문/아티클 기록 목록을 조회합니다.
- 아티클 ID로 전체 아티클 데이터(payload)를 가져옵니다.
- OpenEvidence 연구 질문을 요청합니다 — 블로킹 방식 또는 **fire-and-forget** 방식(`wait_for_completion=false` 설정 후 폴링)을 지원합니다.
- 기존 OpenEvidence 아티클의 생성이 완료될 때까지 상태를 폴링하며, 명시적인 `timed_out` 플래그를 반환합니다.
- 완료된 아티클에서 **구조화된 인용(structured citations)**을 추출하고 **BibTeX**를 내보냅니다(선택적으로 Crossref DOI 메타데이터 보강 지원).

공식 OpenEvidence API 토큰은 필요하지 않습니다.

## 제한 사항 및 안전 원칙 (What it does NOT do)

- OpenEvidence와 제휴되거나 공식 승인 및 보증을 받은 제품이 아닙니다.
- 의료 조언을 제공하지 않으며 의사의 임상적 판단을 대체하지 않습니다.
- 로그인 자격 증명(비밀번호 등)을 절대 수집하지 않습니다.
- 브라우저 세션 상태(Session state)를 사용자의 컴퓨터에서 이루어지는 로컬 요청을 통한 OpenEvidence와의 통신 외에 외부로 전송하지 않습니다.
- 적절한 의료 전문가의 검토 없이 환자 특정적 진단(patient-specific diagnosis)이나 치료 결정에 직접 사용해서는 안 됩니다.

## 사용 대상 (Who it is for)

- 본인의 OpenEvidence 계정을 사용하는 임상 의사
- 참고문헌 관리 도구에 바로 넣을 수 있는 인용이 필요한 의학 연구원
- 의학 근거 검색 워크플로우를 구축하려는 AI 운영자
- 로컬 도구를 Codex, Claude, Cursor, Cline, Continue 또는 유사 클라이언트와 연동하려는 MCP 개발자

## 에이전트 온보딩 및 설치 (Agent Onboarding & Installation)

Codex, Claude Code, Cursor 또는 기타 로컬 AI 코딩 에이전트를 사용 중이신가요? 아래 프롬프트를 전달하면 에이전트가 전체 설정을 자동으로 처리합니다.

```text
Please install OpenEvidence MCP for me: clone https://github.com/bakhtiersizhaev/openevidence-mcp, install dependencies, run build, auto-configure this MCP server in my local client (Claude Desktop/Codex/Cursor), guide me through the one-time Edge/Chrome login using `npm run login:session`, and run `npm run smoke` to verify. Keep everything strictly local and secure.
```

종합적인 단계별 설치 플레이북 및 규칙은 **[docs/AGENT_INSTALL_PROMPT.md](docs/AGENT_INSTALL_PROMPT.md)** 문서를 참고하십시오.

## 도구 및 기능 상세 (Features)

| 도구명 | 용도 | 로그인 인증 필요 여부 | 사이드 이펙트 |
| --- | --- | --- | --- |
| `oe_auth_status` | 저장된 OpenEvidence 브라우저 세션의 로그인 상태를 확인합니다. | 예, 로컬 브라우저 프로필이 로그인되어 있어야 합니다. | 없음. |
| `oe_history_list` | 기존 OpenEvidence 아티클 목록을 페이지네이션 및 검색 옵션과 함께 나열합니다. `include_raw=true`를 명시적으로 요청하지 않는 한 개인정보가 축소된(privacy-reduced) 목록을 반환합니다. | 예. | 없음. |
| `oe_article_get` | ID로 아티클을 가져오고 정규화된 필드(`status`, `is_complete`, `question`, `answer_text`, `citations`)를 반환합니다. 원본 페이로드는 `include_raw=true`로 선택적으로 포함됩니다. | 예. | 없음. |
| `oe_article_wait` | 기존 아티클 ID의 생성이 완료될 때까지 대기합니다. 완료 전에 제한 시간이 만료되면 `timed_out=true`를 반환합니다. | 예. | 없음. |
| `oe_ask` | OpenEvidence 연구 질문을 생성하고 선택적으로 아티클 생성이 완료될 때까지 기다립니다. fire-and-forget 방식을 원하면 `wait_for_completion=false`로 설정하십시오. | 예. | 사용자의 OpenEvidence 계정에 질문/아티클이 새로 생성됩니다. |
| `oe_citations_get` | 완료된 아티클에서 구조화된 인용을 추출하고 JSON + BibTeX를 반환합니다. `validate_crossref=true`로 설정하면 DOI 항목을 Crossref 메타데이터로 보강합니다. | 예. | 없음. |

## 대상 및 테스트 완료된 클라이언트 (Tested / Target Clients)

| 클라이언트 | 상태 | 비고 |
| --- | --- | --- |
| OpenAI Codex / Codex CLI / Codex 앱 | 대상 클라이언트 | 권장되는 로컬 MCP 워크플로우. |
| Claude Code | 대상 클라이언트 | 권장되는 에이전트(Agent) 워크플로우. |
| Claude Desktop / MCP 지원 Claude 앱 | 대상 클라이언트 | 로컬 MCP 서버 설정. |
| Cursor | 호환됨 | MCP 호환 IDE 워크플로우. |
| Cline | 호환됨 | VS Code 에이전트 워크플로우. |
| Continue | 호환됨 | 오픈소스 IDE 어시스턴트 워크플로우. |
| MCP를 지원하는 VS Code / GitHub Copilot 환경 | 실험적 지원 | 로컬 MCP 지원 및 클라이언트 설정에 따라 달라집니다. |
| Windsurf / Zed / Replit / Sourcegraph 스타일 MCP 호스트 | 실험적 지원 | Windsurf는 설치 프로그램에서 지원됩니다. |
| Gemini CLI / Google Antigravity 스타일 에이전트 환경 | 실험적 지원 | Antigravity는 설치 프로그램에서 지원됩니다. |

## 에이전트 도구 호출 참고 사항 (Agent Tool-Calling Notes)

이 MCP 서버는 MCP 프롬프트를 공개하는 클라이언트를 위해 내장된 가이드라인과 `openevidence_research_workflow`라는 이름의 프롬프트를 포함하고 있습니다.

권장 에이전트 워크플로우:

1. 로그인 상태를 알 수 없을 때는 먼저 `oe_auth_status`를 호출합니다.
2. 사용자가 이전의 OpenEvidence 작업 이력이나 아티클 ID를 필요로 할 때만 `oe_history_list`를 사용합니다.
3. 이미 아티클 ID를 확보한 경우에는 `oe_article_get`을 사용합니다.
4. 처리 시간이 긴 연구 질문의 경우, `wait_for_completion=false` 옵션으로 `oe_ask`를 호출한 후 반환된 `article_id`를 사용하여 `oe_article_wait`를 호출합니다.
5. 후속 연속 질의인 경우에만 `original_article_id`를 사용하고, 완전히 새로운 질문의 경우에는 오래된 스레드 컨텍스트를 방지하기 위해 생략합니다.
6. 사용자가 완료된 아티클의 참고문헌이나 BibTeX가 필요할 때 `oe_citations_get`을 호출합니다.
7. 모든 출력 정보는 어디까지나 의학 근거 검색 컨텍스트이며, 의료 조언, 진단 또는 임상 지시가 아님을 명심하십시오.

관련 명령어:

| 명령어 | 용도 |
| --- | --- |
| `npm run login:session` | 최초 1회 로그인. 로컬 OpenEvidence MCP 프로필이 적용된 Chrome/Edge를 엽니다. |
| `npm run smoke` | 로그인 인증 상태 및 기본적인 OpenEvidence 서버 연동을 검증합니다. |

## 실행 환경 요구 사항 (Requirements)

- Node.js 20+
- npm 10+
- OpenEvidence 계정
- macOS, Windows 또는 Linux
- 시스템에 설치된 Chrome, Edge 또는 Chromium 브라우저

## OpenEvidence 서비스 가용성 참고 (Availability Note)

OpenEvidence의 이용 가능 여부는 국가/지역, 계정의 자격 요건 및 OpenEvidence 자체 정책에 따라 달라질 수 있습니다. 2026년 5월 기준 공개 자료에 따르면, 해당 서비스는 인증된 미국 의료 전문의(HCP/NPI) 중심의 접근을 허용하며 EU 및 영국(U.K.) 지역에서는 이용할 수 없습니다. 이 프로젝트는 이러한 제한을 변경하지 않습니다.

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

## 로그인 워크플로우 (Login Flow)

최초 1회 로그인:

```bash
npm run login:session
```

이 명령은 로컬 OpenEvidence MCP 브라우저 프로필이 적용된 Chrome 또는 Edge를 엽니다. 본인의 계정으로 OpenEvidence에 로그인하고, 정상적인 OpenEvidence 페이지가 로드되는지 확인한 뒤, 해당 브라우저 창을 닫고 터미널로 돌아와 Enter 키를 누르십시오.

기본 로컬 프로필 경로:

- macOS/Linux: `~/.openevidence-mcp/browser-profile`
- Windows: `%USERPROFILE%\.openevidence-mcp\browser-profile`

MCP 서버는 프로세스 수명 동안 이 동일한 로컬 프로필을 재사용합니다. OpenEvidence 호출을 위해 최소화된 로컬 브라우저 프로세스를 시작할 수는 있지만, 확장 프로그램을 설치하거나, 공개 네트워크 서비스를 노출하거나, 쿠키를 내보내거나, 비밀번호를 요구하지 않습니다.

브라우저 프로필 파일, 쿠키, 개인 계정 데이터가 포함된 스크린샷, 환자 개인 식별 정보(patient-identifiable information)를 공유하지 마십시오.

## MCP 클라이언트 설정 (MCP Client Setup)

서버를 등록하기 전에 먼저 빌드해야 합니다.

```bash
npm run build
```

### 자동 설정 (권장) (Automatic Setup)

내장된 설치 프로그램을 사용하여 OpenEvidence MCP 서버를 클라이언트에 등록합니다.

| 클라이언트 | 명령어 |
| --- | --- |
| Claude Desktop | `npx openevidence-mcp install --client claude-app` |
| Codex Desktop | `npx openevidence-mcp install --client codex-app` |
| Claude Code | `npx openevidence-mcp install --client claude-code` |
| Codex CLI | `npx openevidence-mcp install --client codex-cli` |
| Google Antigravity | `npx openevidence-mcp install --client antigravity` |
| Cursor | `npx openevidence-mcp install --client cursor` |
| Windsurf | `npx openevidence-mcp install --client windsurf` |

각 클라이언트에는 `npm run install:cursor`와 같은 npm 단축 명령어도 제공됩니다. 제거하려면:

```bash
npx openevidence-mcp uninstall --client <client-id>
```

### 수동 설정 (Manual Setup)

#### Codex

`~/.codex/config.toml` 파일에 다음 내용을 추가합니다.

```toml
[mcp_servers.openevidence]
command = "node"
args = ["/ABSOLUTE/PATH/openevidence-mcp/dist/server.js"]
startup_timeout_sec = 60
```

Windows 설정 예시:

```toml
[mcp_servers.openevidence]
command = "node"
args = ["C:\\Users\\<user>\\openevidence-mcp\\dist\\server.js"]
startup_timeout_sec = 60
```

#### Claude Desktop

`claude_desktop_config.json` 파일에 다음 내용을 추가합니다.

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

사용하는 클라이언트가 MCP 서버 명령/인자(command/args) 구성을 지원하는 경우 동일한 stdio 서버 형식을 사용합니다.

```json
{
  "command": "node",
  "args": ["/ABSOLUTE/PATH/openevidence-mcp/dist/server.js"]
}
```

설정 예제는 `examples/` 디렉토리에서 확인할 수 있습니다.

## 검증 및 테스트 (Verify)

```bash
npm run smoke
```

세션이 유효할 경우 예상되는 결과:

- `ok: true`
- `authenticated: true`
- 비식별 처리(redacted)된 기록 미리보기

만약 스모크 테스트가 인증 오류로 실패한다면 `npm run login:session`을 다시 실행하십시오. 스모크 테스트는 실제 OpenEvidence 계정 세션이 필요하므로, 로컬 세션 프로필이 없는 깨끗한 CI 환경에서는 통과하지 못합니다.

기본적으로 스모크 테스트 출력에서 계정 및 기록 콘텐츠는 비식별화(redact) 처리됩니다. 디버깅을 위해 원본 계정/기록 페이로드를 확인해야 하는 경우에만 프라이빗 터미널에서 `npm run smoke -- --verbose`를 사용하십시오.

개발자 확인 명령어:

```bash
npm test
npm run build
npm run check
```

## 보안 및 안전 주의 사항 (Security Notes)

- 브라우저 프로필과 쿠키는 **보안이 요구되는 민감한 정보(Secrets)**로 취급하십시오.
- `.env` 파일, 세션 상태, 계정 데이터가 포함된 스크린샷, 환자 개인 식별 정보(patient-identifiable information)를 절대 커밋하지 마십시오.
- 오직 본인의 OpenEvidence 계정으로만 사용해야 합니다.
- MCP 클라이언트 설정이 본인이 관리하는 로컬 빌드 서버 경로를 가리키도록 유지하십시오.
- 자율 에이전트(Autonomous Agents)의 도구 호출 출력물을 임상 진료나 현업 워크플로우에 사용하기 전에 반드시 검토하십시오.
- 취약점 제보 및 지원 범위는 `SECURITY.md`를 참고하십시오.

## 문제 해결 및 디버깅 (Troubleshooting)

상세한 복구 단계는 `docs/TROUBLESHOOTING.md` 문서를 참고하십시오.

대표적인 조치 사항:

- `authenticated: false`: `npm run login:session`을 다시 실행하십시오.
- MCP 클라이언트가 서버를 시작하지 못함: `npm run build`가 정상적으로 완료되었는지 확인하고 `dist/server.js`의 절대 경로를 사용하십시오.
- Windows 경로 관련 문제: JSON/TOML 설정에서 역슬래시를 이스케이프 처리하거나 완전한 절대 경로를 사용하십시오.
- Node 관련 오류: `node --version` 실행 결과가 20 이상인지 확인하십시오.
- OpenEvidence UI/API가 변경됨: 개인 계정 정보나 환자 데이터를 제외한 비식별화 로그를 첨부하여 이슈(Issue)를 생성해 주십시오.
- `oe_ask`가 질문 입력란이나 제출 버튼을 찾지 못함: OpenEvidence UI가 변경되었을 수 있습니다. 개인 계정 정보나 환자 데이터를 제외한 비식별화 로그를 첨부하여 이슈를 생성해 주십시오.

## 로드맵 (Roadmap)

- 공식 MCP Registry에 게시 (`server.json` 매니페스트 준비 완료).
- Crossref로 검증된 인용 메타데이터 캐싱.
- 선택적인 아티클 아티팩트 디스크 저장 (answer.md, citations.bib).
- 클라이언트 설정 형식의 진화에 맞춘 MCP 클라이언트 설정 예시 지속 관리.

## 라이선스 및 기여 표기 (License & Attribution)

Apache-2.0 (`LICENSE`) + `NOTICE`.

이 저장소는 2026년 2월에 공개된 오리지널 OpenEvidence MCP 저장소입니다. 재배포하거나, 포크(fork)하거나, 파생 버전을 개발하는 경우 다음의 기여 표기를 유지해 주십시오.

- 원작자: Bakhtier Sizhaev
- 원본 저장소: `https://github.com/bakhtiersizhaev/openevidence-mcp`

권장되는 기여 표기 행:

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
