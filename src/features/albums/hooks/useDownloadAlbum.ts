import { useDownloadMediaItem } from "@/features/downloads";
import { useRequiredQueries } from "@/shared/api";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { mapToMediaItem } from "../lib";

export function useDownloadAlbum() {
  const queryClient = useQueryClient();
  const queries = useRequiredQueries();
  const { mutateAsync: downloadMediaItem } = useDownloadMediaItem();

  return useCallback(
    async ({ albumId }: { albumId: string }) => {
      const albumResponse = await queryClient.ensureQueryData(queries.album(albumId));
      const songs = albumResponse.album.song ?? [];

      const mediaItems = await Promise.all(
        songs.map(async (song) => {
          const remoteMediaUrl = await queryClient.ensureQueryData(queries.streamUrl(song.id));

          return mapToMediaItem({
            song,
            artworkUrl: undefined,
            remoteMediaUrl,
            downloadedMediaUrl: undefined,
            downloadTask: undefined,
          });
        }),
      );

      await Promise.all(
        mediaItems.map((mediaItem) =>
          mediaItem ? downloadMediaItem(mediaItem) : Promise.resolve(),
        ),
      );
    },
    [downloadMediaItem, queries, queryClient],
  );
}
