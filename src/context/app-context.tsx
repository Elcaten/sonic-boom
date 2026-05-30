import { AuthContext, useInitAuth } from "@/features/auth";
import { APIContext, useInitAPI } from "@/shared/api/api-context";
import { ColorsContext, useInitColors } from "@/shared/colors/colors-context";
import { QueriesContext, useInitQueries } from "@/shared/queries/queries-context";
import { PropsWithChildren } from "react";

/**
 * AppProvider - Composes all context providers
 */
export const AppProvider = ({ children, onLoad }: PropsWithChildren<{ onLoad: () => void }>) => {
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
