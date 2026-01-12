import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";

export const KEYS = {
  SERVER_ADDRESS: "server_address",
  USERNAME: "username",
  PASSWORD: "password",
};

export function useAuthLogic(onLoad: () => void) {
  const [serverAddress, setServerAddressState] = useState("");
  const [username, setUsernameState] = useState("");
  const [password, setPasswordState] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load stored values on mount
  useEffect(() => {
    loadStoredValues();
  }, []);

  const loadStoredValues = async () => {
    try {
      const storedServer = await SecureStore.getItemAsync(KEYS.SERVER_ADDRESS);
      const storedUsername = await SecureStore.getItemAsync(KEYS.USERNAME);
      const storedPassword = await SecureStore.getItemAsync(KEYS.PASSWORD);

      if (storedServer) setServerAddressState(storedServer);
      if (storedUsername) setUsernameState(storedUsername);
      if (storedPassword) setPasswordState(storedPassword);
    } catch (error) {
      console.error("Error loading stored values:", error);
    } finally {
      setIsLoading(false);
      onLoad();
    }
  };

  const setServerAddress = useCallback(async (value: string) => {
    try {
      setServerAddressState(value);
      if (value) {
        await SecureStore.setItemAsync(KEYS.SERVER_ADDRESS, value);
      } else {
        await SecureStore.deleteItemAsync(KEYS.SERVER_ADDRESS);
      }
    } catch (error) {
      console.error("Error saving server address:", error);
    }
  }, []);

  const setUsername = useCallback(async (value: string) => {
    try {
      setUsernameState(value);
      if (value) {
        await SecureStore.setItemAsync(KEYS.USERNAME, value);
      } else {
        await SecureStore.deleteItemAsync(KEYS.USERNAME);
      }
    } catch (error) {
      console.error("Error saving username:", error);
    }
  }, []);

  const setPassword = useCallback(async (value: string) => {
    try {
      setPasswordState(value);
      if (value) {
        await SecureStore.setItemAsync(KEYS.PASSWORD, value);
      } else {
        await SecureStore.deleteItemAsync(KEYS.PASSWORD);
      }
    } catch (error) {
      console.error("Error saving password:", error);
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync(KEYS.SERVER_ADDRESS);
      await SecureStore.deleteItemAsync(KEYS.USERNAME);
      await SecureStore.deleteItemAsync(KEYS.PASSWORD);
      setServerAddressState("");
      setUsernameState("");
      setPasswordState("");
    } catch (error) {
      console.error("Error clearing stored values:", error);
    }
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
