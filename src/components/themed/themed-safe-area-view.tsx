import { SafeAreaView, SafeAreaViewProps } from "react-native-safe-area-context";

import { useColors } from "@/context/app-context";
import { AppContextType } from "@/context/types";

export type ThemedSafeAreaViewProps = SafeAreaViewProps & {
  backgroundColor?: keyof Pick<
    AppContextType["colors"],
    | "systemBackground"
    | "secondarySystemBackground"
    | "systemGroupedBackground"
    | "secondarySystemGroupedBackground"
  >;
};

export function ThemedSafeAreaView({
  backgroundColor,
  style,
  ...otherProps
}: ThemedSafeAreaViewProps) {
  const colors = useColors();

  return (
    <SafeAreaView
      style={[{ backgroundColor: colors[backgroundColor ?? "systemBackground"] }, style]}
      {...otherProps}
    />
  );
}
