import { appLogger } from "@/shared/lib/logger";
import { getCoverCacheKey } from "@/shared/lib/media";
import { queryOptions } from "@tanstack/react-query";
import { Image, ImageSource } from "expo-image";
import { SubsonicAPI } from "subsonic-api";

export function createSubsonicQueries(api: SubsonicAPI) {
  return {
    albumList: (params: { size: number; offset: number }) =>
      queryOptions({
        queryKey: ["albumList", params.size, params.offset],
        queryFn: () =>
          api.getAlbumList({
            type: "alphabeticalByArtist",
            size: params.size,
            offset: params.offset,
          }),
      }),
    streamUrl: (trackId: string) =>
      queryOptions({
        queryKey: ["stream-url", trackId],
        queryFn: () => api.buildUrl("stream", { id: trackId }).then((u) => u.toString()),
      }),
    coverArtImage: (entityId: string | undefined, size: 32 | 48 | 256) =>
      queryOptions({
        queryKey: ["cover-art", entityId, size],
        queryFn: async (): Promise<ImageSource> => {
          const cacheKey = getCoverCacheKey({ id: entityId!, size });
          const cachedArtwork = await Image.getCachePathAsync(cacheKey);
          if (cachedArtwork) {
            appLogger.QUERY.info(`Cached artwork ${cacheKey}`);
            return { uri: cachedArtwork, cacheKey };
          }

          const artworkUrl = await api
            .buildUrl("getCoverArt", { id: entityId!, size: size * 2 })
            .then((u) => u.toString());
          appLogger.QUERY.info(`Fetched artwork ${cacheKey}`);
          return { uri: artworkUrl, cacheKey };
        },
        enabled: Boolean(entityId),
        staleTime: undefined,
      }),
    song: (trackId: string) =>
      queryOptions({
        queryKey: ["song", trackId],
        queryFn: () => api.getSong({ id: trackId }),
      }),
    search: ({ query }: { query: string }) =>
      queryOptions({
        queryKey: ["song", query],
        queryFn: () =>
          api
            .search2({ query, songCount: 100, albumCount: 5, artistCount: 5 })
            .then((result) => result.searchResult2)
            .then((result) => {
              const sanitized = query.toLocaleLowerCase();
              return {
                album: result.album?.filter((album) =>
                  album.title.toLocaleLowerCase().includes(sanitized),
                ),
                artist: result.artist,
                song: result.song?.filter((song) =>
                  song.title.toLocaleLowerCase().includes(sanitized),
                ),
              };
            }),
        enabled: !!query,
      }),
    album: (albumId: string) =>
      queryOptions({
        queryKey: ["album", albumId],
        queryFn: () => api.getAlbum({ id: albumId }),
      }),
    artists: () =>
      queryOptions({
        queryKey: ["artists"],
        queryFn: () => api.getArtists(),
      }),
    artist: (artistId: string) =>
      queryOptions({
        queryKey: ["artist", artistId],
        queryFn: () => api.getArtist({ id: artistId }),
      }),
  };
}
