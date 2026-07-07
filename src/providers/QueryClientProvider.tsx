import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { PropsWithChildren } from "react";

const queryClient = new QueryClient({
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

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  throttleTime: 5000,
});

export const QueryClientProvider = ({ children }: PropsWithChildren<unknown>) => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: Number.MAX_SAFE_INTEGER,
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
};
