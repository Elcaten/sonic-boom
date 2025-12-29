import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: "Artists" }} />
      <Stack.Screen
        name="[artistId]/albums/index"
        options={{
          headerBackButtonDisplayMode: "minimal",
          headerTitle: "Albums",
        }}
      />
      <Stack.Screen
        name="[artistId]/albums/[albumId]/tracks"
        options={{
          headerBackButtonDisplayMode: "minimal",
          headerTitle: "Artist",
        }}
      />
    </Stack>
  );
}
