import { useQuery } from "@tanstack/react-query";
import { DownloadsDirectory } from "../lib";

type DownloadedMedia = {
  songId: string;
  albumId: string;
  artistId: string;
};

export function useDownloadedMediaList() {
  return useQuery({
    queryKey: ["downloaded-media"],
    refetchOnMount: true,
    queryFn: async (): Promise<DownloadedMedia[]> => {
      const downloadsDir = new DownloadsDirectory();
      if (!downloadsDir.exists) {
        return [];
      }

      let allDownloadedMedia: DownloadedMedia[] = [];

      const artistDirs = downloadsDir.artistDirectories();

      for (const artistDir of artistDirs) {
        const albumDirs = artistDir.albumDirectories();

        for (const albumDir of albumDirs) {
          for (const songFile of albumDir.songFiles()) {
            allDownloadedMedia.push({
              artistId: artistDir.name,
              albumId: albumDir.name,
              songId: songFile.uri,
            });
          }
        }
      }

      return allDownloadedMedia;
    },
  });
}
