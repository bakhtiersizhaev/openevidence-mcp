export const PENDING_STATUSES = new Set([
  "queued",
  "pending",
  "processing",
  "running",
  "in_progress",
]);

export type AnswerSource =
  | "article.output.text"
  | "article.output.raw_text"
  | "article.partial_output.text"
  | "article.partial_output.raw_text"
  | "inputs.history.outputText";

export interface ExtractedAnswer {
  text: string;
  source: AnswerSource;
}

export interface ArticleStatusInfo {
  status: string | null;
  is_complete: boolean;
}

export interface NormalizedArticleResult {
  article_id: string | null;
  status: string | null;
  is_complete: boolean;
  question: string | null;
  answer_text: string | null;
  answer_source: AnswerSource | null;
  citations: StructuredCitation[];
  article: Record<string, unknown>;
}

export function extractAnswerText(article: Record<string, unknown>): ExtractedAnswer | null {
  const currentOutput = readObject(article.output);
  const outputText = readNonEmptyString(currentOutput?.text);
  if (outputText) {
    return { text: outputText, source: "article.output.text" };
  }

  const outputRawText = readNonEmptyString(currentOutput?.raw_text);
  if (outputRawText) {
    return { text: outputRawText, source: "article.output.raw_text" };
  }

  const partialOutput = readObject(article.partial_output);
  const partialText = readNonEmptyString(partialOutput?.text);
  if (partialText) {
    return { text: partialText, source: "article.partial_output.text" };
  }

  const partialRawText = readNonEmptyString(partialOutput?.raw_text);
  if (partialRawText) {
    return { text: partialRawText, source: "article.partial_output.raw_text" };
  }

  const inputs = readObject(article.inputs);
  const history = Array.isArray(inputs?.history) ? inputs.history : [];
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const item = readObject(history[index]);
    const historyOutput = readNonEmptyString(item?.outputText);
    if (historyOutput) {
      return { text: historyOutput, source: "inputs.history.outputText" };
    }
  }

  return null;
}

export function getArticleStatusInfo(article: Record<string, unknown>): ArticleStatusInfo {
  const status = readNonEmptyString(article.status)?.toLowerCase() ?? null;
  return {
    status,
    is_complete: status !== null && !PENDING_STATUSES.has(status),
  };
}

export function normalizeArticleResult(article: Record<string, unknown>): NormalizedArticleResult {
  const extracted = extractAnswerText(article);
  const statusInfo = getArticleStatusInfo(article);
  const cleanedText = extracted?.text ? renderReactComponents(extracted.text) : null;
  return {
    article_id: readNonEmptyString(article.id),
    status: statusInfo.status,
    is_complete: statusInfo.is_complete,
    question: readQuestion(article),
    answer_text: cleanedText ? formatCitations(cleanedText) : null,
    answer_source: extracted?.source ?? null,
    citations: cleanedText ? extractCitations(cleanedText) : [],
    article,
  };
}

const REACT_COMPONENT_MARKER = "REACTCOMPONENT!:!";

/**
 * OpenEvidence embeds UI widgets into answer text as:
 *   REACTCOMPONENT!:!<ComponentName>!:!{json payload}
 * Render useful ones (figures, quotations) as Markdown and drop the rest
 * (generation progress steps, unknown future widgets).
 */
export function renderReactComponents(text: string): string {
  if (!text.includes(REACT_COMPONENT_MARKER)) {
    return text;
  }

  let result = "";
  let cursor = 0;

  while (cursor < text.length) {
    const markerStart = text.indexOf(REACT_COMPONENT_MARKER, cursor);
    if (markerStart === -1) {
      result += text.slice(cursor);
      break;
    }

    result += text.slice(cursor, markerStart);

    const nameStart = markerStart + REACT_COMPONENT_MARKER.length;
    const nameEnd = text.indexOf("!:!", nameStart);
    if (nameEnd === -1) {
      // Marker without payload separator: drop the rest of the line.
      cursor = skipToLineEnd(text, markerStart);
      continue;
    }

    const componentName = text.slice(nameStart, nameEnd);
    const payload = readBalancedJson(text, nameEnd + 3);
    if (payload === null) {
      // Malformed/truncated JSON: drop the rest of the line, keep following text.
      cursor = skipToLineEnd(text, markerStart);
      continue;
    }

    result += renderComponentMarkdown(componentName, payload.value);
    cursor = payload.endIndex;
  }

  // Collapse runs of 3+ newlines left behind by removed blocks.
  return result.replace(/\n{3,}/g, "\n\n").trim();
}

function renderComponentMarkdown(componentName: string, payload: unknown): string {
  const record = readObject(payload);
  if (!record) {
    return "";
  }

  if (componentName === "PublicationFigure") {
    const url = readNonEmptyString(record.url);
    if (!url) {
      return "";
    }
    const caption =
      readNonEmptyString(record.display_caption) ??
      readNonEmptyString(record.caption) ??
      readNonEmptyString(record.name) ??
      "Figure";
    return `![${caption}](${url})`;
  }

  if (componentName === "PublicationQuotation") {
    const quote = readNonEmptyString(record.text);
    if (!quote) {
      return "";
    }
    return `> ${quote}`;
  }

  // InlineGenerationStep and any unknown widget types carry no answer content.
  return "";
}

