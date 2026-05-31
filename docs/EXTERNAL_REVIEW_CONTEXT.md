# External Review Context

Date: 2026-05-31

This document is a sanitized handoff for an external engineering review of
`openevidence-mcp`. It intentionally excludes passwords, cookies, session
tokens, browser profile contents, storage-state files, private OpenEvidence
chat contents, account identifiers, and patient-identifiable information.

## Repository

- Repository: https://github.com/bakhtiersizhaev/openevidence-mcp
- Local project path on the Windows test machine: `D:\projects\openevidence-mcp`
- Current working branch: `fix/single-session-browser-runner`
- Remote branch: `origin/fix/single-session-browser-runner`
- Current commit: `c558ca33703030f4437364722e46106d8bcd2632`
- Commit subject: `fix: use single local browser session for OpenEvidence tools`

## Product Goal

`openevidence-mcp` is an unofficial Model Context Protocol server for connecting
OpenEvidence to local AI agents and MCP clients such as Codex, Claude Code,
Claude Desktop, Cursor, Cline, Continue, and similar local MCP-compatible hosts.

The intended user experience is:

1. The user installs the repository locally.
2. The user logs in once with their own OpenEvidence account in a normal local
   browser session.
3. The MCP server reuses that local authenticated browser session.
4. AI agents can call OpenEvidence MCP tools for auth status, history, article
   retrieval, fresh questions, and answer waiting.
5. The user should not need to copy cookies, export tokens, install a browser
   extension, expose a public network service, or keep manually operating a
   visible browser for every request.

## Hard Boundaries

Do not design or document methods for bypassing Google, OpenEvidence,
institutional, regional, account, Cloudflare, DataDome, bot-management, paywall,
or access-control protections.

Allowed engineering direction:

- Use the user's own authenticated browser session.
- Keep all execution local.
- Use ordinary browser-side page behavior where possible.
- Keep credentials and session state local.
- Report failures honestly when OpenEvidence changes its UI/API or blocks a
  request.

Not allowed:

- Anti-detect browser guidance.
- Bot-protection evasion.
- Fingerprint spoofing.
- Cookie theft/export workflows.
- Instructions to defeat account, regional, institutional, or access controls.
- Medical advice or patient-specific diagnosis claims.

## MCP Tools

The server exposes:

- `oe_auth_status`: checks whether the saved OpenEvidence session is
  authenticated.
- `oe_history_list`: lists recent OpenEvidence history for the logged-in user.
- `oe_article_get`: retrieves an OpenEvidence article/question by ID.
- `oe_ask`: asks a fresh OpenEvidence research question or a follow-up question.
- `oe_article_wait`: polls until an OpenEvidence article/question reaches a
  completed status or times out.

## Issue Under Investigation

- Issue: https://github.com/bakhtiersizhaev/openevidence-mcp/issues/19
- Title: `oe_ask always returns 403 Cloudflare block regardless of IP, browser, or auth state`
- Reporter: `@leomfischer-br`
- Opened: 2026-05-29
- Environment reported by user: Windows 11, Node.js v24.15.0, npm 11.12.1,
  Claude Desktop, Playwright Chromium installed.

Issue summary:

- `oe_auth_status` worked.
- `npm run smoke` worked.
- `oe_ask` failed with `POST /api/article failed: 403`.
- The stored auth/session appeared valid for read operations.
- The failure appeared specific to the direct Node-side write request used by
  the older `oe_ask` implementation.

## Earlier Architecture Problem

The older implementation used stored browser session state for auth and then
performed some OpenEvidence requests directly from Node.js. This was enough for
auth and read-oriented checks, but `oe_ask` could fail because the write request
did not execute as a normal browser page action.

Observed locally:

- Auth/session checks could pass.
- History/article reads could work.
- Direct Node-side creation of a new OpenEvidence question could return 403.

## Fork Review

Fork checked for comparison:

- https://github.com/htlin222/openevidence-mcp

Local clone path used during investigation:

- `D:\projects\_tmp\openevidence-mcp-htlin222`

Findings:

- The fork used a cookie-file/direct-fetch approach.
- It did not provide a working fix for `oe_ask` in our local test.
- Direct write still failed with a 403-style bot-management response.
- The fork had dependency audit findings during the local check.

Conclusion: the fork did not solve the `oe_ask` write path in a way suitable for
this project.

## Current Branch Solution

Branch:

- `fix/single-session-browser-runner`

Main design:

- Keep one local browser-session transport for the MCP server process.
- Use a persistent local browser profile under the user's home directory.
- Login is performed once through `npm run login:session`.
- MCP runtime reuses that profile.
- `oe_auth_status`, `oe_history_list`, and `oe_article_get` use browser-side
  requests from the OpenEvidence origin.
- `oe_ask` uses normal browser-page interaction rather than a direct Node-side
  write request.
- `oe_article_wait` then polls for completion.

Important files:

- `src/browser-session.ts`: browser-session transport.
- `src/login-session.ts`: one-time login flow.
- `src/openevidence-client.ts`: client wrapper using the browser-session
  transport.
- `src/server.ts`: MCP server; holds a shared client/session for the stdio
  process.
- `docs/SESSION_UAT.md`: UAT notes for the session-based flow.

Rejected/abandoned direction:

- Browser extension / companion-extension flow. The desired product behavior is
  no extension and no user-visible browser window for every MCP request.

## Expected Runtime Behavior

The browser should not reopen a login window for every MCP tool call.

Expected flow:

