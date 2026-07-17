# OpenEvidence MCP（非官方）

**第一個開源 OpenEvidence MCP 伺服器（2026 年 2 月發佈）。** 透過您自己已登入（已驗證）的瀏覽器工作階段，從 Codex、Claude Code、Claude Desktop、Cursor、Windsurf 以及任何相容 MCP 的用戶端查詢 OpenEvidence。無需 API 金鑰。支援 7 個 MCP 用戶端的一鍵安裝程式。支援 fire-and-forget 非同步提問並可輪詢結果。提供結構化引用與 BibTeX 匯出。

[![CI](https://github.com/bakhtiersizhaev/openevidence-mcp/actions/workflows/test.yml/badge.svg)](https://github.com/bakhtiersizhaev/openevidence-mcp/actions/workflows/test.yml)
[![npm](https://img.shields.io/npm/v/openevidence-mcp)](https://www.npmjs.com/package/openevidence-mcp)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-2d72d9)](https://www.apache.org/licenses/LICENSE-2.0)
[![Node.js 20+](https://img.shields.io/badge/node-%3E%3D20-339933)](https://nodejs.org/)
[![auth](https://img.shields.io/badge/auth-your%20own%20browser%20session-8250df)](#登入工作流-login-flow)
[![citations](https://img.shields.io/badge/citations-BibTeX%20%2B%20Crossref-b60205)](#功能特性-features)

> [!IMPORTANT]
> 本專案是非官方的，與 OpenEvidence 並無從屬或合作關係。本專案不提供醫療建議，且只應在符合適用條款、隱私規則和臨床監管（clinical governance）要求的前提下，搭配您自己的 OpenEvidence 帳號使用。

語言版本 (Translations): [English](README.md) | [Русский](README.ru.md) | [Español](README.es.md) | [简体中文](README.zh-Hans.md) | [한국어](README.ko.md) | [हिन्दी](README.hi.md)

## 運作原理 (How it works)

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

您只需在真實的瀏覽器視窗中登入一次（`npm run login:session`）。之後，MCP 伺服器會以最小化模式在該設定檔上驅動本機瀏覽器 — Cookies 絕不會離開瀏覽器、不匯出任何資料、不安裝任何擴充功能，也不開放任何連接埠。

## 功能與作用 (What it does)

- 檢查已儲存的工作階段是否已通過驗證（已登入）；
- 列出您的 OpenEvidence 問題/文章歷史記錄；
- 透過 ID 取得完整的文章數據（payload）；
- 提交 OpenEvidence 研究問題 — 可阻塞等待，也可 **fire-and-forget**（設定 `wait_for_completion=false` 之後再輪詢）；
- 輪詢（poll）已有的 OpenEvidence 文章直到其生成完成，並提供明確的 `timed_out` 旗標；
- 從已完成的文章中擷取**結構化引用**並匯出 **BibTeX**（可選擇以 Crossref 補強 DOI 資料）。

無需官方 OpenEvidence API Token。

## 局限與安全原則 (What it does NOT do)

- 本專案不隸屬於 OpenEvidence，亦未獲得其認可、背書或批准。
- 不提供醫療建議，不代替臨床專業判斷。
- 不收集您的任何憑據，也不會索取您的密碼。
- 除了從您的機器透過本機請求與 OpenEvidence 互動外，不會將您的瀏覽器工作階段狀態（Session state）發送到任何其他地方。
- 在未經適當人工審查的情況下，不應將輸出結果直接用於特定患者的診斷或治療決策。

## 適用對象 (Who it is for)

- 使用自己的 OpenEvidence 帳號的臨床醫生；
- 需要可直接匯入文獻管理軟體之引用的醫學研究人員；
- 建置證據研究工作流的 AI 操作員；
- 將本機工具整合到 Codex、Claude、Cursor、Cline、Continue 或類似用戶端的 MCP 開發者。

## 智能體導引與安裝 (Agent Onboarding & Installation)

正在使用 Codex、Claude Code、Cursor 或其他本機 AI 程式設計智能體（Agent）？讓智能體處理全部安裝流程：

```text
Please install OpenEvidence MCP for me: clone https://github.com/bakhtiersizhaev/openevidence-mcp, install dependencies, run build, auto-configure this MCP server in my local client (Claude Desktop/Codex/Cursor), guide me through the one-time Edge/Chrome login using `npm run login:session`, and run `npm run smoke` to verify. Keep everything strictly local and secure.
```

完整的逐步安裝手冊與規則，請參見 **[docs/AGENT_INSTALL_PROMPT.md](docs/AGENT_INSTALL_PROMPT.md)**。

## 功能特性 (Features)

| 工具名稱 | 用途 | 是否需要登入驗證 | 副作用 |
| --- | --- | --- | --- |
| `oe_auth_status` | 檢查已儲存的 OpenEvidence 瀏覽器工作階段是否已驗證。 | 是，本機瀏覽器設定檔必須已登入。 | 無。 |
| `oe_history_list` | 列出歷史 OpenEvidence 文章，支援分頁和搜尋。除非明確指定 `include_raw=true`，否則回傳經隱私遮蔽的清單。 | 是。 | 無。 |
| `oe_article_get` | 透過 ID 取得文章，並回傳正規化欄位（`status`、`is_complete`、`question`、`answer_text`、`citations`）。原始數據需以 `include_raw=true` 明確啟用。 | 是。 | 無。 |
| `oe_article_wait` | 等待現有文章 ID 生成完成；若在完成前逾時，會回傳 `timed_out=true`。 | 是。 | 無。 |
| `oe_ask` | 建立一個 OpenEvidence 研究問題，並可選擇等待文章生成完成。設定 `wait_for_completion=false` 即可 fire-and-forget。 | 是。 | 會在您的 OpenEvidence 帳號中建立問題/文章記錄。 |
| `oe_citations_get` | 從已完成的文章中擷取結構化引用，並回傳 JSON + BibTeX。設定 `validate_crossref=true` 可用 Crossref 中繼資料補強 DOI 條目。 | 是。 | 無。 |

## 目標與已測試用戶端 (Tested / Target Clients)

| 用戶端 | 狀態 | 備註 |
| --- | --- | --- |
| OpenAI Codex / Codex CLI / Codex app | 目標用戶端 | 推薦的本機 MCP 工作流。 |
| Claude Code | 目標用戶端 | 推薦的智能體（Agent）工作流。 |
| Claude Desktop / 支援 MCP 的 Claude 用戶端 | 目標用戶端 | 本機 MCP 伺服器設定。 |
| Cursor | 已相容 | 相容 MCP 的 IDE 工作流。 |
| Cline | 已相容 | VS Code 智能體工作流。 |
| Continue | 已相容 | 開源 IDE 助手工作流。 |
| 支援 MCP 的 VS Code / GitHub Copilot 環境 | 實驗性支援 | 取決於本機 MCP 支援及用戶端設定。 |
| Windsurf / Zed / Replit / Sourcegraph 風格的 MCP 宿主 | 實驗性支援 | Windsurf 已由安裝程式支援。 |
| Gemini CLI / Google Antigravity 風格的智能體環境 | 實驗性支援 | Antigravity 已由安裝程式支援。 |

## 智能體呼叫注意事項 (Agent Tool-Calling Notes)

MCP 伺服器為暴露 MCP prompts 的用戶端提供了內建說明和一個名為 `openevidence_research_workflow` 的提示範本。

推薦的智能體工作流：

1. 當登入狀態未知時，呼叫 `oe_auth_status`。
2. 僅當使用者需要之前的 OpenEvidence 工作或文章 ID 時，才使用 `oe_history_list`。
3. 當已擁有文章 ID 時，直接使用 `oe_article_get`。
4. 對於耗時較長的研究問題，呼叫 `oe_ask` 並設定 `wait_for_completion=false`，然後透過回傳的 `article_id` 呼叫 `oe_article_wait`。
5. 僅在確實存在後續連續追加問答時才使用 `original_article_id`。對於新問題請省略此參數，以避免引入過期的執行緒上下文。
6. 當使用者需要已完成文章的參考文獻或 BibTeX 時，呼叫 `oe_citations_get`。
7. 始終將輸出內容視為證據研究上下文，而非醫療建議、醫療診斷或臨床處方。

相關指令彙整：

| 指令 | 用途 |
| --- | --- |
| `npm run login:session` | 一次性登入。使用本機 OpenEvidence MCP 設定檔開啟 Chrome/Edge。 |
| `npm run smoke` | 驗證身份認證及 OpenEvidence 的基礎連通性。 |

## 執行環境要求 (Requirements)

- Node.js 20+
- npm 10+
- OpenEvidence 帳號
- macOS、Windows 或 Linux
- 系統中已安裝 Chrome、Edge 或 Chromium

## OpenEvidence 可用性說明 (Availability Note)

OpenEvidence 的可用性可能取決於地區、帳號資格和 OpenEvidence 官方政策。2026 年 5 月的公開資料表明，該服務以已驗證的美國執業醫療專業人員（HCP/NPI）為中心，且在歐盟（EU）與英國（U.K.）無法使用；本專案不會改變這些限制。

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

## 登入工作流 (Login Flow)

一次性登入：

```bash
npm run login:session
```

該指令會使用本機 OpenEvidence MCP 瀏覽器設定檔開啟 Chrome 或 Edge。請使用您自己的帳號登入 OpenEvidence，確認正常的 OpenEvidence 頁面已載入，關閉該瀏覽器視窗，返回終端機並按 Enter 鍵。

預設的本機設定檔路徑：

- macOS/Linux: `~/.openevidence-mcp/browser-profile`
- Windows: `%USERPROFILE%\.openevidence-mcp\browser-profile`

MCP 伺服器在其行程存續期間會重複使用同一個本機設定檔。它可能會以最小化模式啟動本機瀏覽器行程來執行 OpenEvidence 呼叫，但不會安裝任何擴充功能、不對外開放網路服務、不匯出 Cookies，也不會索取您的密碼。

切勿分享瀏覽器設定檔、Cookies、包含私人帳號資料的截圖，或任何涉及患者身份識別的資訊。

## MCP 用戶端設定 (MCP Client Setup)

在註冊伺服器之前，請先進行建置：

```bash
npm run build
```

### 自動設定（推薦）(Automatic Setup)

使用內建的安裝程式將 OpenEvidence MCP 伺服器註冊到您的用戶端：

| 用戶端 | 指令 |
| --- | --- |
| Claude Desktop | `npx openevidence-mcp install --client claude-app` |
| Codex Desktop | `npx openevidence-mcp install --client codex-app` |
| Claude Code | `npx openevidence-mcp install --client claude-code` |
| Codex CLI | `npx openevidence-mcp install --client codex-cli` |
| Google Antigravity | `npx openevidence-mcp install --client antigravity` |
| Cursor | `npx openevidence-mcp install --client cursor` |
| Windsurf | `npx openevidence-mcp install --client windsurf` |

每個用戶端也有對應的 npm 捷徑指令，例如 `npm run install:cursor`。若要解除安裝：

```bash
npx openevidence-mcp uninstall --client <client-id>
```

### 手動設定 (Manual Setup)

#### Codex

將以下內容加入 `~/.codex/config.toml`：

```toml
[mcp_servers.openevidence]
command = "node"
args = ["/ABSOLUTE/PATH/openevidence-mcp/dist/server.js"]
startup_timeout_sec = 60
```

Windows 範例：

```toml
[mcp_servers.openevidence]
command = "node"
args = ["C:\\Users\\<user>\\openevidence-mcp\\dist\\server.js"]
startup_timeout_sec = 60
```

#### Claude Desktop

將以下內容加入 `claude_desktop_config.json`：

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

#### Cursor、Cline、Continue

如果您的用戶端支援 MCP 伺服器 command/args 設定，可使用相同的 stdio 伺服器格式：

```json
{
  "command": "node",
  "args": ["/ABSOLUTE/PATH/openevidence-mcp/dist/server.js"]
}
```

設定範例位於 `examples/` 目錄。

## 驗證與測試 (Verify)

```bash
npm run smoke
```

若工作階段有效，預期的輸出結果應包含：

- `ok: true`
- `authenticated: true`
- 經過遮蔽（去識別化）的歷史記錄預覽

如果冒煙測試因身份驗證錯誤而失敗，請重新執行 `npm run login:session`。冒煙測試需要真實的 OpenEvidence 帳號工作階段；除非有可用的本機工作階段設定檔，否則在純淨的 CI 環境中無法通過。

預設情況下，冒煙測試輸出會對帳號和歷史內容進行遮蔽（Redact）。只有在私有終端機中且確實需要原始帳號/歷史數據進行偵錯時，才使用 `npm run smoke -- --verbose`。

開發人員檢查指令：

```bash
npm test
npm run build
npm run check
```

## 安全須知 (Security Notes)

- 請將瀏覽器設定檔和 Cookies 視為機密。
- 切勿提交 `.env`、工作階段狀態、包含帳號資料的截圖，或任何涉及患者身份識別的資訊。
- 僅使用您自己的 OpenEvidence 帳號。
- 確保 MCP 用戶端設定指向您本機控制且已建置的伺服器路徑。
- 在臨床或營運工作流中使用自主智能體（Autonomous Agents）的輸出之前，請先審查其工具呼叫行為。
- 漏洞報告及支援範圍請參見 `SECURITY.md`。

## 常見問題與偵錯 (Troubleshooting)

詳細的恢復步驟請參見 `docs/TROUBLESHOOTING.md`。

常見修復方法：

- `authenticated: false`：重新執行 `npm run login:session`。
- MCP 用戶端無法啟動伺服器：確認 `npm run build` 已成功執行，且使用指向 `dist/server.js` 的絕對路徑。
- Windows 路徑問題：在 JSON/TOML 中對反斜線進行轉義，或使用完整的絕對路徑。
- Node 錯誤：確認 `node --version` 版本不低於 20。
- OpenEvidence 介面或 API 發生變更：請提交 Issue，並附帶已遮蔽的日誌（不含任何私人帳號及患者資訊）。
- `oe_ask` 找不到提問輸入框或送出按鈕：OpenEvidence 介面可能已變更；請提交 Issue，並附帶已遮蔽的日誌（不含任何私人帳號及患者資訊）。

## 規劃路線圖 (Roadmap)

- 發佈到官方 MCP Registry（`server.json` 清單已準備完成）。
- Crossref 驗證的引用中繼資料快取。
- 可選的文章成品落地磁碟（answer.md、citations.bib）。
- 隨著用戶端設定格式的演進，持續追蹤並更新 MCP 用戶端設定範例。

## 授權條款與署名 (License & Attribution)

Apache-2.0（`LICENSE`）+ `NOTICE`。

本倉庫是原始的 OpenEvidence MCP 專案，於 2026 年 2 月發佈。如果您再散布、分叉（fork）或建置衍生版本，請保留以下署名：

- 原作者: Bakhtier Sizhaev
- 原始倉庫: `https://github.com/bakhtiersizhaev/openevidence-mcp`

推薦的署名行格式：

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
