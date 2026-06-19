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
      .then((creds) => {
        if (creds.serverAddress) setServerAddressState(creds.serverAddress);
        if (creds.username) setUsernameState(creds.username);
        if (creds.password) setPasswordState(creds.password);
      })
      .catch((error) => console.error("Error loading stored values:", error))
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const persist = useCallback(
    async (next: { serverAddress: string; username: string; password: string }) => {
      await authStorage.saveCredentials(next).catch(console.error);
    },
    [],
  );

  const setServerAddress = useCallback(
    async (value: string) => {
      setServerAddressState(value);
      await persist({ serverAddress: value, username, password });
    },
    [password, persist, username],
  );

  const setUsername = useCallback(
    async (value: string) => {
      setUsernameState(value);
      await persist({ serverAddress, username: value, password });
    },
    [password, persist, serverAddress],
  );

  const setPassword = useCallback(
    async (value: string) => {
      setPasswordState(value);
      await persist({ serverAddress, username, password: value });
    },
    [persist, serverAddress, username],
  );

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
