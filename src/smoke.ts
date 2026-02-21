#!/usr/bin/env node
import "dotenv/config";

import { ensureConfigDirs, resolveConfig } from "./config.js";
import { OpenEvidenceClient } from "./openevidence-client.js";

async function main() {
  const config = resolveConfig();
  ensureConfigDirs(config);
  const client = new OpenEvidenceClient(config);

  try {
    await client.init();
    const auth = await client.getAuthStatus();
    if (!auth.authenticated) {
      throw new Error(`Not authenticated. Status=${auth.statusCode}`);
    }

    const history = await client.listHistory(3, 0);
    const output = {
      ok: true,
      authenticated: true,
      user: {
        email: auth.user?.email,
        name: auth.user?.name,
      },
      history_preview: history,
    };

    process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  process.stderr.write(`[smoke] failed: ${message}\n`);
  process.exit(1);
});

