import {
  useDeleteDownloadedMedia,
  useDownloadedMediaList,
  useDownloadStore,
} from "@/features/downloads";
import { useRequiredQueries } from "@/shared/api";
import { Button, Host, List, Section, Text, VStack } from "@expo/ui/swift-ui";
import { bold } from "@expo/ui/swift-ui/modifiers";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Alert } from "react-native";

export function DownloadsScreen() {
  const { data: allDownloadedMedia } = useDownloadedMediaList();
  const downloadTasks = useDownloadStore((x) => x.tasks);

  const deleteDownloads = useDeleteDownloadedMedia();

  const handleDeleteAllPress = () => {
    const result = deleteDownloads();

    if (!result.success) {
      Alert.alert("Error deleting downloads", String(result.error));
      return;
    }

    Alert.alert("All downloads deleted");
  };

  return (
    <Host style={{ flex: 1 }}>
      <List>
        <Section title="Zustand">
          <Text>{JSON.stringify(downloadTasks, null, 2)}</Text>
        </Section>
        <Section title="Files">
          <Button onPress={handleDeleteAllPress} role="destructive">
            <Text> Delete All</Text>
          </Button>
          {allDownloadedMedia?.map((song) => (
            <React.Fragment key={song.songId}>
              <VStack alignment="leading">
                <ArtistName artistId={song.artistId} />
                <AlbumName albumId={song.albumId} />
                <SongName songId={song.songId} />
              </VStack>
            </React.Fragment>
          ))}
        </Section>
      </List>
    </Host>
  );
}

function SongName({ songId }: { songId: string }) {
  const queries = useRequiredQueries();
  const song = useQuery(queries.song(songId));

  if (song.isLoading) {
    return <Text modifiers={[bold()]}>...</Text>;
  }

  return (
    <Text modifiers={[bold()]}>
      {song.data?.song?.title} | {songId}
    </Text>
  );
}

function ArtistName({ artistId }: { artistId: string }) {
  const queries = useRequiredQueries();
  const song = useQuery(queries.artist(artistId));

  if (song.isLoading) {
    return <Text>...</Text>;
  }

  return (
    <Text>
      {song.data?.artist.name} | {artistId}
    </Text>
  );
}

function AlbumName({ albumId }: { albumId: string }) {
  const queries = useRequiredQueries();
  const song = useQuery(queries.album(albumId));

  if (song.isLoading) {
    return <Text>...</Text>;
  }

  return (
    <Text>
      {song.data?.album.name} | {albumId}
    </Text>
  );
}
