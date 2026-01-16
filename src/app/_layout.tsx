import { AppProvider, useIsAuthenticated } from "@/context/app-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { registerPlaybackService } from "@/track-player/register-playback-service";
import { useSetupTrackPlayer } from "@/track-player/use-setup-track-player";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient, useIsRestoring } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import TrackPlayer from "react-native-track-player";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

registerPlaybackService();

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

//TODO: put back after dev
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
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

  useEffect(() => {
    return () => {
      TrackPlayer.reset();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AppProvider onLoad={() => setAuthReady(true)}>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister: asyncStoragePersister }}
            onSuccess={() => setPersistorReady(true)}
            onError={() => setPersistorReady(true)}
          >
            <Content />
          </PersistQueryClientProvider>
        </AppProvider>
      </ThemeProvider>
    </SafeAreaProvider>
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
            options={{ presentation: "modal", headerShown: false }}
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