function readBalancedJson(
  text: string,
  startIndex: number,
): { value: unknown; endIndex: number } | null {
  if (text[startIndex] !== "{") {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = startIndex; index < text.length; index += 1) {
    const char = text[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === '"') {
      inString = true;
    } else if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        const rawJson = text.slice(startIndex, index + 1);
        try {
          return { value: JSON.parse(rawJson), endIndex: index + 1 };
        } catch {
          return null;
        }
      }
    }
  }

  return null;
}

function skipToLineEnd(text: string, fromIndex: number): number {
  const lineEnd = text.indexOf("\n", fromIndex);
  return lineEnd === -1 ? text.length : lineEnd + 1;
}

function readQuestion(article: Record<string, unknown>): string | null {
  const directQuestion =
    readNonEmptyString(article.question) ??
    readNonEmptyString(article.input) ??
    readNonEmptyString(article.inputText) ??
    readNonEmptyString(article.query) ??
    readNonEmptyString(article.prompt);
  if (directQuestion) {
    return directQuestion;
  }

  const inputs = readObject(article.inputs);
  return readNonEmptyString(inputs?.question);
}

function readObject(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function readNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export interface StructuredCitation {
  index: number;
  /** Markdown-formatted citation line, e.g. "FDA. [Zestril](https://...). 2025." */
  markdown: string;
  /** Best-effort parsed fields for BibTeX generation. */
  authors: string | null;
  title: string | null;
  url: string | null;
  year: string | null;
}

/**
 * Extract structured citations from a raw OpenEvidence answer.
 * Citations arrive as [[[$$$Authors. <a href="...">Title</a>. Year.$$$]!!![...]]] blocks.
 */
export function extractCitations(text: string): StructuredCitation[] {
  const { citations } = collectCitations(text);
  return citations;
}

interface CollectedCitations {
  citations: StructuredCitation[];
  formattedText: string;
}

function collectCitations(text: string): CollectedCitations {
  const citations: StructuredCitation[] = [];
  const citationMap = new Map<string, number>();

  // Regular expression to match [[[...]]] citation blocks
  const blockRegex = /\[\[\[([\s\S]*?)\]\]\]/g;

  const formattedText = text.replace(blockRegex, (_match, innerContent: string) => {
    // Split by !!! or ]!!![ or similar
    const rawParts = innerContent.split(/!!!/);
    const resolvedNumbers: number[] = [];

    for (const rawPart of rawParts) {
      // Clean up brackets, dollars and whitespace
      const cleanPart = rawPart
        .replace(/^[\[\]\s\$]+/, "")
        .replace(/[\[\]\s\$]+$/, "")
        .trim();

      if (cleanPart.length === 0) {
        continue;
      }

      // De-duplicate references
      let citationIndex = citationMap.get(cleanPart);
      if (citationIndex === undefined) {
        citationIndex = citations.length + 1;
        citations.push(parseCitation(cleanPart, citationIndex));
        citationMap.set(cleanPart, citationIndex);
      }
      resolvedNumbers.push(citationIndex);
    }

    if (resolvedNumbers.length === 0) {
      return "";
    }
    // Return citation numbers like [1] or [1, 2]
    return `[${resolvedNumbers.join(", ")}]`;
  });

  return { citations, formattedText };
}

function parseCitation(cleanPart: string, index: number): StructuredCitation {
  const linkMatch = cleanPart.match(/<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
  const url = linkMatch?.[1] ?? null;
  const title = linkMatch ? stripHtml(linkMatch[2]) : null;

  // Convert <a> tags to Markdown links, then strip remaining HTML
  const markdown = cleanPart
    .replace(/<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
    .replace(/<[^>]+>/g, "");

  // Text before the link is typically "Authors." / "Organization."
  let authors: string | null = null;
  if (linkMatch && typeof linkMatch.index === "number" && linkMatch.index > 0) {
    authors = stripHtml(cleanPart.slice(0, linkMatch.index)).replace(/[.\s]+$/, "").trim() || null;
  }

  // Trailing 4-digit year, e.g. "... 2025." or "...;2024"
  const yearMatch = markdown.match(/\b((?:19|20)\d{2})\b(?!.*\b(?:19|20)\d{2}\b)/s);
  const year = yearMatch?.[1] ?? null;

  return { index, markdown, authors, title, url, year };
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, "").trim();
}

export function formatCitations(text: string): string {
  const { citations, formattedText: replacedText } = collectCitations(text);
  const bibliography = citations.map((citation) => citation.markdown);
  let formattedText = replacedText;

  // Append bibliography to the end of the text if references exist
  if (bibliography.length > 0) {
    const referencesBlock = [
      "",
      "### References",
      ...bibliography.map((ref, idx) => `${idx + 1}. ${ref}`),
    ].join("\n");
    formattedText = `${formattedText}\n${referencesBlock}`;
  }

  // Final text cleanup: convert remaining HTML tags (like <strong>) in the main text to Markdown (like **)
  formattedText = formattedText
    .replace(/<strong>([\s\S]*?)<\/strong>/gi, "**$1**")
    .replace(/<b>([\s\S]*?)<\/b>/gi, "**$1**")
    .replace(/<em>([\s\S]*?)<\/em>/gi, "*$1*")
    .replace(/<i>([\s\S]*?)<\/i>/gi, "*$1*")
    .replace(/<br\s*\/?>/gi, "\n");

  return formattedText;
}
