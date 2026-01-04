// hooks/useSearch.ts
import { subsonicQueries } from "@/queries/subsonicQueries";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Artist, Child } from "subsonic-api";
import { useSubsonicQuery } from "../queries/use-subsonic-query";
import { useDebouncedState } from "./use-debounce-state";

const STORAGE_KEY = "recentSearches";
const RECENTLY_SEARCH_COUNT = 5;
const DEBOUNCE_TIME = 300;

export type SearchItem =
  | { type: "Album"; album: Child }
  | { type: "Song"; song: Child }
  | { type: "Artist"; artist: Artist };

export function useSearch() {
  const [query, debouncedQuery, setQuery] = useDebouncedState(
    "",
    DEBOUNCE_TIME
  );
  const [recentSearches, setRecentSearches] = useState<SearchItem[]>([]);

  // Load recent searches on mount
  useEffect(() => {
    const loadSearches = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setRecentSearches(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Failed to load recent searches:", error);
      }
    };
    loadSearches();
  }, []);

  // Fetch search results with debounced query
  const {
    data: results,
    isLoading,
    error,
  } = useSubsonicQuery({
    ...subsonicQueries.search({ query: debouncedQuery }),
    enabled: !!debouncedQuery,
  });

  // Add to recent searches
  const addRecentSearch = async (item: SearchItem) => {
    try {
      setRecentSearches((prev) => {
        // Remove if already exists (compare by id and type)
        const filtered = prev.filter((s) => {
          if (s.type !== item.type) return true;

          switch (s.type) {
            case "Album":
              return s.album.id !== (item as typeof s).album.id;
            case "Song":
              return s.song.id !== (item as typeof s).song.id;
            case "Artist":
              return s.artist.id !== (item as typeof s).artist.id;
          }
        });

        // Add to front, keep last 3
        const updated = [item, ...filtered].slice(0, RECENTLY_SEARCH_COUNT);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error("Failed to save recent search:", error);
    }
  };

  // Handle clicking a recent search item
  const handleRecentSearchPress = (item: SearchItem) => {
    addRecentSearch(item);
    // You might want to navigate or do something specific with the item here
  };

  // Handle selecting a result item (to add to recent searches)
  const handleResultSelect = (item: SearchItem) => {
    setQuery("");
    addRecentSearch(item);
  };

  return {
    // Input state
    query,
    setQuery,

    // Search state
    debouncedQuery,

    // Handlers
    handleRecentSearchPress,
    handleResultSelect,

    // Results
    results,
    isLoading,
    error,

    // Recent searches
    recentSearches,
  };
}
