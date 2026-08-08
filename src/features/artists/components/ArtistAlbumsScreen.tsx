import { filterSortAlbums, useDownloadAlbum } from "@/features/albums";
import {
  canStartAlbumDownload,
  DownloadStatusIcon,
  selectAlbumDownloadStatuses,
  useDownloadedTracks,
  useDownloadStore,
} from "@/features/downloads";
import { pluralize } from "@/shared/lib/format";
import { useSearchBar } from "@/shared/lib/navigation";
import { MediaListItem } from "@/shared/ui";
import {
  Button,
  ContentUnavailableView,
  Host,
  List,
  Section,
  SwipeActions,
} from "@expo/ui/swift-ui";
import { frame, listStyle } from "@expo/ui/swift-ui/modifiers";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator, View } from "react-native";
import { useArtistAlbums } from "../hooks";

export default function ArtistAlbumsScreen() {
  const { artistId } = useLocalSearchParams<"/(tabs)/artists/[artistId]/albums">();
  const { query } = useSearchBar();
  const { artistQuery, albums } = useArtistAlbums(artistId);
  const filteredAlbums = filterSortAlbums({ albums, query });
  const downloadedTracksQuery = useDownloadedTracks();
  const downloadTasks = useDownloadStore((state) => state.tasks);
  const downloadAlbum = useDownloadAlbum();
  const downloadStatuses = useMemo(
    () =>
      selectAlbumDownloadStatuses({
        artistId: artistId ?? "",
        albums,
        downloadedTracks: downloadedTracksQuery.data ?? [],
        tasks: downloadTasks,
      }),
    [albums, artistId, downloadTasks, downloadedTracksQuery.data],
  );

  if (artistQuery.isPending) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (filteredAlbums.length === 0) {
    return (
      <Host style={{ flex: 1 }}>
        <ContentUnavailableView
          title={`No results for ${query}`}
          description="Try a new search"
          systemImage="magnifyingglass"
        />
      </Host>
    );
  }

  return (
    <Host style={{ flex: 1 }}>
      <List modifiers={[listStyle("automatic")]}>
        {filteredAlbums.map((album) => {
          const downloadStatus = downloadStatuses.get(album.id);
          const title = [album.name, album.year ? `(${album.year})` : null]
            .filter(Boolean)
            .join(" ");
          const row = (
            <MediaListItem
              key={album.id}
              href={{
                pathname: "/(tabs)/artists/[artistId]/albums/[albumId]/tracks",
                params: { artistId, albumId: album.id },
              }}
              title={title}
              subtitle={pluralize(album.songCount, "track")}
              coverId={album.id}
              trailingAccessory={
                downloadStatus ? <DownloadStatusIcon status={downloadStatus} /> : undefined
              }
            />
          );

          if (!canStartAlbumDownload(downloadStatus)) return row;

          return (
            <SwipeActions key={album.id}>
              {row}
              <SwipeActions.Actions edge="trailing">
                <Button
                  label={downloadStatus ? "Retry Download" : "Download"}
                  systemImage="arrow.down"
                  onPress={() => void downloadAlbum({ albumId: album.id })}
                />
              </SwipeActions.Actions>
            </SwipeActions>
          );
        })}
        <Section modifiers={[frame({ height: 40 })]}>{null}</Section>
      </List>
    </Host>
  );
}
