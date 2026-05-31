import { RECENT_MEDIA_SERCH_COUNT } from "../model/const";
import { SearchItem } from "../model/types";

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
