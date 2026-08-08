import { filterSortAlbums, useDownloadAlbum } from "@/features/albums";
import {
  canStartAlbumDownload,
  DownloadedFilterToolbar,
  DownloadStatusIcon,
  indexDownloadedAlbumsByArtist,
  selectAlbumDownloadStatuses,
  useDownloadedFilterStore,
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
import { Animation, animation, frame, listStyle } from "@expo/ui/swift-ui/modifiers";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator, View } from "react-native";
import { useArtistAlbums } from "../hooks";

export default function ArtistAlbumsScreen() {
  const { artistId } = useLocalSearchParams<"/(tabs)/artists/[artistId]/albums">();
  const { query } = useSearchBar();
  const { artistQuery, albums } = useArtistAlbums(artistId);
  const downloadFilter = useDownloadedFilterStore((state) => state.filter);
  const downloadedOnly = downloadFilter === "downloaded";
  const hasFilterHydrated = useDownloadedFilterStore((state) => state.hasHydrated);
  const downloadedTracksQuery = useDownloadedTracks();
  const downloadedAlbumsByArtist = useMemo(
    () => indexDownloadedAlbumsByArtist(downloadedTracksQuery.data ?? []),
    [downloadedTracksQuery.data],
  );
  const downloadedAlbumIds = downloadedAlbumsByArtist.get(artistId ?? "");
  const filteredAlbums = filterSortAlbums({
    albums,
    query,
    downloadedOnly,
    downloadedAlbumIds,
  });
  const downloadTasks = useDownloadStore((state) => state.tasks);
  const downloadAlbum = useDownloadAlbum();
  const downloadStatuses = useMemo(
    () =>
      selectAlbumDownloadStatuses({
        albumArtistId: artistId ?? "",
        albums,
        downloadedTracks: downloadedTracksQuery.data ?? [],
        tasks: downloadTasks,
      }),
    [albums, artistId, downloadTasks, downloadedTracksQuery.data],
  );

  let content;

  if (
    artistQuery.isPending ||
    !hasFilterHydrated ||
    (downloadedOnly && downloadedTracksQuery.isPending)
  ) {
    content = (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  } else if (filteredAlbums.length === 0) {
    const hasQuery = Boolean(query);
    content = (
      <Host style={{ flex: 1 }}>
        <ContentUnavailableView
          title={
            downloadedOnly
              ? hasQuery
                ? `No downloaded albums for ${query}`
                : "No Downloaded Albums"
              : `No results for ${query}`
          }
          description={
            downloadedOnly
              ? hasQuery
                ? "Try a new search or show all albums."
                : "Download an album by this artist to see it here."
              : "Try a new search"
          }
          systemImage={downloadedOnly && !hasQuery ? "arrow.down.circle" : "magnifyingglass"}
        />
      </Host>
    );
  } else {
    content = (
      <Host style={{ flex: 1 }}>
        <List
          modifiers={[
            listStyle("automatic"),
            animation(Animation.easeInOut({ duration: 0.22 }), downloadedOnly),
          ]}
        >
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
                    onPress={() =>
                      void downloadAlbum({
                        albumId: album.id,
                        albumArtistId: artistId ?? "",
                      })
                    }
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

  return (
    <>
      <DownloadedFilterToolbar />
      {content}
    </>
  );
}
