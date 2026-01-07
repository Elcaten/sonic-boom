import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import React, { PropsWithChildren } from "react";
import { View } from "react-native";

export function SectinHeader({ children }: PropsWithChildren<unknown>) {
  const textSecondary = useThemeColor({}, "textSecondary");
  const bgSecondary = useThemeColor({}, "bgSecondary");

  return (
    <View>
      <ThemedText
        type="defaultSemiBold"
        style={{
          textTransform: "uppercase",
          paddingHorizontal: 16,
          paddingTop: 32,
          paddingBottom: 16,
          color: textSecondary,
          backgroundColor: bgSecondary,
        }}
      >
        {children}
      </ThemedText>
    </View>
  );
}
