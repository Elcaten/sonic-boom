import { Image } from "expo-image";
import { Track } from "react-native-track-player";
import { susbsonicQueryOptions } from "./susbsonic-query-options";

export const subsonicQuery = {
  albumList: function (params: { size: number; offset: number }) {
    return susbsonicQueryOptions({
      queryKey: ["albumList", params.size, params.offset],
      callApi: ({ api }) =>
        api.getAlbumList({
          type: "alphabeticalByArtist",
          size: params.size,
          offset: params.offset,
        }),
    });
  },

  streamUrl: function (trackId: string) {
    return susbsonicQueryOptions({
      queryKey: ["stream-url", trackId],
      callApi: ({ buildUrl }) => buildUrl({ pathName: "stream.view", params: { id: trackId } }),
      staleTime: Infinity,
    });
  },

  coverArtUrl: function (entityId: string | undefined, size: 48 | 256) {
    return susbsonicQueryOptions({
      queryKey: ["cover-art", entityId, size],
      callApi: ({ buildUrl }) =>
        buildUrl({
          pathName: "getCoverArt.view",
          params: { id: entityId!, size: size * 2 },
        }),
      staleTime: Infinity,
      enabled: Boolean(entityId),
    });
  },

  song: function (trackId: string) {
    return susbsonicQueryOptions({
      queryKey: ["song", trackId],
      callApi: ({ api }) => api.getSong({ id: trackId }),
    });
  },

  search: function ({ query }: { query: string }) {
    return susbsonicQueryOptions({
      queryKey: ["song", query],
      callApi: ({ api }) =>
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
    });
  },

  album: function (albumId: string) {
    return susbsonicQueryOptions({
      queryKey: ["album", albumId],
      callApi: async ({ api, buildUrl }) => {
        const album = await api.getAlbum({ id: albumId });
        const cachedArtwork = await Image.getCachePathAsync(`cover-${albumId}-${256}`);
        const artworkToFetch = buildUrl({
          pathName: "getCoverArt.view",
          params: { id: albumId, size: 256 * 2 },
        });
        console.log(cachedArtwork ?? artworkToFetch);
        return {
          ...album,
          tracks: album.album.song?.map<Track>((song) => ({
            id: song.id,
            url: buildUrl({ pathName: "stream.view", params: { id: song.id } }),
            title: song.title,
            artist: song.artist,
            artistId: song.artistId,
            album: song.album,
            albumId: song.albumId,
            artwork: cachedArtwork ?? artworkToFetch,
          })),
        };
      },
      staleTime: Infinity,
    });
  },

  artists: function () {
    return susbsonicQueryOptions({
      queryKey: ["artists"],
      callApi: ({ api }) => api.getArtists(),
    });
  },

  artist: function (artistId: string) {
    return susbsonicQueryOptions({
      queryKey: ["artist", artistId],
      callApi: ({ api }) => api.getArtist({ id: artistId }),
    });
  },
} satisfies Record<string, (...args: any[]) => ReturnType<typeof susbsonicQueryOptions>>;