1. User runs `npm run login:session`.
2. User logs into OpenEvidence in the opened browser.
3. User closes that browser window.
4. User presses Enter in the terminal.
5. MCP server can later use the saved local browser profile.
6. During MCP runtime, a local browser process may be started and reused by the
   MCP server process. It should not require manual interaction for every tool
   call.

## Windows 11 Validation Already Completed

Validated locally on Windows with Microsoft Edge as the browser:

```powershell
cd D:\projects\openevidence-mcp
git checkout fix/single-session-browser-runner
npm ci
npx playwright install chromium
npm test
npm run build
npm run check
npm audit --audit-level=moderate
$env:OE_MCP_BROWSER = "edge"
npm run smoke
```

Observed results:

- `npm test`: passed.
- `npm run build`: passed.
- `npm run check`: passed.
- `npm audit --audit-level=moderate`: 0 vulnerabilities.
- `npm run smoke`: returned `ok: true` and `authenticated: true` with redacted
  user/history output.

MCP-level validation was also performed through a stdio MCP client:

- `oe_auth_status`: authenticated.
- `oe_ask` with `wait_for_completion=false`: returned a new article/question ID.
- `oe_article_wait`: completed successfully and detected answer presence.

The raw answer text and private account details were intentionally not printed
in the test report.

## Remaining Required Validation Before PR/Merge

Do not merge until clean macOS UAT is completed from scratch.

macOS UAT should verify:

- Fresh clone or clean update.
- `git checkout fix/single-session-browser-runner`.
- Node.js 20+.
- `npm ci`.
- `npx playwright install chromium`.
- `npm test`.
- `npm run build`.
- `npm run check`.
- `npm audit --audit-level=moderate`.
- `OE_MCP_BROWSER=chrome npm run login:session`.
- `OE_MCP_BROWSER=chrome npm run smoke`.
- MCP-client-level calls:
  - `oe_auth_status`.
  - `oe_ask` with `wait_for_completion=false`.
  - `oe_article_wait` with the returned ID.

If Google blocks the login flow in Chrome with "This browser or app may not be
secure", try a normal installed Microsoft Edge session if available:

```bash
OE_MCP_BROWSER=edge npm run login:session
```

Do not recommend bypasses. If a normal account/browser flow is blocked, report
the failure and the browser/OS combination.

## macOS External-Agent Test Prompt

Use this prompt with a local AI coding agent on a macOS machine:

```md
Look into this repository: https://github.com/bakhtiersizhaev/openevidence-mcp

Install OpenEvidence MCP into my local AI CLI / agentic MCP setup on macOS.
Use branch `fix/single-session-browser-runner`.

Rules:
- Do not ask for or expose passwords, cookies, browser profile files,
  storage-state files, session tokens, account identifiers, screenshots with
  private account data, patient-identifiable information, or raw private
  OpenEvidence answers.
- Do not bypass Google, OpenEvidence, institutional, regional, or account access
  controls.
- Use only my own OpenEvidence account and my own local browser session.
- Keep the MCP server local.
- Do not install any browser extension.

Steps:
1. Verify prerequisites:
   node --version
   npm --version
   git --version

2. Clone or update:
   git clone https://github.com/bakhtiersizhaev/openevidence-mcp.git
   cd openevidence-mcp
   git fetch origin
   git checkout fix/single-session-browser-runner
   git pull

3. Install and verify:
   npm ci
   npx playwright install chromium
   npm test
   npm run build
   npm run check
   npm audit --audit-level=moderate

4. Run one-time login:
   OE_MCP_BROWSER=chrome npm run login:session

   I will complete OpenEvidence login in the opened browser window, close that
   window, and press Enter in the terminal.

5. Smoke test:
   OE_MCP_BROWSER=chrome npm run smoke

6. Configure the local MCP client with:
   command: node
   args: [absolute path to openevidence-mcp/dist/server.js]

7. Restart the MCP client.

8. Test MCP tools:
   - call oe_auth_status and report only authenticated/statusCode/user metadata
     presence.
   - call oe_ask with wait_for_completion=false using a generic evidence
     question; report only whether an ID was returned.
   - call oe_article_wait with that ID; report only status/is_complete and
     answer_present/answer_length.

If anything fails, report the exact failed step and sanitized error. Do not print
cookies, tokens, raw storage state, browser profile contents, private
OpenEvidence chat content, account identifiers, or patient data.
```

## Suggested PR

Create a PR only after Windows and macOS UAT both pass.

Suggested PR title:

```text
fix: use single local browser session for oe_ask
```

Suggested PR body summary:

```md
Fixes #19.

This changes OpenEvidence runtime access from direct Node-side write requests to
a single local browser-session transport. The user logs in once through
`npm run login:session`; the MCP server then reuses that local profile for auth,
history, article retrieval, ask, and wait operations.

The goal is to make `oe_ask` work through the user's own authenticated
OpenEvidence browser session without browser extensions, cookie export, public
network listeners, or a visible browser login flow for every request.

Validation:
- Windows 11: npm test, build, check, audit, smoke, and MCP-level oe_ask/wait
  passed.
- macOS: pending before merge.

Privacy:
- Tests should not print passwords, cookies, storage-state files, private
  account details, raw private OpenEvidence answers, or patient-identifiable
  information.
```

## Open Questions For Review

- Does the browser-session transport behave reliably on clean macOS with Chrome?
- Does it behave reliably on macOS with Edge if Chrome login is blocked?
- Should the runtime expose an optional configuration for visible/minimized
  browser behavior?
- Should `oe_ask` return more structured pending/completed metadata without
  exposing raw private answer text by default?
- Should CI include only unit/contract tests and keep authenticated smoke tests
  manual?

