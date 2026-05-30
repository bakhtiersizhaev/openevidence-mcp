chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "openevidence-mcp-submit") return;
  void submitQuestion(message.question, message.original_article_id).then(sendResponse);
  return true;
});

async function submitQuestion(question, originalArticleId) {
  try {
    const previousArticleId = getArticleIdFromLocation();
    const input = await waitForElement('textarea[aria-label="Ask a medical question"]', 20_000);
    setTextareaValue(input, question);
    const submit = await waitForElement('button[aria-label="Submit question"]', 10_000);
    submit.click();
    const articleId = await waitForNewArticleId(previousArticleId ?? originalArticleId, 45_000);
    const post = await chrome.runtime
      .sendMessage({ type: "openevidence-mcp-last-post-status" })
      .catch(() => ({ status: null }));
    return articleId
      ? { ok: true, article_id: articleId }
      : {
          ok: false,
          error: Number.isInteger(post?.status)
            ? `OpenEvidence UI submit did not open a research thread (status ${post.status}).`
            : "OpenEvidence UI submit did not open a research thread and no article POST was observed.",
        };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

function setTextareaValue(textarea, value) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value",
  )?.set;
  setter?.call(textarea, value);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  textarea.dispatchEvent(new Event("change", { bubbles: true }));
}

async function waitForElement(selector, timeoutMs) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const element = document.querySelector(selector);
    if (element instanceof HTMLElement && !element.hasAttribute("disabled")) return element;
    await sleep(250);
  }
  throw new Error(`OpenEvidence UI element not found: ${selector}`);
}

async function waitForNewArticleId(previousArticleId, timeoutMs) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const articleId = getArticleIdFromLocation();
    if (articleId && articleId !== previousArticleId) return articleId;
    await sleep(250);
  }
  return null;
}

function getArticleIdFromLocation() {
  return location.pathname.match(/\/ask\/([0-9a-f-]{36})(?:\/|$)/i)?.[1] ?? null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function wakeBackgroundWorker() {
  void chrome.runtime.sendMessage({ type: "openevidence-mcp-poll" }).catch(() => undefined);
}

setInterval(wakeBackgroundWorker, 750);
void wakeBackgroundWorker();
