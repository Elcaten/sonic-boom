import { FlatList, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { SubsonicTrack } from "@/utils/subsonicTrackPlayer";
import { useEffect, useState } from "react";
import TrackPlayer from "react-native-track-player";

export default function ModalScreen() {
  const [queue, setQueue] = useState<SubsonicTrack[] | undefined>();

  useEffect(() => {
    async function effect() {
      const result = (await TrackPlayer.getQueue()) as SubsonicTrack[];

      setQueue(result);
    }

    effect();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={queue}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ThemedView key={item.id}>
            <ThemedText>{item.title}</ThemedText>
          </ThemedView>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});
