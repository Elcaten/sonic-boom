import { AuthState } from "@/features/auth/auth.types";
import { appLogger } from "@/shared/logger/app-logger";
import * as Crypto from "expo-crypto";
import { createContext, useContext, useMemo } from "react";
import { SubsonicAPI } from "subsonic-api";
import { APIContextType } from "./api.types";

export const APIContext = createContext<APIContextType | null>(null);

/**
 * Hook to access Subsonic API instance
 * @throws Error if used outside AppProvider
 * @returns SubsonicAPI instance or null if credentials are incomplete
 */
export const useAPI = () => {
  const context = useContext(APIContext);
  if (!context) {
    throw new Error("useAPI must be used within APIContext.Provider");
  }
  return context;
};

/**
 * Hook to access Subsonic API instance (throws if not available)
 * Use this when you know the user must be authenticated
 * @throws Error if used outside AppProvider or if API is not available
 */
export const useRequiredAPI = () => {
  const context = useContext(APIContext);
  if (!context) {
    throw new Error("useRequiredAPI must be used within APIContext.Provider");
  }
  if (!context) {
    throw new Error(
      "API is not available. Ensure user credentials are set before using this hook.",
    );
  }
  return context;
};

export function useInitAPI(authState: AuthState) {
  const api = useMemo(() => {
    // Return null if credentials are not complete
    if (!authState.password || !authState.username || !authState.serverAddress) {
      return null;
    }

    // Only create API instance when we have valid credentials
    const randomBytes = Crypto.getRandomBytes(16);
    const salt = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const apiInstance = new SubsonicAPI({
      url: authState.serverAddress,
      auth: {
        username: authState.username,
        password: authState.password,
      },
      salt: salt,
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

    return apiInstance;
  }, [authState.password, authState.serverAddress, authState.username]);

  return api;
}
