import { MediaItemExtras } from "@/track-player/types";
import { Button, Host, HStack, Image, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import {
  contentShape,
  disabled,
  font,
  foregroundStyle,
  frame,
  onTapGesture,
  shapes,
} from "@expo/ui/swift-ui/modifiers";
import TrackPlayer, { useActiveMediaItem, useIsPlaying } from "@rntp/player";
import { useRouter } from "expo-router";
import { CoverArt } from "./CoverArt/CoverArt";

export function FloatingPlayer({ actions }: { actions: ("play-pause" | "prev-next")[] }) {
  const router = useRouter();

  const activeTrack = useActiveMediaItem();
  const activeTrackExtra = activeTrack?.extras as MediaItemExtras | undefined;
  const isPlaying = useIsPlaying();

  const handlePress = () => {
    if (!activeTrackExtra?.albumId || !activeTrackExtra?.artistId) {
      return;
    }

    router.navigate({
      // pathname: "/(tabs)/artists/[artistId]/albums/[albumId]/tracks",
      pathname: "/active-track",
      params: { albumId: activeTrackExtra.albumId, artistId: activeTrackExtra.artistId },
    });
  };

  const handlePlayPausePress = () => {
    if (isPlaying) {
      TrackPlayer.pause();
    } else {
      TrackPlayer.play();
    }
  };

  const handlePrevPress = () => {
    TrackPlayer.skipToPrevious();
  };

  const handleNextPress = () => {
    TrackPlayer.skipToNext();
  };

  const isDisabled = !activeTrack;
  const buttonColor = isDisabled ? undefined : "primary";

  return (
    <Host style={{ flex: 1, marginInlineStart: 14, marginInlineEnd: 14 }}>
      <HStack
        spacing={12}
        modifiers={[
          contentShape(shapes.rectangle()),
          onTapGesture(handlePress),
          disabled(isDisabled),
        ]}
      >
        <VStack modifiers={[frame({ width: 32, height: 32 })]}>
          <CoverArt id={activeTrackExtra?.albumId} size={32} />
        </VStack>

        {activeTrack ? (
          <VStack alignment="leading">
            <Text modifiers={[font({ textStyle: "callout", weight: "medium" })]}>
              {activeTrack.title ?? ""}
            </Text>
            <Text
              modifiers={[
                font({ textStyle: "footnote" }),
                foregroundStyle({ type: "hierarchical", style: "secondary" }),
              ]}
            >
              {activeTrack.artist ?? ""}
            </Text>
          </VStack>
        ) : (
          <Text modifiers={[font({ textStyle: "callout", weight: "medium" })]}>Not playing</Text>
        )}

        <Spacer />

        {actions.includes("prev-next") && (
          <Button onPress={handlePrevPress}>
            <Image systemName={"backward.fill"} size={16} color={buttonColor} />
          </Button>
        )}
        {actions.includes("play-pause") && (
          <Button onPress={handlePlayPausePress}>
            <Image
              systemName={isPlaying ? "pause.fill" : "play.fill"}
              size={24}
              color={buttonColor}
            />
          </Button>
        )}
        {actions.includes("prev-next") && (
          <Button onPress={handleNextPress}>
            <Image systemName={"forward.fill"} size={16} color={buttonColor} />
          </Button>
        )}
      </HStack>
    </Host>
  );
}
