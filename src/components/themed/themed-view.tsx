import { View, type ViewProps } from "react-native";

import { useColors } from "@/context/app-context";
import { AppContextType } from "@/context/types";

export type ThemedViewProps = ViewProps & {
  backgroundColor?: keyof Pick<
    AppContextType["colors"],
    | "systemBackground"
    | "secondarySystemBackground"
    | "systemGroupedBackground"
    | "secondarySystemGroupedBackground"
  >;
};

export function ThemedView({ backgroundColor, style, ...otherProps }: ThemedViewProps) {
  const colors = useColors();

  return (
    <View
      style={[{ backgroundColor: colors[backgroundColor ?? "systemBackground"] }, style]}
      {...otherProps}
    />
  );
}
