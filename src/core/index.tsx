import { AppContextProvider } from "@/core/providers/AppContextProvider/ui/AppContextProvider";
import { QueryClientProvider } from "@/core/providers/QueryClientProvider/ui/QueryClientProvider";
import { ThemeProvider } from "@/core/providers/ThemeProvider/ui/ThemeProvider";
import { TrackPlayerProvider } from "@/core/providers/TrackPlayerProvider/ui/TrackPlayerProvider";
import { SplashScreenGate } from "@/core/ui/SplashScreenGate/SplashScreenGate";
import { PropsWithChildren, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

export const AppProvier = ({ children }: PropsWithChildren) => {
  const [playerReady, setPlayerReady] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [persistorReady, setPersistorReady] = useState(false);

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <ThemeProvider>
          <TrackPlayerProvider onLoad={() => setPlayerReady(true)}>
            <AppContextProvider onLoad={() => setAuthReady(true)}>
              <QueryClientProvider onHydrateFinished={() => setPersistorReady(true)}>
                <SplashScreenGate isAppReady={playerReady && authReady && persistorReady}>
                  {children}
                </SplashScreenGate>
              </QueryClientProvider>
            </AppContextProvider>
          </TrackPlayerProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};
