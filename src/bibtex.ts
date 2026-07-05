import type { StructuredCitation } from "./article.js";

const DOI_RE = /doi\.org\/(10\.\d{4,9}\/[^\s"'<>]+)/i;
const CROSSREF_TIMEOUT_MS = 8_000;

export interface BibtexEntry {
  index: number;
  key: string;
  entry: string;
  doi: string | null;
  crossref_matched: boolean;
}

export interface BibtexResult {
  entries: BibtexEntry[];
  bibtex: string;
}

/**
 * Convert structured OpenEvidence citations to BibTeX.
 * Offline by default; pass validateCrossref=true to enrich entries with
 * Crossref metadata when a DOI is present in the citation URL.
 */
export async function citationsToBibtex(
  citations: StructuredCitation[],
  options: { validateCrossref?: boolean } = {},
): Promise<BibtexResult> {
  const entries: BibtexEntry[] = [];
  for (const citation of citations) {
    entries.push(await buildEntry(citation, options.validateCrossref ?? false));
  }
  return {
    entries,
    bibtex: entries.map((item) => item.entry).join("\n\n"),
  };
}

async function buildEntry(citation: StructuredCitation, validateCrossref: boolean): Promise<BibtexEntry> {
  const doi = citation.url?.match(DOI_RE)?.[1] ?? null;
  const key = buildCitationKey(citation);

  if (doi && validateCrossref) {
    const crossrefEntry = await fetchCrossrefBibtex(doi);
    if (crossrefEntry) {
      return { index: citation.index, key, entry: crossrefEntry, doi, crossref_matched: true };
    }
  }

  const fields: [string, string | null][] = [
    ["author", citation.authors],
    ["title", citation.title],
    ["year", citation.year],
    ["url", citation.url],
    ["doi", doi],
    ["note", citation.title ? null : citation.markdown],
  ];
  const body = fields
    .filter((field): field is [string, string] => Boolean(field[1]))
    .map(([name, value]) => `  ${name} = {${escapeBibtex(value)}}`)
    .join(",\n");

  const type = doi ? "article" : "misc";
  return {
    index: citation.index,
    key,
    entry: `@${type}{${key},\n${body}\n}`,
    doi,
    crossref_matched: false,
  };
}

function buildCitationKey(citation: StructuredCitation): string {
  const author = (citation.authors ?? "openevidence")
    .split(/[\s,;]+/)[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const year = citation.year ?? "nd";
  return `${author || "openevidence"}${year}_${citation.index}`;
}

function escapeBibtex(value: string): string {
  return value.replace(/[{}]/g, "").replace(/([&%#_])/g, "\\$1");
}

async function fetchCrossrefBibtex(doi: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CROSSREF_TIMEOUT_MS);
    const response = await fetch(`https://doi.org/${encodeURIComponent(doi)}`, {
      headers: { accept: "application/x-bibtex" },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!response.ok) {
      return null;
    }
    const text = (await response.text()).trim();
    return text.startsWith("@") ? text : null;
  } catch {
    // Crossref enrichment is best-effort; fall back to the offline entry.
    return null;
  }
}
