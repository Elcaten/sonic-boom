import { APIContext, useInitAPI } from "@/core/providers/api/api-context";
import { ColorsContext, useInitColors } from "@/core/providers/colors/colors-context";
import { QueriesContext, useInitQueries } from "@/core/providers/queries/queries-context";
import { AuthContext, useInitAuth } from "@/features/auth";
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

  // Show nothing while loading initial auth state
  if (auth.state.isLoading) {
    return null;
  }

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
