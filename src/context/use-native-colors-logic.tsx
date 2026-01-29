import { useMemo } from "react";
import { PlatformColor, useColorScheme } from "react-native";

//NEW BRANCH 2 COMMENT

/**
 * https://github.com/facebook/react-native/blob/main/packages/rn-tester/js/examples/PlatformColor/PlatformColorExample.js
 */
export function useNativeColorsLogic() {
  const theme = useColorScheme() ?? "light";

  return useMemo(() => {
    return {
      label: PlatformColor("label"),
      secondaryLabel: PlatformColor("secondaryLabel"),

      /**
       * Primary fill color for UI elements\
       * **Use for:** Thin bordered UI elements, subtle backgrounds\
       * **Example:** Text field backgrounds, button backgrounds
       */
      systemFill: PlatformColor("systemFill"),
      /**
       * Secondary fill color for UI elements\
       * **Use for:** Slightly more subtle fills\
       * **Example:** Inactive states, disabled buttons
       */
      secondarySystemFill: PlatformColor("secondarySystemFill"),

      placeholderText: PlatformColor("placeholderText"),

      /**
       * **Use for:** Main app background, full-screen views, root views\
       * **Example:** Main screen background, modal sheets
       */
      systemBackground: PlatformColor("systemBackground"),
      /**
       * **Use for:** Content that sits on top of `systemBackground`, cards, containers\
       * **Example:** Card backgrounds, container backgrounds
       */
      secondarySystemBackground: PlatformColor("secondarySystemBackground"),

      /**
       * **Use for:** Settings screens, grouped table views\
       * **Example:** Example: iOS Settings app background
       */
      systemGroupedBackground: PlatformColor("systemGroupedBackground"),
      /**
       * **Use for:** Table cells in grouped lists
       * **Example:** Settings cells, preference sections
       */
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
  }, [theme]);
}
