import { ThemedSafeAreaView } from "@/components/themed/themed-safe-area-view";
import { ListItem } from "@/components/ui/list-item";
import { useSearch } from "@/hooks/use-recently-searched";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ContentUnavailableView, Host, HStack, List, Section } from "@expo/ui/swift-ui";
import { useNavigation } from "expo-router";
import { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient";
import { useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { Artist, Child } from "subsonic-api";

export default function SearchIndex() {
  const bgSecondary = useThemeColor({}, "bgSecondary");
  const navigation = useNavigation();

  const search = useSearch();

  useEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: "Search",
        onChangeText: (e) => search.setQuery(e.nativeEvent.text),
      },
    } satisfies ExtendedStackNavigationOptions);
  }, [navigation]);

  const renderSong = (song: Child) => {
    if (!song.albumId || !song.artistId) {
      return null;
    }

    return (
      <ListItem
        key={song.id}
        href={{
          pathname: "/(tabs)/artists/[artistId]/albums/[albumId]/tracks",
          params: { albumId: song.albumId, artistId: song.artistId },
        }}
        onPress={() => search.handleResultSelect({ type: "Song", song })}
        title={song.title}
        subtitle={`Song · ${song.artist}`}
        coverId={song.id}
      />
    );
  };

  const renderAlbum = (album: Child) => (
    <ListItem
      key={album.id}
      href={{
        pathname: "/(tabs)/artists/[artistId]/albums/[albumId]/tracks",
        params: { albumId: album.id, artistId: album.artistId! },
      }}
      onPress={() => search.handleResultSelect({ type: "Album", album })}
      title={album.title}
      subtitle={`Album · ${album.artist}`}
      coverId={album.id}
    />
  );

  const renderArtist = (artist: Artist) => (
    <ListItem
      key={artist.id}
      href={{
        pathname: "/(tabs)/artists/[artistId]/albums",
        params: { artistId: artist.id },
      }}
      onPress={() => search.handleResultSelect({ type: "Artist", artist })}
      title={artist.name}
      subtitle="Artist"
      coverId={artist.id}
    />
  );

  if (search.isLoading) {
    return (
      <ThemedSafeAreaView
        backgroundColor="systemGroupedBackground"
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </ThemedSafeAreaView>
    );
  }

  if (search.query === "") {
    return (
      <Host style={{ flex: 1 }}>
        <List>
          <Section title="Recently Searched">
            {search.recentSearches.map((item, index) => (
              <HStack key={index}>
                {item.type === "Album" && renderAlbum(item.album)}
                {item.type === "Artist" && renderArtist(item.artist)}
                {item.type === "Song" && renderSong(item.song)}
              </HStack>
            ))}
          </Section>
        </List>
      </Host>
    );
  }

  if (!search.results?.album && !search.results?.artist && !search.results?.song) {
    return (
      <ThemedSafeAreaView backgroundColor="systemGroupedBackground" style={{ flex: 1 }}>
        <Host style={{ flex: 1 }}>
          <ContentUnavailableView
            title={`No results for ${search.debouncedQuery}`}
            description="Try a new search"
            systemImage="magnifyingglass"
          ></ContentUnavailableView>
        </Host>
      </ThemedSafeAreaView>
    );
  }

  return (
    <Host style={{ flex: 1 }}>
      <List>
        {search.results?.song && search.results.song.length > 0 && (
          <Section title="Songs">{search.results.song.map(renderSong)}</Section>
        )}
        {search.results?.album && search.results?.album.length > 0 && (
          <Section title="Albums">{search.results.album.map(renderAlbum)}</Section>
        )}
        {search.results?.artist && search.results?.artist.length > 0 && (
          <Section title="Artists">{search.results?.artist.map(renderArtist)}</Section>
        )}
      </List>
    </Host>
  );
}
