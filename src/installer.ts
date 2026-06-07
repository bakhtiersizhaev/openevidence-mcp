import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import * as toml from "smol-toml";

// Authoritative client IDs
export const SUPPORTED_CLIENTS = [
  "claude-app",
  "codex-app",
  "claude-code",
  "codex-cli",
  "antigravity",
  "cursor",
  "windsurf",
];

export interface ServerSpec {
  command: string;
  args: string[];
}

// Simple Myers-like LCS diff helper for showing changes
export function diffLines(oldLines: string[], newLines: string[]): string {
  const dp: number[][] = Array.from({ length: oldLines.length + 1 }, () =>
    Array(newLines.length + 1).fill(0)
  );

  for (let i = 1; i <= oldLines.length; i++) {
    for (let j = 1; j <= newLines.length; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const result: string[] = [];
  let i = oldLines.length;
  let j = newLines.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      result.push(`  ${oldLines[i - 1]}`);
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.push(`+ ${newLines[j - 1]}`);
      j--;
    } else {
      result.push(`- ${oldLines[i - 1]}`);
      i--;
    }
  }

  return result.reverse().join("\n");
}

// Path expansion including ~ and Windows env variables
export function expandPath(p: string): string {
  if (p.startsWith("~")) {
    const homedir = os.homedir();
    if (!homedir) {
      process.stderr.write("Error: User home directory could not be resolved\n");
      process.exit(4);
    }
    if (p === "~") {
      return homedir;
    }
    if (p.startsWith("~/") || p.startsWith("~\\")) {
      return path.join(homedir, p.slice(2));
    }
  }

  if (process.platform === "win32") {
    p = p.replace(/%([^%]+)%/g, (match, varName) => {
      const upperVar = varName.toUpperCase();
      if (upperVar === "APPDATA" || upperVar === "USERPROFILE") {
        const val = process.env[upperVar];
        if (!val) {
          process.stderr.write(`Error: Environment variable %${upperVar}% is missing or empty\n`);
          process.exit(4);
        }
        return val;
      }
      return match;
    });
  }

  return p;
}

export interface ClientPaths {
  configPath: string;
  checkDir?: string;
  clientDisplayName: string;
}

export function getClientPaths(clientId: string): ClientPaths {
  const platform = process.platform;
  if (platform !== "darwin" && platform !== "win32" && platform !== "linux") {
    process.stderr.write(`Error: Unsupported platform: ${platform}\n`);
    process.exit(4);
  }

  const home = os.homedir();
  if (!home) {
    process.stderr.write("Error: User home directory could not be resolved\n");
    process.exit(4);
  }

  const appData = process.env.APPDATA;
  const userProfile = process.env.USERPROFILE;

  if (platform === "win32") {
    if (!appData && clientId !== "codex-app" && clientId !== "cursor" && clientId !== "windsurf") {
      if (clientId === "claude-app" || clientId === "antigravity") {
        process.stderr.write("Error: Environment variable %APPDATA% is missing or empty\n");
        process.exit(4);
      }
    }
    if (!userProfile && (clientId === "cursor" || clientId === "windsurf")) {
      process.stderr.write("Error: Environment variable %USERPROFILE% is missing or empty\n");
      process.exit(4);
    }
  }

  const getLinuxConfigHome = () => {
    return process.env.XDG_CONFIG_HOME && process.env.XDG_CONFIG_HOME.trim() !== ""
      ? process.env.XDG_CONFIG_HOME
      : path.join(home, ".config");
  };

  switch (clientId) {
    case "claude-app": {
      let configPath = "";
      if (platform === "darwin") {
        configPath = path.join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json");
      } else if (platform === "win32") {
        configPath = path.join(appData || "", "Claude", "claude_desktop_config.json");
      } else {
        configPath = path.join(home, ".config", "Claude", "claude_desktop_config.json");
      }
      return { configPath, clientDisplayName: "Claude Desktop" };
    }
    case "codex-app": {
      const configPath = path.join(home, ".codex", "config.toml");
      return { configPath, clientDisplayName: "Codex Desktop" };
    }
    case "antigravity": {
      let checkDir = "";
      if (platform === "darwin") {
        checkDir = path.join(home, "Library", "Application Support", "Antigravity", "User");
      } else if (platform === "win32") {
        checkDir = path.join(appData || "", "Antigravity", "User");
      } else {
        checkDir = path.join(getLinuxConfigHome(), "Antigravity", "User");
      }
      return {
        configPath: path.join(checkDir, "mcp_config.json"),
        checkDir,
        clientDisplayName: "Google Antigravity"
      };
    }
    case "cursor": {
      let checkDir = "";
      if (platform === "win32") {
        checkDir = path.join(userProfile || "", ".cursor");
      } else {
        checkDir = path.join(home, ".cursor");
      }
      return {
        configPath: path.join(checkDir, "mcp.json"),
        checkDir,
        clientDisplayName: "Cursor"
      };
    }
    case "windsurf": {
      let checkDir = "";
      if (platform === "win32") {
        checkDir = path.join(userProfile || "", ".codeium", "windsurf");
      } else {
        checkDir = path.join(home, ".codeium", "windsurf");
      }
      return {
        configPath: path.join(checkDir, "mcp_config.json"),
        checkDir,
        clientDisplayName: "Windsurf"
      };
    }
    default:
      process.stderr.write(`Error: Unknown client id: ${clientId}\n`);
      process.exit(2);
  }
}

