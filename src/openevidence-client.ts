import { extractAnswerText as extractArticleAnswerText } from "./article.js";
import { BrowserSession } from "./browser-session.js";
import type { AppConfig } from "./config.js";
import type { AuthStatusResult, OpenEvidenceAskRequest, WaitOptions } from "./types.js";

const PENDING_STATUSES = new Set(["queued", "pending", "processing", "running", "in_progress"]);

export class OpenEvidenceClient {
  private readonly browserSession: BrowserSession;

  constructor(private readonly config: AppConfig) {
    this.browserSession = new BrowserSession(config);
  }

  async init(): Promise<void> {
    await this.browserSession.init();
  }

  async close(): Promise<void> {
    await this.browserSession.close();
  }

  async getAuthStatus(): Promise<AuthStatusResult> {
    return this.browserSession.getAuthStatus();
  }

  async listHistory(limit = 20, offset = 0, search?: string): Promise<unknown> {
    return this.browserSession.listHistory(limit, offset, search);
  }

  async getArticle(articleId: string): Promise<Record<string, unknown>> {
    return this.browserSession.getArticle(articleId);
  }

  async ask(payload: OpenEvidenceAskRequest): Promise<Record<string, unknown>> {
    return this.browserSession.ask(payload);
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

}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function extractAnswerText(article: Record<string, unknown>): string | null {
  return extractArticleAnswerText(article)?.text ?? null;
}
