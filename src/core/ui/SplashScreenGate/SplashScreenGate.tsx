import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
SplashScreen.preventAutoHideAsync();

SplashScreen.preventAutoHideAsync();

type SplashScreenGateProps = {
  children: React.ReactNode;
  isAppReady: boolean;
};

/**
 * Delays children rendering and keeps the splash screen visible until the app is ready
 */
export function SplashScreenGate({ children, isAppReady }: SplashScreenGateProps) {
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
