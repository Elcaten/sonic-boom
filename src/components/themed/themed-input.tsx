import { useColors } from "@/context/app-context";
import { TextInput, type TextInputProps } from "react-native";

export type ThemedInputProps = TextInputProps & {};

export function ThemedInput({ style, ...rest }: ThemedInputProps) {
  const colors = useColors();

  return (
    <TextInput
      style={[{ color: colors.label, fontSize: 17 }, style]}
      placeholderTextColor={colors.placeholderText}
      {...rest}
    />
  );
}
