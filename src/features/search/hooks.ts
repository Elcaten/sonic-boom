import { useRequiredQueries } from "@/shared/api";
import { useDebouncedState } from "@/shared/lib/debounce";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { MEDIA_SEARCH_DEBOUNCE } from "./const";
import { defaultStorage, getUpdatedRecentSearches } from "./lib";
import { SearchItem } from "./types";

export function useSearchMedia({ storage = defaultStorage } = {}) {
  const queries = useRequiredQueries();
  const [query, debouncedQuery, setQuery] = useDebouncedState("", MEDIA_SEARCH_DEBOUNCE);
  const [recentSearches, setRecentSearches] = useState<SearchItem[]>([]);

  useEffect(() => {
    const loadSearches = async () => {
      try {
        const stored = await storage.load();
        if (stored) setRecentSearches(stored);
      } catch (error) {
        console.error("Failed to load recent searches:", error);
      }
    };
    loadSearches();
  }, [storage]);

  const { data: results, isLoading, error } = useQuery(queries.search({ query: debouncedQuery }));

  const addRecentSearch = async (item: SearchItem) => {
    try {
      const updated = getUpdatedRecentSearches(recentSearches, item);
      setRecentSearches(updated);
      await storage.save(updated);
    } catch (error) {
      console.error("Failed to save recent search:", error);
    }
  };

  const handleRecentSearchPress = (item: SearchItem) => {
    addRecentSearch(item);
  };

  const handleResultSelect = (item: SearchItem) => {
    setQuery("");
    addRecentSearch(item);
  };

  return {
    query,
    setQuery,
    debouncedQuery,
    results,
    isLoading,
    error,
    recentSearches,
    handleRecentSearchPress,
    handleResultSelect,
  };
}
