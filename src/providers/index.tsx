import { TrackPlayerProvider } from "@/features/player";
import { PropsWithChildren, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppContextProvider } from "./AppContextProvider";
import { QueryClientProvider } from "./QueryClientProvider";
import { SplashScreenGate } from "./SplashScreenGate";
import { ThemeProvider } from "./ThemeProvider";

export const AppProvier = ({ children }: PropsWithChildren) => {
  const [playerReady, setPlayerReady] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [persistorReady, setPersistorReady] = useState(false);
  const isAppReady = playerReady && authReady && persistorReady;

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <ThemeProvider>
          <TrackPlayerProvider onLoad={() => setPlayerReady(true)}>
            <AppContextProvider onLoad={() => setAuthReady(true)}>
              <QueryClientProvider onHydrateFinished={() => setPersistorReady(true)}>
                <SplashScreenGate isAppReady={isAppReady}>{children}</SplashScreenGate>
              </QueryClientProvider>
            </AppContextProvider>
          </TrackPlayerProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};
