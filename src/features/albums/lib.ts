import { MediaItem } from "@rntp/player";
import { MediaItemExtras } from "../player";
import { AlbumSong } from "./types";

export function filterSortAlbums<T extends { name: string; year?: number | null }>({
  albums,
  query,
}: {
  albums: T[];
  query: string;
}) {
  const normalizedQuery = query.toLocaleLowerCase();
  return albums
    .filter((album) => album.name.toLocaleLowerCase().includes(normalizedQuery))
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
}

export function mapSongToMediaItem({
  song,
  streamUrl,
  artworkUrl,
}: {
  song: AlbumSong;
  streamUrl: string;
  artworkUrl?: string;
}): MediaItem {
  const extras: MediaItemExtras = {
    artistId: song.artistId,
    albumId: song.albumId,
  };

  return {
    mediaId: song.id,
    url: streamUrl,
    title: song.title,
    artist: song.artist,
    albumTitle: song.album,
    artworkUrl,
    extras: extras as unknown as any,
  };
}

export function shuffleArray<T>(input: T[]): T[] {
  const array = [...input];
  let currentIndex = array.length;

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}
