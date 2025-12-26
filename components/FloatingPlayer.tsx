import { useThemeColor } from "@/hooks/use-theme-color";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import TrackPlayer, {
  Track,
  useActiveTrack,
  useIsPlaying,
} from "react-native-track-player";
import { CoverArt } from "./CoverArt";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

export function FloatingPlayer({ style }: { style?: ViewStyle }) {
  const activeTrack = useActiveTrack();

  if (!activeTrack) {
    return null;
  }

  return <Content track={activeTrack} />;
}

function Content({ track }: { track: Track }) {
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

  return (
    <View
      style={{
        position: "absolute",
        bottom: 100,
        width: "100%",
      }}
    >
      <ThemedView
        style={{
          borderRadius: 12,
          flexDirection: "row",
          gap: 12,
          marginHorizontal: 12,
          paddingHorizontal: 8,
          paddingVertical: 8,
          alignItems: "center",

          // iOS Shadow Properties
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -4, // Negative value moves shadow upwards
          },
          shadowOpacity: 0.16, // Very subtle for iOS
          shadowRadius: 10, // Soft blur

          // The "Hairline" Detail
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: "rgba(0, 0, 0, 0.1)",
        }}
      >
        <CoverArt id={track.id} size={48} />
        <View style={{ marginRight: "auto", flexShrink: 1 }}>
          <ThemedText
            style={{ color: textPrimary, textOverflow: "ellipsis" }}
            numberOfLines={1}
            type="defaultSemiBold"
          >
            {track.title}
          </ThemedText>
          <ThemedText style={{ color: textSecondary }}>
            {track.artist}
          </ThemedText>
        </View>
        <TouchableOpacity
          style={{ marginRight: 8 }}
          onPress={handlePlayPausePress}
          disabled={bufferingDuringPlay}
        >
          {bufferingDuringPlay && (
            <Ionicons name="ellipsis-horizontal-sharp" size={24} color={icon} />
          )}
          {!bufferingDuringPlay && !playing && (
            <Ionicons name="play" size={24} color={icon} />
          )}
          {!bufferingDuringPlay && playing && (
            <Ionicons name="pause" size={24} color={icon} />
          )}
        </TouchableOpacity>
      </ThemedView>
    </View>
  );
}
