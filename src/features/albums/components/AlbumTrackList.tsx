import { Section } from "@expo/ui/swift-ui";
import { AlbumSong } from "../types";
import { AlbumTrackRow } from "./AlbumTrackRow";

export function AlbumTrackList({
  songs,
  activeTrackId,
  isPlaying,
  onTrackPress,
}: {
  songs: AlbumSong[];
  activeTrackId?: string;
  isPlaying: boolean;
  onTrackPress: (trackId: string) => void;
}) {
  return (
    <Section>
      {songs.map((song) => (
        <AlbumTrackRow
          key={song.id}
          song={song}
          isActive={song.id === activeTrackId}
          isPlaying={isPlaying}
          onPress={() => onTrackPress(song.id)}
        />
      ))}
    </Section>
  );
}
