import { FloatingPlayer } from "@/widgets/player/floating-player/ui/FloatingPlayer/FloatingPlayer";
import { NativeTabs } from "expo-router/unstable-native-tabs";

function BottomPlayer() {
  const placement = NativeTabs.BottomAccessory.usePlacement();

  if (placement === "inline") {
    return <FloatingPlayer actions={["play-pause"]} />;
  }

  return <FloatingPlayer actions={["play-pause", "prev-next"]} />;
}

export default function TabLayout() {
  return (
    <NativeTabs minimizeBehavior="onScrollDown">
      <NativeTabs.BottomAccessory>
        <BottomPlayer />
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
