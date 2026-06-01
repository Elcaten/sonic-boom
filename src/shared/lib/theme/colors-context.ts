import { createContext, useContext } from "react";
import { PlatformColor } from "react-native";

type ColorsContextType = ReturnType<typeof useInitColors>;

export const ColorsContext = createContext<ColorsContextType | undefined>(undefined);

export function useInitColors() {
  return {
    label: PlatformColor("label"),
    secondaryLabel: PlatformColor("secondaryLabel"),
    systemFill: PlatformColor("systemFill"),
    secondarySystemFill: PlatformColor("secondarySystemFill"),
    placeholderText: PlatformColor("placeholderText"),
    systemBackground: PlatformColor("systemBackground"),
    secondarySystemBackground: PlatformColor("secondarySystemBackground"),
    systemGroupedBackground: PlatformColor("systemGroupedBackground"),
    secondarySystemGroupedBackground: PlatformColor("secondarySystemGroupedBackground"),
    separator: PlatformColor("separator"),
    opaqueSeparator: PlatformColor("opaqueSeparator"),
    link: PlatformColor("link"),
    systemGray: PlatformColor("systemGray"),
    systemGray2: PlatformColor("systemGray2"),
    systemGray3: PlatformColor("systemGray3"),
    systemGray4: PlatformColor("systemGray4"),
    systemGray5: PlatformColor("systemGray5"),
    systemGray6: PlatformColor("systemGray6"),
    black: "#000000",
    white: "#FFFFFF",
    darkText: PlatformColor("darkText"),
    lightText: PlatformColor("lightText"),
  };
}

export const useColors = () => {
  const context = useContext(ColorsContext);
  if (context === undefined) {
    throw new Error("useColors must be used within ColorsContext.Provider");
  }
  return context;
};
