import {
  DownloadedFilterToolbar,
  indexDownloadedAlbumsByArtist,
  useDownloadedFilterStore,
  useDownloadedTracks,
} from "@/features/downloads";
import { pluralize } from "@/shared/lib/format";
import { useSearchBar } from "@/shared/lib/navigation";
import { MediaListItem } from "@/shared/ui";
import { listSectionIndexVisibility, sectionIndexLabel } from "@_elcaten/expo-list-section-index";
import { ContentUnavailableView, Host, List, Section } from "@expo/ui/swift-ui";
import { Animation, animation, listStyle } from "@expo/ui/swift-ui/modifiers";
import { useMemo } from "react";
import { ActivityIndicator, View } from "react-native";
import { useArtists, usePreloadAlbumImages } from "../hooks";
import { groupArtistsBySection } from "../lib";

export default function ArtistsScreen() {
  const { query } = useSearchBar();
  const { artistsQuery, sectionedArtists } = useArtists();
  const downloadFilter = useDownloadedFilterStore((state) => state.filter);
  const downloadedOnly = downloadFilter === "downloaded";
  const hasFilterHydrated = useDownloadedFilterStore((state) => state.hasHydrated);
  const downloadedTracksQuery = useDownloadedTracks();
  const downloadedAlbumsByArtist = useMemo(
    () => indexDownloadedAlbumsByArtist(downloadedTracksQuery.data ?? []),
    [downloadedTracksQuery.data],
  );
  const sections = groupArtistsBySection({
    artists: sectionedArtists,
    query,
    downloadedOnly,
    downloadedAlbumsByArtist,
  });

  const preloadAlbumImages = usePreloadAlbumImages();

  let content;

  if (
    artistsQuery.isPending ||
    !hasFilterHydrated ||
    (downloadedOnly && downloadedTracksQuery.isPending)
  ) {
    content = (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  } else if (sections.length === 0) {
    const hasQuery = Boolean(query);
    content = (
      <Host style={{ flex: 1 }}>
        <ContentUnavailableView
          title={
            downloadedOnly
              ? hasQuery
                ? `No downloaded artists for ${query}`
                : "No Downloaded Artists"
              : `No results for ${query}`
          }
          description={
            downloadedOnly
              ? hasQuery
                ? "Try a new search or show all artists."
                : "Download an album to see its artist here."
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
            listSectionIndexVisibility("visible"),
            animation(Animation.easeInOut({ duration: 0.22 }), downloadedOnly),
          ]}
        >
          {sections.map((section) => (
            <Section
              key={section.title}
              title={section.title}
              modifiers={
                section.title.length === 1 ? [sectionIndexLabel(section.title)] : undefined
              }
            >
              {section.data.map((artist) => {
                const downloadedAlbumIds = downloadedAlbumsByArtist.get(artist.id);

                return (
                  <MediaListItem
                    key={artist.id}
                    href={{
                      pathname: "/(tabs)/artists/[artistId]/albums",
                      params: { artistId: artist.id },
                    }}
                    onPress={() =>
                      preloadAlbumImages(
                        artist.id,
                        downloadedOnly ? downloadedAlbumIds : undefined,
                      )
                    }
                    coverId={artist.id}
                    title={artist.name}
                    subtitle={pluralize(
                      downloadedOnly ? (downloadedAlbumIds?.size ?? 0) : artist.albumCount,
                      "album",
                    )}
                  />
                );
              })}
            </Section>
          ))}
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
