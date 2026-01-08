import { FloatingPlayer } from "@/components/FloatingPlayer";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { Tabs, useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import { Track } from "react-native-track-player";

export default function TabLayout() {
  const router = useRouter();
  const onFloatingPlayerPress = ({ track }: { track: Track }) => {
    if (!track.albumId || !track.artistId) {
      return;
    }

    router.navigate({
      pathname: "/(tabs)/artists/[artistId]/albums/[albumId]/tracks",
      params: { albumId: track.albumId, artistId: track.artistId },
    });
  };

  return (
    <Tabs
      initialRouteName="artists"
      tabBar={(props) => (
        <View>
          <FloatingPlayer onPress={onFloatingPlayerPress} />
          <BottomTabBar {...props} />
        </View>
      )}
    >
      <Tabs.Screen
        name="artists"
        options={{
          title: "Artists",
          tabBarIcon: ({ color }) => <Ionicons size={28} name="people" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Ionicons size={28} name="settings" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Hides from tab bar
        }}
      ></Tabs.Screen>
    </Tabs>
  );
}
