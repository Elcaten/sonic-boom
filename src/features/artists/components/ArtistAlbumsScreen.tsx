import { filterSortAlbums, useDownloadAlbum } from "@/features/albums";
import { DownloadStatusIcon, MyDownloadTask, useDownloadStore } from "@/features/downloads";
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

  const tasks = useDownloadStore((state) => state.tasks);

  const progressByAlbumId = useMemo<Map<string, MyDownloadTask>>(() => {
    const totals = new Map<string, { sum: number; count: number; isLoading: boolean }>();

    tasks.forEach((task) => {
      if (!task.albumId) return;

      const current = totals.get(task.albumId) ?? {
        sum: 0,
        count: 0,
        isLoading: false,
      };

      current.sum += task.status === "success" ? 1 : task.status === "loading" ? task.progress : 0;

      current.count += 1;
      current.isLoading ||= task.status === "loading";

      totals.set(task.albumId, current);
    });

    const result = new Map<string, MyDownloadTask>();

    totals.forEach(({ sum, count, isLoading }, albumId) => {
      if (isLoading) {
        result.set(albumId, { status: "loading", progress: sum / count, albumId });
      }
    });

    return result;
  }, [tasks]);

  const donwloadAlbum = useDownloadAlbum();
  const onDownloadPress = (albumId: string) => {
    donwloadAlbum({ albumId });
  };

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
          const title = [album.name, album.year ? `(${album.year})` : null]
            .filter(Boolean)
            .join(" ");
          return (
            <SwipeActions key={album.id}>
              <MediaListItem
                href={{
                  pathname: "/(tabs)/artists/[artistId]/albums/[albumId]/tracks",
                  params: { artistId, albumId: album.id },
                }}
                title={title}
                subtitle={pluralize(album.songCount, "track")}
                coverId={album.id}
                trailingAccessory={
                  progressByAlbumId.get(album.id) && (
                    <DownloadStatusIcon downloadTask={progressByAlbumId.get(album.id)!} />
                  )
                }
              />

              <SwipeActions.Actions edge="trailing">
                <Button
                  label="Download"
                  systemImage="arrow.down"
                  role="default"
                  onPress={() => onDownloadPress(album.id)}
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
