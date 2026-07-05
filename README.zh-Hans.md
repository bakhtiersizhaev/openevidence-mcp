# OpenEvidence MCP (非官方)

**首个开源 OpenEvidence MCP 服务器（2026年2月发布）。** 通过您自己已登录（已认证）的浏览器会话，从 Codex、Claude Code、Claude Desktop、Cursor、Windsurf 以及任何兼容 MCP 的客户端查询 OpenEvidence。无需 API Key。一条命令即可为 7 种 MCP 客户端完成安装。支持 fire-and-forget（发起即忘）异步提问 + 轮询。提供结构化引文并支持 BibTeX 导出。

[![CI](https://github.com/bakhtiersizhaev/openevidence-mcp/actions/workflows/test.yml/badge.svg)](https://github.com/bakhtiersizhaev/openevidence-mcp/actions/workflows/test.yml)
[![npm](https://img.shields.io/npm/v/openevidence-mcp)](https://www.npmjs.com/package/openevidence-mcp)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-2d72d9)](https://www.apache.org/licenses/LICENSE-2.0)
[![Node.js 20+](https://img.shields.io/badge/node-%3E%3D20-339933)](https://nodejs.org/)
[![auth](https://img.shields.io/badge/auth-your%20own%20browser%20session-8250df)](#登录工作流-login-flow)
[![citations](https://img.shields.io/badge/citations-BibTeX%20%2B%20Crossref-b60205)](#功能特性-features)

> [!IMPORTANT]
> 本项目是非官方的，不隶属于 OpenEvidence。它不提供医疗建议，并且只应在符合适用条款、隐私规则和临床监管（clinical governance）要求的前提下，配合您自己的 OpenEvidence 账号使用。

语言版本 (Translations): [English](README.md) | [Русский](README.ru.md) | [Español](README.es.md) | [繁體中文（台灣）](README.zh-Hant-TW.md) | [한국어](README.ko.md) | [हिन्दी](README.hi.md)

## 工作原理 (How it works)

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

您只需在真实的浏览器窗口中登录一次（`npm run login:session`）。此后，MCP 服务器会在该配置文件（Profile）上驱动一个最小化的本地浏览器 — Cookies 永远不会离开浏览器，不会导出任何内容，不安装任何扩展，也不开放任何端口。

## 功能与作用 (What it does)

- 检查已保存的会话是否已通过身份验证（已登录）；
- 列出您的 OpenEvidence 问题/文章历史记录；
- 通过 ID 获取完整的文章数据（payload）；
- 提交 OpenEvidence 研究问题 — 支持阻塞式等待或 **fire-and-forget** 异步模式（设置 `wait_for_completion=false` 后轮询）；
- 轮询（poll）已有的 OpenEvidence 文章直到生成完成，并返回明确的 `timed_out` 标志；
- 从已完成的文章中提取**结构化引文**并导出 **BibTeX**（可选 Crossref DOI 元数据增强）。

无需官方 OpenEvidence API Token。

## 局限与安全原则 (What it does NOT do)

- 本项目不隶属于 OpenEvidence，未获得其认可、背书或批准。
- 不提供医疗建议，不代替临床专业判断。
- 不收集您的任何凭据，也不会索要您的密码。
- 除了从您的机器通过本地请求与 OpenEvidence 交互外，不会将您的浏览器会话状态发送到任何其他地方。
- 在未经适当人工审查的情况下，不应将输出结果用于特定患者的诊断或治疗决策。

## 适用对象 (Who it is for)

- 使用自己的 OpenEvidence 账号的临床医生；
- 需要可直接导入文献管理器的引文的医学研究人员；
- 构建证据研究工作流的 AI 操作员；
- 将本地工具集成到 Codex、Claude、Cursor、Cline、Continue 或类似客户端的 MCP 开发者。

## 智能体引导与安装 (Agent Onboarding & Installation)

正在使用 Codex、Claude Code、Cursor 或其他本地 AI 编程智能体（Agent）？让智能体处理全部安装流程：

```text
Please install OpenEvidence MCP for me: clone https://github.com/bakhtiersizhaev/openevidence-mcp, install dependencies, run build, auto-configure this MCP server in my local client (Claude Desktop/Codex/Cursor), guide me through the one-time Edge/Chrome login using `npm run login:session`, and run `npm run smoke` to verify. Keep everything strictly local and secure.
```

完整的分步安装操作手册与规则，请参见 **[docs/AGENT_INSTALL_PROMPT.md](docs/AGENT_INSTALL_PROMPT.md)**。

## 功能特性 (Features)

| 工具名称 | 用途 | 是否需要登录验证 | 副作用 |
| --- | --- | --- | --- |
| `oe_auth_status` | 检查已保存的 OpenEvidence 浏览器会话是否已认证。 | 是，本地浏览器配置文件必须已登录。 | 无。 |
| `oe_history_list` | 列出历史 OpenEvidence 文章，支持分页和搜索。除非显式传入 `include_raw=true`，否则返回经过隐私脱敏的列表。 | 是。 | 无。 |
| `oe_article_get` | 通过 ID 获取文章，并返回规范化字段（`status`、`is_complete`、`question`、`answer_text`、`citations`）。原始数据需通过 `include_raw=true` 显式开启。 | 是。 | 无。 |
| `oe_article_wait` | 等待现有文章 ID 生成完成；当在完成前超时时返回 `timed_out=true`。 | 是。 | 无。 |
| `oe_ask` | 创建一个 OpenEvidence 研究问题，并可选择等待文章生成完成。设置 `wait_for_completion=false` 即可 fire-and-forget（发起即忘）。 | 是。 | 会在您的 OpenEvidence 账户中创建问题/文章记录。 |
| `oe_citations_get` | 从已完成的文章中提取结构化引文，返回 JSON + BibTeX。设置 `validate_crossref=true` 可用 Crossref 元数据增强 DOI 条目。 | 是。 | 无。 |

## 目标与已测试客户端 (Tested / Target Clients)

| 客户端 | 状态 | 备注 |
| --- | --- | --- |
| OpenAI Codex / Codex CLI / Codex app | 目标客户端 | 推荐的本地 MCP 工作流。 |
| Claude Code | 目标客户端 | 推荐的智能体（Agent）工作流。 |
| Claude Desktop / 支持 MCP 的 Claude 客户端 | 目标客户端 | 本地 MCP 服务器配置。 |
| Cursor | 已兼容 | 兼容 MCP 的 IDE 工作流。 |
| Cline | 已兼容 | VS Code 智能体工作流。 |
| Continue | 已兼容 | 开源 IDE 助手工作流。 |
| 支持 MCP 的 VS Code / GitHub Copilot 环境 | 实验性支持 | 取决于本地 MCP 支持及客户端配置。 |
| Windsurf / Zed / Replit / Sourcegraph 风格的 MCP 宿主 | 实验性支持 | Windsurf 已被安装器覆盖。 |
| Gemini CLI / Google Antigravity 风格的智能体环境 | 实验性支持 | Antigravity 已被安装器覆盖。 |

## 智能体调用注意事项 (Agent Tool-Calling Notes)

MCP 服务器为暴露 MCP prompts 的客户端提供了内置说明和一个名为 `openevidence_research_workflow` 的提示模板。

推荐的智能体工作流：

1. 当登录状态未知时，首先调用 `oe_auth_status`。
2. 仅当用户需要查找之前的 OpenEvidence 工作或文章 ID 时，才使用 `oe_history_list`。
3. 当已拥有文章 ID 时，直接使用 `oe_article_get`。
4. 对于耗时较长的研究问题，调用 `oe_ask` 并设置 `wait_for_completion=false`，然后通过返回的 `article_id` 调用 `oe_article_wait`。
5. 仅在确实存在后续连续追加问答时才使用 `original_article_id`。对于新问题请省略此参数，以避免引入过期的线程上下文。
6. 当用户需要从已完成的文章中获取参考文献或 BibTeX 时，调用 `oe_citations_get`。
7. 始终将输出内容视为证据研究上下文，而非医疗建议、医疗诊断或临床处方。

相关指令汇总：

| 命令 | 用途 |
| --- | --- |
| `npm run login:session` | 一次性登录。使用本地 OpenEvidence MCP 配置文件启动 Chrome/Edge。 |
| `npm run smoke` | 验证身份认证及 OpenEvidence 的基础连通性。 |

## 运行环境要求 (Requirements)

- Node.js 20+
- npm 10+
- OpenEvidence 账号
- macOS、Windows 或 Linux
- 系统中已安装 Chrome、Edge 或 Chromium

## OpenEvidence 可用性说明 (Availability Note)

OpenEvidence 的可用性可能取决于地区、账号资格和 OpenEvidence 官方政策。截至 2026 年 5 月的公开资料表明，该服务面向已验证的美国执业医疗专业人员（HCP/NPI），且在欧盟（EU）和英国（U.K.）无法使用；本项目不改变这些限制。

相关参考链接：

- [OpenEvidence 官网](https://www.openevidence.com/)
- [OpenEvidence API/产品介绍页](https://www.openevidence.com/product/api)
- [OpenEvidence 隐私政策](https://www.openevidence.com/policies/privacy)

## 快速开始 (Quick Start)

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

## 登录工作流 (Login Flow)

一次性登录：

```bash
npm run login:session
```

该命令会使用本地 OpenEvidence MCP 浏览器配置文件启动 Chrome 或 Edge。请使用您自己的账号登录 OpenEvidence，确认正常的 OpenEvidence 页面已加载，关闭该浏览器窗口，返回终端并按回车键（Enter）。

默认的本地配置文件路径：

- macOS/Linux: `~/.openevidence-mcp/browser-profile`
- Windows: `%USERPROFILE%\.openevidence-mcp\browser-profile`

MCP 服务器在其进程生命周期内会复用同一个本地配置文件。它可能会为 OpenEvidence 调用启动一个最小化的本地浏览器进程，但不会安装扩展、不会暴露公共网络服务、不会导出 Cookies，也不会索要您的密码。

请勿分享浏览器配置文件、Cookies、包含私人账户数据的截图，或任何涉及患者身份识别的信息。

## MCP 客户端配置 (MCP Client Setup)

在注册服务器之前，请确保先进行构建：

```bash
npm run build
```

### 自动配置（推荐）(Automatic Setup)

使用内置安装器将 OpenEvidence MCP 服务器注册到您的客户端：

| 客户端 | 命令 |
| --- | --- |
| Claude Desktop | `npx openevidence-mcp install --client claude-app` |
| Codex Desktop | `npx openevidence-mcp install --client codex-app` |
| Claude Code | `npx openevidence-mcp install --client claude-code` |
| Codex CLI | `npx openevidence-mcp install --client codex-cli` |
| Google Antigravity | `npx openevidence-mcp install --client antigravity` |
| Cursor | `npx openevidence-mcp install --client cursor` |
| Windsurf | `npx openevidence-mcp install --client windsurf` |

每个客户端还提供 npm 快捷命令，例如 `npm run install:cursor`。卸载方式：

```bash
npx openevidence-mcp uninstall --client <client-id>
```

### 手动配置 (Manual Setup)

#### Codex

将以下内容添加到 `~/.codex/config.toml`：

```toml
[mcp_servers.openevidence]
command = "node"
args = ["/ABSOLUTE/PATH/openevidence-mcp/dist/server.js"]
startup_timeout_sec = 60
```

Windows 系统配置示例：

```toml
[mcp_servers.openevidence]
command = "node"
args = ["C:\\Users\\<user>\\openevidence-mcp\\dist\\server.js"]
startup_timeout_sec = 60
```

#### Claude Desktop

将以下内容添加到 `claude_desktop_config.json`：

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

如果您的客户端支持 MCP 服务器 command/args 配置，可使用相同的 stdio 服务器配置格式：

```json
{
  "command": "node",
  "args": ["/ABSOLUTE/PATH/openevidence-mcp/dist/server.js"]
}
```

具体的配置示例可在 `examples/` 目录下找到。

## 验证与测试 (Verify)

```bash
npm run smoke
```

若会话有效，预期的输出结果应包含：

- `ok: true`
- `authenticated: true`
- 经过脱敏的历史记录预览

如果冒烟测试因身份验证错误而失败，请重新运行 `npm run login:session`。冒烟测试需要真实的 OpenEvidence 账户会话；除非本地会话配置文件可用，否则在纯净的 CI 环境中无法通过。

默认情况下，冒烟测试输出会对账号和历史内容进行脱敏（Redact）。只有在私有终端中且确实需要原始账号/历史数据进行调试时，才使用 `npm run smoke -- --verbose`。

开发人员检查项：

```bash
npm test
npm run build
npm run check
```

## 安全须知 (Security Notes)

- 请将浏览器配置文件和 Cookies 视为机密信息。
- 切勿提交 `.env` 文件、会话状态、包含账户数据的截图，或任何涉及患者身份识别的信息。
- 仅应使用您自己拥有的 OpenEvidence 账户。
- 确保 MCP 客户端配置指向您本地控制的已构建服务器路径。
- 在临床或实际运营工作流中使用自主智能体（Autonomous Agents）的输出之前，请务必先人工审核其工具调用行为。
- 漏洞报告及安全支持范围请参见 `SECURITY.md`。

## 常见问题与调试 (Troubleshooting)

详细的恢复步骤请参见 `docs/TROUBLESHOOTING.md`。

常见修复方法：

- `authenticated: false`：请重新运行 `npm run login:session`。
- MCP 客户端无法启动服务器：确认 `npm run build` 已成功运行，且配置中使用的是指向 `dist/server.js` 的绝对路径。
- Windows 路径问题：请在 JSON/TOML 中对反斜杠进行转义，或使用完整的绝对路径。
- Node 错误：确认 `node --version` 版本不低于 20。
- OpenEvidence 界面或 API 发生变更：请提交 Issue，并附带已脱敏的日志（不含任何私人账户及患者信息）。
- `oe_ask` 找不到问题输入框或提交按钮：OpenEvidence 界面可能已变更；请提交 Issue，并附带已脱敏的日志（不含任何私人账户及患者信息）。

## 规划路线图 (Roadmap)

- 发布到官方 MCP Registry（`server.json` 清单已就绪）。
- 经 Crossref 验证的引文元数据缓存。
- 可选的文章产物落盘（answer.md、citations.bib）。
- 随着客户端配置格式的演进，持续跟踪并更新 MCP 客户端设置示例。

## 许可证与署名 (License & Attribution)

Apache-2.0 (`LICENSE`) + `NOTICE`。

本仓库是 OpenEvidence MCP 的原始仓库，于 2026 年 2 月发布。如果您分发、分叉（fork）或构建衍生版本，请保留以下署名：

- 原作者: Bakhtier Sizhaev
- 原始仓库: `https://github.com/bakhtiersizhaev/openevidence-mcp`

推荐的署名行格式：

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
