import { appLogger } from "@/lib/logger";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import TrackPlayer from "@rntp/player";
import { useCallback, useState } from "react";
import { usePlayerPersistor } from "../player";
import { authService } from "./api";
import { useAuth } from "./context";

export function useSignIn() {
  const [serverAddress, setServerAddress] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { actions: authActions } = useAuth();

  const submit = useMutation({
    mutationFn: () => authService.verifySubsonicCredentials({ serverAddress, username, password }),
    onError: (error) => appLogger.SIGN_IN.error(error),
    onSuccess: () => {
      authActions.setServerAddress(serverAddress);
      authActions.setUsername(username);
      authActions.setPassword(password);
    },
  });

  return {
    serverAddress,
    setServerAddress,
    username,
    setUsername,
    password,
    setPassword,
    isLoading: submit.isPending,
    signInAsync: submit.mutateAsync,
  };
}

export function useSignOut() {
  const auth = useAuth();
  const { clearAll } = usePlayerPersistor();
  const queryClient = useQueryClient();

  const signOut = useCallback(async () => {
    TrackPlayer.stop();
    TrackPlayer.clear();
    await clearAll();
    await Image.clearMemoryCache();
    await Image.clearDiskCache();
    await auth.actions.clearAll();
    queryClient.clear();
  }, [auth.actions, clearAll, queryClient]);

  return { signOut };
}
