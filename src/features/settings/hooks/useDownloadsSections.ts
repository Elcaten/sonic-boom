import { getDownloadKey, useDownloadedTracks, useDownloadStore } from "@/features/downloads";
import { useRequiredQueries } from "@/shared/api";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { buildDownloadsSections } from "../lib/downloads-sections";

export function useDownloadsSections() {
  const queries = useRequiredQueries();
  const downloadedTracksQuery = useDownloadedTracks();
  const downloadTasks = useDownloadStore((state) => state.tasks);
  const downloadedTracks = useMemo(
    () => {
      const completedTracks = downloadedTracksQuery.data ?? [];
      const completedKeys = new Set(completedTracks.map(getDownloadKey));
      const pendingTracks = [...downloadTasks.values()]
        .filter((task) => !completedKeys.has(getDownloadKey(task)))
        .map((task) => ({
          albumArtistId: task.albumArtistId,
          albumId: task.albumId,
          trackId: task.trackId,
          fileUri: "",
        }));
      return [...completedTracks, ...pendingTracks];
    },
    [downloadTasks, downloadedTracksQuery.data],
  );
  const artistIds = useMemo(
    () => [...new Set(downloadedTracks.map((track) => track.albumArtistId))],
    [downloadedTracks],
  );
  const albumIds = useMemo(
    () => [...new Set(downloadedTracks.map((track) => track.albumId))],
    [downloadedTracks],
  );
  const { data: artistNames } = useQueries({
    queries: artistIds.map((artistId) => queries.artist(artistId)),
    combine: (results) => ({
      data: new Map(
        results.flatMap((result) =>
          result.data?.artist
            ? [[result.data.artist.id, result.data.artist.name] as const]
            : [],
        ),
      ),
    }),
  });
  const { data: albums } = useQueries({
    queries: albumIds.map((albumId) => queries.album(albumId)),
    combine: (results) => ({
      data: new Map(
        results.flatMap((result) =>
          result.data?.album ? [[result.data.album.id, result.data.album] as const] : [],
        ),
      ),
    }),
  });

  const sections = useMemo(
    () => buildDownloadsSections({ downloadedTracks, artistNames, albums }),
    [albums, artistNames, downloadedTracks],
  );

  return {
    sections,
    downloadedCount: downloadedTracks.length,
    isPending: downloadedTracksQuery.isPending,
  };
}
