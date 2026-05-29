import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerTitle: "Settings", headerTransparent: true }}
      />
      <Stack.Screen
        name="animations"
        options={{ headerTitle: "Animations", headerTransparent: true }}
      />
      <Stack.Screen
        name="colors"
        options={{ headerTitle: "Colors", headerTransparent: true }}
      />
    </Stack>
  );
}
