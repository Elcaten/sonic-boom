import { CoverArt } from "@/components/CoverArt";
import { ProgressSlider } from "@/components/ProgressSlider";
import { useColors } from "@/context/app-context";
import { usePlayerQueue } from "@/track-player/use-player-queue";
import { Column, Row } from "@expo/ui";
import { Button, Host, Image, RNHostView, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import { controlSize, font, foregroundStyle, padding } from "@expo/ui/swift-ui/modifiers";
import TrackPlayer, { useActiveMediaItem, useIsPlaying } from "@rntp/player";
import { useRouter } from "expo-router";
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
      <Image systemName={isPlaying ? "pause.fill" : "play.fill"} color="primary" size={size} />
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
  const router = useRouter();
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

  // const handleMoveItem = async (fromIndex: number, toIndex: number) => {
  //   const savedActiveTrack = TrackPlayer.getActiveMediaItem();
  //   const savedProgress = TrackPlayer.getProgress();

  //   const queue = TrackPlayer.getQueue();
  //   const newQueue = [...queue];
  //   const [movedItem] = newQueue.splice(fromIndex, 1);
  //   newQueue.splice(toIndex, 0, movedItem);
  //   TrackPlayer.setMediaItems(newQueue);

  //   const indexToSkipTo = newQueue.findIndex((item) => item.mediaId === savedActiveTrack?.mediaId);
  //   if (indexToSkipTo !== -1) {
  //     TrackPlayer.skipToIndex(indexToSkipTo);
  //     TrackPlayer.seekTo(savedProgress.position);
  //   }
  //   TrackPlayer.play();
  // };

  // const handleDeleteItem = async (index: number) => {
  //   const savedActiveTrack = TrackPlayer.getActiveMediaItem();
  //   const savedProgress = TrackPlayer.getProgress();

  //   const queue = TrackPlayer.getQueue();
  //   const newQueue = [...queue];
  //   newQueue.splice(index, 1);
  //   TrackPlayer.setMediaItems(newQueue);

  //   const indexToSkipTo = newQueue.findIndex((item) => item.mediaId === savedActiveTrack?.mediaId);
  //   if (indexToSkipTo !== -1) {
  //     TrackPlayer.skipToIndex(indexToSkipTo);
  //     TrackPlayer.seekTo(savedProgress.position);
  //   }
  //   TrackPlayer.play();
  // };

  const handleAlbumPress = () => {
    const albumId = activeTrack?.extras?.albumId;
    const artistId = activeTrack?.extras?.artistId;

    if (!albumId || typeof albumId !== "string" || !artistId || typeof artistId !== "string") {
      return;
    }

    router.replace({
      pathname: "/(tabs)/artists/[artistId]/albums/[albumId]/tracks",
      params: { albumId: albumId, artistId: artistId },
    });
  };

  const handleArtistPress = () => {
    const artistId = activeTrack?.extras?.artistId;
    if (!artistId || typeof artistId !== "string") {
      return;
    }

    router.replace({
      pathname: "/(tabs)/artists/[artistId]/albums",
      params: { artistId: artistId },
    });
  };

  return (
    <Host style={{ flex: 1 }}>
      <VStack modifiers={[padding({ vertical: 48, horizontal: 48 })]}>
        <RNHostView matchContents>
          <CoverArt id={activeTrack?.extras?.albumId} size={256} />
        </RNHostView>

        {/* <ScrollView>
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
        </ScrollView> */}

        <Spacer modifiers={[padding({ bottom: 12 })]} />

        <Column alignment="center" spacing={4}>
          <Button onPress={handleAlbumPress}>
            <Text
              modifiers={[
                font({ weight: "semibold", size: 24 }),
                foregroundStyle({ type: "color", color: "primary" }),
              ]}
            >
              {activeTrack?.title}
            </Text>
          </Button>
          <Button onPress={handleArtistPress}>
            <Text
              modifiers={[font({ size: 18 }), foregroundStyle({ type: "color", color: "primary" })]}
            >
              {activeTrack?.artist}
            </Text>
          </Button>
        </Column>

        <Spacer modifiers={[padding({ bottom: 12 })]} />

        <RNHostView>
          <GestureDetector gesture={capturePan}>
            <ProgressSlider />
          </GestureDetector>
        </RNHostView>

        <Spacer modifiers={[padding({ bottom: 12 })]} />

        <Row alignment="center">
          <PreviousButton size={32} />
          <Spacer />
          <PlayPauseButton size={48} />
          <Spacer />
          <NextButton size={32} />
        </Row>
      </VStack>
    </Host>
  );
}
