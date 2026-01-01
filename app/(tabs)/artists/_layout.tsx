import { FloatingPlayer } from "@/components/FloatingPlayer";
import { Stack } from "expo-router";
import { View } from "react-native";

export default function StackLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen
          name="index"
          // options={{
          //   headerTitle: (p) => <View></View>,
          // }}
        />
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
            headerTitle: "",
          }}
        />
      </Stack>
      <FloatingPlayer />
    </View>
  );
}
