import AsyncStorage from "@react-native-async-storage/async-storage";
import { MEDIA_SEARCH_STORAGE_KEY, RECENT_MEDIA_SERCH_COUNT } from "./const";
import { SearchItem, StorageDependency } from "./types";

export const defaultStorage: StorageDependency = {
  load: async () => {
    const stored = await AsyncStorage.getItem(MEDIA_SEARCH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },
  save: async (items) => {
    await AsyncStorage.setItem(MEDIA_SEARCH_STORAGE_KEY, JSON.stringify(items));
  },
};

export function getUpdatedRecentSearches(
  prevSearches: SearchItem[],
  newItem: SearchItem,
  maxCount: number = RECENT_MEDIA_SERCH_COUNT,
): SearchItem[] {
  const filtered = prevSearches.filter((s) => {
    if (s.type !== newItem.type) return true;
    switch (s.type) {
      case "Album":
        return s.album.id !== (newItem as typeof s).album.id;
      case "Song":
        return s.song.id !== (newItem as typeof s).song.id;
      case "Artist":
        return s.artist.id !== (newItem as typeof s).artist.id;
    }
  });

  return [newItem, ...filtered].slice(0, maxCount);
}
