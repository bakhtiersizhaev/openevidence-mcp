# OpenEvidence MCP (非官方)

OpenEvidence MCP 是一個非官方的 Model Context Protocol (MCP) 伺服器。它透過您自己已登入（已驗證）的瀏覽器工作階段，將 OpenEvidence 連接到 Codex、Claude Code、Claude Desktop、Cursor、Cline、Continue 和其他相容 MCP 的用戶端。

[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-2d72d9)](https://www.apache.org/licenses/LICENSE-2.0)
[![Node.js 20+](https://img.shields.io/badge/node-%3E%3D20-339933)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6)](https://www.typescriptlang.org/)
[![MCP SDK](https://img.shields.io/badge/MCP%20SDK-1.26.0-1d9a5a)](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
[![Playwright](https://img.shields.io/badge/Playwright-1.58.2-4f46e5)](https://playwright.dev/)

> [!IMPORTANT]
> 本專案是非官方的，與 OpenEvidence 並無從屬或合作關係。本專案不提供醫療建議、不繞過存取控制，且只應在符合適用條款、隱私規則和臨床監管（clinical governance）要求的前提下，搭配您自己的 OpenEvidence 帳號使用。

語言版本 (Translations): [English](README.md) | [Русский](README.ru.md) | [Español](README.es.md) | [简体中文](README.zh-Hans.md) | [한국어](README.ko.md) | [हिन्दी](README.hi.md)

## 智能體自動安裝提示詞 (Copy/Paste Agent Install Prompt)

正在使用 Codex、Claude Code 或其他本機 AI 程式設計智能體（Agent）？複製以下提示詞並發送給智能體，讓它自動處理環境建置、MCP 設定、登入引導以及功能驗證。

```text
Look into this repository: https://github.com/bakhtiersizhaev/openevidence-mcp

Install OpenEvidence MCP in my local AI CLI / agentic MCP setup. Add it as an MCP server for the CLI or app I am using. Follow the repository README and the agent install playbook at docs/AGENT_INSTALL_PROMPT.md.

Verify local prerequisites: Node.js 20+, npm, git, and Playwright Chromium. Clone or update the repo, run npm ci, npx playwright install chromium, npm run build, and npm run check.

Configure the MCP server with command "node" and args pointing to the absolute path of dist/server.js. Keep the server local and do not expose it over a public network.

Guide me through OpenEvidence login with my own account. First try npm run login. If Google says "This browser or app may not be secure", stop that flow and run npm run login:browser instead. I will complete login in the opened browser window and then press Enter in the terminal.

Do not ask for or expose my password, cookies, tokens, storage-state files, screenshots with private account data, patient-identifiable information, or account identifiers. Do not bypass OpenEvidence, Google, institutional, regional, or account access controls.

After login, run npm run smoke. If smoke returns ok: true and authenticated: true, show me the final MCP config and tell me to restart my AI agent / MCP client so the OpenEvidence tools become available.
```

更詳細的智能體操作手冊：[`docs/AGENT_INSTALL_PROMPT.md`](docs/AGENT_INSTALL_PROMPT.md)。

## 功能與作用 (What it does)

OpenEvidence MCP 執行一個本機的 stdio MCP 伺服器，允許 MCP 用戶端使用您現有的 OpenEvidence 瀏覽器工作階段來執行以下操作：

- 檢查已儲存的工作階段是否已通過驗證（已登入）；
- 列出您的 OpenEvidence 問題/文章歷史記錄；
- 透過 ID 取得完整的文章數據（payload）；
- 提交 OpenEvidence 研究問題，並可選擇是否等待回答完成；
- 輪詢（poll）已有的 OpenEvidence 文章，直到其生成完成。

無需官方 OpenEvidence API Token。

## 局限與安全原則 (What it does NOT do)

- 本專案不隸屬於 OpenEvidence，亦未獲得其認可、背書或批准；
- 不提供醫療建議，不代替臨床專業判斷；
- 不繞過身份驗證、付費牆或存取控制；
- 不收集您的任何憑據（如密碼等）；
- 除了透過本機 Playwright 請求與 OpenEvidence 互動外，不會將您的瀏覽器工作階段狀態（Session state）發送到任何其他地方；
- 在未經人工審查的情況下，不應將輸出結果直接用於特定患者的診斷或治療決策。

## 適用對象 (Who it is for)

- 使用自己的 OpenEvidence 帳號的臨床醫生；
- 醫學研究人員；
- 建置證據研究工作流的 AI 操作員；
- 將本機工具整合到 Codex、Claude、Cursor、Cline、Continue 或類似用戶端的 MCP 開發者。

## 目標與已測試用戶端 (Tested / Target Clients)

本專案專為相容 MCP 的用戶端和本機智能體工作流設計。除非另有說明，本倉庫僅維護 Codex 和 Claude 風格的本機設定範例。

| 用戶端 | 狀態 | 備註 |
| --- | --- | --- |
| OpenAI Codex / Codex CLI / Codex app | 目標用戶端 | 推薦的本機 MCP 工作流。 |
| Claude Code | 目標用戶端 | 推薦的智能體（Agent）工作流。 |
| Claude Desktop / 支援 MCP 的 Claude 用戶端 | 目標用戶端 | 本機 MCP 伺服器設定。 |
| Cursor | 已相容 | 相容 MCP 的 IDE 工作流。 |
| Cline | 已相容 | VS Code 智能體工作流。 |
| Continue | 已相容 | 開源 IDE 助手工作流。 |
| 支援 MCP 的 VS Code / GitHub Copilot 環境 | 實驗性支援 | 取決於本機 MCP 支援及用戶端設定。 |
| Windsurf / Zed / Replit / Sourcegraph 風格的 MCP 宿主 | 實驗性支援 | 未經測試，不保證可用性。 |
| Gemini CLI / Google Antigravity 風格的智能體環境 | 實驗性支援 | 生態關注對象，非持續維護的範例。 |

## 功能特性 (Features)

| 工具名稱 | 用途 | 是否需要登入驗證 | 副作用 |
| --- | --- | --- | --- |
| `oe_auth_status` | 檢查已儲存的 OpenEvidence 瀏覽器工作階段是否已驗證。 | 是，本機工作階段檔案必須存在。 | 無。 |
| `oe_history_list` | 列出歷史 OpenEvidence 文章/問題，支援分頁和搜尋。 | 是。 | 無。 |
| `oe_article_get` | 透過 ID 取得文章，並回傳結構化欄位（狀態、是否完成、問題、答案文字）及原始數據。 | 是。 | 無。 |
| `oe_article_wait` | 等待現有文章生成完成；在執行非阻塞 `oe_ask` 後非常有用。 | 是。 | 無。 |
| `oe_ask` | 提交一個 OpenEvidence 研究問題，並可選擇等待文章生成完成。 | 是。 | 會在您的 OpenEvidence 帳號中建立問題/文章記錄。 |

## 智能體呼叫注意事項 (Agent Tool-Calling Notes)

MCP 伺服器為暴露 MCP prompts 的用戶端提供了內建說明和一個名為 `openevidence_research_workflow` 的提示範本。

推薦的智能體工作流：

1. 當登入狀態未知時，首先呼叫 `oe_auth_status`。
2. 僅當用戶需要尋找之前的 OpenEvidence 工作或文章 ID 時，才使用 `oe_history_list`。
3. 當已擁有文章 ID 時，直接使用 `oe_article_get`。
4. 對於耗時較長的研究問題，建議呼叫 `oe_ask` 並設定 `wait_for_completion=false`，然後透過回傳的 `article_id` 呼叫 `oe_article_wait`。
5. 僅在確實存在後續連續追加問答時才使用 `original_article_id`。對於新問題請省略此參數，以避免引入過期的上下文。
6. 始終將輸出內容視為臨床證據檢索上下文，而非醫療建議、醫療診斷或臨床處方。

相關指令彙整：

| 指令 | 用途 |
| --- | --- |
| `npm run login` | 啟動本機瀏覽器進行登入，並儲存可複用的工作階段狀態檔案。 |
| `npm run login:browser` | 在 Google SSO 限制 Playwright 登入（提示瀏覽器不安全）時，使用系統預設瀏覽器進行登入。 |
| `npm run smoke` | 驗證身份認證及 OpenEvidence 的基礎連通性。 |

## 執行環境要求 (Requirements)

- Node.js 20+
- npm 10+
- OpenEvidence 帳號
- macOS, Windows, 或 Linux
- 透過 Playwright 安裝的 Chromium 瀏覽器 (`npx playwright install chromium`)

## OpenEvidence 可用性說明 (Availability Note)

OpenEvidence 的可用性可能取決於地區、帳號資格和 OpenEvidence 官方政策。截至 2026 年 5 月的公開資料表明，該服務主要面向已驗證的美國執業醫療專業人員（HCP/NPI），且在歐盟（EU） and 英國（U.K.）無法使用。本專案不會（也無法）繞過這些區域、帳號或政策限制。

相關參考連結：

- [OpenEvidence 官網](https://www.openevidence.com/)
- [OpenEvidence API/產品介紹頁](https://www.openevidence.com/product/api)
- [OpenEvidence 隱私政策](https://www.openevidence.com/policies/privacy)

## 快速開始 (Quick Start)

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

## 登入工作流 (Login Flow)

執行：

```bash
npm run login
```

該指令將打開一個瀏覽器視窗。請使用您自己的帳號登入 OpenEvidence，然後返回終端並按回車鍵（Enter）。登入腳本將驗證 `/api/auth/me` 並儲存本機瀏覽器工作階段狀態（Session state）。

預設的工作階段狀態檔案儲存路徑：

- macOS/Linux: `~/.openevidence-mcp/auth/storage-state.json`
- Windows: `%USERPROFILE%\.openevidence-mcp\auth\storage-state.json`

您也可以直接匯入已有的 Playwright 工作階段檔案：

```bash
npm run login -- --import /絕對路徑/storage-state.json
```

如果 Google 登入提示「此瀏覽器或應用程式可能不安全」（This browser or app may not be secure），請使用系統瀏覽器登入流：

```bash
npm run login:browser
```

此指令會使用本機 OpenEvidence MCP 設定檔啟動系統內建的 Chrome 或 Edge 瀏覽器。請在打開的瀏覽器視窗中完成登入，然後返回終端並按回車鍵（Enter）。該腳本將自動儲存本機工作階段狀態，並驗證 `/api/auth/me` 的連通性。

> [!WARNING]
> 工作階段狀態（Session state）完全儲存在您本機。**切勿**公開、洩露或提交您的 `storage-state.json`、Cookies、包含個人帳號隱私的截圖，或任何涉及患者身份識別的資訊。

## MCP 用戶端設定 (MCP Client Setup)

在註冊伺服器之前，請確保先進行建置：

```bash
npm run build
```

### Codex

將以下內容添加到 `~/.codex/config.toml`：

```toml
[mcp_servers.openevidence]
command = "node"
args = ["/絕對路徑/openevidence-mcp/dist/server.js"]
startup_timeout_sec = 60
```

Windows 系統設定範例：

```toml
[mcp_servers.openevidence]
command = "node"
args = ["C:\\Users\\<使用者名稱>\\openevidence-mcp\\dist\\server.js"]
startup_timeout_sec = 60
```

### Claude Desktop

將以下內容添加到 `claude_desktop_config.json` :

```json
{
  "mcpServers": {
    "openevidence": {
      "command": "node",
      "args": ["/絕對路徑/openevidence-mcp/dist/server.js"]
    }
  }
}
```

### Cursor, Cline, Continue

如果您的用戶端支援基於 stdio 方式的 MCP 伺服器命令列設定，可使用以下設定格式：

```json
{
  "command": "node",
  "args": ["/絕對路徑/openevidence-mcp/dist/server.js"]
}
```

具體的設定範例可在 `examples/` 目錄下找到。

## 驗證與測試 (Verify)

執行冒煙測試（Smoke Test）：

```bash
npm run smoke
```

若工作階段有效，預期的輸出結果應包含：
- `ok: true`
- `authenticated: true`
- 經過遮蔽（去識別化）的歷史記錄預覽

如果冒煙測試因身份驗證錯誤而失敗，請重新執行 `npm run login`。冒煙測試需要真實的 OpenEvidence 帳戶工作階段，在沒有安全設定工作階段狀態的情況下，在純淨的 CI 環境中是無法通過的。

預設情況下，冒煙測試輸出會對帳號和歷史內容進行遮蔽（Redact）。只有在本機私有終端中且確實需要偵錯原始帳號數據時，才使用 `npm run smoke -- --verbose`。

開發人員常用指令：

```bash
npm test          # 執行測試
npm run build     # 建置專案
npm run check     # 執行 TypeScript 類型與程式碼規範檢查
```

## 安全須知 (Security Notes)

- 請將 `storage-state.json`、Cookies 及瀏覽器設定檔視為**絕密憑證**。
- 切勿將 `.env` 設定檔、工作階段狀態檔案、包含敏感帳戶資訊的截圖，或任何涉及患者隱私的數據（patient-identifiable information）提交到 Git 倉庫。
- 僅應配合您自己擁有的 OpenEvidence 帳戶使用。
- 確保 MCP 用戶端設定中的路徑指向您本機控制且已編譯的 `dist/server.js` 絕對路徑。
- 在臨床或實際營運工作流中使用自主智能體（Autonomous Agents）生成的輸出之前，請務必先人工審核其工具呼叫行為及結果。
- 漏洞報告及安全支援範圍請參見 `SECURITY.md`。

## 常見問題與偵錯 (Troubleshooting)

若遇到問題，可查閱 `docs/TROUBLESHOOTING.md` 取得詳細的恢復方案。

常見修復方法：
- `authenticated: false`：請重新執行 `npm run login`。
- Google 提示瀏覽器不安全：請改用 `npm run login:browser`。
- 瀏覽器安裝錯誤：執行 `npx playwright install chromium`。
- MCP 用戶端無法啟動伺服器：確認 `npm run build` 已成功執行，且設定中使用的是指向 `dist/server.js` 的絕對路徑。
- Windows 路徑問題：請在 JSON/TOML 中對反斜線進行雙重轉義（即 `\\`），或使用正斜線。
- Node 錯誤：確認 `node --version` 版本不低於 20。
- OpenEvidence 介面或 API 發生變更：請提交 Issue，並附帶已遮蔽的日誌（不含任何私人帳號及患者資訊）。

## 規劃路線圖 (Roadmap)

- 保持工具描述的簡潔與智能體友善。
- 添加針對設定和回應解析的重點單元測試。
- 改善冒煙測試的診斷機制，同時保護工作階段隱私。
- 隨著用戶端設定格式的演進，持續追蹤並更新 MCP 用戶端設定範例。

## 授權條款與署名 (License & Attribution)

本專案採用 Apache-2.0 (`LICENSE`) + `NOTICE` 開源協定。

如果您分發、分叉（fork）或建置衍生版本，請保留以下原作者署名：

- 原作者: Bakhtier Sizhaev
- 原始倉庫: `https://github.com/bakhtiersizhaev/openevidence-mcp`

推薦的署名行格式：

```text
Based on OpenEvidence MCP by Bakhtier Sizhaev - https://github.com/bakhtiersizhaev/openevidence-mcp
```
