#!/usr/bin/env node
import "dotenv/config";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { normalizeArticleResult } from "./article.js";
import { ensureConfigDirs, resolveConfig } from "./config.js";
import { sanitizeHistoryPayload } from "./history.js";
import { extractAnswerText, OpenEvidenceClient } from "./openevidence-client.js";
import type { OpenEvidenceAskRequest } from "./types.js";

const config = resolveConfig();
ensureConfigDirs(config);

const server = new McpServer({
  name: "openevidence-mcp",
  version: "1.0.0",
}, {
  instructions: [
    "OpenEvidence MCP is an unofficial local stdio bridge to the user's own authenticated OpenEvidence browser session.",
    "Use oe_auth_status first when authentication state is unknown.",
    "Use oe_history_list to find recent OpenEvidence article IDs, and oe_article_get to fetch an existing article.",
    "Use oe_ask only for OpenEvidence evidence-research questions. Do not present outputs as medical advice, diagnosis, or clinical orders.",
    "For long research questions, prefer oe_ask with wait_for_completion=false, then call oe_article_wait or oe_article_get with the returned article_id. Some MCP hosts time out long blocking calls.",
    "Use original_article_id only when the user explicitly wants follow-up continuity in that OpenEvidence thread. For fresh questions, omit original_article_id to avoid stale thread context.",
    "Never ask for or expose passwords, cookies, storage-state files, session tokens, account identifiers, screenshots with private account data, or patient-identifiable information.",
  ].join(" "),
});

server.registerPrompt(
  "openevidence_research_workflow",
  {
    title: "OpenEvidence Research Workflow",
    description:
      "Guide an AI agent through safe OpenEvidence MCP usage: auth check, history lookup, fresh question vs follow-up, non-blocking ask, polling, and privacy constraints.",
  },
  () => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: [
            "Use OpenEvidence MCP safely with the user's own authenticated OpenEvidence session.",
            "",
            "Workflow:",
            "1. Call oe_auth_status if auth state is unknown.",
            "2. Call oe_history_list only when the user asks to inspect prior OpenEvidence work or needs an article_id.",
            "3. Call oe_article_get when you already have an article_id and need the current status or answer_text.",
            "4. For a new evidence-research question, call oe_ask. For long questions, set wait_for_completion=false and then call oe_article_wait with the returned article_id.",
            "5. Use original_article_id only for a true follow-up in the same OpenEvidence thread. Omit it for fresh questions or when prior thread context may be stale.",
            "6. Treat OpenEvidence output as research context, not medical advice, diagnosis, or a clinical order.",
            "7. Never expose passwords, cookies, storage-state files, session tokens, account identifiers, screenshots with private data, or patient-identifiable information.",
          ].join("\n"),
        },
      },
    ],
  }),
);

server.registerTool(
  "oe_auth_status",
  {
    title: "OpenEvidence Auth Status",
    description:
      "Check whether the saved OpenEvidence browser session is authenticated. Use before history/article/ask tools when auth state is unknown. Returns authenticated=true/false and basic account metadata when available. Requires local session state. No side effects. Can fail if session state is missing, expired, or network access fails.",
    annotations: {
      readOnlyHint: true,
      idempotentHint: true,
    },
  },
  async () =>
    withClient(async (client) => {
      const status = await client.getAuthStatus();
      return ok(sanitizeAuthStatus(status));
    }),
);

server.registerTool(
  "oe_history_list",
  {
    title: "OpenEvidence History List",
    description:
      "List prior OpenEvidence articles from the authenticated account. Use only when the user asks to inspect prior OpenEvidence work or needs an article_id. Inputs: limit, offset, optional search, optional include_raw=false. Returns a privacy-reduced list by default; include_raw=true may expose private prior questions and must be used only with explicit user intent. Requires authenticated session. No side effects.",
    annotations: {
      readOnlyHint: true,
      idempotentHint: true,
    },
    inputSchema: z.object({
      limit: z.number().int().min(1).max(100).default(20).optional(),
      offset: z.number().int().min(0).default(0).optional(),
      search: z.string().max(200).optional(),
      include_raw: z.boolean().default(false).optional(),
    }),
  },
  async (args) =>
    withClient(async (client) => {
      const data = await client.listHistory(args.limit ?? 20, args.offset ?? 0, args.search);
      return ok(args.include_raw ? data : sanitizeHistoryPayload(data));
    }),
);

server.registerTool(
  "oe_article_get",
  {
    title: "OpenEvidence Article Get",
    description:
      "Fetch an OpenEvidence article by article_id. Use after history lookup or oe_ask returns an article ID. Inputs: article_id UUID, optional include_raw=false. Returns normalized status, question, and answer fields by default. include_raw=true may expose private thread context and must be used only with explicit user intent. Requires authenticated session. No side effects.",
    annotations: {
      readOnlyHint: true,
      idempotentHint: true,
    },
    inputSchema: z.object({
      article_id: z.string().uuid(),
      include_raw: z.boolean().default(false).optional(),
    }),
  },
  async (args) =>
    withClient(async (client) => {
      const article = await client.getArticle(args.article_id);
      const result = {
        ...normalizeArticleResult(article),
        extracted_answer_raw: extractAnswerText(article),
      };
      return ok(args.include_raw ? result : omitRawArticle(result));
    }),
);

