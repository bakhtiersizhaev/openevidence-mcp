import { platform } from "node:os";
import { chromium, type BrowserContext, type Page, type Response } from "playwright";

import type { AppConfig } from "./config.js";
import { classifyWriteFailure } from "./errors.js";
import { findSystemBrowser } from "./system-browser.js";

const DEFAULT_ARTICLE_TYPE = "Ask OpenEvidence Light with citations";
const ARTICLE_ID_RE = /\/ask\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

interface BrowserFetchResult {
  status: number;
  contentType: string;
  data: unknown;
  text: string;
}

interface PostArticleResult {
  status: number;
  contentType: string;
  data: unknown;
  text: string;
}

export interface BrowserAskPayload {
  question: string;
  originalArticleId?: string;
}

export class BrowserSession {
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private initPromise: Promise<void> | null = null;
  private queue = Promise.resolve();

  constructor(private readonly config: AppConfig) {}

  async init(): Promise<void> {
    this.initPromise ??= this.launch();
    await this.initPromise;
  }

  async close(): Promise<void> {
    const context = this.context;
    this.context = null;
    this.page = null;
    this.initPromise = null;
    await context?.close().catch(() => undefined);
  }

  async getAuthStatus(): Promise<{ authenticated: boolean; statusCode: number; user?: Record<string, unknown>; message?: string }> {
    return this.runExclusive(async () => {
      const result = await this.browserFetch("/api/auth/me");
      if (result.status !== 200) {
        return {
          authenticated: false,
          statusCode: result.status,
          message: `OpenEvidence auth is not active (status ${result.status}). Run: npm run login:session`,
        };
      }
      if (!isRecord(result.data)) {
        return {
          authenticated: false,
          statusCode: result.status,
          message: "OpenEvidence auth endpoint did not return JSON. Session may be expired or redirected.",
        };
      }
      return {
        authenticated: true,
        statusCode: result.status,
        user: result.data,
      };
    });
  }

  async listHistory(limit = 20, offset = 0, search?: string): Promise<unknown> {
    return this.runExclusive(async () => {
      const query = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
      });
      if (search && search.length > 0) {
        query.set("search", search);
      }
      return this.getJson(`/api/article/list?${query.toString()}`);
    });
  }

  async getArticle(articleId: string): Promise<Record<string, unknown>> {
    return this.runExclusive(async () => {
      const data = await this.getJson(`/api/article/${articleId}`);
      if (!isRecord(data)) {
        throw new Error(`GET /api/article/${articleId} did not return an object.`);
      }
      return data;
    });
  }

  async ask(payload: BrowserAskPayload): Promise<Record<string, unknown>> {
    return this.runExclusive(async () => {
      const page = await this.pageForAsk(payload.originalArticleId);
      const previousArticleId = extractArticleId(page.url());
      await fillQuestion(page, payload.question);

      const postResponsePromise = waitForPostArticle(page);
      const routeArticlePromise = waitForNewArticleId(page, previousArticleId);
      await clickSubmit(page);

      const first = await Promise.race([postResponsePromise, routeArticlePromise]);
      if (typeof first === "string") {
        return {
          id: first,
          status: "pending",
          article_type: DEFAULT_ARTICLE_TYPE,
        };
      }

      if (first) {
        assertWriteSucceeded(first);
        if (isRecord(first.data) && typeof first.data.id === "string") {
          return first.data;
        }
      }

      const fallbackArticleId = await routeArticlePromise;
      if (fallbackArticleId) {
        return {
          id: fallbackArticleId,
          status: "pending",
          article_type: DEFAULT_ARTICLE_TYPE,
        };
      }

      throw new Error("OpenEvidence question submit did not return an article id.");
    });
  }

  private async launch(): Promise<void> {
    const browser = findSystemBrowser();
    const isHeadless = process.env.OE_MCP_BROWSER_HEADLESS !== "0";

    this.context = await chromium.launchPersistentContext(this.config.userDataDir, {
      executablePath: browser.executablePath,
      headless: isHeadless,
      viewport: isHeadless ? { width: 1280, height: 800 } : null,
      userAgent: getCleanUserAgent(),
      ignoreDefaultArgs: ["--enable-automation"],
      args: [
        "--no-first-run",
        "--no-default-browser-check",
        "--start-minimized",
        "--disable-blink-features=AutomationControlled",
        "--password-store=basic",
      ],
    });
    await this.context.addInitScript(() => {
      try {
        Object.defineProperty(navigator, "webdriver", {
          get: () => undefined,
        });
      } catch {
        // Ignore errors in standard headless/non-headless environments
      }
    });
    this.page = this.context.pages()[0] ?? await this.context.newPage();
    this.page.setDefaultTimeout(parsePositiveInt(process.env.OE_MCP_BROWSER_TIMEOUT_MS, 30_000));
    await this.page.goto(this.config.baseUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
  }

  private async ensureOpenEvidencePage(path: string): Promise<Page> {
    await this.init();
    const page = await this.currentPage();
    const target = new URL(path, this.config.baseUrl).toString();
    if (!sameOrigin(page.url(), this.config.baseUrl)) {
      await page.goto(target, { waitUntil: "domcontentloaded", timeout: 45_000 });
    }
    return page;
  }

  private async pageForAsk(originalArticleId?: string): Promise<Page> {
    const path = originalArticleId ? `/ask/${originalArticleId}` : "/";
    const page = await this.ensureOpenEvidencePage(path);
    const target = new URL(path, this.config.baseUrl).toString();
    await page.goto(target, { waitUntil: "domcontentloaded", timeout: 45_000 });
    return page;
  }

  private async currentPage(): Promise<Page> {
    if (this.page && !this.page.isClosed()) {
      return this.page;
    }
    if (!this.context) {
      throw new Error("OpenEvidence browser session is not initialized.");
    }
    this.page = this.context.pages().find((candidate) => !candidate.isClosed()) ?? await this.context.newPage();
    return this.page;
  }

  private async browserFetch(path: string, init?: { method?: string; body?: unknown; headers?: Record<string, string> }): Promise<BrowserFetchResult> {
    const page = await this.ensureOpenEvidencePage("/");
    return page.evaluate(
      async ({ requestPath, requestInit }) => {
        const headers = new Headers(requestInit?.headers ?? {});
        if (!headers.has("accept")) {
          headers.set("accept", "application/json, text/plain, */*");
        }
        if (requestInit?.body !== undefined && !headers.has("content-type")) {
          headers.set("content-type", "application/json");
        }
        const response = await fetch(requestPath, {
          method: requestInit?.method ?? "GET",
          headers,
          credentials: "include",
          body:
            requestInit?.body === undefined
              ? undefined
              : JSON.stringify(requestInit.body),
        });
        const contentType = response.headers.get("content-type") ?? "";
        const text = await response.text();
        let data: unknown = null;
        if (text.length > 0 && contentType.toLowerCase().includes("json")) {
          try {
            data = JSON.parse(text) as unknown;
          } catch {
            data = null;
          }
        }
        return {
          status: response.status,
          contentType,
          data,
          text: text.slice(0, 800),
        };
      },
      { requestPath: path, requestInit: init },
    );
  }

  private async getJson(path: string): Promise<unknown> {
    const result = await this.browserFetch(path);
    if (result.status < 200 || result.status >= 300) {
      throw new Error(`GET ${path} failed with status ${result.status}.`);
    }
    return result.data;
  }

  private async runExclusive<T>(fn: () => Promise<T>): Promise<T> {
    const previous = this.queue;
    let release!: () => void;
    this.queue = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      await this.init();
      return await fn();
    } finally {
      release();
    }
  }
}

