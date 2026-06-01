import { AuthContext, useInitAuth } from "@/features/auth";
import { APIContext, useInitAPI } from "@/features/subsonic-api";
import { QueriesContext, useInitQueries } from "@/shared/api/subsonic";
import { ColorsContext, useInitColors } from "@/shared/lib/theme";
import { PropsWithChildren } from "react";

export const AppContextProvider = ({
  children,
  onLoad,
}: PropsWithChildren<{ onLoad: () => void }>) => {
  // Initialize context providers in dependency order
  const auth = useInitAuth(onLoad);
  const api = useInitAPI(auth.state);
  const queries = useInitQueries(api);
  const colors = useInitColors();

  return (
    <AuthContext.Provider value={auth}>
      <APIContext.Provider value={api}>
        <ColorsContext.Provider value={colors}>
          <QueriesContext.Provider value={queries}>{children}</QueriesContext.Provider>
        </ColorsContext.Provider>
      </APIContext.Provider>
    </AuthContext.Provider>
  );
};
