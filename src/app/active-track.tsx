import { CoverArt } from "@/components/CoverArt";
import { ProgressSlider } from "@/components/ProgressSlider";
import { ThemedSafeAreaView } from "@/components/themed/themed-safe-area-view";
import { useColors } from "@/context/app-context";
import { usePlayerQueue } from "@/track-player/use-player-queue";
import { Button, Host, HStack, Image, List, Text } from "@expo/ui/swift-ui";
import { controlSize, font, listStyle, symbolEffect } from "@expo/ui/swift-ui/modifiers";
import TrackPlayer, { useActiveMediaItem, useIsPlaying } from "@rntp/player";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

function PreviousButton({ size }: { size: 32 | 48 }) {
  return (
    <Button modifiers={[controlSize("large")]} onPress={() => TrackPlayer.skipToPrevious()}>
      <Image systemName="backward.fill" color="primary" size={size} />
    </Button>
  );
}

function PlayPauseButton({ size }: { size: 32 | 48 }) {
  const isPlaying = useIsPlaying();
  return (
    <Button
      modifiers={[controlSize("large")]}
      onPress={() => (isPlaying ? TrackPlayer.pause() : TrackPlayer.play())}
    >
      <Image
        systemName={isPlaying ? "pause.fill" : "play.fill"}
        color="primary"
        size={size}
        modifiers={[symbolEffect({ effect: "scale" })]}
      />
    </Button>
  );
}

function NextButton({ size }: { size: 32 | 48 }) {
  return (
    <Button modifiers={[controlSize("large")]} onPress={() => TrackPlayer.skipToNext()}>
      <Image systemName="forward.fill" color="primary" size={size} />
    </Button>
  );
}
// Prevent the modal from being closed when the user is dragging the progress slider
const capturePan = Gesture.Pan().minDistance(1);

export default function ActiveTrackModal() {
  const colors = useColors();
  const activeTrack = useActiveMediaItem();
  const { queue } = usePlayerQueue();

  const handlePress = (index: number) => {
    const item = queue[index];
    if (item.mediaId === activeTrack?.mediaId) {
      TrackPlayer.play();
    } else {
      TrackPlayer.skipToIndex(index);
    }
  };

  const handleMoveItem = async (fromIndex: number, toIndex: number) => {
    const savedActiveTrack = TrackPlayer.getActiveMediaItem();
    const savedProgress = TrackPlayer.getProgress();

    const queue = TrackPlayer.getQueue();
    const newQueue = [...queue];
    const [movedItem] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, movedItem);
    TrackPlayer.setMediaItems(newQueue);

    const indexToSkipTo = newQueue.findIndex((item) => item.mediaId === savedActiveTrack?.mediaId);
    if (indexToSkipTo !== -1) {
      TrackPlayer.skipToIndex(indexToSkipTo);
      TrackPlayer.seekTo(savedProgress.position);
    }
    TrackPlayer.play();
  };

  const handleDeleteItem = async (index: number) => {
    const savedActiveTrack = TrackPlayer.getActiveMediaItem();
    const savedProgress = TrackPlayer.getProgress();

    const queue = TrackPlayer.getQueue();
    const newQueue = [...queue];
    newQueue.splice(index, 1);
    TrackPlayer.setMediaItems(newQueue);

    const indexToSkipTo = newQueue.findIndex((item) => item.mediaId === savedActiveTrack?.mediaId);
    if (indexToSkipTo !== -1) {
      TrackPlayer.skipToIndex(indexToSkipTo);
      TrackPlayer.seekTo(savedProgress.position);
    }
    TrackPlayer.play();
  };

  return (
    <ThemedSafeAreaView
      style={{
        height: 300,
        paddingTop: 100,
        paddingHorizontal: 48,
        backgroundColor: colors.systemBackground,
        gap: 32,
        alignItems: "stretch",
        flex: 1,
      }}
    >
      <CoverArt id={activeTrack?.extras?.albumId} size={256} />
      <GestureDetector gesture={capturePan}>
        <ProgressSlider />
      </GestureDetector>
      <Host style={{ flex: 1 }}>
        <HStack spacing={48}>
          <PreviousButton size={32} />
          <PlayPauseButton size={48} />
          <NextButton size={32} />
        </HStack>
      </Host>
    </ThemedSafeAreaView>
  );

  return (
    <Host style={{ flex: 1 }}>
      <List
        modifiers={[listStyle("inset")]}
        // TODO: add move and delete functionality
        // moveEnabled
        // onMoveItem={handleMoveItem}
        // deleteEnabled
        // onDeleteItem={handleDeleteItem}
      >
        {queue.map((item, index) => (
          <Button key={item.mediaId} onPress={() => handlePress(index)}>
            <Text
              modifiers={[
                font({ weight: item.mediaId === activeTrack?.mediaId ? "semibold" : "regular" }),
              ]}
            >
              {item.title!}
            </Text>
          </Button>
        ))}
      </List>
    </Host>
  );
}
