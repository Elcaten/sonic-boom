import { pluralize } from "@/shared/lib/format";
import { useSearchBar } from "@/shared/lib/navigation";
import { MediaListItem } from "@/shared/ui";
import { listSectionIndexVisibility, sectionIndexLabel } from "@_elcaten/expo-list-section-index";
import { ContentUnavailableView, Host, List, Section } from "@expo/ui/swift-ui";
import { listStyle } from "@expo/ui/swift-ui/modifiers";
import { ActivityIndicator, View } from "react-native";
import { useArtists, usePreloadAlbumImages } from "../hooks";
import { groupArtistsBySection } from "../lib";

export default function ArtistsScreen() {
  const { query } = useSearchBar();
  const { artistsQuery, sectionedArtists } = useArtists();
  const sections = groupArtistsBySection({ artists: sectionedArtists, query });

  const preloadAlbumImages = usePreloadAlbumImages();

  if (artistsQuery.isPending) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (sections.length === 0) {
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
      <List modifiers={[listStyle("plain"), listSectionIndexVisibility("visible")]}>
        {sections.map((section) => (
          <Section
            key={section.title}
            title={section.title}
            modifiers={section.title.length === 1 ? [sectionIndexLabel(section.title)] : undefined}
          >
            {section.data.map((artist) => (
              <MediaListItem
                key={artist.id}
                href={{
                  pathname: "/(tabs)/artists/[artistId]/albums",
                  params: { artistId: artist.id },
                }}
                onPress={() => preloadAlbumImages(artist.id)}
                coverId={artist.id}
                title={artist.name}
                subtitle={pluralize(artist.albumCount, "album")}
              />
            ))}
          </Section>
        ))}
      </List>
    </Host>
  );
}
