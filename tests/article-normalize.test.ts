import test from "node:test";
import assert from "node:assert/strict";

import {
  extractAnswerText,
  getArticleStatusInfo,
  normalizeArticleResult,
  formatCitations,
} from "../src/article.js";

test("extractAnswerText prefers current article output over history fallback", () => {
  const article = {
    id: "00000000-0000-4000-8000-000000000001",
    status: "success",
    output: {
      text: "Current synthetic answer.",
    },
    inputs: {
      history: [
        {
          outputText: "Stale synthetic history answer.",
        },
      ],
    },
  };

  const extracted = extractAnswerText(article);

  assert.deepEqual(extracted, {
    text: "Current synthetic answer.",
    source: "article.output.text",
  });
});

test("extractAnswerText falls back to partial output before history", () => {
  const article = {
    id: "00000000-0000-4000-8000-000000000002",
    status: "running",
    partial_output: {
      text: "Synthetic partial answer.",
    },
    inputs: {
      history: [
        {
          outputText: "Synthetic history fallback.",
        },
      ],
    },
  };

  const extracted = extractAnswerText(article);

  assert.deepEqual(extracted, {
    text: "Synthetic partial answer.",
    source: "article.partial_output.text",
  });
});

test("extractAnswerText uses latest history only when current output is absent", () => {
  const article = {
    id: "00000000-0000-4000-8000-000000000003",
    status: "success",
    inputs: {
      history: [
        {
          outputText: "Older synthetic history answer.",
        },
        {
          outputText: "Latest synthetic history answer.",
        },
      ],
    },
  };

  const extracted = extractAnswerText(article);

  assert.deepEqual(extracted, {
    text: "Latest synthetic history answer.",
    source: "inputs.history.outputText",
  });
});

test("extractAnswerText returns null for empty article payload", () => {
  assert.equal(extractAnswerText({ status: "running" }), null);
});

test("getArticleStatusInfo classifies pending and complete statuses", () => {
  assert.deepEqual(getArticleStatusInfo({ status: "running" }), {
    status: "running",
    is_complete: false,
  });
  assert.deepEqual(getArticleStatusInfo({ status: "success" }), {
    status: "success",
    is_complete: true,
  });
  assert.deepEqual(getArticleStatusInfo({}), {
    status: null,
    is_complete: false,
  });
});

test("normalizeArticleResult exposes stable fields without hiding raw article", () => {
  const article = {
    id: "00000000-0000-4000-8000-000000000004",
    status: "success",
    inputs: {
      question: "Synthetic question?",
    },
    output: {
      text: "Synthetic answer.",
    },
  };

  const normalized = normalizeArticleResult(article);

  assert.equal(normalized.article_id, "00000000-0000-4000-8000-000000000004");
  assert.equal(normalized.status, "success");
  assert.equal(normalized.is_complete, true);
  assert.equal(normalized.question, "Synthetic question?");
  assert.equal(normalized.answer_text, "Synthetic answer.");
  assert.equal(normalized.answer_source, "article.output.text");
  assert.equal(normalized.article, article);
});

test("formatCitations cleans up raw OpenEvidence formatting and builds bibliography", () => {
  const rawText = "Lisinopril starting dose is <strong>10 mg once daily</strong>.[[[$$$Food and Drug Administration. <a target=\"_blank\" href=\"https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=838\">Zestril</a>. 2025.$$$]!!![$$$Food and Drug Administration. <a target=\"_blank\" href=\"https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=9f6\">Qbrelis</a>. 2025.$$$]]]";
  
  const formatted = formatCitations(rawText);
  
  assert.match(formatted, /\*\*10 mg once daily\*\*/);
  assert.match(formatted, /\[1, 2\]/);
  assert.match(formatted, /### References/);
  assert.match(formatted, /1\. Food and Drug Administration\. \[Zestril\]\(https:\/\/dailymed\.nlm\.nih\.gov\/dailymed\/drugInfo\.cfm\?setid=838\)\. 2025\./);
  assert.match(formatted, /2\. Food and Drug Administration\. \[Qbrelis\]\(https:\/\/dailymed\.nlm\.nih\.gov\/dailymed\/drugInfo\.cfm\?setid=9f6\)\. 2025\./);
});
