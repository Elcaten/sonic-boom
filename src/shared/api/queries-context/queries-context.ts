import { createContext, useContext } from "react";
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
