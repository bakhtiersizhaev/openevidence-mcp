import test from "node:test";
import assert from "node:assert/strict";

import { classifyWriteFailure } from "../src/errors.js";
import { sanitizeHistoryPayload } from "../src/history.js";

test("sanitizeHistoryPayload removes nested private thread context", () => {
  const sanitized = sanitizeHistoryPayload({
    next: "https://example.test/next",
    previous: null,
    results: [
      {
        id: "00000000-0000-4000-8000-000000000001",
        status: "success",
        title: "Synthetic title",
        datetime_created: "2026-05-30T00:00:00Z",
        article_type: "Synthetic",
        access_level: "CREATOR_ONLY",
        inputs: {
          question: "Synthetic private question",
          history: [{ input: "Synthetic nested private question" }],
        },
      },
    ],
  });

  assert.deepEqual(sanitized, {
    has_next: true,
    has_previous: false,
    results: [
      {
        article_id: "00000000-0000-4000-8000-000000000001",
        status: "success",
        title: "Synthetic title",
        datetime_created: "2026-05-30T00:00:00Z",
        article_type: "Synthetic",
        access_level: "CREATOR_ONLY",
      },
    ],
  });
  assert.doesNotMatch(JSON.stringify(sanitized), /private question/);
});

test("classifyWriteFailure redacts upstream browser-protection HTML", () => {
  const message = classifyWriteFailure(
    403,
    "text/html",
    "<html>Please enable JS and disable any ad blocker cid=private-debug-value</html>",
  );

  assert.match(message, /browser-protection response/);
  assert.doesNotMatch(message, /private-debug-value/);
  assert.doesNotMatch(message, /cid=/);
});
