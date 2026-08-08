import { useAuthState } from "@/features/auth";
import { DownloadRecovery } from "@/features/downloads";
import { TrackPlayerSetup } from "@/features/player";
import { AppContextProvider, QueryClientProvider, ThemeProvider } from "@/providers";
import { ArtworkStartupGate, SplashScreenGate } from "@/shared/ui";
import { FloatingDevTools } from "@buoy-gg/core";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <>
      <TrackPlayerSetup />

      <GestureHandlerRootView>
        <SafeAreaProvider>
          <ThemeProvider>
            <AppContextProvider>
              <QueryClientProvider>
                <FloatingDevTools
                  licenseKey={process.env.EXPO_PUBLIC_BUYO_LICENSE_KEY}
                  externalSync={{
                    socketURL: `http://${process.env.EXPO_PUBLIC_HOSTNAME}:42831`,
                    enableLogs: true,
                  }}
                />
                <Content />
              </QueryClientProvider>
            </AppContextProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </>
  );
}

function Content() {
  const authState = useAuthState();

  if (authState.loading) {
    return <SplashScreenGate isAppReady={false}>{null}</SplashScreenGate>;
  }

  const stack = (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Protected guard={!!authState.authenticated}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="active-track"
            options={{ presentation: "formSheet", headerShown: false, sheetGrabberVisible: true }}
          ></Stack.Screen>
        </Stack.Protected>
        <Stack.Protected guard={!authState.authenticated}>
          <Stack.Screen
            name="sign-in"
            options={{ headerTitle: "Sign In", headerLargeTitleEnabled: true }}
          />
        </Stack.Protected>
      </Stack>
    </>
  );

  if (authState.authenticated) {
    return (
      <>
        <DownloadRecovery />
        <ArtworkStartupGate>{stack}</ArtworkStartupGate>
      </>
    );
  }
  return <SplashScreenGate isAppReady>{stack}</SplashScreenGate>;
}
