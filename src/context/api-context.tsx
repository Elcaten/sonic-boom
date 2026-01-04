import * as Crypto from "expo-crypto";
import { createContext, PropsWithChildren, useContext, useMemo } from "react";
import { SubsonicAPI } from "subsonic-api";
import { useAuth } from "./auth-context";

const APIContext = createContext<SubsonicAPI | undefined>(undefined);

export function APIProvider({ children }: PropsWithChildren<unknown>) {
  const auth = useAuth();

  const api = useMemo(() => {
    const randomBytes = Crypto.getRandomBytes(16);

    const salt = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const api = new SubsonicAPI({
      url: auth.serverAddress,
      auth: {
        username: auth.username,
        password: auth.password,
      },
      salt: salt,
      reuseSalt: true,
    });

    return api;
  }, [auth.password, auth.serverAddress, auth.username]);

  return <APIContext.Provider value={api}>{children}</APIContext.Provider>;
}

export const useAPI = () => {
  const context = useContext(APIContext);
  if (!context) {
    throw new Error("useAPI must be used within APIProvider");
  }

  return context;
};
