import React, { createContext, PropsWithChildren, useContext, useMemo } from "react";
import { AppContextType } from "./types";
import { useAPILogic } from "./use-api-logic";
import { useAuthLogic } from "./use-auth-logic";
import { useNativeColorsLogic } from "./use-native-colors-logic";
import { useQueriesLogic } from "./use-queries-logic";

const AppContext = createContext<AppContextType | null>(null);

// ============================================================================
// APP PROVIDER - Composes all services
// ============================================================================

export const AppProvider = ({ children, onLoad }: PropsWithChildren<{ onLoad: () => void }>) => {
  // Initialize services in dependency order
  const { state: authState, actions: authActions } = useAuthLogic(onLoad);
  const api = useAPILogic(authState);
  const queries = useQueriesLogic(api);
  const colors = useNativeColorsLogic();

  // Bundle everything into context value
  const value = useMemo<AppContextType>(
    () => ({
      auth: {
        ...authState,
        ...authActions,
      },
      api,
      queries,
      colors: colors,
    }),
    [authState, authActions, api, queries, colors]
  );

  // Show nothing while loading initial auth state
  if (authState.isLoading) {
    return null;
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// ============================================================================
// SPECIALIZED HOOKS - Clean consumer APIs
// ============================================================================

/**
 * Hook to access authentication state and actions
 * @throws Error if used outside AppProvider
 */
export const useAuth = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAuth must be used within AppProvider");
  }
  return context.auth;
};

/**
 * Hook to access Subsonic API instance
 * @throws Error if used outside AppProvider
 * @returns SubsonicAPI instance or null if credentials are incomplete
 */
export const useAPI = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAPI must be used within AppProvider");
  }
  return context.api;
};

/**
 * Hook to access Subsonic API instance (throws if not available)
 * Use this when you know the user must be authenticated
 * @throws Error if used outside AppProvider or if API is not available
 */
export const useRequiredAPI = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useRequiredAPI must be used within AppProvider");
  }
  if (!context.api) {
    throw new Error(
      "API is not available. Ensure user credentials are set before using this hook."
    );
  }
  return context.api;
};

/**
 * Hook to access queries (throws if not available)
 * Use this when you know the user must be authenticated
 * @throws Error if used outside AppProvider or if Queries is not available
 */
export const useRequiredQueries = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useRequiredQueries must be used within AppProvider");
  }
  if (!context.queries) {
    throw new Error(
      "Quereies are not available. Ensure user credentials are set before using this hook."
    );
  }
  return context.queries;
};

/**
 * Hook to check if user is authenticated
 * Useful for conditional rendering and navigation guards
 */
export const useIsAuthenticated = () => {
  const auth = useAuth();
  return !!(auth.serverAddress && auth.username && auth.password);
};

/**
 * Hook to access native colors
 * @throws Error if used outside AppProvider
 * @returns Native colors
 */
export const useColors = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useColors must be used within AppProvider");
  }
  return context.colors;
};
