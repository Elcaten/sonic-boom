import { Track } from "react-native-track-player";
import { susbsonicQueryOptions } from "./susbsonic-query-options";

export const subsonicQuery = {
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
          params: { id: entityId!, size: size },
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
      callApi: ({ api, buildUrl }) =>
        api.getAlbum({ id: albumId }).then((album) => {
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
              artwork: buildUrl({ pathName: "getCoverArt.view", params: { id: song.id } }),
            })),
          };
        }),
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
