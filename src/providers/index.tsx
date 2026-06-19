import { TrackPlayerProvider } from "@/features/player";
import { PropsWithChildren } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppContextProvider } from "./AppContextProvider";
import { QueryClientProvider } from "./QueryClientProvider";
import { ThemeProvider } from "./ThemeProvider";

export const AppProvier = ({ children }: PropsWithChildren) => {
  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <ThemeProvider>
          <TrackPlayerProvider>
            <AppContextProvider>
              <QueryClientProvider>{children}</QueryClientProvider>
            </AppContextProvider>
          </TrackPlayerProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};
