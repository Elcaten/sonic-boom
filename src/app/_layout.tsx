import { useAuthState } from "@/features/auth";
import { TrackPlayerProvider } from "@/features/player";
import {
  AppContextProvider,
  QueryClientProvider,
  SplashScreenGate,
  ThemeProvider,
} from "@/providers";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <ThemeProvider>
          <TrackPlayerProvider>
            <AppContextProvider>
              <QueryClientProvider>
                <Content />
              </QueryClientProvider>
            </AppContextProvider>
          </TrackPlayerProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function Content() {
  const authState = useAuthState();

  return (
    <SplashScreenGate isAppReady={!authState.loading}>
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
    </SplashScreenGate>
  );
}
