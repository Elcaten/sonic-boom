import { createContext, useContext, useMemo } from "react";
import { SubsonicAPI } from "subsonic-api";
import { createSubsonicQueries } from "./create-subsonic-queries";

type QueriesContextType = ReturnType<typeof createSubsonicQueries> | null;

export const QueriesContext = createContext<QueriesContextType | undefined>(undefined);

export const useRequiredQueries = () => {
  const context = useContext(QueriesContext);
  if (context === undefined) {
    throw new Error("useRequiredQueries must be used within QueriesContext.Provider");
  }
  if (context === null) {
    throw new Error("Queries are not available. Ensure API is available before using this hook.");
  }
  return context;
};

export function useInitQueries(api: SubsonicAPI | null) {
  return useMemo(() => {
    if (!api) return null;
    return createSubsonicQueries(api);
  }, [api]);
}
