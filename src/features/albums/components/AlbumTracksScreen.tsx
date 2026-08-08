import { ContentUnavailableView, Host, List, Section } from "@expo/ui/swift-ui";
import { frame, listStyle } from "@expo/ui/swift-ui/modifiers";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, View, useWindowDimensions } from "react-native";
import { useAlbum, useAlbumMediaItems, useAlbumPlayback, useAlbumTrackPress } from "../hooks";
import { AlbumHeader } from "./AlbumHeader";
import { AlbumPlaybackActions } from "./AlbumPlaybackActions";
import { AlbumTrackList } from "./AlbumTrackList";

export default function AlbumTracksScreen() {
  const params = useLocalSearchParams<"/(tabs)/artists/[artistId]/albums/[albumId]/tracks">();
  const albumId = params.albumId;

  const { width } = useWindowDimensions();
  const isWideLayout = width > 600;

  const { albumQuery, album, songs } = useAlbum(albumId);
  const albumMediaItems = useAlbumMediaItems({ albumId, songs });
  const { playAlbum, shuffleAlbum, playFromTrack } = useAlbumPlayback({
    tracks: albumMediaItems.data,
  });
  const { isPlaying, activeTrackId, handleTrackPress } = useAlbumTrackPress({
    tracks: albumMediaItems.data,
    onInactiveTrackPress: playFromTrack,
  });

  if (!albumId) {
    return (
      <Host style={{ flex: 1 }}>
        <ContentUnavailableView title="Album not found" description="Missing album id" />
      </Host>
    );
  }

  if (albumQuery.isPending || albumMediaItems.isPending) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (songs.length === 0) {
    return (
      <Host style={{ flex: 1 }}>
        <ContentUnavailableView title="No tracks" description="This album has no tracks yet" />
      </Host>
    );
  }

  return (
    <Host style={{ flex: 1 }}>
      <List modifiers={[listStyle("inset")]}>
        <AlbumHeader
          albumId={albumId}
          albumName={album?.name}
          artistName={album?.artist}
          isWideLayout={isWideLayout}
          actions={<AlbumPlaybackActions onPlayPress={playAlbum} onShufflePress={shuffleAlbum} />}
        />
        <AlbumTrackList
          tracks={albumMediaItems.tracks}
          activeTrackId={activeTrackId}
          isPlaying={isPlaying}
          onTrackPress={handleTrackPress}
        />
        <Section modifiers={[frame({ height: 40 })]}>{null}</Section>
      </List>
    </Host>
  );
}
