import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

export interface AppConfig {
  baseUrl: string;
  userDataDir: string;
  pollIntervalMs: number;
  pollTimeoutMs: number;
}

const DEFAULT_BASE_URL = "https://www.openevidence.com";
const DEFAULT_ROOT = path.join(homedir(), ".openevidence-mcp");

export function resolveConfig(): AppConfig {
  const rootDir = process.env.OE_MCP_ROOT_DIR ?? DEFAULT_ROOT;
  const userDataDir =
    process.env.OE_MCP_USER_DATA_DIR ?? path.join(rootDir, "browser-profile");

  return {
    baseUrl: process.env.OE_MCP_BASE_URL ?? DEFAULT_BASE_URL,
    userDataDir,
    pollIntervalMs: parsePositiveInt(process.env.OE_MCP_POLL_INTERVAL_MS, 1200),
    pollTimeoutMs: parsePositiveInt(process.env.OE_MCP_POLL_TIMEOUT_MS, 180_000),
  };
}

export function ensureConfigDirs(config: AppConfig): void {
  mkdirSync(config.userDataDir, { recursive: true });
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

