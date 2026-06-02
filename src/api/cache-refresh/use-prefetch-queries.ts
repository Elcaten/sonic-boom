import { useRequiredQueries } from "@/api";
import { batchProcessWithDetails } from "@/lib/promise";
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

    const artistListQuery = await queryClient.ensureQueryData(queries.artists());
    const artistList = artistListQuery.artists.index?.flatMap((section) => section.artist ?? []) ?? [];

    const artistsDetailsQueries = artistList.map(async (artist) => {
      return queryClient.ensureQueryData(queries.artist(artist.id));
    });

    const artistsDetails = await batchProcessWithDetails({
      promises: artistsDetailsQueries,
      pageSize: 3,
      delayMs: 300,
      onProgress: ({ completed, total }) => {
        setProgress({ title: "Artists", progressPercentage: Math.round((completed / total) * 100) });
      },
    });

    const albumsQueries = artistsDetails.successful
      .flatMap((artist) => artist.artist.album ?? [])
      .map(async (album) => queryClient.ensureQueryData(queries.album(album.id)));

    const albums = await batchProcessWithDetails({
      promises: albumsQueries,
      pageSize: 5,
      delayMs: 300,
      onProgress: ({ completed, total }) => {
        setProgress({ title: "Albums", progressPercentage: Math.round((completed / total) * 100) });
      },
    });

    if (artistsDetails.failureCount) {
      console.log(`Failed ${artistsDetails.failureCount} artists details`);
    }
    if (albums.failureCount) {
      console.log(`Failed ${albums.failureCount} albums`);
    }
  };

  return { trigger, progress };
}
