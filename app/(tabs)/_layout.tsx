import { Label, NativeTabs } from "expo-router/unstable-native-tabs";
import React from "react";

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        {/* <Icon sf="house.fill" drawable="custom_android_drawable" /> */}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="artists">
        <Label>Artists</Label>
        {/* <Icon sf="paperplane.fill" /> */}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
