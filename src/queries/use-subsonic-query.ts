import { useAuth } from "@/context/auth-context";
import {
  DefaultError,
  QueryKey,
  UseQueryResult,
  queryOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import * as Crypto from "expo-crypto";
import { useCallback } from "react";
import { SubsonicAPI } from "subsonic-api";
import { UseSubsonicQueryOptions } from "./subsonicQueries";

function sessionQueryOptions(params: {
  username: string;
  getApi: () => Promise<SubsonicAPI>;
}) {
  return queryOptions({
    queryKey: ["navidrome-session", params.username],
    queryFn: async () => {
      const api = await params.getApi();
      const session = await api.navidromeSession();
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
  const getApi = useGetApi();
  const auth = useAuth();
  const navidromeSession = useQuery(
    sessionQueryOptions({ username: auth.username, getApi })
  );
  const query = useQuery({
    ...options,
    queryFn: async () => {
      const api = await getApi();
      const result = await options.callApi(api, navidromeSession.data!);
      return result;
    },
  });

  return query;
}

export function useEnsureSubsonicQuery() {
  const queryClient = useQueryClient();
  const getApi = useGetApi();
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
        sessionQueryOptions({ username: auth.username, getApi })
      );
      return queryClient.ensureQueryData({
        queryKey: options.queryKey,
        queryFn: async () => {
          const api = await getApi();
          return options.callApi(api, navidromeSession);
        },
      });
    },
    [queryClient, auth.username, getApi]
  );
}

function useGetApi() {
  const auth = useAuth();

  if (!auth.serverAddress || !auth.password || !auth.username) {
    throw new Error(
      "invalid config: server address username or password are missing"
    );
  }

  const getApi = useCallback(async () => {
    const randomBytes = await Crypto.getRandomBytesAsync(16);

    const salt = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const api = new SubsonicAPI({
      url: auth.serverAddress,
      auth: {
        username: auth.username,
        password: auth.password,
      },
      salt: salt,
      reuseSalt: true,
    });

    return api;
  }, [auth.password, auth.username, auth.serverAddress]);

  return getApi;
}
