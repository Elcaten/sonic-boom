import { useAuth } from "@/context/auth-context";
import {
  DefaultError,
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
  useQuery,
} from "@tanstack/react-query";
import * as Crypto from "expo-crypto";
import { useCallback } from "react";
import { SubsonicAPI } from "subsonic-api";

export function useSubsonicQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = Awaited<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
    callApi: (api: SubsonicAPI) => TQueryFnData;
  }
): UseQueryResult<NoInfer<TData>, TError> {
  const getApi = useGetApi();
  const query = useQuery({
    ...options,
    queryFn: async () => {
      const api = await getApi();
      const result = await options.callApi(api);
      return result;
    },
  });

  return query;
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
