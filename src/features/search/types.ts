import { Artist, Child } from "subsonic-api";

export type SearchItem =
  | { type: "Album"; album: Child }
  | { type: "Song"; song: Child }
  | { type: "Artist"; artist: Artist };

export interface StorageDependency {
  load: () => Promise<SearchItem[] | null>;
  save: (items: SearchItem[]) => Promise<void>;
}
