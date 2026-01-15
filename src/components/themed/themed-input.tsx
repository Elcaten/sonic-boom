// import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

// import { useThemeColor } from '@/hooks/use-theme-color';

// export type ThemedInputProps = TextInputProps & {
//   lightColor?: string;
//   darkColor?: string;
// };

// export function ThemedInput({
//   style,
//   lightColor,
//   darkColor,
//   ...rest
// }: ThemedInputProps) {
//   const textColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
//   const placeholderColor = useThemeColor({ light: lightColor, dark: darkColor }, 'icon');

//   return (
//     <TextInput
//       style={[
//         { color: textColor },
//         style,
//       ]}
//       placeholderTextColor={placeholderColor}
//       {...rest}
//     />
//   );
// }

// const styles = StyleSheet.create({

// });
