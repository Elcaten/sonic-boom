import { AlbumSong } from "@/entities/album/model/types";
import { formatDuration } from "@/shared/lib/format/format-duration";
import { Button, HStack, Image, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import {
  Animation,
  animation,
  font,
  foregroundStyle,
  frame,
  lineLimit,
  padding,
  symbolEffect,
} from "@expo/ui/swift-ui/modifiers";

type AlbumTrackRowProps = {
  song: AlbumSong;
  isActive: boolean;
  isPlaying: boolean;
  onPress: () => void;
};

export function AlbumTrackRow({ song, isActive, isPlaying, onPress }: AlbumTrackRowProps) {
  return (
    <Button onPress={onPress}>
      <HStack spacing={12} modifiers={[animation(Animation.spring({ duration: 0.2 }), isActive)]}>
        <VStack modifiers={[frame({ width: 1 })]}>
          {/* avoid inset list layout messing up row separator alignment */}
          <Text>&nbsp;</Text>
        </VStack>
        {isActive && (
          <Image
            systemName="waveform"
            size={18}
            modifiers={[
              frame({ width: 32 }),
              ...(isPlaying
                ? [
                    symbolEffect(
                      {
                        effect: "variableColor",
                        fillStyle: "iterative",
                      },
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
            {String(song.track)}
          </Text>
        )}
        <Text modifiers={[font({ weight: isActive ? "semibold" : "regular" }), lineLimit(1)]}>
          {song.title}
        </Text>
        <Spacer />
        {song.duration && (
          <Text
            modifiers={[
              padding({ trailing: 16 }),
              foregroundStyle({ type: "hierarchical", style: "secondary" }),
            ]}
          >
            {formatDuration(song.duration)}
          </Text>
        )}
      </HStack>
    </Button>
  );
}
