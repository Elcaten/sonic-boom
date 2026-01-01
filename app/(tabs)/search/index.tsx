import { ListItem } from "@/components/ListItem";
import { ThemedSafeAreaView } from "@/components/themed-safe-area-view";
import { ThemedText } from "@/components/themed-text";
import { useDebouncedState } from "@/hooks/use-debounce-state";
import { useSubsonicQuery } from "@/hooks/use-subsonic-query";
import { subsonicQueries } from "@/utils/subsonicQueries";
import { Host, HStack, List, Section, Text } from "@expo/ui/swift-ui";
import { useNavigation } from "expo-router";
import { useEffect } from "react";
import { Artist, Child } from "subsonic-api";

type SearchItem =
  | {
      type: "Album";
      album: Child;
    }
  | { type: "Song"; song: Child }
  | { type: "Artist"; artist: Artist };

export default function SearchIndex() {
  const [_, debounceSearch, setSearch] = useDebouncedState("", 300);

  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        // placement: "stacked",
        placeholder: "Search",
        onChangeText: (e) => setSearch(e.nativeEvent.text),
      },
    });
  }, [navigation, setSearch]);

  const searchQuery = useSubsonicQuery({
    ...subsonicQueries.search({ query: debounceSearch }),
    enabled: !!debounceSearch,
  });

  const data = searchQuery.data;

  if (searchQuery.isLoading) {
    return null;
  }

  if (_ === "") {
    return (
      // <ThemedSafeAreaView style={{ flex: 1 }}>
      <Host style={{ flex: 1 }}>
        <List>
          <Section title="Recently Searched">
            <HStack>
              <Text>hell</Text>
            </HStack>
            <HStack>
              <Text>hell</Text>
            </HStack>
          </Section>
        </List>
      </Host>
      // </ThemedSafeAreaView>
    );
  }

  if (!data?.album && !data?.artist && !data?.song) {
    return (
      <ThemedSafeAreaView>
        <ThemedText>NOTHING FOUND</ThemedText>
      </ThemedSafeAreaView>
    );
  }

  return (
    <Host style={{ flex: 1 }}>
      <List>
        {data?.song && data.song.length > 0 && (
          <Section title="Songs">
            {data.song.map((song) => (
              <ListItem
                key={song.id}
                href={{
                  //TODO: navigate and start playing or start playing?
                  pathname:
                    "/(tabs)/artists/[artistId]/albums/[albumId]/tracks",
                  params: { albumId: song.albumId, artistId: song.artistId },
                }}
                title={song.title}
                subtitle={`Song · ${song.artist}`}
                coverId={song.id}
              />
            ))}
          </Section>
        )}
        {data?.album && data.album.length > 0 && (
          <Section title="Albums">
            {data.album.map((album) => (
              <ListItem
                key={album.id}
                href={{
                  pathname:
                    "/(tabs)/artists/[artistId]/albums/[albumId]/tracks",
                  params: { albumId: album.id, artistId: album.artistId! },
                }}
                title={album.title}
                subtitle={`Album · ${album.artist}`}
                coverId={album.id}
              />
            ))}
          </Section>
        )}
        {data?.artist && data.artist.length > 0 && (
          <Section title="Artists">
            {data.artist.map((artist) => (
              <ListItem
                key={artist.id}
                href={{
                  pathname: "/(tabs)/artists/[artistId]/albums",
                  params: { artistId: artist.id },
                }}
                title={artist.name}
                subtitle="Artist"
                coverId={artist.id}
              />
            ))}
          </Section>
        )}
      </List>
    </Host>
  );
}
