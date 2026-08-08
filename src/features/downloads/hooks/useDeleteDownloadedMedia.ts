import { appLogger } from "@/shared/lib/logger";
import { useQueryClient } from "@tanstack/react-query";
import { DownloadsDirectory } from "../lib";
import { useDownloadStore } from "./useDownloadStore";

type DeleteDownloadsResult = { success: true } | { success: false; error: unknown };

export function useDeleteDownloadedMedia(): () => DeleteDownloadsResult {
  const client = useQueryClient();

  return () => {
    try {
      const downloadsDir = new DownloadsDirectory();

      if (downloadsDir.exists) {
        downloadsDir.delete();
        client.invalidateQueries({ queryKey: ["downloaded-media"] });
        useDownloadStore.getState().clear();
      }

      return { success: true };
    } catch (error) {
      appLogger.DOWNLOADS.error("Error deleting downloads", error);
      return { success: false, error };
    }
  };
}
