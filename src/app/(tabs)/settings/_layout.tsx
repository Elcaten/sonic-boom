import { isIOSVersion } from "@/utils/is-ios-version";
import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerTitle: "Settings", headerTransparent: isIOSVersion(26) }}
      />
    </Stack>
  );
}
