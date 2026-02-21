import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { request, type APIRequestContext } from "playwright";

import type { AppConfig } from "./config.js";
import type { AuthStatusResult, OpenEvidenceAskRequest, WaitOptions } from "./types.js";

const DEFAULT_ARTICLE_TYPE = "Ask OpenEvidence Light with citations";
const PENDING_STATUSES = new Set(["queued", "pending", "processing", "running", "in_progress"]);

export class OpenEvidenceClient {
  private ctx: APIRequestContext | null = null;

  constructor(private readonly config: AppConfig) {}

  async init(): Promise<void> {
    await access(this.config.authStatePath, constants.R_OK);
    this.ctx = await request.newContext({
      baseURL: this.config.baseUrl,
      storageState: this.config.authStatePath,
    });
  }

  async close(): Promise<void> {
    if (this.ctx) {
      await this.ctx.dispose();
      this.ctx = null;
    }
  }

  async getAuthStatus(): Promise<AuthStatusResult> {
    const res = await this.api().get("/api/auth/me");
    const statusCode = res.status();
    if (statusCode !== 200) {
      return {
        authenticated: false,
        statusCode,
        message: `OpenEvidence auth is not active (status ${statusCode}). Run login flow.`,
      };
    }

    const user = (await res.json()) as Record<string, unknown>;
    return {
      authenticated: true,
      statusCode,
      user,
    };
  }

  async listHistory(limit = 20, offset = 0, search?: string): Promise<unknown> {
    const query = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    if (search && search.length > 0) {
      query.set("search", search);
    }
    return this.getJson(`/api/article/list?${query.toString()}`);
  }

  async getArticle(articleId: string): Promise<Record<string, unknown>> {
    return (await this.getJson(`/api/article/${articleId}`)) as Record<string, unknown>;
  }

  async ask(payload: OpenEvidenceAskRequest): Promise<Record<string, unknown>> {
    const body: Record<string, unknown> = {
      article_type: payload.articleType ?? DEFAULT_ARTICLE_TYPE,
      inputs: {
        variant_configuration_file: payload.variantConfigurationFile ?? "prod",
        attachments: [],
        question: payload.question,
        use_gatekeeper: true,
      },
      personalization_enabled: payload.personalizationEnabled ?? false,
      disable_caching: payload.disableCaching ?? false,
    };

    if (payload.originalArticleId) {
      body.original_article = payload.originalArticleId;
    }

    return (await this.postJson("/api/article", body)) as Record<string, unknown>;
  }

  async waitForArticle(articleId: string, options?: WaitOptions): Promise<Record<string, unknown>> {
    const timeoutMs = options?.timeoutMs ?? this.config.pollTimeoutMs;
    const intervalMs = options?.intervalMs ?? this.config.pollIntervalMs;
    const started = Date.now();

    while (true) {
      const article = await this.getArticle(articleId);
      const status = String(article.status ?? "").toLowerCase();
      if (status.length > 0 && !PENDING_STATUSES.has(status)) {
        return article;
      }

      if (Date.now() - started > timeoutMs) {
        return article;
      }

      await sleep(intervalMs);
    }
  }

  private api(): APIRequestContext {
    if (!this.ctx) {
      throw new Error("OpenEvidence client is not initialized.");
    }
    return this.ctx;
  }

  private async getJson(url: string): Promise<unknown> {
    const res = await this.getWithRetry(url, 3);
    await assertJsonResponse(res.status(), url);
    return res.json();
  }

  private async postJson(url: string, body: unknown): Promise<unknown> {
    const res = await this.postWithRetry(url, body, 2);
    const status = res.status();
    if (status !== 200 && status !== 201) {
      const text = await res.text();
      throw new Error(`POST ${url} failed: ${status} ${text.slice(0, 400)}`);
    }
    return res.json();
  }

  private async getWithRetry(url: string, attempts: number) {
    let last = await this.api().get(url);
    for (let i = 1; i < attempts; i++) {
      if (last.status() < 500) {
        return last;
      }
      await sleep(i * 400);
      last = await this.api().get(url);
    }
    return last;
  }

  private async postWithRetry(url: string, body: unknown, attempts: number) {
    let last = await this.api().post(url, { data: body });
    for (let i = 1; i < attempts; i++) {
      if (last.status() < 500) {
        return last;
      }
      await sleep(i * 400);
      last = await this.api().post(url, { data: body });
    }
    return last;
  }
}

async function assertJsonResponse(status: number, url: string): Promise<void> {
  if (status >= 200 && status < 300) {
    return;
  }
  throw new Error(`GET ${url} failed with status ${status}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function extractAnswerText(article: Record<string, unknown>): string | null {
  const history = article.inputs as Record<string, unknown> | undefined;
  const historyItems = Array.isArray(history?.history) ? history.history : [];
  if (historyItems.length === 0) {
    return null;
  }

  const last = historyItems[historyItems.length - 1] as Record<string, unknown>;
  const raw = typeof last.outputText === "string" ? last.outputText : null;
  if (!raw) {
    return null;
  }
  return raw;
}
