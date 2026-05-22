import { FloatingPlayer } from "@/components/FloatingPlayer";
import { isIOSVersion } from "@/utils/is-ios-version";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import React from "react";

function MiniPlayer() {
  const placement = NativeTabs.BottomAccessory.usePlacement();

  if (placement === "inline") {
    // Compact UI for inline placement
    return <FloatingPlayer actions={["play-pause"]} />;
  }

  // Full UI for regular placement
  return <FloatingPlayer actions={["play-pause", "prev-next"]} />;
}

export default function TabLayout() {
  if (isIOSVersion(26)) {
    return (
      <NativeTabs minimizeBehavior="onScrollDown">
        <NativeTabs.BottomAccessory>
          <MiniPlayer />
        </NativeTabs.BottomAccessory>
        <NativeTabs.Trigger name="artists">
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="music.note.house.fill" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="settings">
          <NativeTabs.Trigger.Icon sf="gear" />
          <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="search" role="search">
          <NativeTabs.Trigger.Icon sf="magnifyingglass" />
          <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ href: null }}></Tabs.Screen>
      <Tabs.Screen
        name="artists"
        options={{
          headerShown: false,
          tabBarLabel: "Artists",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerShown: false,
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          headerShown: false,
          tabBarLabel: "Search",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "search" : "search-outline"} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
