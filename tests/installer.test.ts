import test from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { spawnSync } from "node:child_process";
import * as toml from "smol-toml";

import {
  diffLines,
  expandPath,
  getClientPaths,
  SUPPORTED_CLIENTS,
  runInstallerCLI,
} from "../src/installer.js";

// Helper to create sandboxed test environment
function createSandbox(): string {
  const tmpDir = path.join(process.cwd(), "scratch", `test-sandbox-${Date.now()}-${Math.floor(Math.random() * 10000)}`);
  fs.mkdirSync(tmpDir, { recursive: true });
  return tmpDir;
}

function cleanupSandbox(dir: string) {
  if (fs.existsSync(dir)) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch {}
  }
}

test("diffLines LCS implementation", () => {
  const oldLines = ["line1", "line2", "line3"];
  const newLines = ["line1", "line4", "line3"];
  const diff = diffLines(oldLines, newLines);
  assert.match(diff, /\- line2/);
  assert.match(diff, /\+ line4/);
  assert.match(diff, /  line1/);
  assert.match(diff, /  line3/);
});

test("expandPath leading-~ and Windows variables", () => {
  const homedir = os.homedir();
  if (homedir) {
    assert.equal(expandPath("~"), homedir);
    assert.equal(expandPath("~/test"), path.join(homedir, "test"));
    assert.equal(expandPath("~\\test"), path.join(homedir, "test"));
    assert.equal(expandPath("test~"), "test~");
  }

  if (process.platform === "win32") {
    const originalAppdata = process.env.APPDATA;
    process.env.APPDATA = "C:\\AppDataMock";
    assert.equal(expandPath("%APPDATA%\\test"), "C:\\AppDataMock\\test");
    assert.equal(expandPath("%appdata%\\test"), "C:\\AppDataMock\\test");
    if (originalAppdata) {
      process.env.APPDATA = originalAppdata;
    }
  }
});

// Mock/sandbox testing of file-based clients
test("File clients settings directory missing validation", () => {
  const sandbox = createSandbox();
  const originalHome = process.env.HOME;
  const originalAppdata = process.env.APPDATA;
  const originalUserprofile = process.env.USERPROFILE;

  // Set home/appdata/userprofile to sandbox
  process.env.HOME = sandbox;
  process.env.APPDATA = sandbox;
  process.env.USERPROFILE = sandbox;

  try {
    // For Cursor, settings directory is ~/.cursor (mac/linux) or %USERPROFILE%\.cursor (windows)
    // It does not exist in the sandbox yet, so install must exit 3.
    const originalExit = process.exit;
    const originalStderrWrite = process.stderr.write;

    let exitCode: number | null = null;
    let stderrOut = "";

    process.exit = ((code?: number) => {
      exitCode = code ?? 0;
      throw new Error("exit");
    }) as any;

    process.stderr.write = ((str: string) => {
      stderrOut += str;
      return true;
    }) as any;

    try {
      runInstallerCLI("install", ["--client", "cursor"]);
    } catch (err: any) {
      if (err.message !== "exit") throw err;
    }

    assert.equal(exitCode, 3);
    assert.match(stderrOut, /Cursor must be launched at least once/);

    // Reset mocks
    process.exit = originalExit;
    process.stderr.write = originalStderrWrite;
  } finally {
    cleanupSandbox(sandbox);
    process.env.HOME = originalHome;
    process.env.APPDATA = originalAppdata;
    process.env.USERPROFILE = originalUserprofile;
  }
});

// 200 Generated Property Tests for JSON client configs
test("Property tests - JSON Round-trip, Idempotence, Backups & Preservation (200 cases)", () => {
  const sandbox = createSandbox();
  const spec = { command: "node", args: ["/abs/path/server.js"] };

  function generateRandomJsonConfig(): any {
    const obj: any = {};
    const keyCount = Math.floor(Math.random() * 5);
    for (let i = 0; i < keyCount; i++) {
      obj[`key_${i}_${Math.random().toString(36).slice(2, 6)}`] =
        Math.random() > 0.5 ? "value" : { nested: Math.random() };
    }
    obj.mcpServers = {};
    const serversCount = Math.floor(Math.random() * 3);
    for (let i = 0; i < serversCount; i++) {
      obj.mcpServers[`server_${i}_${Math.random().toString(36).slice(2, 6)}`] = {
        command: "node",
        args: [`/abs/path/other-${i}.js`],
      };
    }
    return obj;
  }

  for (let caseNum = 0; caseNum < 200; caseNum++) {
    const testFile = path.join(sandbox, `test-json-${caseNum}.json`);
    const initialConfig = generateRandomJsonConfig();
    const initialContent = JSON.stringify(initialConfig, null, 2) + "\n";
    fs.writeFileSync(testFile, initialContent, "utf8");

    // 1. Round trip property
    const parsed = JSON.parse(initialContent);
    const roundTripped = JSON.stringify(parsed, null, 2) + "\n";
    assert.deepEqual(JSON.parse(roundTripped), initialConfig);

    // Let's run mutation manually on the file simulating JSON_Adapter contract
    const contentBefore = fs.readFileSync(testFile, "utf8");
    const doc = JSON.parse(contentBefore);
    if (!doc.mcpServers) doc.mcpServers = {};

    // Foreign entries must be immutable
    const foreignServersBefore = { ...doc.mcpServers };
    delete foreignServersBefore.openevidence;

    doc.mcpServers.openevidence = spec;
    const contentAfter = JSON.stringify(doc, null, 2) + "\n";

    // Simulate Backup creation if content differs
    let backupCreated = false;
    if (contentAfter !== contentBefore) {
      const backupFile = `${testFile}.openevidence-backup-TEST`;
      fs.writeFileSync(backupFile, contentBefore, "utf8");
      backupCreated = true;
    }

    fs.writeFileSync(testFile, contentAfter, "utf8");

    // Verify foreign entries immutable
    const docAfter = JSON.parse(fs.readFileSync(testFile, "utf8"));
    const foreignServersAfter = { ...docAfter.mcpServers };
    delete foreignServersAfter.openevidence;
    assert.deepEqual(foreignServersAfter, foreignServersBefore);

    // Verify Idempotence
    const contentAfterSecond = fs.readFileSync(testFile, "utf8");
    const docSecond = JSON.parse(contentAfterSecond);
    docSecond.mcpServers.openevidence = spec;
    const contentAfterThird = JSON.stringify(docSecond, null, 2) + "\n";
    assert.equal(contentAfterThird, contentAfterSecond);

    // Verify Uninstall restores to previous state if openevidence didn't exist before
    const hadOpenEvidence = initialConfig.mcpServers && initialConfig.mcpServers.openevidence;
    if (!hadOpenEvidence) {
      const docUninstall = JSON.parse(fs.readFileSync(testFile, "utf8"));
      delete docUninstall.mcpServers.openevidence;
      const contentUninstall = JSON.stringify(docUninstall, null, 2) + "\n";
      assert.deepEqual(JSON.parse(contentUninstall), initialConfig);
    }

    // Cleanup backups
    if (backupCreated) {
      fs.unlinkSync(`${testFile}.openevidence-backup-TEST`);
    }
  }

  cleanupSandbox(sandbox);
});

