import { SubsonicAPI } from "subsonic-api";
import { useNativeColorsLogic } from "./use-native-colors-logic";
import { useQueriesLogic } from "./use-queries-logic";

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

export type AppContextType = {
  auth: AuthState & AuthActions;
  api: SubsonicAPI | null;
  queries: ReturnType<typeof useQueriesLogic>;
  colors: ReturnType<typeof useNativeColorsLogic>;
};
