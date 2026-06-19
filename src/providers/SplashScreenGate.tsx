import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

type SplashScreenGateProps = {
  children: React.ReactNode;
  isAppReady: boolean;
};

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
