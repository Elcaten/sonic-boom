import { AuthContext, useInitAuth } from "@/features/auth";
import { APIContext, useInitAPI } from "@/features/subsonic-api";
import { QueriesContext, useInitQueries } from "@/shared/api/subsonic";
import { PropsWithChildren } from "react";

export const AppContextProvider = ({
  children,
  onLoad,
}: PropsWithChildren<{ onLoad: () => void }>) => {
  // Initialize context providers in dependency order
  const auth = useInitAuth(onLoad);
  const api = useInitAPI(auth.state);
  const queries = useInitQueries(api);

  return (
    <AuthContext.Provider value={auth}>
      <APIContext.Provider value={api}>
        <QueriesContext.Provider value={queries}>{children}</QueriesContext.Provider>
      </APIContext.Provider>
    </AuthContext.Provider>
  );
};
