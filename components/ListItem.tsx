import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import React, { ReactNode } from "react";
import { View } from "react-native";

export function ListItem({
  isLastItem,
  leftAddon,
  title,
  subtitle,
}: {
  isLastItem: boolean;
  leftAddon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
}) {
  const separator = useThemeColor({}, "separator");
  const bgTertiary = useThemeColor({}, "bgTertiary");
  const textSecondary = useThemeColor({}, "textSecondary");

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomColor: isLastItem ? bgTertiary : separator,
        borderBottomWidth: 1,
        backgroundColor: bgTertiary,
        alignItems: "center",
      }}
    >
      {leftAddon && <View>{leftAddon}</View>}
      <View style={{ gap: 2 }}>
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
        {subtitle && (
          <ThemedText style={{ color: textSecondary }}>{subtitle}</ThemedText>
        )}
      </View>
    </View>
  );
}
