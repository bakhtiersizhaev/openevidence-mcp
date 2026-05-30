#!/usr/bin/env node
import "dotenv/config";

import { spawn, type ChildProcess } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { ensureConfigDirs, resolveConfig } from "./config.js";
import { findSystemBrowser } from "./system-browser.js";

async function main() {
  const config = resolveConfig();
  ensureConfigDirs(config);

  const browser = findSystemBrowser(process.env.OE_MCP_COMPANION_BROWSER ?? "");
  const loginUrl = `${config.baseUrl}/login`;
  const extensionDir = fileURLToPath(new URL("../extension/", import.meta.url));

  await mkdir(config.userDataDir, { recursive: true });

  output.write(`[openevidence-mcp] launching ${browser.name} for companion login...\n`);
  output.write(`[openevidence-mcp] login URL: ${loginUrl}\n`);
  output.write(`[openevidence-mcp] profile dir: ${config.userDataDir}\n\n`);

  const child = launchBrowser(browser.executablePath, config.userDataDir, extensionDir, loginUrl);

  try {
    output.write(
      [
        "1) Complete OpenEvidence login in the opened browser window.",
        "2) Confirm that the normal OpenEvidence page loads while signed in.",
        "3) Close the companion browser window so its local profile is flushed to disk.",
        "4) Return here and press Enter.",
        "",
        "This companion login stores the browser profile locally. It does not use CDP,",
        "export cookies, or require a visible browser window during every MCP request.",
        "",
      ].join("\n"),
    );

    await waitForEnter("Press Enter after closing the companion browser window...");
    output.write(`[openevidence-mcp] companion browser profile is ready.\n`);
    output.write(`[openevidence-mcp] next: run npm run smoke, then test oe_ask.\n`);
  } finally {
    child.kill();
  }
}

function launchBrowser(
  executablePath: string,
  userDataDir: string,
  extensionDir: string,
  loginUrl: string,
): ChildProcess {
  const args = [
    `--user-data-dir=${userDataDir}`,
    "--no-first-run",
    "--no-default-browser-check",
  ];

  if (process.env.OE_MCP_COMPANION_DEV_EXTENSION === "true") {
    args.push(`--disable-extensions-except=${extensionDir}`, `--load-extension=${extensionDir}`);
  }

  args.push(loginUrl);

  return spawn(executablePath, args, {
    detached: false,
    stdio: "ignore",
  });
}

async function waitForEnter(prompt: string): Promise<void> {
  const rl = createInterface({ input, output });
  try {
    await rl.question(`${prompt}\n`);
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown error.";
  output.write(`[openevidence-mcp] failed: ${message.slice(0, 300)}\n`);
  output.write(
    [
      "",
      "Try:",
      "- close other Chrome/Edge windows that use the companion profile;",
      "- set OE_MCP_COMPANION_BROWSER=edge or chrome to choose a browser;",
      "- set OE_MCP_BROWSER_PATH to a browser executable if auto-detection fails.",
      "",
    ].join("\n"),
  );
  process.exit(1);
});
