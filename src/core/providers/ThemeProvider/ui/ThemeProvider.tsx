import { DarkTheme, DefaultTheme, ThemeProvider as ExpoThemeProvider } from "expo-router";

import { useColorScheme } from "react-native";

type ThemeProviderProps = {
  children: React.ReactNode;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const colorScheme = useColorScheme() ?? "light";

  return (
    <ExpoThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {children}
    </ExpoThemeProvider>
  );
};
