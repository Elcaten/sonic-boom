import { createContext, useContext, useMemo } from "react";
import { SubsonicAPI } from "subsonic-api";
import { createSubsonicAPI } from "./create-subsonic-api";

type APIContextType = SubsonicAPI | null;
type AuthStateInput = {
  serverAddress: string;
  username: string;
  password: string;
};

export const APIContext = createContext<APIContextType | undefined>(undefined);

export const useAPI = () => {
  const context = useContext(APIContext);
  if (context === undefined) {
    throw new Error("useAPI must be used within APIContext.Provider");
  }
  return context;
};

export const useRequiredAPI = () => {
  const context = useContext(APIContext);
  if (context === undefined) {
    throw new Error("useRequiredAPI must be used within APIContext.Provider");
  }
  if (context === null) {
    throw new Error(
      "API is not available. Ensure user credentials are set before using this hook.",
    );
  }
  return context;
};

export function useInitAPI(authState: AuthStateInput) {
  const api = useMemo(() => {
    if (!authState.password || !authState.username || !authState.serverAddress) {
      return null;
    }

    return createSubsonicAPI({
      serverAddress: authState.serverAddress,
      username: authState.username,
      password: authState.password,
    });
  }, [authState.password, authState.serverAddress, authState.username]);

  return api;
}
