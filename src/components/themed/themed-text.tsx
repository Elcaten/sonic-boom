import { StyleSheet, Text, type TextProps } from "react-native";

import { useColors } from "@/context/app-context";
import { AppContextType } from "@/context/types";

export type ThemedTextProps = TextProps & {
  /**
   * `"body"` - Main content, paragraphs\
   * `"callout"`- Emphasized body text\
   * `"subheadline"` - Secondary content
   */
  size?: "body" | "callout" | "subheadline";
  color?: keyof Pick<AppContextType["colors"], "label" | "secondaryLabel">;
};

export function ThemedText({ style, size = "body", color = "label", ...rest }: ThemedTextProps) {
  const colors = useColors();

  return (
    <Text
      style={[
        { color: colors[color] },
        size === "body" ? styles.body : undefined,
        size === "callout" ? styles.callout : undefined,
        size === "subheadline" ? styles.subheadline : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: 17,
    lineHeight: 22,
  },
  callout: {
    fontSize: 16,
    lineHeight: 21,
  },
  subheadline: {
    fontSize: 15,
    lineHeight: 20,
  },
});