async function fillQuestion(page: Page, question: string): Promise<void> {
  const input = await findFirstVisible(page, [
    'textarea[aria-label="Ask a medical question"]',
    'textarea[aria-label*="Ask"]',
    'textarea[placeholder*="Ask"]',
    "textarea",
    '[contenteditable="true"]',
  ]);
  if (!input) {
    throw new Error("Could not find the OpenEvidence question input. The OpenEvidence UI may have changed.");
  }
  await input.fill(question);
}

async function clickSubmit(page: Page): Promise<void> {
  const button = await findFirstVisible(page, [
    'button[aria-label="Submit question"]',
    'button[aria-label*="Submit"]',
    'button[type="submit"]',
  ]);
  if (!button) {
    throw new Error("Could not find the OpenEvidence submit button. The OpenEvidence UI may have changed.");
  }
  await button.click({ timeout: 15_000 });
}

async function findFirstVisible(page: Page, selectors: string[]) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    try {
      if ((await locator.count()) > 0 && (await locator.isVisible({ timeout: 2_000 }))) {
        return locator;
      }
    } catch {
      // Try the next selector.
    }
  }
  return null;
}

async function waitForPostArticle(page: Page): Promise<PostArticleResult | null> {
  const response = await page
    .waitForResponse(
      (candidate) =>
        candidate.request().method() === "POST" &&
        new URL(candidate.url()).pathname === "/api/article",
      { timeout: 60_000 },
    )
    .catch(() => null);
  if (!response) {
    return null;
  }
  return readResponse(response);
}

async function waitForNewArticleId(page: Page, previousArticleId: string | null): Promise<string | null> {
  const handle = await page
    .waitForFunction(
      (previous) => {
        const match = window.location.pathname.match(
          /\/ask\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
        );
        const id = match?.[1] ?? null;
        return id && id !== previous ? id : null;
      },
      previousArticleId,
      { timeout: 60_000 },
    )
    .catch(() => null);
  if (!handle) {
    return null;
  }
  const value = await handle.jsonValue();
  return typeof value === "string" ? value : null;
}

async function readResponse(response: Response): Promise<PostArticleResult> {
  const status = response.status();
  const contentType = response.headers()["content-type"] ?? "";
  const text = await response.text().catch(() => "");
  let data: unknown = null;
  if (text.length > 0 && contentType.toLowerCase().includes("json")) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = null;
    }
  }
  return {
    status,
    contentType,
    data,
    text: text.slice(0, 800),
  };
}

function assertWriteSucceeded(result: PostArticleResult): void {
  if (result.status === 200 || result.status === 201) {
    return;
  }
  throw new Error(classifyWriteFailure(result.status, result.contentType, result.text));
}

function sameOrigin(url: string, baseUrl: string): boolean {
  try {
    return new URL(url).origin === new URL(baseUrl).origin;
  } catch {
    return false;
  }
}

function extractArticleId(url: string): string | null {
  return new URL(url).pathname.match(ARTICLE_ID_RE)?.[1] ?? null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getCleanUserAgent(): string {
  const os = platform();
  if (os === "darwin") {
    return "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
  }
  if (os === "linux") {
    return "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
  }
  return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
}