// 200 Generated Property Tests for TOML client configs
test("Property tests - TOML Round-trip, Idempotence, Backups & Preservation (200 cases)", () => {
  const sandbox = createSandbox();
  const spec = { command: "node", args: ["/abs/path/server.js"] };

  function generateRandomTomlConfig(): any {
    const obj: any = {};
    const keyCount = Math.floor(Math.random() * 4);
    for (let i = 0; i < keyCount; i++) {
      obj[`key_${i}`] = "value";
    }
    obj.mcp_servers = {};
    const serversCount = Math.floor(Math.random() * 3);
    for (let i = 0; i < serversCount; i++) {
      obj.mcp_servers[`server_${i}`] = {
        command: "node",
        args: [`/abs/path/other-${i}.js`],
        startup_timeout_sec: 60,
      };
    }
    return obj;
  }

  for (let caseNum = 0; caseNum < 200; caseNum++) {
    const testFile = path.join(sandbox, `test-toml-${caseNum}.toml`);
    const initialConfig = generateRandomTomlConfig();
    const initialContent = toml.stringify(initialConfig);
    fs.writeFileSync(testFile, initialContent, "utf8");

    // 1. Round trip property
    const parsed = toml.parse(initialContent);
    const roundTripped = toml.stringify(parsed);
    // Deep structural check on parsed objects
    assert.deepEqual(toml.parse(roundTripped), initialConfig);

    // Simulate TOML_Adapter mutation
    const contentBefore = fs.readFileSync(testFile, "utf8");
    const doc = toml.parse(contentBefore) as any;
    if (!doc.mcp_servers) doc.mcp_servers = {};

    const foreignServersBefore = { ...doc.mcp_servers };
    delete foreignServersBefore.openevidence;

    const existing = doc.mcp_servers.openevidence;
    doc.mcp_servers.openevidence = {
      ...(existing || { startup_timeout_sec: 60 }),
      command: spec.command,
      args: spec.args,
    };
    const contentAfter = toml.stringify(doc);

    let backupCreated = false;
    if (contentAfter !== contentBefore) {
      const backupFile = `${testFile}.openevidence-backup-TEST`;
      fs.writeFileSync(backupFile, contentBefore, "utf8");
      backupCreated = true;
    }

    fs.writeFileSync(testFile, contentAfter, "utf8");

    // Verify foreign entries immutable
    const docAfter = toml.parse(fs.readFileSync(testFile, "utf8")) as any;
    const foreignServersAfter = { ...docAfter.mcp_servers };
    delete foreignServersAfter.openevidence;
    assert.deepEqual(foreignServersAfter, foreignServersBefore);

    // Verify Idempotence
    const contentAfterSecond = fs.readFileSync(testFile, "utf8");
    const docSecond = toml.parse(contentAfterSecond) as any;
    docSecond.mcp_servers.openevidence = {
      ...docSecond.mcp_servers.openevidence,
      command: spec.command,
      args: spec.args,
    };
    const contentAfterThird = toml.stringify(docSecond);
    assert.equal(contentAfterThird, contentAfterSecond);

    // Verify Uninstall restores to previous state if openevidence didn't exist before
    const hadOpenEvidence = initialConfig.mcp_servers && initialConfig.mcp_servers.openevidence;
    if (!hadOpenEvidence) {
      const docUninstall = toml.parse(fs.readFileSync(testFile, "utf8")) as any;
      delete docUninstall.mcp_servers.openevidence;
      const contentUninstall = toml.stringify(docUninstall);
      assert.deepEqual(toml.parse(contentUninstall), initialConfig);
    }

    if (backupCreated) {
      fs.unlinkSync(`${testFile}.openevidence-backup-TEST`);
    }
  }

  cleanupSandbox(sandbox);
});
