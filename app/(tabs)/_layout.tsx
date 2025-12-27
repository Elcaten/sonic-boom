import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import React from "react";

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="artists">
        <Label>Artists</Label>
        <Icon sf="person.2" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
