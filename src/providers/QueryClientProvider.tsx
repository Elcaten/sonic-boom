import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient, useIsRestoring } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import React, { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: Infinity,
      staleTime: Infinity,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

type QueryClientProviderProps = {
  children: React.ReactNode;
  onHydrateFinished: () => void;
};

const HydrationGate = ({ children, onHydrateFinished }: QueryClientProviderProps) => {
  const isRestoring = useIsRestoring();

  useEffect(() => {
    if (!isRestoring) {
      onHydrateFinished();
    }
  }, [isRestoring, onHydrateFinished]);

  if (isRestoring) {
    return null;
  }

  return <>{children}</>;
};

export const QueryClientProvider = ({ onHydrateFinished, children }: QueryClientProviderProps) => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: Infinity,
      }}
    >
      <HydrationGate onHydrateFinished={onHydrateFinished}>{children}</HydrationGate>
    </PersistQueryClientProvider>
  );
};
