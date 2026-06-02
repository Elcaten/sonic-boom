import { appLogger } from "@/lib/logger";
import * as Crypto from "expo-crypto";
import { createContext, useContext, useMemo } from "react";
import { SubsonicAPI } from "subsonic-api";

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
    throw new Error("API is not available. Ensure user credentials are set before using this hook.");
  }
  return context;
};

export function useInitAPI(authState: AuthStateInput) {
  const api = useMemo(() => {
    if (!authState.password || !authState.username || !authState.serverAddress) {
      return null;
    }

    const randomBytes = Crypto.getRandomBytes(16);
    const salt = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return new SubsonicAPI({
      url: authState.serverAddress,
      auth: { username: authState.username, password: authState.password },
      salt,
      reuseSalt: true,
      fetch: (params) => {
        if (typeof params === "string") {
          try {
            const url = new URL(params);
            url.searchParams.delete("v");
            url.searchParams.delete("c");
            url.searchParams.delete("f");
            url.searchParams.delete("u");
            url.searchParams.delete("t");
            url.searchParams.delete("s");
            appLogger.API.info(
              `${url.pathname} ${Array.from(url.searchParams.entries())
                .map(([k, v]) => `${k} = ${v}`)
                .join(" & ")}`,
            );
          } catch (e) {
            appLogger.API.error(e);
          }
        }
        return fetch(params);
      },
    });
  }, [authState.password, authState.serverAddress, authState.username]);

  return api;
}
