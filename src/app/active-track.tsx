import { ThemedText } from "@/components/themed-text";
import { BlurView } from "expo-blur";

export default function ActiveTrackModal() {
  return (
    <BlurView style={{ flex: 1 }} intensity={100}>
      <ThemedText>HELL</ThemedText>
    </BlurView>
  );
}
