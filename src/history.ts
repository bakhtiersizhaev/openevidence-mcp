export function sanitizeHistoryPayload(payload: unknown): Record<string, unknown> {
  const record = asRecord(payload);
  const results = Array.isArray(record.results) ? record.results : [];
  return {
    has_next: Boolean(record.next),
    has_previous: Boolean(record.previous),
    results: results.map(sanitizeHistoryItem),
  };
}

function sanitizeHistoryItem(item: unknown): Record<string, unknown> {
  const record = asRecord(item);
  return {
    article_id: stringOrNull(record.id),
    status: stringOrNull(record.status),
    title: stringOrNull(record.title),
    datetime_created: stringOrNull(record.datetime_created),
    article_type: stringOrNull(record.article_type),
    access_level: stringOrNull(record.access_level),
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}
