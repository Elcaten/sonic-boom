import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authStorage } from "./storage";
import { AuthContextType } from "./types";

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContext.Provider");
  }
  return context;
};

type AuthState =
  | {
      loading: true;
      authenticated?: never;
    }
  | {
      loading: false;
      authenticated: boolean;
    };

export const useAuthState = (): AuthState => {
  const auth = useAuth();

  if (auth.state.isLoading) {
    return { loading: true };
  }

  return {
    loading: false,
    authenticated: !!auth.state.serverAddress && !!auth.state.username && !!auth.state.password,
  };
};

export function useInitAuth(): AuthContextType {
  const [serverAddress, setServerAddressState] = useState("");
  const [username, setUsernameState] = useState("");
  const [password, setPasswordState] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authStorage
      .getCredentials()
      .then((credentials) => {
        if (credentials.serverAddress) setServerAddressState(credentials.serverAddress);
        if (credentials.username) setUsernameState(credentials.username);
        if (credentials.password) setPasswordState(credentials.password);
      })
      .catch((error) => console.error("Error loading stored values:", error))
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const setServerAddress = useCallback(async (value: string) => {
    setServerAddressState(value);
    await authStorage.saveServerAddress(value);
  }, []);

  const setUsername = useCallback(async (value: string) => {
    setUsernameState(value);
    await authStorage.saveUsername(value);
  }, []);

  const setPassword = useCallback(async (value: string) => {
    setPasswordState(value);
    await authStorage.savePassword(value);
  }, []);

  const clearAll = useCallback(async () => {
    setServerAddressState("");
    setUsernameState("");
    setPasswordState("");
    await authStorage.clearCredentials().catch(console.error);
  }, []);

  return {
    state: { serverAddress, username, password, isLoading },
    actions: { setServerAddress, setUsername, setPassword, clearAll },
  };
}
