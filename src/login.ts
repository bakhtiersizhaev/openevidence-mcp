#!/usr/bin/env node
import "dotenv/config";

import { copyFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { chromium, request } from "playwright";

import { ensureConfigDirs, resolveConfig } from "./config.js";

async function main() {
  const config = resolveConfig();
  ensureConfigDirs(config);
  const importPath = getArgValue("--import");

  if (importPath) {
    await copyFile(importPath, config.authStatePath);
    await verifyStateFile(config.baseUrl, config.authStatePath);
    output.write(`[openevidence-mcp] imported and verified auth state: ${config.authStatePath}\n`);
    output.write(`[openevidence-mcp] success. You can now run: npm run smoke\n`);
    return;
  }

  output.write(`[openevidence-mcp] launching browser...\n`);
  output.write(`[openevidence-mcp] base URL: ${config.baseUrl}\n`);
  output.write(`[openevidence-mcp] profile dir: ${config.userDataDir}\n`);
  output.write(`[openevidence-mcp] auth state path: ${config.authStatePath}\n\n`);

  const context = await chromium.launchPersistentContext(config.userDataDir, {
    headless: false,
  });

  try {
    let page = context.pages()[0];
    if (!page) {
      page = await context.newPage();
    }

    await page.goto(`${config.baseUrl}/login`, {
      waitUntil: "domcontentloaded",
      timeout: 90_000,
    });

    output.write(
      [
        "1) Complete login in the opened browser window.",
        "2) After successful login, return here and press Enter.",
        "3) This will save a reusable local auth state for MCP.",
        "",
      ].join("\n"),
    );

    await waitForEnter("Press Enter when login is done...");
    await context.storageState({ path: config.authStatePath });
    await verifyStateFile(config.baseUrl, config.authStatePath);
    output.write(`[openevidence-mcp] auth state saved: ${config.authStatePath}\n`);
    output.write(`[openevidence-mcp] success. You can now run: npm run smoke\n`);
  } finally {
    await context.close();
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

function getArgValue(flag: string): string | undefined {
  const idx = process.argv.findIndex((v) => v === flag);
  if (idx === -1) {
    return undefined;
  }
  const value = process.argv[idx + 1];
  return value;
}

async function verifyStateFile(baseUrl: string, statePath: string): Promise<void> {
  const ctx = await request.newContext({
    baseURL: baseUrl,
    storageState: statePath,
  });
  try {
    const check = await ctx.get("/api/auth/me");
    if (check.status() !== 200) {
      const body = await check.text();
      throw new Error(`Auth check failed (${check.status()}): ${body.slice(0, 300)}`);
    }
  } finally {
    await ctx.dispose();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  output.write(`[openevidence-mcp] failed: ${message}\n`);
  process.exit(1);
});
