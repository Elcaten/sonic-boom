import { PlayerButton, ProgressSlider } from "@/features/player-controls";
import { MediaItemExtras } from "@/shared/lib/player";
import { CoverArt } from "@/shared/ui";
import { Column, Row } from "@expo/ui";
import { Button, Host, RNHostView, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import { font, foregroundStyle, padding } from "@expo/ui/swift-ui/modifiers";
import { useActiveMediaItem } from "@rntp/player";
import { useRouter } from "expo-router";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

// Capture pan gestures so that parent modal won't wobble when the user is dragging the progress slider
const capturePan = Gesture.Pan().minDistance(1);

export default function ActiveTrackScreen() {
  const router = useRouter();
  const activeTrack = useActiveMediaItem();
  const activeTrackExtra = activeTrack?.extras as MediaItemExtras;

  const handleAlbumPress = () => {
    const albumId = activeTrackExtra?.albumId;
    const artistId = activeTrackExtra?.artistId;

    if (!albumId || typeof albumId !== "string" || !artistId || typeof artistId !== "string") {
      return;
    }

    router.replace({
      pathname: "/(tabs)/artists/[artistId]/albums/[albumId]/tracks",
      params: { albumId: albumId, artistId: artistId },
    });
  };

  const handleArtistPress = () => {
    const artistId = activeTrackExtra?.artistId;
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
          <CoverArt id={activeTrackExtra?.albumId} size={256} />
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
          <PlayerButton.Previous size={32} />
          <Spacer />
          <PlayerButton.PlayPause size={48} />
          <Spacer />
          <PlayerButton.Next size={32} />
        </Row>
      </VStack>
    </Host>
  );
}
