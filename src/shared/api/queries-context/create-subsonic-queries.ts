import { appLogger } from "@/shared/lib/logger";
import { queryOptions } from "@tanstack/react-query";
import { ImageSource } from "expo-image";
import { SubsonicAPI } from "subsonic-api";
import {
  CoverArtRepository,
  CoverArtSize,
} from "../cover-art/cover-art-repository";

export function createSubsonicQueries(
  api: SubsonicAPI,
  account: { serverAddress: string; username: string },
) {
  const coverArtRepository = new CoverArtRepository(account);

  const getCoverArtImage = async ({
    entityId,
    size,
    force = false,
    signal,
  }: {
    entityId: string;
    size: CoverArtSize;
    force?: boolean;
    signal?: AbortSignal;
  }): Promise<ImageSource> => {
    const storedSize = coverArtRepository.getStoredSize(size);
    const source = await coverArtRepository.getCoverArt({
      entityId,
      size,
      force,
      signal,
      getUrl: () =>
        api
          .buildUrl("getCoverArt", { id: entityId, size: storedSize * 2 })
          .then((url) => url.toString()),
    });
    appLogger.COVER_ART.info(
      `${force ? "Refreshed" : "Resolved"} persistent artwork ${source.cacheKey}`,
    );
    return source;
  };

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
    coverArtImage: (entityId: string | undefined, size: CoverArtSize) =>
      queryOptions({
        queryKey: ["cover-art", entityId, size],
        queryFn: ({ signal }): Promise<ImageSource> =>
          getCoverArtImage({ entityId: entityId!, size, signal }),
        enabled: Boolean(entityId),
        retry: false,
      }),
    artwork: {
      repository: coverArtRepository,
      get: getCoverArtImage,
      ping: () => api.ping(),
    },
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
