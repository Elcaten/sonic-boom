export type AuthState = {
  serverAddress: string;
  username: string;
  password: string;
  isLoading: boolean;
};

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
