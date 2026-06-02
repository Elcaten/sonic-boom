import { MediaListItem } from "@/components";
import { filterSortAlbums } from "@/features/albums";
import { pluralize } from "@/lib/format";
import { useSearchBar } from "@/lib/navigation";
import { ContentUnavailableView, Host, List, Section } from "@expo/ui/swift-ui";
import { frame, listStyle } from "@expo/ui/swift-ui/modifiers";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useArtistAlbums } from "../hooks";

export default function ArtistAlbumsScreen() {
  const { artistId } = useLocalSearchParams<"/(tabs)/artists/[artistId]/albums">();
  const { query } = useSearchBar();
  const { artistQuery, albums } = useArtistAlbums(artistId);
  const filteredAlbums = filterSortAlbums({ albums, query });

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
          const title = [album.name, album.year ? `(${album.year})` : null].filter(Boolean).join(" ");
          return (
            <MediaListItem
              key={album.id}
              href={{
                pathname: "/(tabs)/artists/[artistId]/albums/[albumId]/tracks",
                params: { artistId, albumId: album.id },
              }}
              title={title}
              subtitle={pluralize(album.songCount, "track")}
              coverId={album.id}
            />
          );
        })}
        <Section modifiers={[frame({ height: 40 })]}>{null}</Section>
      </List>
    </Host>
  );
}
