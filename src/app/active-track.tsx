import { usePlayerQueue } from "@/hooks/use-player-queue";
import { BlurView } from "expo-blur";
import { FlatList, Text } from "react-native";
import { useActiveTrack } from "react-native-track-player";

export default function ActiveTrackModal() {
  const { queue } = usePlayerQueue();
  const activeTrack = useActiveTrack();

  return (
    <BlurView style={{ flex: 1 }} intensity={75}>
      <FlatList data={queue} renderItem={({ item }) => <Text>{item.title}</Text>} />
    </BlurView>
  );
}
