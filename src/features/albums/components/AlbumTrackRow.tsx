import { DownloadStatusIcon } from "@/features/downloads";
import { formatDuration } from "@/shared/lib/format";
import { Button, HStack, Image, Spacer, Text } from "@expo/ui/swift-ui";
import {
  Animation,
  animation,
  disabled,
  font,
  foregroundStyle,
  frame,
  lineLimit,
  padding,
  symbolEffect,
} from "@expo/ui/swift-ui/modifiers";
import { AlbumTrackRowModel } from "../types";

export function AlbumTrackRow({
  track,
  isActive,
  isPlaying,
  onPress,
}: {
  track: AlbumTrackRowModel;
  isActive: boolean;
  isPlaying: boolean;
  onPress: () => void;
}) {
  return (
    <Button onPress={onPress} modifiers={!track.isPlayable ? [disabled()] : undefined}>
      <HStack spacing={12} modifiers={[animation(Animation.spring({ duration: 0.2 }), isActive)]}>
        {isActive && (
          <Image
            systemName="waveform"
            size={18}
            modifiers={[
              frame({ width: 32 }),
              ...(isPlaying
                ? [
                    symbolEffect(
                      { effect: "variableColor", fillStyle: "iterative" },
                      { options: { speed: 0.3 } },
                    ),
                  ]
                : []),
            ]}
          />
        )}
        {!isActive && (
          <Text
            modifiers={[
              frame({ width: 32 }),
              foregroundStyle({
                type: "hierarchical",
                style: "secondary",
              }),
            ]}
          >
            {track.trackNumber ? String(track.trackNumber) : "–"}
          </Text>
        )}
        <Text modifiers={[font({ weight: isActive ? "semibold" : "regular" }), lineLimit(1)]}>
          {track.title}
        </Text>
        <Spacer />
        {track.duration && (
          <Text
            modifiers={[
              padding({ trailing: 16 }),
              foregroundStyle({ type: "hierarchical", style: "secondary" }),
            ]}
          >
            {formatDuration(track.duration)}
          </Text>
        )}
        {track.downloadStatus && <DownloadStatusIcon status={track.downloadStatus} />}
      </HStack>
    </Button>
  );
}
