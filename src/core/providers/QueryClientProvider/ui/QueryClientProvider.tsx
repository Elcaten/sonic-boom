import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient, useIsRestoring } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import React, { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: Infinity, // Keeps data in cache indefinitely
      staleTime: Infinity, // Disables automatic background refetches
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

// 1. Create an inner component to handle the hydration gate
const HydrationGate = ({ children, onHydrateFinished }: QueryClientProviderProps) => {
  const isRestoring = useIsRestoring();

  useEffect(() => {
    // Once isRestoring flips from true to false, hydration is officially done
    if (!isRestoring) {
      onHydrateFinished();
    }
  }, [isRestoring, onHydrateFinished]);

  // Optional: Prevent children from rendering/flashing stale UI while restoring
  if (isRestoring) {
    return null; // Or return a splash/loading screen
  }

  return <>{children}</>;
};

// 2. Keep the main provider clean
export const QueryClientProvider = ({ onHydrateFinished, children }: QueryClientProviderProps) => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: Infinity, // Keeps the storage snapshot valid indefinitely
      }}
    >
      <HydrationGate onHydrateFinished={onHydrateFinished}>{children}</HydrationGate>
    </PersistQueryClientProvider>
  );
};
