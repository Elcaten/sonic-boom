import { Section } from "@expo/ui/swift-ui";
import { MediaItem } from "@rntp/player";
import { AlbumTrackRow } from "./AlbumTrackRow";

export function AlbumTrackList({
  mediaItems,
  activeTrackId,
  isPlaying,
  onTrackPress,
}: {
  mediaItems: MediaItem[];
  activeTrackId?: string;
  isPlaying: boolean;
  onTrackPress: (trackId: string) => void;
}) {
  return (
    <Section>
      {mediaItems.map((mediaItem) => (
        <AlbumTrackRow
          key={mediaItem.mediaId}
          mediaItem={mediaItem}
          isActive={mediaItem.mediaId === activeTrackId}
          isPlaying={isPlaying}
          onPress={() => onTrackPress(mediaItem.mediaId!)}
        />
      ))}
    </Section>
  );
}
