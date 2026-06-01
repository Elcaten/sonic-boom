import { filterSortAlbums } from "@/entities/album/lib/filter-sort-albums";
import { useArtistAlbums } from "@/entities/artist/model/use-artist-albums";
import { useSearchBar } from "@/shared/lib/navigation/use-search-bar";
import { pluralize } from "@/shared/lib/format/pluralize";
import { MediaListItem } from "@/shared/ui/MediaListItem";
import { ContentUnavailableView, Host, List, Section } from "@expo/ui/swift-ui";
import { frame, listStyle } from "@expo/ui/swift-ui/modifiers";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export function ArtistAlbumsScreen() {
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
                params: { artistId: artistId, albumId: album.id },
              }}
              title={title}
              subtitle={pluralize(album.songCount, "track")}
              coverId={album.id}
            />
          );
        })}
        {/* Padding to account for FloatingPlayer */}
        <Section modifiers={[frame({ height: 40 })]}>{null}</Section>
      </List>
    </Host>
  );
}
