import { CallApiParams } from "@/hooks/use-subsonic-query";
import {
  DataTag,
  DefaultError,
  QueryKey,
  queryOptions,
  UndefinedInitialDataOptions,
} from "@tanstack/react-query";

function susbsonicQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  options: UndefinedInitialDataOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryKey
  > & {
    callApi: (...[api, session]: CallApiParams) => TQueryFnData;
  }
): UndefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey> & {
  queryKey: DataTag<TQueryKey, TQueryFnData, TError>;
  callApi: (...[api, session]: CallApiParams) => TQueryFnData;
} {
  return { ...queryOptions(options), callApi: options.callApi };
}

export const subsonicQueries = {
  currentNavidromeSession: function () {
    return susbsonicQueryOptions({
      queryKey: ["currentNavidromeSession"],
      callApi: (...[_, session]: CallApiParams) => session ?? null,
    });
  },
  randomSong: function () {
    return susbsonicQueryOptions({
      queryKey: ["random-song"],
      callApi: (...[api]: CallApiParams) => api.getRandomSongs(),
    });
  },
  streamUrl: function (trackId: string) {
    return susbsonicQueryOptions({
      queryKey: ["stream-url", trackId],
      callApi: (...[api, session]: CallApiParams) => {
        const url = new URL(`${api.baseURL()}rest/stream.view`);
        url.searchParams.set("v", "1.16");
        url.searchParams.set("c", "subsonic-api");
        url.searchParams.set("f", "json");
        url.searchParams.set("id", trackId);
        url.searchParams.set("u", session.username);
        url.searchParams.set("t", session.subsonicToken);
        url.searchParams.set("s", session.subsonicSalt);

        return url.toString();
      },
      staleTime: Infinity,
    });
  },

  coverArtUrl: function (
    entityId: string,
    size: 48 | 64 | 256 | 320 | 512 | "Full"
  ) {
    return susbsonicQueryOptions({
      queryKey: ["cover-art", entityId],
      callApi: (...[api, session]: CallApiParams) => {
        const url = new URL(`${api.baseURL()}rest/getCoverArt.view`);
        url.searchParams.set("v", "1.16.1");
        url.searchParams.set("c", "subsonic-api");
        url.searchParams.set("f", "json");
        url.searchParams.set("id", entityId);
        if (size !== "Full") {
          // url.searchParams.set("size", size.toString());
        }
        url.searchParams.set("u", session.username);
        url.searchParams.set("t", session.subsonicToken);
        url.searchParams.set("s", session.subsonicSalt);

        return url.toString();
      },
      staleTime: Infinity,
    });
  },

  song: function (trackId: string) {
    return susbsonicQueryOptions({
      queryKey: ["song", trackId],
      callApi: (...[api]: CallApiParams) => api.getSong({ id: trackId }),
    });
  },

  search: function ({ query }: { query: string }) {
    return susbsonicQueryOptions({
      queryKey: ["song", query],
      callApi: (...[api]: CallApiParams) =>
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
};