function getUtcTimestamp(): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const hh = String(now.getUTCHours()).padStart(2, "0");
  const min = String(now.getUTCMinutes()).padStart(2, "0");
  const ss = String(now.getUTCSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}T${hh}${min}${ss}Z`;
}

function isMatch(existing: any, spec: ServerSpec): boolean {
  if (!existing || typeof existing !== "object") return false;
  return (
    existing.command === spec.command &&
    Array.isArray(existing.args) &&
    existing.args.length === spec.args.length &&
    existing.args.every((val: string, idx: number) => val === spec.args[idx])
  );
}

function writeAtomic(filePath: string, content: string) {
  const tempPath = filePath + ".tmp";
  try {
    fs.writeFileSync(tempPath, content, "utf8");
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    if (fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch {}
    }
    throw err;
  }
}

// Display CLI Help
export function printHelp() {
  process.stdout.write(`OpenEvidence MCP Installer CLI

Usage:
  openevidence-mcp install --client <client-id> [options]
  openevidence-mcp uninstall --client <client-id> [options]
  openevidence-mcp show-config --client <client-id> [options]

Subcommands:
  install        Register the OpenEvidence MCP server with the specified client.
  uninstall      Remove the OpenEvidence MCP server registration from the client.
  show-config    Print the would-be config changes (diff) without modifying files.

Options:
  --client <id>  Target client ID. Supported: ${SUPPORTED_CLIENTS.join(", ")}
  --name <name>  Override default server entry name (default: "openevidence", max 64 chars).
  --server-path <path>  Override path to server.js (must be absolute).
  -h, --help     Show this help screen.

Note:
  CLI_Adapter clients (claude-code, codex-cli) communicate directly with their parent command-line binaries.
  Unlike file-based clients (claude-app, codex-app, cursor, windsurf, antigravity), CLI_Adapter clients do not
  produce local Backup_Files; the lifecycle and backup of their settings are owned by the underlying CLI binaries.
