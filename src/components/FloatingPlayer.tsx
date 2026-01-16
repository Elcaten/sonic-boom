import { useColors } from "@/context/app-context";
import { isIOSVersion } from "@/utils/is-ios-version";
import { Button, Host, HStack, Image, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import { frame } from "@expo/ui/swift-ui/modifiers";
import { GlassView } from "expo-glass-effect";
import { useRouter } from "expo-router";
import { StyleSheet, useColorScheme, useWindowDimensions, View } from "react-native";
import TrackPlayer, { useActiveTrack, useIsPlaying } from "react-native-track-player";
import { CoverArt } from "./CoverArt";

const style = StyleSheet.create({
  wrapper: {
    position: "absolute",
    width: "100%",
    ...(isIOSVersion(26)
      ? {
          bottom: 80,
          paddingHorizontal: 20,
          paddingBlockEnd: 12,
        }
      : {
          bottom: 0,
          padding: 12,
        }),
  },
  card: isIOSVersion(26)
    ? {
        borderRadius: 100,
        paddingLeft: 10,
        paddingRight: 20,
        paddingVertical: 8,
      }
    : {
        borderRadius: 12,
        paddingLeft: 8,
        paddingRight: 16,
        paddingVertical: 8,
      },
  cardShadowLight: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  cardShadowDark: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 15,
  },
  wideCard: {
    marginHorizontal: "auto",
  },
});

export function FloatingPlayer() {
  const router = useRouter();
  const colors = useColors();
  const theme = useColorScheme() ?? "light";

  const activeTrack = useActiveTrack();
  const { playing, bufferingDuringPlay } = useIsPlaying();

  const { width, height } = useWindowDimensions();
  const isWideLayout = width > height;

  const handlePress = () => {
    if (!activeTrack?.albumId || !activeTrack?.artistId) {
      return;
    }

    router.navigate({
      // pathname: "/(tabs)/artists/[artistId]/albums/[albumId]/tracks",
      pathname: "/active-track",
      params: { albumId: activeTrack.albumId, artistId: activeTrack.artistId },
    });
  };

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

  if (!activeTrack) {
    return null;
  }

  return (
    <View style={style.wrapper}>
      <GlassView
        isInteractive
        style={[
          style.card,
          theme === "light" ? style.cardShadowLight : style.cardShadowDark,
          isWideLayout && {
            ...style.wideCard,
            minWidth: height,
          },
          !isIOSVersion(26) && { backgroundColor: colors.secondarySystemGroupedBackground },
        ]}
      >
        <Host>
          <HStack spacing={12} onPress={handlePress}>
            {isIOSVersion(26) && (
              <VStack modifiers={[frame({ height: 32, width: 0 })]}>
                <View style={{ height: 32, width: 0 }} />
              </VStack>
            )}
            {!isIOSVersion(26) && (
              <VStack modifiers={[frame({ width: 48, height: 48 })]}>
                <CoverArt id={activeTrack.albumId} size={48} />
              </VStack>
            )}
            <VStack alignment="leading">
              <Text size={15} weight="medium">
                {activeTrack.title ?? ""}
              </Text>
              <Text color="secondary" size={15}>
                {activeTrack.artist ?? ""}
              </Text>
            </VStack>
            <Spacer />
            <Button onPress={handlePrevPress}>
              <Image systemName={"backward.fill"} size={16} color="primary" />
            </Button>
            <Button onPress={handlePlayPausePress} disabled={bufferingDuringPlay}>
              <Image
                systemName={
                  bufferingDuringPlay ? "pause.fill" : playing ? "pause.fill" : "play.fill"
                }
                size={24}
                color="primary"
              />
            </Button>
            <Button onPress={handleNextPress}>
              <Image systemName={"forward.fill"} size={16} color="primary" />
            </Button>
          </HStack>
        </Host>
      </GlassView>
    </View>
  );
}
