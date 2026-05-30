import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient, useIsRestoring } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useEffect, useState } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
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

export const QueryClientProvider = ({ onHydrateFinished, children }: QueryClientProviderProps) => {
  const isRestoring = useIsRestoring();
  const [isHydrating, setIsHydrating] = useState(false); //not sure if this is needed, might duplicate the useIsRestoring hook

  const handleSuccess = () => {
    setIsHydrating(false);
  };

  const handleError = () => {
    setIsHydrating(false);
  };

  useEffect(() => {
    if (!isHydrating && !isRestoring) {
      onHydrateFinished();
    }
  }, [isRestoring, isHydrating, onHydrateFinished]);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
      onSuccess={handleSuccess}
      onError={handleError}
    >
      {children}
    </PersistQueryClientProvider>
  );
};
