import { useRequiredQueries } from "@/core/providers/AppContextProvider/queries/queries-context";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useDebouncedState } from "../../../hooks/use-debounce-state"; // Assuming this exists
import { defaultStorage } from "../lib/default-storage";
import { getUpdatedRecentSearches } from "../lib/get-updated-recent-searches";
import { MEDIA_SEARCH_DEBOUNCE } from "./const";
import { SearchItem } from "./types";

export function useSearchMedia({ storage = defaultStorage } = {}) {
  // Global API treated as a stable dependency
  const queries = useRequiredQueries();

  const [query, debouncedQuery, setQuery] = useDebouncedState("", MEDIA_SEARCH_DEBOUNCE);
  const [recentSearches, setRecentSearches] = useState<SearchItem[]>([]);

  // Load initial searches
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

  // Fetch results based on global TanStack Query setup
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
    // Navigation logic can go here or be bubbled up
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
