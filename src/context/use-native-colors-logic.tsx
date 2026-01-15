import { useMemo } from "react";
import { PlatformColor, useColorScheme } from "react-native";

/**
 * https://github.com/facebook/react-native/blob/main/packages/rn-tester/js/examples/PlatformColor/PlatformColorExample.js
 */
export function useNativeColorsLogic() {
  const theme = useColorScheme() ?? "light";

  return useMemo(() => {
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
    };
  }, [theme]);
}
