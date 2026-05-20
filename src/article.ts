const PENDING_STATUSES = new Set([
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
  return {
    article_id: readNonEmptyString(article.id),
    status: statusInfo.status,
    is_complete: statusInfo.is_complete,
    question: readQuestion(article),
    answer_text: extracted?.text ?? null,
    answer_source: extracted?.source ?? null,
    article,
  };
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
