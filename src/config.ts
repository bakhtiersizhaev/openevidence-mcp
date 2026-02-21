import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

export interface AppConfig {
  baseUrl: string;
  authStatePath: string;
  userDataDir: string;
  pollIntervalMs: number;
  pollTimeoutMs: number;
}

const DEFAULT_BASE_URL = "https://www.openevidence.com";
const DEFAULT_ROOT = path.join(homedir(), ".openevidence-mcp");

export function resolveConfig(): AppConfig {
  const rootDir = process.env.OE_MCP_ROOT_DIR ?? DEFAULT_ROOT;
  const authStatePath =
    process.env.OE_MCP_AUTH_STATE_PATH ??
    path.join(rootDir, "auth", "storage-state.json");
  const userDataDir =
    process.env.OE_MCP_USER_DATA_DIR ?? path.join(rootDir, "browser-profile");

  return {
    baseUrl: process.env.OE_MCP_BASE_URL ?? DEFAULT_BASE_URL,
    authStatePath,
    userDataDir,
    pollIntervalMs: parseInt(process.env.OE_MCP_POLL_INTERVAL_MS ?? "1200", 10),
    pollTimeoutMs: parseInt(process.env.OE_MCP_POLL_TIMEOUT_MS ?? "180000", 10),
  };
}

export function ensureConfigDirs(config: AppConfig): void {
  mkdirSync(path.dirname(config.authStatePath), { recursive: true });
  mkdirSync(config.userDataDir, { recursive: true });
}

