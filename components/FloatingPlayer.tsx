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
import { StyleSheet, useWindowDimensions, View } from "react-native";

import { useRouter } from "expo-router";
import TrackPlayer, {
  useActiveTrack,
  useIsPlaying,
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
      pathname: "/modal",
      // params: { albumId: track.albumId, artistId: track.artistId },
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

  const handlePrevPress = () => {
    TrackPlayer.skipToPrevious();
  };

  const handleNextPress = () => {
    TrackPlayer.skipToNext();
  };

  const isWideLayout = width > height;

  return (
    <View style={style.wrapper}>
      <ThemedView
        style={[
          style.card,
          isWideLayout && {
            ...style.wideCard,
            minWidth: height,
          },
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
              onPress={handlePrevPress}
              modifiers={[padding({ trailing: 8 })]}
            >
              <Image systemName={"backward.fill"} size={16} color="primary" />
            </Button>
            <Button
              onPress={handlePlayPausePress}
              disabled={bufferingDuringPlay}
              modifiers={[padding({ trailing: 8 })]}
            >
              <Image
                systemName={
                  bufferingDuringPlay
                    ? "pause.fill"
                    : playing
                    ? "pause.fill"
                    : "play.fill"
                }
                size={24}
                color="primary"
              />
            </Button>
            <Button
              onPress={handleNextPress}
              modifiers={[padding({ trailing: 8 })]}
            >
              <Image systemName={"forward.fill"} size={16} color="primary" />
            </Button>
          </HStack>
        </Host>
      </ThemedView>
    </View>
  );
}

const style = StyleSheet.create({
  wrapper: {
    position: "absolute",
    width: "100%",
    bottom: 0,
  },
  card: {
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
  wideCard: {
    borderRadius: 12,
    marginHorizontal: "auto",
    bottom: 12,
  },
});