server.registerTool(
  "oe_article_wait",
  {
    title: "OpenEvidence Article Wait",
    description:
      "Wait for an existing OpenEvidence article_id to finish, then return normalized fields. Use after oe_ask with wait_for_completion=false, especially for long research questions that may exceed MCP host timeouts. Inputs: article_id UUID, optional timeout_sec, poll_interval_ms, and include_raw=false. include_raw=true may expose private thread context and must be used only with explicit user intent. Requires authenticated session. No side effects.",
    annotations: {
      readOnlyHint: true,
      idempotentHint: true,
    },
    inputSchema: z.object({
      article_id: z.string().uuid(),
      timeout_sec: z.number().int().min(5).max(900).default(180).optional(),
      poll_interval_ms: z.number().int().min(300).max(10000).default(1200).optional(),
      include_raw: z.boolean().default(false).optional(),
    }),
  },
  async (args) =>
    withClient(async (client) => {
      const article = await client.waitForArticle(args.article_id, {
        timeoutMs: (args.timeout_sec ?? 180) * 1000,
        intervalMs: args.poll_interval_ms ?? config.pollIntervalMs,
      });
      const result = {
        ...normalizeArticleResult(article),
        extracted_answer_raw: extractAnswerText(article),
      };
      return ok(args.include_raw ? result : omitRawArticle(result));
    }),
);

server.registerTool(
  "oe_ask",
  {
    title: "OpenEvidence Ask",
    description:
      "Create an OpenEvidence research question, not medical advice or patient-specific diagnosis. For long questions, prefer wait_for_completion=false and then call oe_article_wait with the returned article_id. Use original_article_id only for true follow-up continuity; omit it for fresh questions. Returns privacy-reduced created article data and optionally normalized completed fields. Side effect: creates a question/article in the user's OpenEvidence account. Can fail if upstream browser protection rejects web-session automation.",
    annotations: {
      readOnlyHint: false,
      idempotentHint: false,
    },
    inputSchema: z.object({
      question: z.string().min(3).max(6000),
      original_article_id: z.string().uuid().optional(),
      wait_for_completion: z.boolean().default(true).optional(),
      timeout_sec: z.number().int().min(5).max(600).default(120).optional(),
      poll_interval_ms: z.number().int().min(300).max(10000).default(1200).optional(),
      disable_caching: z.boolean().default(false).optional(),
      personalization_enabled: z.boolean().default(false).optional(),
      article_type: z.string().default("Ask OpenEvidence Light with citations").optional(),
      variant_configuration_file: z.string().default("prod").optional(),
    }),
  },
  async (args) =>
    withClient(async (client) => {
      const askPayload: OpenEvidenceAskRequest = {
        question: args.question,
        originalArticleId: args.original_article_id,
        disableCaching: args.disable_caching ?? false,
        personalizationEnabled: args.personalization_enabled ?? false,
        articleType: args.article_type,
        variantConfigurationFile: args.variant_configuration_file,
      };

      const created = await client.ask(askPayload);
      const articleId = String(created.id ?? "");
      if (!articleId) {
        return fail("OpenEvidence returned no article id.");
      }

      const waitForCompletion = args.wait_for_completion ?? true;
      if (!waitForCompletion) {
        return ok({
          created: sanitizeCreatedArticle(created),
          article_id: articleId,
          note: "Article created. Poll with oe_article_wait or oe_article_get.",
        });
      }

      const article = await client.waitForArticle(articleId, {
        timeoutMs: (args.timeout_sec ?? 120) * 1000,
        intervalMs: args.poll_interval_ms ?? config.pollIntervalMs,
      });

      return ok({
        created: sanitizeCreatedArticle(created),
        ...omitRawArticle(normalizeArticleResult(article)),
        article_id: articleId,
        extracted_answer_raw: extractAnswerText(article),
      });
    }),
);

async function withClient(
  fn: (client: OpenEvidenceClient) => Promise<{
    content: { type: "text"; text: string }[];
    isError?: boolean;
    structuredContent?: Record<string, unknown>;
  }>,
) {
  const client = new OpenEvidenceClient(config);
  try {
    await client.init();
    const auth = await client.getAuthStatus();
    if (!auth.authenticated) {
      return fail(
        `Session is not authenticated (status ${auth.statusCode}). Run: npm run login`,
      );
    }
    return await fn(client);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return fail(message);
  } finally {
    await client.close();
  }
}

function ok(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    structuredContent: toStructured(data),
  };
}

function fail(message: string) {
  return {
    isError: true,
    content: [{ type: "text" as const, text: message }],
  };
}

function toStructured(data: unknown): Record<string, unknown> {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  return { value: data };
}

function omitRawArticle<T extends { article?: unknown }>(result: T): Omit<T, "article"> {
  const { article: _article, ...safe } = result;
  return safe;
}

function sanitizeAuthStatus(status: {
  authenticated: boolean;
  statusCode: number;
  user?: Record<string, unknown>;
  message?: string;
}) {
  return {
    authenticated: status.authenticated,
    statusCode: status.statusCode,
    user: {
      present: Boolean(status.user),
      email_present: typeof status.user?.email === "string" && status.user.email.length > 0,
      name_present: typeof status.user?.name === "string" && status.user.name.length > 0,
    },
    message: status.message,
  };
}

function sanitizeCreatedArticle(article: Record<string, unknown>) {
  return {
    article_id: typeof article.id === "string" ? article.id : null,
    status: typeof article.status === "string" ? article.status : null,
    article_type: typeof article.article_type === "string" ? article.article_type : null,
    datetime_created:
      typeof article.datetime_created === "string" ? article.datetime_created : null,
  };
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  process.stderr.write(`[openevidence-mcp] fatal: ${message}\n`);
  process.exit(1);
});
