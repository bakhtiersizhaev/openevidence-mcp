import { existsSync } from "node:fs";
import { platform } from "node:os";
import path from "node:path";

export interface BrowserChoice {
  name: string;
  executablePath: string;
}

export function findSystemBrowser(defaultPreference = ""): BrowserChoice {
  const explicitPath = process.env.OE_MCP_BROWSER_PATH;
  if (explicitPath) {
    if (!existsSync(explicitPath)) {
      throw new Error(`OE_MCP_BROWSER_PATH does not exist: ${explicitPath}`);
    }
    return { name: "custom browser", executablePath: explicitPath };
  }

  const preferred = (process.env.OE_MCP_BROWSER ?? defaultPreference).toLowerCase();
  const candidates = getBrowserCandidates();
  const ordered = preferred
    ? [
        ...candidates.filter((candidate) => candidate.name.toLowerCase().includes(preferred)),
        ...candidates.filter((candidate) => !candidate.name.toLowerCase().includes(preferred)),
      ]
    : candidates;

  const found = ordered.find((candidate) => existsSync(candidate.executablePath));
  if (!found) {
    throw new Error(
      "Could not find Chrome, Edge, or Chromium. Install one or set OE_MCP_BROWSER_PATH.",
    );
  }
  return found;
}

function getBrowserCandidates(): BrowserChoice[] {
  const os = platform();
  if (os === "win32") {
    const local = process.env.LOCALAPPDATA ?? "";
    const programFiles = process.env.ProgramFiles ?? "";
    const programFilesX86 = process.env["ProgramFiles(x86)"] ?? "";
    return [
      browser("Google Chrome", programFiles, "Google", "Chrome", "Application", "chrome.exe"),
      browser("Google Chrome", programFilesX86, "Google", "Chrome", "Application", "chrome.exe"),
      browser("Google Chrome", local, "Google", "Chrome", "Application", "chrome.exe"),
      browser("Microsoft Edge", programFiles, "Microsoft", "Edge", "Application", "msedge.exe"),
      browser("Microsoft Edge", programFilesX86, "Microsoft", "Edge", "Application", "msedge.exe"),
    ];
  }

  if (os === "darwin") {
    return [
      browser("Google Chrome", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
      browser("Microsoft Edge", "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"),
      browser("Chromium", "/Applications/Chromium.app/Contents/MacOS/Chromium"),
    ];
  }

  return [
    browser("Google Chrome", "/usr/bin/google-chrome"),
    browser("Google Chrome", "/usr/bin/google-chrome-stable"),
    browser("Microsoft Edge", "/usr/bin/microsoft-edge"),
    browser("Microsoft Edge", "/usr/bin/microsoft-edge-stable"),
    browser("Chromium", "/usr/bin/chromium"),
    browser("Chromium", "/usr/bin/chromium-browser"),
  ];
}

function browser(name: string, ...parts: string[]): BrowserChoice {
  return { name, executablePath: path.join(...parts) };
}
