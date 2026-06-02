import { AppProvier } from "@/providers";
import { useIsAuthenticated } from "@/features/auth";
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
  const isLoggedIn = useIsAuthenticated();

  return (
    <>
      <StatusBar style="auto" />
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
    </>
  );
}
