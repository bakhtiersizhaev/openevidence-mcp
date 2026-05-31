export function classifyWriteFailure(status: number, contentType: string, text: string): string {
  const lower = text.toLowerCase();
  const looksLikeProtectionBlock =
    status === 403 &&
    (contentType.toLowerCase().includes("text/html") ||
      lower.includes("enable js") ||
      lower.includes("disable any ad blocker"));

  if (looksLikeProtectionBlock) {
    return [
      "OpenEvidence blocked article creation with an upstream browser-protection response (403).",
      "The saved session may still support read-only tools, but oe_ask is unavailable through the current web-session transport.",
      "Do not paste the HTML response, cookies, session state, or account details into public issues.",
    ].join(" ");
  }
  return `POST request failed with status ${status}.`;
}
