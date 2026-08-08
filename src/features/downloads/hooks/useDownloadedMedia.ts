import { AlbumSong, AlbumSongMeta } from "@/features/albums";
import { combineToMapFactory } from "@/shared/lib/query";
import { queryOptions, useQueries } from "@tanstack/react-query";
import { MediaItemFile } from "../lib";

const getDownloadedMediaQueryOptions = (song: AlbumSong) => {
  return queryOptions({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["downloaded-media", song.artistId, song.albumId, song.id],
    refetchOnMount: true,
    queryFn: async (): Promise<AlbumSongMeta> => {
      const mediaFile = new MediaItemFile({
        artistId: song.artistId,
        albumId: song.albumId,
        songId: song.id,
        mimeType: song.contentType,
      });

      return { downloadedFileUrl: mediaFile.uri, trackId: song.id };
    },
  });
};

const combineToMap = combineToMapFactory<AlbumSongMeta>({ keyExtractor: (song) => song.trackId });

export function useDownloadedMedia({ songs }: { songs: AlbumSong[] }) {
  return useQueries({
    queries: songs.map((song) => getDownloadedMediaQueryOptions(song)),
    combine: combineToMap,
  });
}
