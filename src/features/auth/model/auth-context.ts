import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AuthContextType } from "../auth.types";

import { authStorage } from "../services/auth-storage.service";

/**
 * Context to store authentication state and actions
 */
export const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Hook to access authentication state and actions
 * @throws Error if used outside AuthContext.Provider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContext.Provider");
  }
  return context;
};

/**
 * Hook to check if user is authenticated
 * Useful for conditional rendering and navigation guards
 */
export const useIsAuthenticated = () => {
  const auth = useAuth();

  return !!(auth.state.serverAddress && auth.state.username && auth.state.password);
};

export function useInitAuth(onLoad: () => void): AuthContextType {
  const [serverAddress, setServerAddressState] = useState("");
  const [username, setUsernameState] = useState("");
  const [password, setPasswordState] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authStorage
      .getCredentials()
      .then((creds) => {
        if (creds.serverAddress) setServerAddressState(creds.serverAddress);
        if (creds.username) setUsernameState(creds.username);
        if (creds.password) setPasswordState(creds.password);
      })
      .catch((error) => console.error("Error loading stored values:", error))
      .finally(() => {
        setIsLoading(false);
        onLoad();
      });
  }, [onLoad]);

  const setServerAddress = useCallback(async (value: string) => {
    setServerAddressState(value);
    await authStorage.saveServerAddress(value).catch(console.error);
  }, []);

  const setUsername = useCallback(async (value: string) => {
    setUsernameState(value);
    await authStorage.saveUsername(value).catch(console.error);
  }, []);

  const setPassword = useCallback(async (value: string) => {
    setPasswordState(value);
    await authStorage.savePassword(value).catch(console.error);
  }, []);

  const clearAll = useCallback(async () => {
    setServerAddressState("");
    setUsernameState("");
    setPasswordState("");
    await authStorage.clearAll().catch(console.error);
  }, []);

  return {
    state: {
      serverAddress,
      username,
      password,
      isLoading,
    },
    actions: {
      setServerAddress,
      setUsername,
      setPassword,
      clearAll,
    },
  };
}
