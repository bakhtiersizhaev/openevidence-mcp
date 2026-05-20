#!/usr/bin/env node
import "dotenv/config";

import { spawn, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { homedir, platform } from "node:os";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { chromium, type BrowserContext } from "playwright";

import { ensureConfigDirs, resolveConfig } from "./config.js";

interface BrowserChoice {
  name: string;
  executablePath: string;
}

async function main() {
  const config = resolveConfig();
  ensureConfigDirs(config);

  const port = parseInt(process.env.OE_MCP_BROWSER_DEBUG_PORT ?? "9222", 10);
  const browser = findBrowser();
  const loginUrl = `${config.baseUrl}/login`;

  await mkdir(config.userDataDir, { recursive: true });

  output.write(`[openevidence-mcp] launching ${browser.name}...\n`);
  output.write(`[openevidence-mcp] login URL: ${loginUrl}\n`);
  output.write(`[openevidence-mcp] profile dir: ${config.userDataDir}\n`);
  output.write(`[openevidence-mcp] auth state path: ${config.authStatePath}\n\n`);

  const child = launchBrowser(browser.executablePath, config.userDataDir, port, loginUrl);

  try {
    output.write(
      [
        "1) Complete OpenEvidence login in the opened browser window.",
        "2) If Google blocks the normal Playwright login, this system-browser flow often works better.",
        "3) After OpenEvidence is logged in, return here and press Enter.",
        "4) This will save a reusable local auth state for MCP.",
        "",
      ].join("\n"),
    );

    await waitForEnter("Press Enter when OpenEvidence login is done...");
    const verified = await saveStorageStateFromBrowser(port, config.authStatePath);
    output.write(`[openevidence-mcp] auth state saved: ${config.authStatePath}\n`);
    if (verified) {
      output.write(`[openevidence-mcp] browser session looked authenticated.\n`);
    } else {
      output.write(
        `[openevidence-mcp] warning: browser-side auth verification did not complete. Run npm run smoke next.\n`,
      );
    }
    output.write(`[openevidence-mcp] next: npm run smoke\n`);
  } finally {
    child.kill();
  }
}

function findBrowser(): BrowserChoice {
  const explicitPath = process.env.OE_MCP_BROWSER_PATH;
  if (explicitPath) {
    if (!existsSync(explicitPath)) {
      throw new Error(`OE_MCP_BROWSER_PATH does not exist: ${explicitPath}`);
    }
    return { name: "custom browser", executablePath: explicitPath };
  }

  const preferred = (process.env.OE_MCP_BROWSER ?? "").toLowerCase();
  const candidates = getBrowserCandidates();
  const ordered = preferred
    ? [
        ...candidates.filter((candidate) => candidate.name.toLowerCase().includes(preferred)),
        ...candidates.filter((candidate) => !candidate.name.toLowerCase().includes(preferred)),
      ]
    : candidates;

  const found = ordered.find((candidate) => existsSync(candidate.executablePath));
  if (!found) {
    throw new Error(
      [
        "Could not find Chrome, Edge, or Chromium.",
        "Install one of them or set OE_MCP_BROWSER_PATH to the browser executable.",
      ].join(" "),
    );
  }

  return found;
}

function getBrowserCandidates(): BrowserChoice[] {
  const os = platform();
  if (os === "win32") {
    const local = process.env.LOCALAPPDATA ?? "";
    const programFiles = process.env.ProgramFiles ?? "";
    const programFilesX86 = process.env["ProgramFiles(x86)"] ?? "";
    return [
      {
        name: "Google Chrome",
        executablePath: path.join(programFiles, "Google", "Chrome", "Application", "chrome.exe"),
      },
      {
        name: "Google Chrome",
        executablePath: path.join(programFilesX86, "Google", "Chrome", "Application", "chrome.exe"),
      },
      {
        name: "Google Chrome",
        executablePath: path.join(local, "Google", "Chrome", "Application", "chrome.exe"),
      },
      {
        name: "Microsoft Edge",
        executablePath: path.join(programFiles, "Microsoft", "Edge", "Application", "msedge.exe"),
      },
      {
        name: "Microsoft Edge",
        executablePath: path.join(programFilesX86, "Microsoft", "Edge", "Application", "msedge.exe"),
      },
    ];
  }

  if (os === "darwin") {
    return [
      {
        name: "Google Chrome",
        executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      },
      {
        name: "Microsoft Edge",
        executablePath: "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      },
      {
        name: "Chromium",
        executablePath: "/Applications/Chromium.app/Contents/MacOS/Chromium",
      },
    ];
  }

  return [
    { name: "Google Chrome", executablePath: "/usr/bin/google-chrome" },
    { name: "Google Chrome", executablePath: "/usr/bin/google-chrome-stable" },
    { name: "Microsoft Edge", executablePath: "/usr/bin/microsoft-edge" },
    { name: "Microsoft Edge", executablePath: "/usr/bin/microsoft-edge-stable" },
    { name: "Chromium", executablePath: "/usr/bin/chromium" },
    { name: "Chromium", executablePath: "/usr/bin/chromium-browser" },
  ];
}

function launchBrowser(
  executablePath: string,
  userDataDir: string,
  port: number,
  loginUrl: string,
): ChildProcess {
  const args = [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    loginUrl,
  ];

  return spawn(executablePath, args, {
    detached: false,
    stdio: "ignore",
  });
}

async function saveStorageStateFromBrowser(
  port: number,
  authStatePath: string,
): Promise<boolean> {
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
  try {
    const context = browser.contexts()[0];
    if (!context) {
      throw new Error("No browser context found. Keep the launched browser window open before pressing Enter.");
    }

    const verified = await looksLoggedIn(context);
    await mkdir(path.dirname(authStatePath), { recursive: true });
    await context.storageState({ path: authStatePath });
    return verified;
  } finally {
    await browser.close();
  }
}

async function waitForEnter(prompt: string): Promise<void> {
  const rl = createInterface({ input, output });
  try {
    await rl.question(`${prompt}\n`);
  } finally {
    rl.close();
  }
}

async function looksLoggedIn(context: BrowserContext): Promise<boolean> {
  const cookies = await context.cookies();
  return cookies.some((cookie) => cookie.name.startsWith("appSession"));
}

function sanitizeErrorMessage(message: string): string {
  const firstLine = message.split(/\r?\n/)[0]?.trim() ?? "";
  return firstLine
    .replace(/cookie:\s*.*/i, "cookie: [redacted]")
    .replace(/authorization:\s*.*/i, "authorization: [redacted]")
    .replace(/bearer\s+[A-Za-z0-9._~+/=-]+/gi, "bearer [redacted]")
    .slice(0, 300);
}

main().catch((error) => {
  const message = error instanceof Error ? sanitizeErrorMessage(error.message) : "Unknown error.";
  output.write(`[openevidence-mcp] failed: ${message}\n`);
  output.write(
    [
      "",
      "Try:",
      "- confirm OpenEvidence is logged in before pressing Enter;",
      "- close other Chrome/Edge windows that use the same profile;",
      "- set OE_MCP_BROWSER=edge to try Microsoft Edge;",
      "- set OE_MCP_BROWSER_PATH to a browser executable if auto-detection fails.",
      "",
    ].join("\n"),
  );
  process.exit(1);
});
