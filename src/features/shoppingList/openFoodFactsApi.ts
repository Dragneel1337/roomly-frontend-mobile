import { isAbortError } from "@/src/shared/api/isAbortError";

export type OffSearchHit = {
  barcode: string;
  name: string;
  brand: string;
};

const SEARCH_URL = "https://world.openfoodfacts.org/cgi/search.pl";
const REQUEST_TIMEOUT_MS = 8_000;
const FETCH_PAGE_SIZE = 24;
const RESULT_LIMIT = 20;
const CACHE_MAX_ENTRIES = 20;

type OffProduct = {
  code?: string;
  product_name?: string;
  brands?: string;
};

type OffSearchResponse = {
  products?: OffProduct[];
};

const searchCache = new Map<string, OffSearchHit[]>();

export function looksLikeBarcode(query: string): boolean {
  return /^\d{8,}$/.test(query.trim());
}

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function parseBrand(brands: string | undefined): string {
  if (!brands?.trim()) return "";
  return brands.split(",")[0]?.trim() ?? "";
}

function relevanceScore(name: string, query: string): number {
  const normalizedName = name.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  if (normalizedName === normalizedQuery) return 0;
  if (normalizedName.startsWith(normalizedQuery)) return 1;

  const wordBoundary = new RegExp(`\\b${escapeRegExp(normalizedQuery)}\\b`);
  if (wordBoundary.test(normalizedName)) return 2;
  if (normalizedName.includes(normalizedQuery)) return 3;

  return 4;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function rankSearchHits(hits: OffSearchHit[], query: string): OffSearchHit[] {
  return [...hits]
    .sort((a, b) => {
      const scoreDiff = relevanceScore(a.name, query) - relevanceScore(b.name, query);
      if (scoreDiff !== 0) return scoreDiff;
      return a.name.length - b.name.length;
    })
    .slice(0, RESULT_LIMIT);
}

function readCache(query: string): OffSearchHit[] | undefined {
  return searchCache.get(normalizeQuery(query));
}

function writeCache(query: string, hits: OffSearchHit[]) {
  const key = normalizeQuery(query);
  if (searchCache.has(key)) {
    searchCache.delete(key);
  }
  searchCache.set(key, hits);
  while (searchCache.size > CACHE_MAX_ENTRIES) {
    const oldestKey = searchCache.keys().next().value;
    if (oldestKey == null) break;
    searchCache.delete(oldestKey);
  }
}

export async function searchProductsByName(
  query: string,
  signal?: AbortSignal,
): Promise<OffSearchHit[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const cached = readCache(trimmed);
  if (cached) return cached;

  const url =
    `${SEARCH_URL}?search_terms=${encodeURIComponent(trimmed)}` +
    `&json=1&page_size=${FETCH_PAGE_SIZE}&fields=code,product_name,brands`;

  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);

  const onAbort = () => timeoutController.abort();
  signal?.addEventListener("abort", onAbort);

  try {
    const response = await fetch(url, {
      signal: timeoutController.signal,
      headers: {
        "User-Agent": "Roomly/1.0",
      },
    });

    if (signal?.aborted) {
      return [];
    }

    if (!response.ok) {
      throw new Error("Search failed");
    }

    const data = (await response.json()) as OffSearchResponse;
    const hits: OffSearchHit[] = [];

    for (const product of data.products ?? []) {
      const barcode = product.code?.trim();
      const name = product.product_name?.trim();
      if (!barcode || !name) continue;

      hits.push({
        barcode,
        name,
        brand: parseBrand(product.brands),
      });
    }

    const ranked = rankSearchHits(hits, trimmed);
    if (!signal?.aborted) {
      writeCache(trimmed, ranked);
    }
    return ranked;
  } catch (err) {
    if (isAbortError(err) || signal?.aborted || timeoutController.signal.aborted) {
      return [];
    }
    throw err;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", onAbort);
  }
}
