import { SubsonicTrack } from "@/utils/subsonicTrackPlayer";
import {
  Button,
  Host,
  HStack,
  Image,
  Spacer,
  Text,
  VStack,
} from "@expo/ui/swift-ui";
import { frame, padding } from "@expo/ui/swift-ui/modifiers";
import Slider from "@react-native-community/slider";
import { useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useRouter } from "expo-router";
import TrackPlayer, {
  useActiveTrack,
  useIsPlaying,
  useProgress,
} from "react-native-track-player";
import { CoverArt } from "./CoverArt";
import { ThemedView } from "./themed-view";

export function FloatingPlayer() {
  //TODO: fix typing
  const activeTrack = useActiveTrack() as SubsonicTrack;

  const router = useRouter();
  const onPress = ({ track }: { track: SubsonicTrack }) => {
    if (!track.albumId || !track.artistId) {
      return;
    }

    router.navigate({
      pathname: "/(tabs)/artists/[artistId]/albums/[albumId]/tracks",
      params: { albumId: track.albumId, artistId: track.artistId },
    });
  };

  if (!activeTrack) {
    return null;
  }

  return <Content track={activeTrack} onPress={onPress} />;
}

function Content({
  track,
  onPress,
}: {
  track: SubsonicTrack;
  onPress: (_: { track: SubsonicTrack }) => void;
}) {
  const { width, height } = useWindowDimensions();

  const { playing, bufferingDuringPlay } = useIsPlaying();
  const { position, duration } = useProgress();

  const handlePlayPausePress = () => {
    if (bufferingDuringPlay) {
      return;
    }

    if (playing) {
      TrackPlayer.pause();
    } else {
      TrackPlayer.play();
    }
  };

  const MARGIN = 16;

  return (
    <SafeAreaView
      style={{
        position: "absolute",
        width: "100%",
        bottom: 0,
      }}
    >
      <ThemedView
        style={[
          {
            borderRadius: 12,
            marginHorizontal: MARGIN,
            marginBottom: MARGIN,
            paddingHorizontal: 8,
            paddingVertical: 8,

            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 0,
            },
            shadowOpacity: 0.15,
            shadowRadius: 15,
          },
          width > height
            ? {
                marginHorizontal: "auto",
                minWidth: height,
              }
            : {},
        ]}
      >
        <Host style={{ flex: 1 }}>
          <HStack spacing={12} onPress={() => onPress({ track })}>
            <VStack modifiers={[frame({ width: 48, height: 48 })]}>
              <CoverArt id={track.id} size={48} />
            </VStack>
            <VStack alignment="leading">
              {track.title && (
                <Text size={15} weight="medium">
                  {track.title}
                </Text>
              )}
              {track.artist && (
                <Text color="secondary" size={15}>
                  {track.artist}
                </Text>
              )}
            </VStack>
            <Spacer />
            <Button
              onPress={handlePlayPausePress}
              disabled={bufferingDuringPlay}
              modifiers={[padding({ trailing: 8 })]}
            >
              <Image
                systemName={
                  bufferingDuringPlay
                    ? "progress.indicator"
                    : playing
                    ? "pause.fill"
                    : "play.fill"
                }
                size={24}
                color="primary"
              />
            </Button>
          </HStack>
        </Host>
        <Slider
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onSlidingComplete={(time) => TrackPlayer.seekTo(time)}
          tapToSeek={true}
        />
      </ThemedView>
    </SafeAreaView>
  );
}
