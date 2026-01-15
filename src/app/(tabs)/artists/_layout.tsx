import { FloatingPlayer } from "@/components/FloatingPlayer";
import { isIOSVersion } from "@/utils/is-ios-version";
import { Stack } from "expo-router";
import { View } from "react-native";

export default function StackLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerTitle: "Artists",
            headerTransparent: isIOSVersion(26),
          }}
        />
        <Stack.Screen
          name="[artistId]/albums/index"
          options={{
            headerBackButtonDisplayMode: "minimal",
            headerTitle: "Albums",
            headerTransparent: isIOSVersion(26),
          }}
        />
        <Stack.Screen
          name="[artistId]/albums/[albumId]/tracks"
          options={{
            headerBackButtonDisplayMode: "minimal",
            headerTitle: "",
            headerTransparent: isIOSVersion(26),
          }}
        />
      </Stack>
      <FloatingPlayer />
    </View>
  );
}
