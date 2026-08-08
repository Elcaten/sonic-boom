import { useDownloadedMedia, useDownloadStore } from "@/features/downloads";
import { useRequiredQueries } from "@/shared/api";
import { MediaItem } from "@rntp/player";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { mapToMediaItem } from "../lib";
import { AlbumSong } from "../types";

type UseAlbumMediaItemsProps = {
  albumId: string;
  songs: AlbumSong[];
};

type UseAlbumMediaItemsResult = {
  isPending: boolean;
  data: MediaItem[];
};

export function useAlbumMediaItems({
  albumId,
  songs,
}: UseAlbumMediaItemsProps): UseAlbumMediaItemsResult {
  const queries = useRequiredQueries();
  const albumArtworkUrlQuery = useQuery(queries.coverArtImage(albumId, 256));
  const streamUrlQueries = useQueries({
    queries: songs.map((song) => ({
      ...queries.streamUrl(song.id),
      select: (url: string) => ({ id: song.id, url }),
      enabled: songs.length > 0,
    })),
    combine: (queryResults) => {
      const entries = queryResults.flatMap((query) => {
        if (!query.data?.id || !query.data.url) return [];
        return [[query.data.id, query.data.url] as const];
      });
      return {
        data: new Map(entries),
        isPending: queryResults.some((query) => query.isPending),
      };
    },
  });
  const downloadedMediaQueries = useDownloadedMedia({ songs });

  const downloadProgress = useDownloadStore((x) => x.tasks);

  const data = useMemo<MediaItem[]>(
    () =>
      songs
        .map((song) =>
          mapToMediaItem({
            song: song,
            artworkUrl: albumArtworkUrlQuery.data?.uri,
            remoteMediaUrl: streamUrlQueries.data.get(song.id),
            downloadedMediaUrl: downloadedMediaQueries.data.get(song.id)?.downloadedFileUrl,
            downloadTask: downloadProgress.get(song.id),
          }),
        )
        .filter((item): item is MediaItem => item !== undefined),
    [
      albumArtworkUrlQuery.data?.uri,
      downloadProgress,
      downloadedMediaQueries.data,
      songs,
      streamUrlQueries.data,
    ],
  );

  return { isPending: albumArtworkUrlQuery.isPending || streamUrlQueries.isPending, data };
}
