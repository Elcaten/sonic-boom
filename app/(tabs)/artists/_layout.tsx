import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen name="[artistId]/albums/index" />
      <Stack.Screen name="[artistId]/albums/[albumId]/tracks" />
    </Stack>
  );
}
