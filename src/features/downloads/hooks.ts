import { appLogger } from "@/shared/lib/logger";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";
import { deleteAllMediaDownloads, recoverMediaDownloads, startMediaDownload } from "./lib/download-coordinator";
import { downloadsRepository } from "./lib/downloads-repository";
import { DownloadTarget } from "./types";

export const DOWNLOADS_QUERY_KEY = ["downloads"] as const;

export const downloadedTracksQueryOptions = queryOptions({
  queryKey: DOWNLOADS_QUERY_KEY,
  queryFn: () => downloadsRepository.list(),
  staleTime: 0,
});

export function useDownloadedTracks() {
  return useQuery({ ...downloadedTracksQueryOptions, refetchOnMount: "always" });
}

function useCoordinatorDependencies() {
  const queryClient = useQueryClient();
  return useMemo(
    () => ({
      onCatalogChanged: () => queryClient.invalidateQueries({ queryKey: DOWNLOADS_QUERY_KEY }),
      onError: (message: string, error?: unknown) =>
        appLogger.DOWNLOADS.error(message, error),
    }),
    [queryClient],
  );
}

export function useStartMediaDownload() {
  const dependencies = useCoordinatorDependencies();
  return useCallback(
    (target: DownloadTarget, remoteUrl: string) =>
      startMediaDownload({ target, remoteUrl, dependencies }),
    [dependencies],
  );
}

export function useDeleteAllDownloads() {
  const dependencies = useCoordinatorDependencies();
  return useMutation({ mutationFn: () => deleteAllMediaDownloads(dependencies) });
}

export function DownloadRecovery() {
  const dependencies = useCoordinatorDependencies();

  useEffect(() => {
    recoverMediaDownloads(dependencies).catch((error) =>
      appLogger.DOWNLOADS.error("Failed to recover downloads", error),
    );
  }, [dependencies]);

  return null;
}
