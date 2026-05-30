import { spawn, type ChildProcess } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { fileURLToPath } from "node:url";

import type { AppConfig } from "./config.js";
import { findSystemBrowser } from "./system-browser.js";

const DEFAULT_PORT = 47_831;
const BODY_LIMIT_BYTES = 16_384;

interface CompanionJob {
  job_id: string;
  question: string;
  original_article_id?: string;
}

interface CompanionResult {
  ok: boolean;
  article_id?: string;
  error?: string;
}

export class CompanionBridge {
  private server: Server | null = null;
  private browser: ChildProcess | null = null;
  private pendingJob: CompanionJob | null = null;
  private resolvePending: ((result: CompanionResult) => void) | null = null;
  private polls = 0;
  private jobsDelivered = 0;
  private resultsReceived = 0;

  constructor(private readonly config: AppConfig) {}

  async submitQuestion(question: string, originalArticleId?: string): Promise<string> {
    if (this.pendingJob) {
      throw new Error("Another oe_ask request is already pending.");
    }
    await this.ensureStarted();
    const job: CompanionJob = {
      job_id: randomUUID(),
      question,
      original_article_id: originalArticleId,
    };
    this.pendingJob = job;

    const result = await new Promise<CompanionResult>((resolve) => {
      const timeout = setTimeout(() => {
        this.clearPending();
        resolve({
          ok: false,
          error:
            "Timed out waiting for the local OpenEvidence companion. Confirm the companion extension is installed in the selected browser profile, run `npm run login:companion`, and retry.",
        });
      }, 60_000);
      this.resolvePending = (value) => {
        clearTimeout(timeout);
        this.clearPending();
        resolve(value);
      };
    });

    if (!result.ok || !result.article_id) {
      throw new Error(result.error ?? "OpenEvidence companion did not return a research thread id.");
    }
    return result.article_id;
  }

  async close(): Promise<void> {
    this.server?.closeAllConnections();
    await new Promise<void>((resolve) => this.server?.close(() => resolve()) ?? resolve());
    this.server = null;
    this.browser?.kill();
    this.browser = null;
    this.clearPending();
  }

  private async ensureStarted(): Promise<void> {
    if (!this.server) {
      this.server = createServer((req, res) => void this.handleRequest(req, res));
      await new Promise<void>((resolve, reject) => {
        this.server!.once("error", reject);
        this.server!.listen(resolveBridgePort(), "127.0.0.1", () => resolve());
      });
    }
    if (!this.browser || this.browser.exitCode !== null) {
      this.browser = launchCompanionBrowser(this.config);
    }
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (req.method === "OPTIONS") {
      return send(res, 204);
    }
    if (req.method === "GET" && req.url === "/v1/next") {
      this.polls += 1;
      if (!this.pendingJob) return send(res, 204);
      this.jobsDelivered += 1;
      return sendJson(res, 200, this.pendingJob);
    }
    if (req.method === "GET" && req.url === "/v1/status") {
      return sendJson(res, 200, {
        polls: this.polls,
        jobs_delivered: this.jobsDelivered,
        results_received: this.resultsReceived,
        pending_job: Boolean(this.pendingJob),
      });
    }
    if (req.method === "POST" && req.url === "/v1/result") {
      const body = await readJsonBody(req);
      if (!body || body.job_id !== this.pendingJob?.job_id) return send(res, 409);
      this.resultsReceived += 1;
      const articleId = typeof body.article_id === "string" ? body.article_id : undefined;
      const error = typeof body.error === "string" ? body.error.slice(0, 300) : undefined;
      this.resolvePending?.({ ok: body.ok === true, article_id: articleId, error });
      return send(res, 204);
    }
    return send(res, 404);
  }

  private clearPending(): void {
    this.pendingJob = null;
    this.resolvePending = null;
  }
}

function launchCompanionBrowser(config: AppConfig): ChildProcess {
  const selected = findSystemBrowser(process.env.OE_MCP_COMPANION_BROWSER ?? "");
  const extensionDir = fileURLToPath(new URL("../extension/", import.meta.url));
  const loadDevelopmentExtension = process.env.OE_MCP_COMPANION_DEV_EXTENSION === "true";
  return spawn(
    selected.executablePath,
    [
      `--user-data-dir=${config.userDataDir}`,
      ...(loadDevelopmentExtension
        ? [`--disable-extensions-except=${extensionDir}`, `--load-extension=${extensionDir}`]
        : []),
      "--no-first-run",
      "--no-default-browser-check",
      "--start-minimized",
      "--window-position=-32000,-32000",
      config.baseUrl,
    ],
    { detached: false, stdio: "ignore", windowsHide: true },
  );
}

function resolveBridgePort(): number {
  const port = Number.parseInt(process.env.OE_MCP_COMPANION_PORT ?? String(DEFAULT_PORT), 10);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("OE_MCP_COMPANION_PORT must be a valid TCP port.");
  }
  return port;
}

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown> | null> {
  const chunks: Buffer[] = [];
  let length = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    length += buffer.length;
    if (length > BODY_LIMIT_BYTES) return null;
    chunks.push(buffer);
  }
  try {
    const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function send(res: ServerResponse, status: number): void {
  res.writeHead(status, corsHeaders());
  res.end();
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { ...corsHeaders(), "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

function corsHeaders(): Record<string, string> {
  return {
    "access-control-allow-origin": "https://www.openevidence.com",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
  };
}
