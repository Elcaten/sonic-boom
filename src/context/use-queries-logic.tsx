import { getCoverCacheKey } from "@/utils/get-cover-cache-key";
import { queryOptions } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useMemo } from "react";
import { SubsonicAPI } from "subsonic-api";

export function useQueriesLogic(api: SubsonicAPI | null) {
  return useMemo(() => {
    if (!api) {
      return null;
    }

    return {
      albumList: function (params: { size: number; offset: number }) {
        return queryOptions({
          queryKey: ["albumList", params.size, params.offset],
          queryFn: () =>
            api.getAlbumList({
              type: "alphabeticalByArtist",
              size: params.size,
              offset: params.offset,
            }),
        });
      },

      streamUrl: function (trackId: string) {
        return queryOptions({
          queryKey: ["stream-url", trackId],
          queryFn: () => api.buildUrl("stream", { id: trackId }).then((u) => u.toString()),
          staleTime: Infinity,
        });
      },

      coverArtUrl: function (entityId: string | undefined, size: 48 | 256) {
        return queryOptions({
          queryKey: ["cover-art", entityId, size],
          queryFn: async () => {
            const cachedArtwork = await Image.getCachePathAsync(
              getCoverCacheKey({ id: entityId!, size })
            );

            if (cachedArtwork) {
              return cachedArtwork;
            }

            return api
              .buildUrl("getCoverArt", { id: entityId!, size: size * 2 })
              .then((u) => u.toString());
          },
          staleTime: Infinity,
          enabled: Boolean(entityId),
        });
      },

      song: function (trackId: string) {
        return queryOptions({
          queryKey: ["song", trackId],
          queryFn: () => api.getSong({ id: trackId }),
        });
      },

      search: function ({ query }: { query: string }) {
        return queryOptions({
          queryKey: ["song", query],
          queryFn: () =>
            api
              .search2({ query, songCount: 100, albumCount: 5, artistCount: 5 })
              .then((result) => result.searchResult2)
              .then((result) => {
                return {
                  album: result.album?.filter((album) => {
                    // hack on client - avoid album matched by artist filed
                    const santizedQuery = query.toLocaleLowerCase();
                    return album.title.toLocaleLowerCase().includes(santizedQuery);
                  }),
                  artist: result.artist,
                  song: result.song?.filter((song) => {
                    // hack on client - avoid songs matched by artist and album fields
                    const santizedQuery = query.toLocaleLowerCase();
                    return song.title.toLocaleLowerCase().includes(santizedQuery);
                  }),
                };
              }),
          enabled: !!query,
        });
      },

      album: function (albumId: string) {
        return queryOptions({
          queryKey: ["album", albumId],
          queryFn: () => api.getAlbum({ id: albumId }),
          staleTime: Infinity,
        });
      },

      artists: function () {
        return queryOptions({
          queryKey: ["artists"],
          queryFn: () => api.getArtists(),
        });
      },

      artist: function (artistId: string) {
        return queryOptions({
          queryKey: ["artist", artistId],
          queryFn: () => api.getArtist({ id: artistId }),
        });
      },
    };
  }, [api]);
}
