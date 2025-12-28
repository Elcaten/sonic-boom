import { useThemeColor } from "@/hooks/use-theme-color";
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
import { useWindowDimensions, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TrackPlayer, {
  useActiveTrack,
  useIsPlaying,
} from "react-native-track-player";
import { CoverArt } from "./CoverArt";
import { ThemedView } from "./themed-view";

export function FloatingPlayer({
  style,
  onPress,
}: {
  style?: ViewStyle;
  onPress?: (_: { track: SubsonicTrack }) => void;
}) {
  //TODO: fix typing
  const activeTrack = useActiveTrack() as SubsonicTrack;

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
  onPress?: (_: { track: SubsonicTrack }) => void;
}) {
  const { width, height, scale, fontScale } = useWindowDimensions();

  const textSecondary = useThemeColor({}, "textSecondary");
  const textPrimary = useThemeColor({}, "textPrimary");
  const icon = useThemeColor({}, "icon");

  const { playing, bufferingDuringPlay } = useIsPlaying();

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
        bottom: MARGIN + 48,
        width: "100%",
      }}
    >
      <ThemedView
        style={[
          {
            borderRadius: 12,
            marginHorizontal: MARGIN,
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
          <HStack spacing={12} onPress={() => onPress?.({ track })}>
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
      </ThemedView>
    </SafeAreaView>
  );
}
