import { QueryClient } from "@tanstack/react-query";

const QUERY_CLIENT_GLOBAL_KEY = "__SONIC_BOOM_QUERY_CLIENT__";

type QueryClientGlobal = typeof globalThis & {
  [QUERY_CLIENT_GLOBAL_KEY]?: QueryClient;
};

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: Number.MAX_SAFE_INTEGER,
        staleTime: Number.MAX_SAFE_INTEGER,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export function getQueryClient() {
  if (!__DEV__) return createQueryClient();

  // Fast Refresh can re-evaluate this module without remounting the persistence
  // provider. Keep the client stable so its restored cache is not replaced.
  const globalStore = globalThis as QueryClientGlobal;
  globalStore[QUERY_CLIENT_GLOBAL_KEY] ??= createQueryClient();
  return globalStore[QUERY_CLIENT_GLOBAL_KEY];
}
