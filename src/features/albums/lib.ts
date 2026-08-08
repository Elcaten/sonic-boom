import { MediaItem } from "@rntp/player";
import { MyDownloadTask } from "../downloads";
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

type MapToMediaItemParams = {
  song: AlbumSong;
  artworkUrl: string | undefined;
  remoteMediaUrl: string | undefined;
  downloadedMediaUrl: string | undefined;
  downloadTask: MyDownloadTask | undefined;
};

export function mapToMediaItem(params: MapToMediaItemParams): MediaItem | undefined {
  const {
    song,
    artworkUrl,
    remoteMediaUrl,
    downloadedMediaUrl,
    downloadTask: _downloadTask,
  } = params;

  const streamUrl = downloadedMediaUrl ?? remoteMediaUrl;

  const downloadTask: MyDownloadTask | undefined = downloadedMediaUrl
    ? { progress: 100, status: "success" }
    : _downloadTask;

  if (!streamUrl) return undefined;

  return {
    mediaId: song.id,
    url: streamUrl,
    mimeType: song.contentType,
    title: song.title,
    artist: song.artist,
    albumTitle: song.album,
    artworkUrl: artworkUrl,
    extras: {
      artistId: song.artistId,
      albumId: song.albumId,
      downloadTask: downloadTask,
      trackNumber: song.track,
    } satisfies MediaItemExtras,
  } satisfies MediaItem;
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
