import { ThemedText } from "@/components/themed/themed-text";
import { useColors } from "@/context/app-context";
import React, { PropsWithChildren } from "react";
import { View } from "react-native";

export function SectionHeader({ children }: PropsWithChildren<unknown>) {
  const colors = useColors();

  return (
    <View>
      <ThemedText
        size="callout"
        style={{
          textTransform: "uppercase",
          paddingHorizontal: 16,
          paddingTop: 32,
          paddingBottom: 16,
          color: colors.secondaryLabel,
          backgroundColor: colors.secondarySystemGroupedBackground,
        }}
      >
        {children}
      </ThemedText>
    </View>
  );
}
