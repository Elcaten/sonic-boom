import { isIOSVersion } from "@/utils/is-ios-version";
import { Stack } from "expo-router";

export default function SearchLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Search",
          headerTransparent: isIOSVersion(26),
        }}
      />
    </Stack>
  );
}
