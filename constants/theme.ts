/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,

    /** Main app background */
    bgPrimary: "#FFFFFF",
    /** Grouped list background */
    bgSecondary: "#F2F2F7",
    /** List item, card background */
    bgTertiary: "#FFFFFF",
    /** Modal, popover background */
    bgElevated: "#FFFFFF",

    /** Main text, titles */
    textPrimary: "#11181C",
    /** Subtitles, captions */
    textSecondary: "#8E8E93",
    /** Placeholders, disabled */
    textTertiary: "#C7C7CC",
    /** Links, tappable text */
    textLink: "#007AFF",

    /** List dividers */
    separator: "#C6C6C8",
    /** Solid dividers */
    separatorOpaque: "#C6C6C8",
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,

    /** Main app background */
    bgPrimary: "#151718",
    /** Grouped list background */
    bgSecondary: "#1C1C1E",
    /** List item, card background */
    bgTertiary: "#2C2C2E",
    /** Modal, popover background */
    bgElevated: "#3A3A3C",

    /** Main text, titles */
    textPrimary: "#ECEDEE",
    /** Subtitles, captions */
    textSecondary: "#98989D",
    /** Placeholders, disabled */
    textTertiary: "#545456",
    /** Links, tappable text */
    textLink: "#0A84FF",

    /** List dividers */
    separator: "#545458",
    /** Solid dividers */
    separatorOpaque: "#38383A",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
