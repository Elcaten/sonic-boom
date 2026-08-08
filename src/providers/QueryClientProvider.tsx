import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { defaultShouldDehydrateQuery } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { PropsWithChildren } from "react";
import { getQueryClient } from "./query-client";

const queryClient = getQueryClient();

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
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            query.queryKey[0] !== "cover-art" &&
            query.queryKey[0] !== "downloads" &&
            defaultShouldDehydrateQuery(query),
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
};
