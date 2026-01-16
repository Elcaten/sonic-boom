import { ThemedText } from "@/components/themed/themed-text";
import { usePlayerQueue } from "@/track-player/use-player-queue";
import { BlurView } from "expo-blur";
import { FlatList } from "react-native";
import { useActiveTrack } from "react-native-track-player";

export default function ActiveTrackModal() {
  const { queue } = usePlayerQueue();
  const activeTrack = useActiveTrack();

  return (
    <BlurView style={{ flex: 1, padding: 24 }} intensity={75}>
      <FlatList
        data={queue}
        keyExtractor={(_, index) => `${index}`}
        renderItem={({ item }) => (
          <ThemedText
            style={{
              fontWeight: item.id === activeTrack?.id ? "bold" : "normal",
              fontSize: activeTrack?.id === item.id ? 20 : 16,
            }}
          >
            {item.title}
          </ThemedText>
        )}
      />
    </BlurView>
  );
}
