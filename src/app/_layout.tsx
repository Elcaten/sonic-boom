import { AppContextProvider } from "@/core/providers/AppContextProvider/ui/AppContextProvider";
import { QueryClientProvider } from "@/core/providers/QueryClientProvider/ui/QueryClientProvider";
import { ThemeProvider } from "@/core/providers/ThemeProvider/ui/ThemeProvider";
import { TrackPlayerProvider } from "@/entities/player/ui/TrackPlayerProvider";
import { useIsAuthenticated } from "@/features/auth/model/auth-context";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [playerReady, setPlayerReady] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [persistorReady, setPersistorReady] = useState(false);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <TrackPlayerProvider onLoad={() => setPlayerReady(true)}>
            <AppContextProvider onLoad={() => setAuthReady(true)}>
              <QueryClientProvider onHydrateFinished={() => setPersistorReady(true)}>
                <SplashScreenGate isAppReady={playerReady && authReady && persistorReady}>
                  <Content />
                </SplashScreenGate>
              </QueryClientProvider>
            </AppContextProvider>
          </TrackPlayerProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function SplashScreenGate({
  children,
  isAppReady,
}: {
  children: React.ReactNode;
  isAppReady: boolean;
}) {
  useEffect(() => {
    if (isAppReady) {
      SplashScreen.hide();
    }
  }, [isAppReady]);

  if (!isAppReady) {
    return null;
  }

  return <>{children}</>;
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
