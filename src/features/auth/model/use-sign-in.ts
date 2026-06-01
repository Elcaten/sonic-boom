import { appLogger } from "@/shared/lib/logger";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { authService } from "../services/auth.service";
import { useAuth } from "./auth-context";

export function useSignIn() {
  const [serverAddress, setServerAddress] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { actions: authActions } = useAuth();

  const submit = useMutation({
    mutationFn: () => authService.verifySubsonicCredentials({ serverAddress, username, password }),
    onError: (error) => {
      appLogger.SIGN_IN.error(error);
    },
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
