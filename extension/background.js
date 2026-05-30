const BRIDGE_URL = "http://127.0.0.1:47831";
const POLL_INTERVAL_MS = 750;
let processing = false;
let lastArticlePostStatus = null;

chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (details.method === "POST") lastArticlePostStatus = details.statusCode;
  },
  { urls: ["https://www.openevidence.com/api/article"] },
);

async function poll() {
  if (processing) return;
  processing = true;
  try {
    const response = await fetch(`${BRIDGE_URL}/v1/next`, { cache: "no-store" });
    if (response.status === 204) return;
    if (!response.ok) return;
    const job = await response.json();
    const tab = await getOrCreateOpenEvidenceTab(job.original_article_id);
    const result = await sendToTab(tab.id, job);
    await postResult(job.job_id, result);
  } catch {
    // The MCP bridge is intentionally absent when no oe_ask call is active.
  } finally {
    processing = false;
  }
}

async function getOrCreateOpenEvidenceTab(originalArticleId) {
  const targetUrl = originalArticleId
    ? `https://www.openevidence.com/ask/${encodeURIComponent(originalArticleId)}`
    : "https://www.openevidence.com/";
  const tabs = await chrome.tabs.query({ url: "https://www.openevidence.com/*" });
  if (tabs[0]?.id) {
    if (tabs[0].url !== targetUrl) {
      return chrome.tabs.update(tabs[0].id, { url: targetUrl, active: false });
    }
    return tabs[0];
  }
  return chrome.tabs.create({ url: targetUrl, active: false });
}

async function sendToTab(tabId, job) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      return await chrome.tabs.sendMessage(tabId, {
        type: "openevidence-mcp-submit",
        job_id: job.job_id,
        question: job.question,
        original_article_id: job.original_article_id,
      });
    } catch {
      await sleep(500);
    }
  }
  return { ok: false, error: "OpenEvidence page did not become ready." };
}

async function postResult(jobId, result) {
  await fetch(`${BRIDGE_URL}/v1/result`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ job_id: jobId, ...result }),
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

setInterval(poll, POLL_INTERVAL_MS);
void poll();

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "openevidence-mcp-poll") void poll();
  if (message?.type === "openevidence-mcp-last-post-status") {
    return Promise.resolve({ status: lastArticlePostStatus });
  }
});
