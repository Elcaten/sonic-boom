import { useAuthState } from "@/features/auth";
import { AppProvier } from "@/providers";
import { SplashScreenGate } from "@/providers/SplashScreenGate";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <AppProvier>
      <Content />
    </AppProvier>
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
