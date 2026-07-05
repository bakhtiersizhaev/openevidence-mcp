import test from "node:test";
import assert from "node:assert/strict";

import { extractCitations } from "../src/article.js";
import { citationsToBibtex } from "../src/bibtex.js";

const RAW_ANSWER =
  "Lisinopril starting dose is <strong>10 mg once daily</strong>." +
  '[[[$$$Food and Drug Administration. <a target="_blank" href="https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=838">Zestril</a>. 2025.$$$]' +
  '!!![$$$Smith J, Doe A. <a target="_blank" href="https://doi.org/10.1056/NEJMoa2404881">Synthetic Trial of Something</a>. 2024.$$$]]]';

test("extractCitations returns structured fields from raw citation blocks", () => {
  const citations = extractCitations(RAW_ANSWER);

  assert.equal(citations.length, 2);

  assert.equal(citations[0].index, 1);
  assert.equal(citations[0].authors, "Food and Drug Administration");
  assert.equal(citations[0].title, "Zestril");
  assert.equal(citations[0].url, "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=838");
  assert.equal(citations[0].year, "2025");
  assert.match(citations[0].markdown, /\[Zestril\]\(https:\/\/dailymed/);

  assert.equal(citations[1].authors, "Smith J, Doe A");
  assert.equal(citations[1].title, "Synthetic Trial of Something");
  assert.equal(citations[1].year, "2024");
});

test("extractCitations deduplicates repeated references", () => {
  const text =
    'A.[[[$$$Org. <a href="https://example.com/x">Ref</a>. 2023.$$$]]] B.[[[$$$Org. <a href="https://example.com/x">Ref</a>. 2023.$$$]]]';
  const citations = extractCitations(text);
  assert.equal(citations.length, 1);
});

test("extractCitations returns empty array for text without citation blocks", () => {
  assert.deepEqual(extractCitations("Plain answer without references."), []);
});

test("citationsToBibtex builds offline entries with parsed fields", async () => {
  const citations = extractCitations(RAW_ANSWER);
  const result = await citationsToBibtex(citations);

  assert.equal(result.entries.length, 2);

  const first = result.entries[0];
  assert.equal(first.doi, null);
  assert.equal(first.crossref_matched, false);
  assert.match(first.entry, /^@misc\{food2025_1,/);
  assert.match(first.entry, /author = \{Food and Drug Administration\}/);
  assert.match(first.entry, /title = \{Zestril\}/);
  assert.match(first.entry, /year = \{2025\}/);

  const second = result.entries[1];
  assert.equal(second.doi, "10.1056/NEJMoa2404881");
  assert.match(second.entry, /^@article\{smith2024_2,/);
  assert.match(second.entry, /doi = \{10.1056\/NEJMoa2404881\}/);

  assert.match(result.bibtex, /@misc\{food2025_1/);
  assert.match(result.bibtex, /@article\{smith2024_2/);
});

test("citationsToBibtex escapes BibTeX-hostile characters", async () => {
  const citations = extractCitations(
    'X.[[[$$$Org & Co. <a href="https://example.com/a">Salt {and} 100% effort_test</a>. 2022.$$$]]]',
  );
  const result = await citationsToBibtex(citations);
  assert.match(result.entries[0].entry, /author = \{Org \\& Co\}/);
  assert.match(result.entries[0].entry, /title = \{Salt and 100\\% effort\\_test\}/);
});
