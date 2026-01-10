import {
  DefaultError,
  QueryKey,
  queryOptions,
  UndefinedInitialDataOptions,
} from "@tanstack/react-query";
import { SubsonicAPI } from "subsonic-api";

type CallApiParams = {
  api: SubsonicAPI;
  buildUrl: (_: { pathName: string; params?: Record<string, string> }) => string;
};

export type UseSubsonicQueryOptions<
  TCallApiResult = unknown,
  TQueryFnData = TCallApiResult extends Promise<infer U> ? U : TCallApiResult,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> = UndefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey> & {
  callApi: (_: CallApiParams) => TQueryFnData | Promise<TQueryFnData>;
};

export function susbsonicQueryOptions<
  TCallApiResult = unknown,
  TQueryFnData = TCallApiResult extends Promise<infer U> ? U : TCallApiResult,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(options: UseSubsonicQueryOptions<TCallApiResult, TQueryFnData, TError, TData, TQueryKey>) {
  return { ...queryOptions(options), callApi: options.callApi };
}
