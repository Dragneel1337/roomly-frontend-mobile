import { useCallback, useEffect, useRef, useState } from "react";
import { isAbortError } from "@/src/shared/api/isAbortError";
import {
  looksLikeBarcode,
  searchProductsByName,
  type OffSearchHit,
} from "./openFoodFactsApi";

const DEBOUNCE_MS = 300;

export function useProductSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OffSearchHit[]>([]);
  const [resultsQuery, setResultsQuery] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const currentQueryRef = useRef("");
  const abortRef = useRef<AbortController | null>(null);

  const trimmedQuery = query.trim();
  const isBarcodeQuery = looksLikeBarcode(trimmedQuery);
  const resultsAreStale = results.length > 0 && resultsQuery !== trimmedQuery;
  const showResults =
    !searching && !resultsAreStale && resultsQuery === trimmedQuery && results.length > 0;

  const runSearch = useCallback(async (requestQuery: string) => {
    if (requestQuery.length < 2 || looksLikeBarcode(requestQuery)) {
      return;
    }

    abortRef.current?.abort();
    const abortController = new AbortController();
    abortRef.current = abortController;

    currentQueryRef.current = requestQuery;
    setResults([]);
    setResultsQuery(null);
    setSearching(true);
    setSearchError(null);

    try {
      const hits = await searchProductsByName(requestQuery, abortController.signal);
      if (abortController.signal.aborted) return;
      if (currentQueryRef.current !== requestQuery) return;

      setResults(hits);
      setResultsQuery(requestQuery);
      setSearchError(null);
    } catch (err: unknown) {
      if (abortController.signal.aborted) return;
      if (currentQueryRef.current !== requestQuery) return;
      if (isAbortError(err)) return;

      setResults([]);
      setResultsQuery(null);
      setSearchError("Search failed");
    } finally {
      if (abortController.signal.aborted) return;
      if (currentQueryRef.current !== requestQuery) return;
      setSearching(false);
    }
  }, []);

  const submitSearch = useCallback(() => {
    void runSearch(trimmedQuery);
  }, [runSearch, trimmedQuery]);

  useEffect(() => {
    currentQueryRef.current = trimmedQuery;

    if (trimmedQuery.length < 2 || isBarcodeQuery) {
      abortRef.current?.abort();
      setResults([]);
      setResultsQuery(null);
      setSearchError(null);
      setSearching(false);
      return;
    }

    const handle = setTimeout(() => {
      void runSearch(trimmedQuery);
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(handle);
      abortRef.current?.abort();
    };
  }, [trimmedQuery, isBarcodeQuery, runSearch]);

  return {
    query,
    setQuery,
    results,
    resultsQuery,
    resultsAreStale,
    showResults,
    searching,
    searchError,
    isBarcodeQuery,
    trimmedQuery,
    submitSearch,
  };
}
