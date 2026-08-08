import { DownloadStatusIcon } from "@/features/downloads";
import { MediaItemExtras } from "@/features/player";
import { Button, HStack, Image, Spacer, Text } from "@expo/ui/swift-ui";
import {
  Animation,
  animation,
  font,
  foregroundStyle,
  frame,
  lineLimit,
  symbolEffect,
} from "@expo/ui/swift-ui/modifiers";
import { MediaItem } from "@rntp/player";

export function AlbumTrackRow({
  mediaItem,
  isActive,
  isPlaying,
  onPress,
}: {
  mediaItem: MediaItem;
  isActive: boolean;
  isPlaying: boolean;
  onPress: () => void;
}) {
  const extras = mediaItem.extras as unknown as MediaItemExtras;

  return (
    <Button onPress={onPress}>
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
            {String(extras.trackNumber)}
          </Text>
        )}
        <Text modifiers={[font({ weight: isActive ? "semibold" : "regular" }), lineLimit(1)]}>
          {mediaItem.title}
        </Text>
        <Spacer />
        {extras.downloadTask && <DownloadStatusIcon downloadTask={extras.downloadTask} />}
      </HStack>
    </Button>
  );
}
