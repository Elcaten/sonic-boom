import { AlbumSong, AlbumSongMeta } from "@/features/albums";
import { MediaItemExtras } from "@/features/player";
import { createDownloadTask } from "@kesha-antonov/react-native-background-downloader";
import { MediaItem } from "@rntp/player";
import {
  queryOptions,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Directory, File, Paths } from "expo-file-system";
import { Alert } from "react-native";

const DOWNLOADS_SUBDIR = "downloads";
const DEFAULT_ARTIST_ID = "NO_ARTIST";
const DEFAULT_ALBUM_ID = "NO_ALBUM";
const DEFAULT_TRACK_ID = "NO_TRACK";

export function useDeleteAllDownloads() {
  const client = useQueryClient();

  return () => {
    try {
      const downloadsDir = new Directory(Paths.document, DOWNLOADS_SUBDIR);
      if (downloadsDir.exists) {
        downloadsDir.delete();
        client.invalidateQueries({
          queryKey: ["downloaded-media"],
        });
      }
      Alert.alert("All downloads deleted");
    } catch (error) {
      console.error("Error deleting downloads:", error);
      Alert.alert("Error deleting downloads", String(error));
    }
  };
}

const getPath = (dir: Directory) => {
  return dir.uri.replace("file://", "");
};

const getAlbumDir = ({ albumId, artistId }: { albumId: string; artistId: string }) => {
  return new Directory(Paths.document, DOWNLOADS_SUBDIR, artistId, albumId);
};

export const getDownloadedMediaQueryOptions = (
  artistId: string | undefined = DEFAULT_ARTIST_ID,
  albumId: string | undefined = DEFAULT_ALBUM_ID,
  trackId: string | undefined = DEFAULT_TRACK_ID,
) => {
  return queryOptions({
    queryKey: ["downloaded-media", artistId, albumId, trackId],
    refetchOnMount: true,
    // staleTime: 1000,
    queryFn: async (): Promise<AlbumSongMeta> => {
      const mediaFile = new File(Paths.document, DOWNLOADS_SUBDIR, artistId, albumId, trackId);
      if (!mediaFile.exists) {
        return { downloadedFileUrl: null, trackId };
      }
      console.log("Found downloaded media file at:", mediaFile.uri);
      return { downloadedFileUrl: mediaFile.uri, trackId };
    },
  });
};

type AllDownloadedMedia = {
  songId: string;
  albumId: string;
  artistId: string;
}[];

export function useAllDownloadedMedia() {
  return useQuery({
    queryKey: ["downloaded-media"],
    refetchOnMount: true,
    // staleTime: 1000,
    queryFn: async (): Promise<AllDownloadedMedia> => {
      const downloadsDir = new Directory(Paths.document, DOWNLOADS_SUBDIR);

      if (!downloadsDir.exists) {
        return [];
      }

      let allDownloadedMedia: AllDownloadedMedia = [];

      const artistDirs = downloadsDir.list();

      for (const artistDir of artistDirs) {
        const albumDirs = artistDir.list();

        for (const albumDir of albumDirs) {
          for (const songFile of albumDir.list()) {
            allDownloadedMedia.push({
              artistId: artistDir.name,
              albumId: albumDir.name,
              songId: songFile.name,
            });
          }
        }
      }

      return allDownloadedMedia;
    },
  });
}

export function useAlbumSongsMeta({ songs }: { songs: AlbumSong[] }) {
  return useQueries({
    queries: songs.map((song) =>
      getDownloadedMediaQueryOptions(song.artistId, song.albumId, song.id),
    ),
    combine: (queryResults) => {
      return {
        data: queryResults.reduce((acc, query) => {
          if (query.data) {
            acc.set(query.data.trackId, query.data);
          }
          return acc;
        }, new Map<string, AlbumSongMeta>()),
        isPending: queryResults.some((query) => query.isPending),
      };
    },
  });
}

export function useDownloadMediaItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mediaItem: MediaItem) => {
      const mediaItemExtras = mediaItem?.extras as MediaItemExtras | undefined;
      const artistId = mediaItemExtras?.artistId ?? DEFAULT_ARTIST_ID;
      const albumId = mediaItemExtras?.albumId ?? DEFAULT_ALBUM_ID;
      const trackId = mediaItem.mediaId ?? DEFAULT_TRACK_ID;

      const albumDir = getAlbumDir({ albumId, artistId });
      if (!albumDir.exists) {
        albumDir.create({ intermediates: true });
      }

      const albumDirPath = getPath(albumDir);
      const destination = albumDirPath + "/" + trackId;

      const downloadTask = createDownloadTask({
        id: trackId,
        url: mediaItem.url.toString(),
        destination: destination,
        metadata: {},
      })
        .begin(({ expectedBytes, headers }) => {
          console.log(`Going to download ${expectedBytes} bytes!`);
        })
        .progress(({ bytesDownloaded, bytesTotal }) => {
          console.log(`Downloaded: ${(bytesDownloaded / bytesTotal) * 100}%`);
        })
        .done(async ({ bytesDownloaded, bytesTotal }) => {
          console.log("Download is done!" + `${bytesDownloaded / 1_000_000} MB`);
          console.log(`Saved to ${destination}`);
          await queryClient.invalidateQueries({
            queryKey: ["downloaded-media", albumId, trackId],
          });
          await queryClient.invalidateQueries({
            queryKey: ["downloaded-media"],
          });
          // PROCESS YOUR STUFF
          // FINISH DOWNLOAD JOB
        })
        .error(({ error, errorCode }) => {
          console.log("Download canceled due to error: ", { error, errorCode });
        });

      downloadTask.start();
    },
  });
}

const getCachedSongsQueryOptions = ({
  artistId,
  albumId,
}: {
  artistId: string;
  albumId: string;
}) => {
  return queryOptions({
    queryKey: ["cached-songs", artistId, albumId],
    refetchOnMount: true,
    queryFn: async (): Promise<AlbumSongMeta[]> => {
      const albumDir = getAlbumDir({ albumId, artistId });
      if (!albumDir.exists) {
        return [];
      }

      const cachedSongs: AlbumSongMeta[] = [];

      for (const songFile of albumDir.list()) {
        cachedSongs.push({
          downloadedFileUrl: songFile.uri,
          trackId: songFile.name,
        });
      }

      return cachedSongs;
    },
  });
};

function useGetCachedSongs({ artistId, albumId }: { artistId: string; albumId: string }) {
  return useQueries({
    queries: [getCachedSongsQueryOptions({ artistId, albumId })],
  });
}
