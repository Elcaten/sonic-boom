import { MediaItemExtras } from "@/features/player";
import { appLogger } from "@/shared/lib/logger";
import { createDownloadTask } from "@kesha-antonov/react-native-background-downloader";
import { MediaItem } from "@rntp/player";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MediaItemFile } from "../lib";
import { useDownloadStore } from "./useDownloadStore";

export function useDownloadMediaItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mediaItem: MediaItem) => {
      const mediaItemExtras = mediaItem?.extras as MediaItemExtras | undefined;

      const destinationFile = new MediaItemFile({
        artistId: mediaItemExtras?.artistId,
        albumId: mediaItemExtras?.albumId,
        songId: mediaItem.mediaId,
        mimeType: mediaItem.mimeType,
      });

      const taskId = mediaItem.mediaId ?? new Date().toString();
      const existingTask = useDownloadStore.getState().tasks.get(taskId);

      if (existingTask?.status === "loading") return;

      if (destinationFile.uri) {
        useDownloadStore.getState().setTaskSuccess(taskId);
        return;
      }

      destinationFile.parentDirectory.create({ intermediates: true, idempotent: true });

      const destination = destinationFile.pathWithoutProtocol;

      const downloadTask = createDownloadTask({
        id: taskId,
        url: mediaItem.url.toString(),
        destination: destination,
      })
        .begin(() => {
          useDownloadStore
            .getState()
            .setTaskLoading({ albumId: mediaItemExtras?.albumId, fileId: taskId });
          appLogger.DOWNLOADS.info(`Going to download | {taskId}`);
        })
        .progress(({ bytesDownloaded, bytesTotal }) => {
          useDownloadStore.getState().setTaskProgress({
            albumId: mediaItemExtras?.albumId,
            fileId: taskId,
            progress: bytesDownloaded / bytesTotal,
          });
        })
        .done(async () => {
          appLogger.DOWNLOADS.info(`$Download is done | ${taskId} | ${destination}`);
          useDownloadStore
            .getState()
            .setTaskSuccess({ albumId: mediaItemExtras?.albumId, fileId: taskId });
          await queryClient.invalidateQueries({ queryKey: ["downloaded-media"] });
        })
        .error(({ error, errorCode }) => {
          useDownloadStore
            .getState()
            .setTaskError({ albumId: mediaItemExtras?.albumId, fileId: taskId, error: error });
          appLogger.DOWNLOADS.error(
            new Error("Download canceled due to error", { cause: { error, errorCode } }),
          );
        });

      downloadTask.start();
    },
  });
}
