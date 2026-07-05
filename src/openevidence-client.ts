import { extractAnswerText as extractArticleAnswerText, PENDING_STATUSES } from "./article.js";
import { BrowserSession } from "./browser-session.js";
import type { AppConfig } from "./config.js";
import type { AuthStatusResult, OpenEvidenceAskRequest, WaitOptions } from "./types.js";

export interface WaitForArticleResult {
  article: Record<string, unknown>;
  /** True when polling stopped because the timeout elapsed, not because the article completed. */
  timedOut: boolean;
}

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

  async waitForArticle(articleId: string, options?: WaitOptions): Promise<WaitForArticleResult> {
    const timeoutMs = options?.timeoutMs ?? this.config.pollTimeoutMs;
    const intervalMs = options?.intervalMs ?? this.config.pollIntervalMs;
    const started = Date.now();

    while (true) {
      const article = await this.getArticle(articleId);
      const status = String(article.status ?? "").toLowerCase();
      if (status.length > 0 && !PENDING_STATUSES.has(status)) {
        return { article, timedOut: false };
      }

      if (Date.now() - started > timeoutMs) {
        return { article, timedOut: true };
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
