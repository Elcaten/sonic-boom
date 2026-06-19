import { AuthContext, AuthState, useInitAuth } from "@/features/auth";
import { createSubsonicQueries, QueriesContext } from "@/shared/api";
import { APIContext } from "@/shared/api/api-context/api-context";
import { createSubsonicAPI } from "@/shared/api/api-context/create-subsonic-api";
import { PropsWithChildren, useMemo } from "react";
import { SubsonicAPI } from "subsonic-api";

export const AppContextProvider = ({ children }: PropsWithChildren<unknown>) => {
  const auth = useInitAuth();
  const api = useMemo(() => createApiContext(auth.state), [auth.state]);
  const queries = useMemo(() => createQueriesContext(api), [api]);

  return (
    <AuthContext.Provider value={auth}>
      <APIContext.Provider value={api}>
        <QueriesContext.Provider value={queries}>{children}</QueriesContext.Provider>
      </APIContext.Provider>
    </AuthContext.Provider>
  );
};

function createApiContext(auth: AuthState) {
  if (!auth.password || !auth.username || !auth.serverAddress) {
    return null;
  }

  return createSubsonicAPI({
    serverAddress: auth.serverAddress,
    username: auth.username,
    password: auth.password,
  });
}

function createQueriesContext(api: SubsonicAPI | null) {
  if (!api) return null;

  return createSubsonicQueries(api);
}