\n`);
}

export function runInstallerCLI(subcommand: string, rawArgs: string[]) {
  const options = parseArgs(rawArgs);

  // Validation of client ID
  if (!options.client) {
    process.stderr.write(`Error: Missing --client argument. Supported clients: ${SUPPORTED_CLIENTS.join(", ")}\n`);
    process.exit(2);
  }
  if (!SUPPORTED_CLIENTS.includes(options.client)) {
    process.stderr.write(`Error: Invalid client ID: "${options.client}". Supported clients: ${SUPPORTED_CLIENTS.join(", ")}\n`);
    process.exit(2);
  }

  // Name override validation
  if (options.name.length < 1 || options.name.length > 64) {
    process.stderr.write(`Error: Server entry name (--name) must be between 1 and 64 characters.\n`);
    process.exit(2);
  }

  // Server path validation
  let serverPath = options.serverPath;
  if (serverPath) {
    serverPath = expandPath(serverPath);
    if (!path.isAbsolute(serverPath)) {
      process.stderr.write(`Error: Server path must be an absolute path: "${serverPath}"\n`);
      process.exit(2);
    }
  } else {
    // Resolve default server path relative to this script
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    let resolved = path.resolve(__dirname, "server.js");
    if (!fs.existsSync(resolved)) {
      resolved = path.resolve(__dirname, "../dist/server.js");
    }
    serverPath = resolved;
  }

  const spec: ServerSpec = {
    command: "node",
    args: [serverPath],
  };

  // Route to proper adapter
  if (options.client === "claude-code" || options.client === "codex-cli") {
    handleCLIClient(subcommand, options.client, options.name, spec);
  } else {
    handleFileClient(subcommand, options.client, options.name, spec);
  }
}

function parseArgs(args: string[]) {
  const options = {
    client: "",
    name: "openevidence",
    serverPath: "",
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--client") {
      options.client = args[i + 1] || "";
      i++;
    } else if (args[i] === "--name") {
      options.name = args[i + 1] || "";
      i++;
    } else if (args[i] === "--server-path") {
      options.serverPath = args[i + 1] || "";
      i++;
    } else if (args[i] === "-h" || args[i] === "--help") {
      printHelp();
      process.exit(0);
    }
  }
  return options;
}

// CLI Clients: claude-code, codex-cli
function handleCLIClient(subcommand: string, client: string, entryName: string, spec: ServerSpec) {
  const binary = client === "claude-code" ? "claude" : "codex";
  const docUrl =
    client === "claude-code"
      ? "https://docs.anthropic.com/en/docs/agents-and-tools/claude-code"
      : "https://modelcontextprotocol.io";

  // Check if binary is on PATH (runs within 2 seconds)
  const isWin = process.platform === "win32";
  const checkCmd = isWin ? "where.exe" : "which";
  const checkArgs = isWin ? [binary] : [binary];

  const pathCheck = spawnSync(checkCmd, checkArgs, { timeout: 2000 });
  if (pathCheck.status !== 0) {
    process.stderr.write(`${client === "claude-code" ? "Claude Code" : "Codex CLI"} is not installed or not on PATH. Please visit ${docUrl}. Run the client once and try again.\n`);
    process.exit(3);
  }

  if (subcommand === "show-config") {
    let wouldRun = "";
    if (client === "claude-code") {
      wouldRun = `claude mcp add ${entryName} --scope user -- ${spec.command} ${spec.args.join(" ")}`;
    } else {
      wouldRun = `codex mcp add ${entryName} -- ${spec.command} ${spec.args.join(" ")}`;
    }
    process.stdout.write(`Would execute command:\n+ ${wouldRun}\n`);
    process.exit(0);
  }

  if (subcommand === "install") {
    if (client === "codex-cli") {
      process.stderr.write(`Warning: the ~/.codex/config.toml is shared with the Codex_App desktop client and running both "codex-app" and "codex-cli" install commands targets one shared config file.\n`);
    }

    const addArgs =
      client === "claude-code"
        ? ["mcp", "add", entryName, "--scope", "user", "--", spec.command, ...spec.args]
        : ["mcp", "add", entryName, "--", spec.command, ...spec.args];

    const addRes = spawnSync(binary, addArgs, { timeout: 30000 });

    if (addRes.error && (addRes.error as any).code === "ETIMEDOUT") {
      process.stderr.write(`Error: Subprocess timed out after 30 seconds\n`);
      process.exit(1);
    }

    if (addRes.status !== 0) {
      const errStr = addRes.stderr.toString();
      const outStr = addRes.stdout.toString();
      const combinedOutput = errStr + "\n" + outStr;

      if (/exist/i.test(combinedOutput)) {
        const removeRes = spawnSync(binary, ["mcp", "remove", entryName], { timeout: 30000 });
        if (removeRes.error && (removeRes.error as any).code === "ETIMEDOUT") {
          process.stderr.write(`Error: Subprocess timed out after 30 seconds\n`);
          process.exit(1);
        }

        const retryRes = spawnSync(binary, addArgs, { timeout: 30000 });
        if (retryRes.error && (retryRes.error as any).code === "ETIMEDOUT") {
          process.stderr.write(`Error: Subprocess timed out after 30 seconds\n`);
          process.exit(1);
        }

        if (retryRes.status !== 0) {
          process.stderr.write(retryRes.stderr.toString());
          process.exit(client === "codex-cli" ? 4 : 1);
        }
      } else {
        process.stderr.write(errStr);
        process.exit(client === "codex-cli" ? 4 : 1);
      }
    }

    process.stdout.write(`managed by ${binary}\n`);
    process.exit(0);
  }

  if (subcommand === "uninstall") {
    const removeRes = spawnSync(binary, ["mcp", "remove", entryName], { timeout: 30000 });
    if (removeRes.error && (removeRes.error as any).code === "ETIMEDOUT") {
      process.stderr.write(`Error: Subprocess timed out after 30 seconds\n`);
      process.exit(1);
    }

    const combinedOutput = removeRes.stderr.toString() + "\n" + removeRes.stdout.toString();
    const isSuccessOrNotFound = removeRes.status === 0 || /not found|no such/i.test(combinedOutput);

    if (isSuccessOrNotFound) {
      if (/not found|no such/i.test(combinedOutput) || (removeRes.status === 0 && combinedOutput.includes("no changes"))) {
        process.stdout.write("no changes\n");
      } else {
        process.stdout.write(`Successfully removed entry ${entryName}\n`);
      }
      process.exit(0);
    } else {
      process.stderr.write(removeRes.stderr.toString());
      process.exit(client === "codex-cli" ? 4 : 1);
    }
  }
}

// File Clients: claude-app, codex-app, antigravity, cursor, windsurf
function handleFileClient(subcommand: string, client: string, entryName: string, spec: ServerSpec) {
  const paths = getClientPaths(client);
  const configPath = expandPath(paths.configPath);

  if (paths.checkDir) {
    const checkDirResolved = expandPath(paths.checkDir);
    if (!fs.existsSync(checkDirResolved)) {
      process.stderr.write(`${paths.clientDisplayName} must be launched at least once before running install. Run the client once and try again.\n`);
      process.exit(3);
    }
  }

  let originalContent = "";
  let exists = false;
  if (fs.existsSync(configPath)) {
    exists = true;
    try {
      originalContent = fs.readFileSync(configPath, "utf8");
    } catch (err) {
      process.stderr.write(`Error reading config file at ${configPath}: ${(err as Error).message}\n`);
      process.exit(5);
    }
  }

  const isJSON = client !== "codex-app";
  let configObj: any = null;

  if (exists) {
    if (isJSON) {
      try {
        configObj = JSON.parse(originalContent);
      } catch (err) {
        process.stderr.write(`Error: Config file is malformed JSON: ${configPath}\n`);
        process.exit(6);
      }
      if (!configObj || typeof configObj !== "object" || Array.isArray(configObj)) {
        process.stderr.write(`Error: Config file top-level is not a JSON object: ${configPath}\n`);
        process.exit(6);
      }
      if (configObj.mcpServers !== undefined && (configObj.mcpServers === null || typeof configObj.mcpServers !== "object" || Array.isArray(configObj.mcpServers))) {
        process.stderr.write(`Error: mcpServers key has an invalid type in config file: ${configPath}\n`);
        process.exit(6);
      }
    } else {
      try {
        configObj = toml.parse(originalContent);
      } catch (err) {
        process.stderr.write(`Error: Config file is malformed TOML: ${configPath}\n`);
        process.exit(6);
      }
    }
  } else {
    configObj = isJSON ? {} : {};
  }

  if (subcommand === "install") {
    let mutated = false;
    if (isJSON) {
      if (!configObj.mcpServers) {
        configObj.mcpServers = {};
      }
      const existing = configObj.mcpServers[entryName];
      if (isMatch(existing, spec)) {
        process.stdout.write("no changes\n");
        process.exit(0);
      }
      configObj.mcpServers[entryName] = spec;
      mutated = true;
    } else {
      if (!configObj.mcp_servers) {
        configObj.mcp_servers = {};
      }
      const existing = configObj.mcp_servers[entryName];
      if (existing && existing.command === spec.command && Array.isArray(existing.args) &&
          existing.args.length === spec.args.length && existing.args.every((v: string, idx: number) => v === spec.args[idx])) {
        process.stdout.write("no changes\n");
        process.exit(0);
      }
      configObj.mcp_servers[entryName] = {
        ...(existing || { startup_timeout_sec: 60 }),
        command: spec.command,
        args: spec.args,
      };
      mutated = true;
    }

    if (mutated) {
      const newContent = isJSON ? JSON.stringify(configObj, null, 2) + "\n" : toml.stringify(configObj);
      if (newContent === originalContent) {
        process.stdout.write("no changes\n");
        process.exit(0);
      }

      if (exists) {
        const backupPath = `${configPath}.openevidence-backup-${getUtcTimestamp()}`;
        try {
          fs.writeFileSync(backupPath, originalContent, "utf8");
        } catch (err) {
          process.stderr.write(`Error: Failed to write Backup_File at ${backupPath}. Config_File was not modified.\n`);
          process.exit(5);
        }

        try {
          writeAtomic(configPath, newContent);
        } catch (err) {
          process.stderr.write(`Error: Failed to write config file at ${configPath}. A backup was preserved at ${backupPath}.\n`);
          process.exit(5);
        }
      } else {
        const parentDir = path.dirname(configPath);
        if (!fs.existsSync(parentDir)) {
          try {
            fs.mkdirSync(parentDir, { recursive: true });
          } catch (err) {
            process.stderr.write(`Error creating directory ${parentDir}: ${(err as Error).message}\n`);
            process.exit(5);
          }
        }

        try {
          writeAtomic(configPath, newContent);
        } catch (err) {
          process.stderr.write(`Error writing config file to ${configPath}: ${(err as Error).message}\n`);
          process.exit(5);
        }
      }

      process.stdout.write(`${configPath}\n`);
      process.exit(0);
    }
  }

  if (subcommand === "uninstall") {
    let mutated = false;
    if (isJSON) {
      if (configObj.mcpServers && configObj.mcpServers[entryName]) {
        delete configObj.mcpServers[entryName];
        mutated = true;
      }
    } else {
      if (configObj.mcp_servers && configObj.mcp_servers[entryName]) {
        delete configObj.mcp_servers[entryName];
        mutated = true;
      }
    }

    if (!mutated) {
      process.stdout.write("no changes\n");
      process.exit(0);
    }

    const newContent = isJSON ? JSON.stringify(configObj, null, 2) + "\n" : toml.stringify(configObj);
    if (newContent === originalContent) {
      process.stdout.write("no changes\n");
      process.exit(0);
    }

    if (exists) {
      const backupPath = `${configPath}.openevidence-backup-${getUtcTimestamp()}`;
      try {
        fs.writeFileSync(backupPath, originalContent, "utf8");
      } catch (err) {
        process.stderr.write(`Error: Failed to write Backup_File at ${backupPath}. Config_File was not modified.\n`);
        process.exit(5);
      }

      try {
        writeAtomic(configPath, newContent);
      } catch (err) {
        process.stderr.write(`Error: Failed to write config file at ${configPath}. A backup was preserved at ${backupPath}.\n`);
        process.exit(5);
      }
    } else {
      try {
        writeAtomic(configPath, newContent);
      } catch (err) {
        process.stderr.write(`Error writing config file to ${configPath}: ${(err as Error).message}\n`);
        process.exit(5);
      }
    }

    process.stdout.write(`Successfully removed entry ${entryName} from ${configPath}\n`);
    process.exit(0);
  }

  if (subcommand === "show-config") {
    let wouldBeConfig = JSON.parse(JSON.stringify(configObj));
    if (isJSON) {
      if (!wouldBeConfig.mcpServers) wouldBeConfig.mcpServers = {};
      wouldBeConfig.mcpServers[entryName] = spec;
    } else {
      if (!wouldBeConfig.mcp_servers) wouldBeConfig.mcp_servers = {};
      wouldBeConfig.mcp_servers[entryName] = {
        ...(wouldBeConfig.mcp_servers[entryName] || { startup_timeout_sec: 60 }),
        command: spec.command,
        args: spec.args,
      };
    }
    const newContent = isJSON ? JSON.stringify(wouldBeConfig, null, 2) + "\n" : toml.stringify(wouldBeConfig);
    const diff = diffLines(originalContent.split(/\r?\n/), newContent.split(/\r?\n/));
    process.stdout.write(`--- ${configPath}\n+++ ${configPath} (Would-be)\n${diff}\n`);
    process.exit(0);
  }
}
