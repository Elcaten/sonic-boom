import { useRequiredQueries } from "@/shared/api/queries-context/queries-context";
import { appLogger } from "@/shared/lib/logger";
import { useQueryClient } from "@tanstack/react-query";
import { ImageSource } from "expo-image";
import { useCallback, useRef, useState } from "react";
import { StoredCoverArtSize } from "./cover-art-repository";

const PAGE_SIZE = 10;
const DOWNLOAD_CONCURRENCY = 4;
const CONNECTIVITY_TIMEOUT_MS = 10_000;
const ALBUM_PAGE_TIMEOUT_MS = 10_000;
const STORED_SIZES: StoredCoverArtSize[] = [48, 256];

export type ArtworkSyncProgress = {
  status: "idle" | "syncing" | "complete";
  completed: number;
  total: number;
  failed: number;
  progressPercentage: number;
};

const initialProgress: ArtworkSyncProgress = {
  status: "idle",
  completed: 0,
  total: 0,
  failed: 0,
  progressPercentage: 0,
};

export function useArtworkSync() {
  const queries = useRequiredQueries();
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<ArtworkSyncProgress>(initialProgress);
  const inFlight = useRef<Promise<ArtworkSyncProgress> | null>(null);

  const start = useCallback(
    ({ force = false }: { force?: boolean } = {}) => {
      if (inFlight.current) return inFlight.current;

      const request = (async (): Promise<ArtworkSyncProgress> => {
        setProgress({ ...initialProgress, status: "syncing" });

        if (!force && (await queries.artwork.repository.isInitialSyncComplete())) {
          const complete = { ...initialProgress, status: "complete" as const };
          setProgress(complete);
          return complete;
        }

        try {
          await withTimeout(queries.artwork.ping(), CONNECTIVITY_TIMEOUT_MS);
        } catch (error) {
          appLogger.COVER_ART.warn(`Artwork sync skipped: ${String(error)}`);
          const complete = {
            ...initialProgress,
            status: "complete" as const,
            failed: 1,
          };
          setProgress(complete);
          return complete;
        }

        let albumIds: string[];
        try {
          albumIds = await getAllAlbumIds({ force, queryClient, queries });
        } catch (error) {
          appLogger.COVER_ART.error(`Unable to enumerate artwork: ${String(error)}`);
          const complete = {
            ...initialProgress,
            status: "complete" as const,
            failed: 1,
          };
          setProgress(complete);
          return complete;
        }

        const work = albumIds.flatMap((entityId) =>
          STORED_SIZES.map((size) => ({ entityId, size })),
        );
        const expectedKeys = work.map(({ entityId, size }) =>
          queries.artwork.repository.getKey(entityId, size),
        );
        let completed = 0;
        let failed = 0;

        for (let index = 0; index < work.length; index += DOWNLOAD_CONCURRENCY) {
          const batch = work.slice(index, index + DOWNLOAD_CONCURRENCY);
          const results = await Promise.allSettled(
            batch.map(async ({ entityId, size }) => {
              const source = await queries.artwork.get({ entityId, size, force });
              updateCoverArtQueryData(queryClient, entityId, size, source);
              return source;
            }),
          );
          const batchFailures = results.filter((result) => result.status === "rejected").length;
          completed += batch.length;
          failed += batchFailures;
          setProgress(createProgress("syncing", completed, work.length, failed));

          if (batch.length === DOWNLOAD_CONCURRENCY && batchFailures === batch.length) {
            failed += work.length - completed;
            completed = work.length;
            break;
          }
        }

        const allDownloaded = failed === 0;
        await queries.artwork.repository.finishSync(expectedKeys, allDownloaded);
        if (force) await queries.artwork.repository.prune(expectedKeys);

        const complete = createProgress("complete", completed, work.length, failed);
        setProgress(complete);
        return complete;
      })().finally(() => {
        inFlight.current = null;
      });

      inFlight.current = request;
      return request;
    },
    [queries, queryClient],
  );

  return { progress, start };
}

async function getAllAlbumIds({
  force,
  queryClient,
  queries,
}: {
  force: boolean;
  queryClient: ReturnType<typeof useQueryClient>;
  queries: ReturnType<typeof useRequiredQueries>;
}): Promise<string[]> {
  const ids = new Set<string>();

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const options = queries.albumList({ size: PAGE_SIZE, offset });
    const page = await withTimeout(
      force
        ? queryClient.fetchQuery({ ...options, staleTime: 0 })
        : queryClient.ensureQueryData(options),
      ALBUM_PAGE_TIMEOUT_MS,
    );
    const albums = page.albumList.album ?? [];
    const previousSize = ids.size;
    albums.forEach((album) => ids.add(album.id));

    // Some Subsonic-compatible servers ignore `offset`. Stop when a page adds
    // no new albums instead of requesting the same full page forever.
    if (albums.length < PAGE_SIZE || ids.size === previousSize) break;
  }
  return [...ids];
}

function updateCoverArtQueryData(
  queryClient: ReturnType<typeof useQueryClient>,
  entityId: string,
  size: StoredCoverArtSize,
  source: ImageSource,
) {
  queryClient.setQueryData(["cover-art", entityId, size], source);
  if (size === 48) queryClient.setQueryData(["cover-art", entityId, 32], source);
}

function createProgress(
  status: ArtworkSyncProgress["status"],
  completed: number,
  total: number,
  failed: number,
): ArtworkSyncProgress {
  return {
    status,
    completed,
    total,
    failed,
    progressPercentage: total === 0 ? 100 : Math.round((completed / total) * 100),
  };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error("Connectivity check timed out")), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
