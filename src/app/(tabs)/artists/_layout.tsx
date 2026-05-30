import { Stack } from "expo-router";

export default function ArtistsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Artists",
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="[artistId]/albums/index"
        options={{
          headerBackButtonDisplayMode: "minimal",
          headerTitle: "Albums",
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="[artistId]/albums/[albumId]/tracks"
        options={{
          headerBackButtonDisplayMode: "minimal",
          headerTitle: "",
          headerTransparent: true,
        }}
      />
    </Stack>
  );
}
