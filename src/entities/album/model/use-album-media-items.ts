import { useRequiredQueries } from "@/shared/api/subsonic";
import { useQueries, useQuery } from "@tanstack/react-query";
import { MediaItem } from "@rntp/player";
import { useMemo } from "react";
import { mapSongToMediaItem } from "../lib/map-song-to-media-item";
import { AlbumSong } from "./types";

type UseAlbumMediaItemsArgs = {
  albumId: string;
  songs: AlbumSong[];
};

export function useAlbumMediaItems({ albumId, songs }: UseAlbumMediaItemsArgs) {
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
        if (!query.data?.id || !query.data.url) {
          return [];
        }
        return [[query.data.id, query.data.url] as const];
      });

      return {
        data: new Map(entries),
        isPending: queryResults.some((query) => query.isPending),
      };
    },
  });

  const data = useMemo<MediaItem[]>(
    () =>
      songs.flatMap((song) => {
        const streamUrl = streamUrlQueries.data.get(song.id);
        if (!streamUrl) {
          return [];
        }
        return [
          mapSongToMediaItem({
            song,
            streamUrl,
            artworkUrl: albumArtworkUrlQuery.data?.uri,
          }),
        ];
      }),
    [albumArtworkUrlQuery.data?.uri, songs, streamUrlQueries.data],
  );

  return {
    isPending: albumArtworkUrlQuery.isPending || streamUrlQueries.isPending,
    data,
  };
}
