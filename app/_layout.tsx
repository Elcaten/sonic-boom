import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { FloatingPlayer } from "@/components/FloatingPlayer";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSetupTrackPlayer } from "@/hooks/use-setup-track-player";
import { playbackService } from "@/utils/playbackService";
import { SubsonicTrack } from "@/utils/subsonicTrackPlayer";
import { setAudioModeAsync } from "expo-audio";
import { useEffect, useState } from "react";
import TrackPlayer from "react-native-track-player";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

setAudioModeAsync({
  playsInSilentMode: true,
  shouldPlayInBackground: true,
  interruptionMode: "mixWithOthers",
});

TrackPlayer.registerPlaybackService(() => playbackService);

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [playerReady, setPlayerReady] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useSetupTrackPlayer({ onLoad: () => setPlayerReady(true) });

  useEffect(() => {
    if (playerReady && authReady) {
      SplashScreen.hide();
    }
  }, [playerReady, authReady]);

  useEffect(() => {
    return () => {
      TrackPlayer.reset();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AuthProvider onLoad={() => setAuthReady(true)}>
          <QueryClientProvider client={queryClient}>
            <Content />
          </QueryClientProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function Content() {
  const auth = useAuth();
  const isLoggedIn = Boolean(
    auth.serverAddress && auth.username && auth.password
  );
  const router = useRouter();

  const onFloatingPlayerPress = ({ track }: { track: SubsonicTrack }) => {
    if (!track.albumId || !track.artistId) {
      return;
    }

    router.navigate({
      pathname: "/(tabs)/artists/[artistId]/albums/[albumId]/tracks",
      params: { albumId: track.albumId, artistId: track.artistId },
    });
  };

  return (
    <>
      <Stack>
        <Stack.Protected guard={isLoggedIn}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack.Protected>
        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
      <StatusBar style="auto" />
      <FloatingPlayer onPress={onFloatingPlayerPress} />
    </>
  );
}
