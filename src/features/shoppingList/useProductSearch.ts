import { useEffect, useRef, useState } from "react";
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

  const trimmedQuery = query.trim();
  const isBarcodeQuery = looksLikeBarcode(trimmedQuery);
  const resultsAreStale = results.length > 0 && resultsQuery !== trimmedQuery;
  const showResults =
    !searching && !resultsAreStale && resultsQuery === trimmedQuery && results.length > 0;

  useEffect(() => {
    currentQueryRef.current = trimmedQuery;

    if (trimmedQuery.length < 2 || isBarcodeQuery) {
      setResults([]);
      setResultsQuery(null);
      setSearchError(null);
      setSearching(false);
      return;
    }

    setResults([]);
    setResultsQuery(null);
    setSearching(true);
    setSearchError(null);

    const abortController = new AbortController();
    const requestQuery = trimmedQuery;

    const handle = setTimeout(() => {
      void searchProductsByName(requestQuery, abortController.signal)
        .then((hits) => {
          if (abortController.signal.aborted) return;
          if (currentQueryRef.current !== requestQuery) return;

          setResults(hits);
          setResultsQuery(requestQuery);
          setSearchError(null);
        })
        .catch((err: unknown) => {
          if (abortController.signal.aborted) return;
          if (currentQueryRef.current !== requestQuery) return;
          if (isAbortError(err)) return;

          setResults([]);
          setResultsQuery(null);
          setSearchError("Search failed");
        })
        .finally(() => {
          if (abortController.signal.aborted) return;
          if (currentQueryRef.current !== requestQuery) return;
          setSearching(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(handle);
      abortController.abort();
    };
  }, [trimmedQuery, isBarcodeQuery]);

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
  };
}
