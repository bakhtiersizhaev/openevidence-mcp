# OpenEvidence MCP (非官方)

OpenEvidence MCP 是一个非官方的 Model Context Protocol (MCP) 服务器。它通过您自己已登录（已认证）的浏览器会话，将 OpenEvidence 连接到 Codex、Claude Code、Claude Desktop、Cursor、Cline、Continue 和其他兼容 MCP 的客户端。

[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-2d72d9)](https://www.apache.org/licenses/LICENSE-2.0)
[![Node.js 20+](https://img.shields.io/badge/node-%3E%3D20-339933)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6)](https://www.typescriptlang.org/)
[![MCP SDK](https://img.shields.io/badge/MCP%20SDK-1.26.0-1d9a5a)](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
[![Playwright](https://img.shields.io/badge/Playwright-1.58.2-4f46e5)](https://playwright.dev/)

> [!IMPORTANT]
> 本项目是非官方的，不隶属于 OpenEvidence。它不提供医疗建议，不绕过访问控制，并且只应在符合适用条款、隐私规则和临床监管（clinical governance）要求的前提下，配合您自己的 OpenEvidence 账号使用。

语言版本 (Translations): [English](README.md) | [Русский](README.ru.md) | [Español](README.es.md) | [繁體中文 (台灣)](README.zh-Hant-TW.md) | [한국어](README.ko.md) | [हिन्दी](README.hi.md)

## 智能体自动安装提示词 (Copy/Paste Agent Install Prompt)

正在使用 Codex、Claude Code 或其他本地 AI 编程智能体（Agent）？复制以下提示词并发送给智能体，让它自动处理环境搭建、MCP 配置、登录引导以及功能验证。

```text
Look into this repository: https://github.com/bakhtiersizhaev/openevidence-mcp

Install OpenEvidence MCP in my local AI CLI / agentic MCP setup. Add it as an MCP server for the CLI or app I am using. Follow the repository README and the agent install playbook at docs/AGENT_INSTALL_PROMPT.md.

Verify local prerequisites: Node.js 20+, npm, git, and Playwright Chromium. Clone or update the repo, run npm ci, npx playwright install chromium, npm run build, and npm run check.

Configure the MCP server with command "node" and args pointing to the absolute path of dist/server.js. Keep the server local and do not expose it over a public network.

Guide me through OpenEvidence login with my own account. First try npm run login. If Google says "This browser or app may not be secure", stop that flow and run npm run login:browser instead. I will complete login in the opened browser window and then press Enter in the terminal.

Do not ask for or expose my password, cookies, tokens, storage-state files, screenshots with private account data, patient-identifiable information, or account identifiers. Do not bypass OpenEvidence, Google, institutional, regional, or account access controls.

After login, run npm run smoke. If smoke returns ok: true and authenticated: true, show me the final MCP config and tell me to restart my AI agent / MCP client so the OpenEvidence tools become available.
```

更详细的智能体操作手册：[`docs/AGENT_INSTALL_PROMPT.md`](docs/AGENT_INSTALL_PROMPT.md)。

## 功能与作用 (What it does)

OpenEvidence MCP 运行一个本地的 stdio MCP 服务器，允许 MCP 客户端使用您现有的 OpenEvidence 浏览器会话来执行以下操作：

- 检查已保存的会话是否已通过身份验证（已登录）；
- 列出您的 OpenEvidence 问题/文章历史记录；
- 通过 ID 获取完整的文章数据（payload）；
- 提交 OpenEvidence 研究问题，并可选择是否等待回答完成；
- 轮询（poll）已有的 OpenEvidence 文章，直到其生成完成。

无需官方 OpenEvidence API Token。

## 局限与安全原则 (What it does NOT do)

- 本项目不隶属于 OpenEvidence，未获得其认可、背书或批准；
- 不提供医疗建议，不代替临床专业判断；
- 不绕过身份验证、付费墙或访问控制；
- 不收集您的任何凭据（如密码等）；
- 除了通过本地 Playwright 请求与 OpenEvidence 交互外，不会将您的浏览器会话状态（Session state）发送到任何其他地方；
- 在未经人工审查的情况下，不应将输出结果直接用于特定患者的诊断或治疗决策。

## 适用对象 (Who it is for)

- 使用自己的 OpenEvidence 账号的临床医生；
- 医学研究人员；
- 构建证据研究工作流的 AI 操作员；
- 将本地工具集成到 Codex、Claude、Cursor、Cline、Continue 或类似客户端的 MCP 开发者。

## 目标与已测试客户端 (Tested / Target Clients)

本项目专为兼容 MCP 的客户端和本地智能体工作流设计。除非另有说明，本仓库仅维护 Codex 和 Claude 风格的本地配置示例。

| 客户端 | 状态 | 备注 |
| --- | --- | --- |
| OpenAI Codex / Codex CLI / Codex app | 目标客户端 | 推荐的本地 MCP 工作流。 |
| Claude Code | 目标客户端 | 推荐的智能体（Agent）工作流。 |
| Claude Desktop / 支持 MCP 的 Claude 客户端 | 目标客户端 | 本地 MCP 服务器配置。 |
| Cursor | 已兼容 | 兼容 MCP 的 IDE 工作流。 |
| Cline | 已兼容 | VS Code 智能体工作流。 |
| Continue | 已兼容 | 开源 IDE 助手工作流。 |
| 支持 MCP 的 VS Code / GitHub Copilot 环境 | 实验性支持 | 取决于本地 MCP 支持及客户端配置。 |
| Windsurf / Zed / Replit / Sourcegraph 风格的 MCP 宿主 | 实验性支持 | 未经测试，不保证可用性。 |
| Gemini CLI / Google Antigravity 风格的智能体环境 | 实验性支持 | 生态关注对象，非持续维护的示例。 |

## 功能特性 (Features)

| 工具名称 | 用途 | 是否需要登录验证 | 副作用 |
| --- | --- | --- | --- |
| `oe_auth_status` | 检查已保存的 OpenEvidence 浏览器会话是否已认证。 | 是，本地会话文件必须存在。 | 无。 |
| `oe_history_list` | 列出历史 OpenEvidence 文章/问题，支持分页和搜索。 | 是。 | 无。 |
| `oe_article_get` | 通过 ID 获取文章，并返回结构化字段（状态、是否完成、问题、答案文本）及原始数据。 | 是。 | 无。 |
| `oe_article_wait` | 等待现有文章生成完成；在执行非阻塞 `oe_ask` 后非常有用。 | 是。 | 无。 |
| `oe_ask` | 提交一个 OpenEvidence 研究问题，并可选择等待文章生成完成。 | 是。 | 会在您的 OpenEvidence 账户中创建问题/文章记录。 |

## 智能体调用注意事项 (Agent Tool-Calling Notes)

MCP 服务器为暴露 MCP prompts 的客户端提供了内置说明和一个名为 `openevidence_research_workflow` 的提示模板。

推荐的智能体工作流：

1. 当登录状态未知时，首先调用 `oe_auth_status`。
2. 仅当用户需要查找之前的 OpenEvidence 工作或文章 ID 时，才使用 `oe_history_list`。
3. 当已拥有文章 ID 时，直接使用 `oe_article_get`。
4. 对于耗时较长的研究问题，建议调用 `oe_ask` 并设置 `wait_for_completion=false`，然后通过返回的 `article_id` 调用 `oe_article_wait`。
5. 仅在确实存在后续连续追加问答时才使用 `original_article_id`。对于新问题请省略此参数，以避免引入过期的上下文。
6. 始终将输出内容视为临床证据检索上下文，而非医疗建议、医疗诊断或临床处方。

相关指令汇总：

| 命令 | 用途 |
| --- | --- |
| `npm run login` | 启动本地浏览器进行登录，并保存可复用的会话状态文件。 |
| `npm run login:browser` | 在 Google SSO 限制 Playwright 登录（提示浏览器不安全）时，使用系统默认浏览器进行登录。 |
| `npm run smoke` | 验证身份认证及 OpenEvidence 的基础连通性。 |

## 运行环境要求 (Requirements)

- Node.js 20+
- npm 10+
- OpenEvidence 账号
- macOS, Windows, 或 Linux
- 通过 Playwright 安装的 Chromium 浏览器 (`npx playwright install chromium`)

## OpenEvidence 可用性说明 (Availability Note)

OpenEvidence 的可用性可能取决于地区、账号资格和 OpenEvidence 官方政策。截至 2026 年 5 月的公开资料表明，该服务主要面向已验证的美国执业医疗专业人员（HCP/NPI），且在欧盟（EU）和英国（U.K.）无法使用。本项目不会（也无法）绕过这些区域、账号或政策限制。

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

## 登录工作流 (Login Flow)

运行：

```bash
npm run login
```

该命令将打开一个浏览器窗口。请使用您自己的账号登录 OpenEvidence，然后返回终端并按回车键（Enter）。登录脚本将验证 `/api/auth/me` 并保存本地浏览器会话状态（Session state）。

默认的会话状态文件保存路径：

- macOS/Linux: `~/.openevidence-mcp/auth/storage-state.json`
- Windows: `%USERPROFILE%\.openevidence-mcp\auth\storage-state.json`

您也可以直接导入已有的 Playwright 会话文件：

```bash
npm run login -- --import /绝对路径/storage-state.json
```

如果 Google 登录提示“此浏览器或应用可能不安全”（This browser or app may not be secure），请使用系统浏览器登录流：

```bash
npm run login:browser
```

此命令会使用本地 OpenEvidence MCP 配置文件启动系统自带的 Chrome 或 Edge 浏览器。请在打开的浏览器窗口中完成登录，然后返回终端并按回车键（Enter）。该脚本将自动保存本地会话状态，并验证 `/api/auth/me` 的连通性。

> [!WARNING]
> 会话状态（Session state）完全存储在您本地。**切勿**公开、泄露或提交您的 `storage-state.json`、Cookies、包含个人账号隐私的截图，或任何涉及患者身份识别的信息。

## MCP 客户端配置 (MCP Client Setup)

在注册服务器之前，请确保先进行构建：

```bash
npm run build
```

### Codex

将以下内容添加到 `~/.codex/config.toml`：

```toml
[mcp_servers.openevidence]
command = "node"
args = ["/绝对路径/openevidence-mcp/dist/server.js"]
startup_timeout_sec = 60
```

Windows 系统配置示例：

```toml
[mcp_servers.openevidence]
command = "node"
args = ["C:\\Users\\<用户名>\\openevidence-mcp\\dist\\server.js"]
startup_timeout_sec = 60
```

### Claude Desktop

将以下内容添加到 `claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "openevidence": {
      "command": "node",
      "args": ["/绝对路径/openevidence-mcp/dist/server.js"]
    }
  }
}
```

### Cursor, Cline, Continue

如果您的客户端支持基于 stdio 方式的 MCP 服务器命令行配置，可使用以下配置格式：

```json
{
  "command": "node",
  "args": ["/绝对路径/openevidence-mcp/dist/server.js"]
}
```

具体的配置示例可在 `examples/` 目录下找到。

## 验证与测试 (Verify)

运行冒烟测试（Smoke Test）：

```bash
npm run smoke
```

若会话有效，预期的输出结果应包含：
- `ok: true`
- `authenticated: true`
- 经过脱敏的历史记录预览

如果冒烟测试因身份验证错误而失败，请重新运行 `npm run login`。冒烟测试需要真实的 OpenEvidence 账户会话，在没有安全配置会话状态的情况下，在纯净的 CI 环境中是无法通过的。

默认情况下，冒烟测试输出会对账号和历史内容进行脱敏（Redact）。只有在私有终端中且确实需要调试原始账号数据时，才使用 `npm run smoke -- --verbose`。

开发人员常用指令：

```bash
npm test          # 运行测试
npm run build     # 构建项目
npm run check     # 运行 TypeScript 类型与代码规范检查
```

## 安全须知 (Security Notes)

- 请将 `storage-state.json`、Cookies 及浏览器配置文件视为**绝密凭证**。
- 切勿将 `.env` 配置文件、会话状态文件、包含敏感账户信息的截图，或任何涉及患者隐私的数据（patient-identifiable information）提交到 Git 仓库。
- 仅应配合您自己拥有的 OpenEvidence 账户使用。
- 确保 MCP 客户端配置中的路径指向您本地控制且已编译的 `dist/server.js` 绝对路径。
- 在临床或实际运营工作流中使用自主智能体（Autonomous Agents）生成的输出之前，请务必先人工审核其工具调用行为及结果。
- 漏洞报告及安全支持范围请参见 `SECURITY.md`。

## 常见问题与调试 (Troubleshooting)

若遇到问题，可查阅 `docs/TROUBLESHOOTING.md` 获取详细的恢复方案。

常见修复方法：
- `authenticated: false`：请重新运行 `npm run login`。
- Google 提示浏览器不安全：请改用 `npm run login:browser`。
- 浏览器安装错误：运行 `npx playwright install chromium`。
- MCP 客户端无法启动服务器：确认 `npm run build` 已成功运行，且配置中使用的是指向 `dist/server.js` 的绝对路径。
- Windows 路径问题：请在 JSON/TOML 中对反斜杠进行双重转义（即 `\\`），或使用正斜杠。
- Node 错误：确认 `node --version` 版本不低于 20。
- OpenEvidence 界面或 API 发生变更：请提交 Issue，并附带已脱敏的日志（不含任何私人账户及患者信息）。

## 规划路线图 (Roadmap)

- 保持工具描述的简洁与智能体友好。
- 添加针对配置和响应解析的重点单元测试。
- 改善冒烟测试的诊断机制，同时保护会话隐私。
- 随着客户端配置格式的演进，持续跟踪并更新 MCP 客户端设置示例。

## 许可证与署名 (License & Attribution)

本项目采用 Apache-2.0 (`LICENSE`) + `NOTICE` 开源协议。

如果您分发、分叉（fork）或构建衍生版本，请保留以下原作者署名：

- 原作者: Bakhtier Sizhaev
- 原始仓库: `https://github.com/bakhtiersizhaev/openevidence-mcp`

推荐的署名行格式：

```text
Based on OpenEvidence MCP by Bakhtier Sizhaev - https://github.com/bakhtiersizhaev/openevidence-mcp
```
