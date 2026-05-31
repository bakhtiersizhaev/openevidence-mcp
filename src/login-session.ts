#!/usr/bin/env node
import "dotenv/config";

import { spawn, type ChildProcess } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { ensureConfigDirs, resolveConfig } from "./config.js";
import { findSystemBrowser } from "./system-browser.js";

async function main() {
  const config = resolveConfig();
  ensureConfigDirs(config);

  const browser = findSystemBrowser(process.env.OE_MCP_BROWSER ?? "");
  const loginUrl = `${config.baseUrl}/login`;

  await mkdir(config.userDataDir, { recursive: true });

  output.write(`[openevidence-mcp] launching ${browser.name} for one-time session login...\n`);
  output.write(`[openevidence-mcp] login URL: ${loginUrl}\n`);
  output.write(`[openevidence-mcp] profile dir: ${config.userDataDir}\n\n`);

  const child = launchBrowser(browser.executablePath, config.userDataDir, loginUrl);

  try {
    output.write(
      [
        "1) Complete OpenEvidence login in the opened browser window.",
        "2) Confirm that the normal OpenEvidence page loads while signed in.",
        "3) Close this browser window so its local profile is flushed to disk.",
        "4) Return here and press Enter.",
        "",
        "This stores one local OpenEvidence MCP browser profile. It does not export cookies,",
        "install an extension, or ask for your password.",
        "",
      ].join("\n"),
    );

    await waitForEnter("Press Enter after closing the browser window...");
    output.write(`[openevidence-mcp] local browser session is ready.\n`);
    output.write(`[openevidence-mcp] next: run npm run smoke, then test oe_ask.\n`);
  } finally {
    child.kill();
  }
}

function launchBrowser(
  executablePath: string,
  userDataDir: string,
  loginUrl: string,
): ChildProcess {
  const args = [
    `--user-data-dir=${userDataDir}`,
    "--no-first-run",
    "--no-default-browser-check",
  ];

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
      "- close other Chrome/Edge windows that use this MCP browser profile;",
      "- set OE_MCP_BROWSER=edge or chrome to choose a browser;",
      "- set OE_MCP_BROWSER_PATH to a browser executable if auto-detection fails.",
      "",
    ].join("\n"),
  );
  process.exit(1);
});
