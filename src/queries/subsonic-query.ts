import {
  DefaultError,
  QueryKey,
  queryOptions,
  UndefinedInitialDataOptions,
} from "@tanstack/react-query";
import { SubsonicAPI } from "subsonic-api";

type CallApiParams = [
  api: SubsonicAPI,
  session: Awaited<ReturnType<SubsonicAPI["navidromeSession"]>>
];

export type UseSubsonicQueryOptions<
  TCallApiResult = unknown,
  TQueryFnData = TCallApiResult extends Promise<infer U> ? U : TCallApiResult,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> = UndefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey> & {
  callApi: (...params: CallApiParams) => TQueryFnData | Promise<TQueryFnData>;
};

function susbsonicQueryOptions<
  TCallApiResult = unknown,
  TQueryFnData = TCallApiResult extends Promise<infer U> ? U : TCallApiResult,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  options: UseSubsonicQueryOptions<
    TCallApiResult,
    TQueryFnData,
    TError,
    TData,
    TQueryKey
  >
) {
  return { ...queryOptions(options), callApi: options.callApi };
}

export const subsonicQueries = {
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
    entityId: string | undefined,
    size: 48 | 64 | 256 | 320 | 512 | "Full"
  ) {
    return susbsonicQueryOptions({
      queryKey: ["cover-art", entityId, size],
      callApi: (...[api, session]: CallApiParams) => {
        const url = new URL(`${api.baseURL()}rest/getCoverArt.view`);
        url.searchParams.set("v", "1.16.1");
        url.searchParams.set("c", "subsonic-api");
        url.searchParams.set("f", "json");
        url.searchParams.set("id", entityId!);
        if (size !== "Full") {
          // url.searchParams.set("size", size.toString());
        }
        url.searchParams.set("u", session.username);
        url.searchParams.set("t", session.subsonicToken);
        url.searchParams.set("s", session.subsonicSalt);

        return url.toString();
      },
      staleTime: Infinity,
      enabled: Boolean(entityId),
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
