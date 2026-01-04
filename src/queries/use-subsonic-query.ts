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
import { useCallback } from "react";
import { SubsonicAPI } from "subsonic-api";
import { UseSubsonicQueryOptions } from "./subsonic-query";

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
  options: UseSubsonicQueryOptions<
    TCallApiResult,
    TQueryFnData,
    TError,
    TData,
    TQueryKey
  >
): UseQueryResult<NoInfer<TData>, TError> {
  const api = useAPI();
  const auth = useAuth();
  const navidromeSession = useQuery(
    sessionQueryOptions({ username: auth.username, api })
  );
  const query = useQuery({
    ...options,
    queryFn: async () => {
      const result = await options.callApi(api, navidromeSession.data!);
      return result;
    },
  });

  return query;
}

export function useEnsureSubsonicQuery() {
  const queryClient = useQueryClient();
  const api = useAPI();
  const auth = useAuth();

  return useCallback(
    async function <
      TCallApiResult = unknown,
      TQueryFnData = unknown,
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
    ): Promise<TQueryFnData> {
      const navidromeSession = await queryClient.ensureQueryData(
        sessionQueryOptions({ username: auth.username, api })
      );
      return queryClient.ensureQueryData({
        ...options,
        queryFn: async () => {
          return options.callApi(api, navidromeSession);
        },
      });
    },
    [queryClient, auth.username, api]
  );
}
