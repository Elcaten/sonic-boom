import { Stack } from "expo-router";
import { View } from "react-native";

export default function ArtistsLayout() {
  return (
    <View style={{ flex: 1 }}>
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
    </View>
  );
}
