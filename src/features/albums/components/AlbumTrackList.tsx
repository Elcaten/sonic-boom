import { Section } from "@expo/ui/swift-ui";
import { AlbumTrackRowModel } from "../types";
import { AlbumTrackRow } from "./AlbumTrackRow";

export function AlbumTrackList({
  tracks,
  activeTrackId,
  isPlaying,
  onTrackPress,
}: {
  tracks: AlbumTrackRowModel[];
  activeTrackId?: string;
  isPlaying: boolean;
  onTrackPress: (trackId: string) => void;
}) {
  return (
    <Section>
      {tracks.map((track) => (
        <AlbumTrackRow
          key={track.id}
          track={track}
          isActive={track.id === activeTrackId}
          isPlaying={isPlaying}
          onPress={() => onTrackPress(track.id)}
        />
      ))}
    </Section>
  );
}
