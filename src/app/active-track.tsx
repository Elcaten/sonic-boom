import { CoverArt } from "@/components/CoverArt";
import { ProgressSlider } from "@/components/ProgressSlider";
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
  const activeTrack = useActiveMediaItem();

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

        <Spacer modifiers={[padding({ bottom: 12 })]} />

        <Column alignment="center" spacing={4}>
          <Button onPress={handleAlbumPress}>
            <Text
              modifiers={[
                font({ textStyle: "title2", weight: "semibold" }),
                foregroundStyle({ type: "color", color: "primary" }),
              ]}
            >
              {activeTrack?.title}
            </Text>
          </Button>
          <Button onPress={handleArtistPress}>
            <Text modifiers={[foregroundStyle({ type: "color", color: "secondary" })]}>
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
