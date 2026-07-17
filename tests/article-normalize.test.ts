import test from "node:test";
import assert from "node:assert/strict";

import {
  extractAnswerText,
  getArticleStatusInfo,
  normalizeArticleResult,
  formatCitations,
  renderReactComponents,
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

test("renderReactComponents strips InlineGenerationStep progress blocks", () => {
  const raw =
    'REACTCOMPONENT!:!InlineGenerationStep!:!{"steps": [{"kind": "reasoning", "label": "Analyzed query", "active": false, "children": [], "paragraph_index": 0, "metadata": {}}], "done": true, "summary": "Analyzed query, searched for evidence"}\n\nSGLT2 inhibitors reduce kidney failure risk.';

  const cleaned = renderReactComponents(raw);

  assert.equal(cleaned.includes("REACTCOMPONENT"), false);
  assert.equal(cleaned.includes("InlineGenerationStep"), false);
  assert.match(cleaned, /^SGLT2 inhibitors reduce kidney failure risk\./);
});

test("renderReactComponents converts PublicationFigure to markdown image", () => {
  const raw =
    'Consistency across eGFR categories:\n\nREACTCOMPONENT!:!PublicationFigure!:!{"media_type": "figure", "url": "https://example.com/fig1.jpg", "name": "Figure 1", "caption": "Effects of SGLT2 Inhibitors on CKD Progression", "display_caption": null, "rich_citation_data": {"title": "Nested {braces} inside", "doi": "10.1001/jama.2025.20834"}}\n\nNext paragraph.';

  const cleaned = renderReactComponents(raw);

  assert.equal(cleaned.includes("REACTCOMPONENT"), false);
  assert.match(cleaned, /!\[Effects of SGLT2 Inhibitors on CKD Progression\]\(https:\/\/example\.com\/fig1\.jpg\)/);
  assert.match(cleaned, /Next paragraph\./);
});

test("renderReactComponents converts PublicationQuotation to blockquote", () => {
  const raw =
    'Evidence summary:\n\nREACTCOMPONENT!:!PublicationQuotation!:!{"text": "SGLT2 inhibitors were found to lower the risk of CKD progression.", "full_author_list": ["Brendon L. Neuen, PhD"]}\n\nEnd.';

  const cleaned = renderReactComponents(raw);

  assert.equal(cleaned.includes("REACTCOMPONENT"), false);
  assert.match(cleaned, /> SGLT2 inhibitors were found to lower the risk of CKD progression\./);
  assert.match(cleaned, /End\./);
});

test("renderReactComponents drops unknown component types and malformed JSON safely", () => {
  const unknown =
    'Before.\n\nREACTCOMPONENT!:!FutureWidget!:!{"some": {"nested": "payload"}}\n\nAfter.';
  const cleanedUnknown = renderReactComponents(unknown);
  assert.equal(cleanedUnknown.includes("REACTCOMPONENT"), false);
  assert.match(cleanedUnknown, /Before\./);
  assert.match(cleanedUnknown, /After\./);

  const malformed = 'Before.\n\nREACTCOMPONENT!:!InlineGenerationStep!:!{"broken": tru\n\nAfter.';
  const cleanedMalformed = renderReactComponents(malformed);
  assert.equal(cleanedMalformed.includes("REACTCOMPONENT"), false);
  assert.match(cleanedMalformed, /Before\./);
  assert.match(cleanedMalformed, /After\./);
});

test("renderReactComponents leaves plain text untouched", () => {
  const raw = "Plain answer with [1] citation markers and **bold** text.";
  assert.equal(renderReactComponents(raw), raw);
});

test("normalizeArticleResult strips REACTCOMPONENT blocks from answer_text", () => {
  const article = {
    id: "00000000-0000-4000-8000-000000000005",
    status: "success",
    output: {
      text:
        'REACTCOMPONENT!:!InlineGenerationStep!:!{"steps": [], "done": true, "summary": "Analyzed query"}\n\nReal answer body.[[[$$$FDA. <a href="https://example.com/drug">Drug Label</a>. 2025.$$$]]]',
    },
  };

  const normalized = normalizeArticleResult(article);

  assert.equal(normalized.answer_text?.includes("REACTCOMPONENT"), false);
  assert.match(normalized.answer_text ?? "", /^Real answer body\./);
  assert.match(normalized.answer_text ?? "", /### References/);
  assert.equal(normalized.citations.length, 1);
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
