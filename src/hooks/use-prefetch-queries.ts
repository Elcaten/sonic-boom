import { useRequiredQueries } from "@/context/app-context";
import { batchProcessWithDetails } from "@/utils/batch";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

type Progress = { title: string; progressPercentage: number };

export function usePrefetchQueries() {
  const queryClient = useQueryClient();
  const queries = useRequiredQueries();
  const [progress, setProgress] = useState<Progress | undefined>();

  const trigger = async () => {
    setProgress({ title: "", progressPercentage: 0 });

    queryClient.getQueryCache().clear();

    // await queryClient.prefetchQuery(queries.artists());
    const artistListQuery = await queryClient.ensureQueryData(queries.artists());

    const artistList =
      artistListQuery.artists.index?.flatMap((section) => section.artist ?? []) ?? [];

    const artistsDetailsQueries = artistList.map(async (artist) => {
      // await queryClient.prefetchQuery(queries.artist(artist.id));
      return queryClient.ensureQueryData(queries.artist(artist.id));
    });

    const artistsDetails = await batchProcessWithDetails({
      promises: artistsDetailsQueries,
      pageSize: 3,
      delayMs: 300,
      onProgress: ({ completed, total }) => {
        setProgress({
          title: "Artists",
          progressPercentage: Math.round((completed / total) * 100),
        });
      },
    });

    const albumsQueries = artistsDetails.successful
      .flatMap((artist) => artist.artist.album ?? [])
      .map(async (album) => {
        // await queryClient.prefetchQuery(queries.album(album.id));
        return queryClient.ensureQueryData(queries.album(album.id));
      });

    const _albums = await batchProcessWithDetails({
      promises: albumsQueries,
      pageSize: 5,
      delayMs: 300,
      onProgress: ({ completed, total }) => {
        setProgress({ title: "Albums", progressPercentage: Math.round((completed / total) * 100) });
      },
    });

    if (artistsDetails.failureCount) {
      console.log(`Failed ${artistsDetails.failureCount} artistsDetails`);
    }
    if (_albums.failureCount) {
      console.log(`Failed ${_albums.failureCount} albums`);
    }
  };

  return { trigger, progress };
}
