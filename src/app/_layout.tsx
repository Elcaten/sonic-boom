import { AppContextProvider } from "@/core/providers";
import { ThemeProvider } from "@/core/providers/ThemeProvider/ui/ThemeProvider";
import { useIsAuthenticated } from "@/features/auth/model/auth-context";
import { useSetupTrackPlayer } from "@/track-player/use-setup-track-player";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient, useIsRestoring } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

export default function RootLayout() {
  const [playerReady, setPlayerReady] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [persistorReady, setPersistorReady] = useState(false);
  const isRestoring = useIsRestoring();

  useSetupTrackPlayer({ onLoad: () => setPlayerReady(true) });

  useEffect(() => {
    if (playerReady && authReady && persistorReady && !isRestoring) {
      SplashScreen.hide();
    }
  }, [playerReady, authReady, persistorReady, isRestoring]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContextProvider onLoad={() => setAuthReady(true)}>
            <PersistQueryClientProvider
              client={queryClient}
              persistOptions={{ persister: asyncStoragePersister }}
              onSuccess={() => setPersistorReady(true)}
              onError={() => setPersistorReady(true)}
            >
              <Content />
            </PersistQueryClientProvider>
          </AppContextProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function Content() {
  const isLoggedIn = useIsAuthenticated();

  return (
    <>
      <Stack>
        <Stack.Protected guard={isLoggedIn}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="active-track"
            options={{ presentation: "formSheet", headerShown: false, sheetGrabberVisible: true }}
          ></Stack.Screen>
        </Stack.Protected>
        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen
            name="sign-in"
            options={{ headerTitle: "Sign In", headerLargeTitleEnabled: true }}
          />
        </Stack.Protected>
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
