#!/usr/bin/env node
import "dotenv/config";

import { ensureConfigDirs, resolveConfig } from "./config.js";
import { OpenEvidenceClient } from "./openevidence-client.js";

async function main() {
  const config = resolveConfig();
  ensureConfigDirs(config);
  const client = new OpenEvidenceClient(config);
  const verbose = process.argv.includes("--verbose");

  try {
    await client.init();
    const auth = await client.getAuthStatus();
    if (!auth.authenticated) {
      const detail = auth.message ? ` ${auth.message}` : "";
      throw new Error(`Not authenticated. Status=${auth.statusCode}.${detail}`);
    }

    const history = await client.listHistory(3, 0);
    const output = verbose ? {
      ok: true,
      authenticated: true,
      mode: "verbose",
      user: auth.user,
      history_preview: history,
    } : buildSafeSmokeOutput(auth, history);

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

function buildSafeSmokeOutput(auth: Awaited<ReturnType<OpenEvidenceClient["getAuthStatus"]>>, history: unknown) {
  const historyPayload = history as { results?: unknown[]; next?: unknown; previous?: unknown };
  const results = Array.isArray(historyPayload.results) ? historyPayload.results : [];

  return {
    ok: true,
    authenticated: true,
    user: {
      present: Boolean(auth.user),
      email_present: typeof auth.user?.email === "string" && auth.user.email.length > 0,
      name_present: typeof auth.user?.name === "string" && auth.user.name.length > 0,
    },
    history_preview: {
      count: results.length,
      has_next: Boolean(historyPayload.next),
      has_previous: Boolean(historyPayload.previous),
      results: results.map(redactHistoryItem),
    },
    note: "Smoke output is redacted by default. Use `npm run smoke -- --verbose` only in a private terminal if raw account/history payloads are needed for debugging.",
  };
}

function redactHistoryItem(item: unknown) {
  const record = item as {
    id?: unknown;
    status?: unknown;
    article_type?: unknown;
    title?: unknown;
    datetime_created?: unknown;
    access_level?: unknown;
  };

  return {
    id_present: typeof record.id === "string" && record.id.length > 0,
    status: typeof record.status === "string" ? record.status : undefined,
    article_type: typeof record.article_type === "string" ? record.article_type : undefined,
    title_present: typeof record.title === "string" && record.title.length > 0,
    datetime_created: typeof record.datetime_created === "string" ? record.datetime_created : undefined,
    access_level: typeof record.access_level === "string" ? record.access_level : undefined,
  };
}

