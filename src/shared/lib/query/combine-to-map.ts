import {
    DefinedUseQueryResult,
    QueryObserverLoadingErrorResult,
    QueryObserverLoadingResult,
    QueryObserverPendingResult,
    QueryObserverPlaceholderResult,
} from "@tanstack/react-query";

export function combineToMapFactory<TData>({
  keyExtractor,
}: {
  keyExtractor: (item: TData) => string;
}) {
  return function (
    queryResults: (
      | DefinedUseQueryResult<TData, Error>
      | QueryObserverLoadingErrorResult<TData, Error>
      | QueryObserverLoadingResult<TData, Error>
      | QueryObserverPendingResult<TData, Error>
      | QueryObserverPlaceholderResult<TData, Error>
    )[],
  ): { data: Map<string, TData>; isPending: boolean } {
    return {
      data: queryResults.reduce((acc, query) => {
        if (query.data) {
          const key = keyExtractor(query.data);
          acc.set(key, query.data);
        }
        return acc;
      }, new Map<string, TData>()),
      isPending: queryResults.some((query) => query.isPending),
    };
  };
}
