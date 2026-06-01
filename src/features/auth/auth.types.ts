import type { AuthState } from "@/entities/auth";

export type { AuthState };

export type AuthActions = {
  setServerAddress: (value: string) => Promise<void>;
  setUsername: (value: string) => Promise<void>;
  setPassword: (value: string) => Promise<void>;
  clearAll: () => Promise<void>;
};

export type AuthContextType = {
  state: AuthState;
  actions: AuthActions;
};
