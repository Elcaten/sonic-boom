import * as Crypto from "expo-crypto";
import { useMemo } from "react";
import { SubsonicAPI } from "subsonic-api";
import { AuthState } from "./types";

export function useAPILogic(authState: AuthState) {
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
    });

    return apiInstance;
  }, [authState.password, authState.serverAddress, authState.username]);

  return api;
}
