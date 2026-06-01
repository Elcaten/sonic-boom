import { AlbumSong } from "@/entities/album";
import { AlbumTrackRow } from "../AlbumTrackRow/AlbumTrackRow";
import { Section } from "@expo/ui/swift-ui";

type AlbumTrackListProps = {
  songs: AlbumSong[];
  activeTrackId?: string;
  isPlaying: boolean;
  onTrackPress: (trackId: string) => void;
};

export function AlbumTrackList({
  songs,
  activeTrackId,
  isPlaying,
  onTrackPress,
}: AlbumTrackListProps) {
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
