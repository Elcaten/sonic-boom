import { useAuth } from "@/context/auth-context";
import {
  DefaultError,
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import * as Crypto from "expo-crypto";
import { useCallback } from "react";
import { SubsonicAPI } from "subsonic-api";

export type CallApiParams = [
  api: SubsonicAPI,
  session: Awaited<ReturnType<SubsonicAPI["navidromeSession"]>>
];

export function useSubsonicQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = Awaited<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
    callApi: (...params: CallApiParams) => TQueryFnData;
  }
): UseQueryResult<NoInfer<TData>, TError> {
  const getApi = useGetApi();
  const auth = useAuth();
  const navidromeSession = useQuery({
    queryKey: ["navidrome-session", auth.username],
    queryFn: async () => {
      const api = await getApi();
      const session = await api.navidromeSession();
      return session;
    },
  });
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
    async <TQueryFnData = unknown>(options: {
      queryKey: QueryKey;
      callApi: (...params: CallApiParams) => TQueryFnData;
    }): Promise<Awaited<TQueryFnData>> => {
      const session = await queryClient.ensureQueryData({
        queryKey: ["navidrome-session", auth.username],
        queryFn: async () => {
          const api = await getApi();
          const session = await api.navidromeSession();
          return session;
        },
      });
      return queryClient.ensureQueryData({
        queryKey: options.queryKey,
        queryFn: async () => {
          const api = await getApi();
          return options.callApi(api, session);
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
