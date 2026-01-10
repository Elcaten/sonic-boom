import { useAPI } from "@/context/api-context";
import { useAuth } from "@/context/auth-context";
import {
  DefaultError,
  QueryKey,
  UseQueryResult,
  queryOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { SubsonicAPI } from "subsonic-api";
import { UseSubsonicQueryOptions } from "./susbsonic-query-options";

function sessionQueryOptions(params: { username: string; api: SubsonicAPI }) {
  return queryOptions({
    queryKey: ["navidrome-session", params.username],
    queryFn: async () => {
      const session = await params.api.navidromeSession();
      return session;
    },
    staleTime: Infinity,
  });
}

export function useSubsonicQuery<
  TCallApiResult = unknown,
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  options: UseSubsonicQueryOptions<TCallApiResult, TQueryFnData, TError, TData, TQueryKey>
): UseQueryResult<NoInfer<TData>, TError> {
  const api = useAPI();
  const auth = useAuth();
  const navidromeSession = useQuery(sessionQueryOptions({ username: auth.username, api }));

  const query = useQuery({
    ...options,
    queryFn: () => {
      const buildUrl = ({
        pathName,
        params = {},
      }: {
        pathName: string;
        params?: Record<string, string>;
      }) => {
        const url = new URL(`${api.baseURL()}rest/${pathName}`);
        url.searchParams.set("u", navidromeSession.data!.username);
        url.searchParams.set("t", navidromeSession.data!.subsonicToken);
        url.searchParams.set("s", navidromeSession.data!.subsonicSalt);
        url.searchParams.set("v", "1.16");
        url.searchParams.set("c", "subsonic-api");
        url.searchParams.set("f", "json");
        for (const [key, value] of Object.entries(params)) {
          url.searchParams.set(key, value);
        }

        return url.toString();
      };

      return options.callApi({ api, buildUrl });
    },
  });

  return query;
}

export function useEnsureSubsonicQuery() {
  const queryClient = useQueryClient();
  const api = useAPI();
  const auth = useAuth();

  return async function <
    TCallApiResult = unknown,
    TQueryFnData = unknown,
    TError = DefaultError,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey
  >(
    options: UseSubsonicQueryOptions<TCallApiResult, TQueryFnData, TError, TData, TQueryKey>
  ): Promise<TQueryFnData> {
    const navidromeSessionQueryData = await queryClient.ensureQueryData(
      sessionQueryOptions({ username: auth.username, api })
    );

    const buildUrl = ({
      pathName,
      params = {},
    }: {
      pathName: string;
      params?: Record<string, string>;
    }) => {
      const url = new URL(`${api.baseURL()}rest/${pathName}`);
      url.searchParams.set("u", navidromeSessionQueryData!.username);
      url.searchParams.set("t", navidromeSessionQueryData!.subsonicToken);
      url.searchParams.set("s", navidromeSessionQueryData!.subsonicSalt);
      url.searchParams.set("v", "1.16");
      url.searchParams.set("c", "subsonic-api");
      url.searchParams.set("f", "json");
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }

      return url.toString();
    };

    const queryData = queryClient.ensureQueryData({
      ...options,
      queryFn: () => options.callApi({ api, buildUrl }),
    });

    return queryData;
  };
}
