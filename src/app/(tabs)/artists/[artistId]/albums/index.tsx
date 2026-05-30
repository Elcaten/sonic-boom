import { ListItem } from "@/components/core/list-item";
import { pluralize } from "@/shared/lib/format/pluralize";
import { useRequiredQueries } from "@/shared/queries/queries-context";
import { ContentUnavailableView, Host, List, Section } from "@expo/ui/swift-ui";
import { frame, listStyle } from "@expo/ui/swift-ui/modifiers";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function ArtistAlbumsScreen() {
  const { artistId } = useLocalSearchParams<"/(tabs)/artists/[artistId]/albums">();

  const [search, setSearch] = useState("");

  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        autoCapitalize: "none",
        placeholder: "Search",
        onChangeText(e) {
          setSearch(e.nativeEvent.text);
        },
        onCancelButtonPress: () => {
          setSearch("");
        },
      },
    } satisfies ExtendedStackNavigationOptions);
  }, [navigation]);

  const queries = useRequiredQueries();
  const artistQuery = useQuery(queries.artist(artistId));

  const data = (artistQuery.data?.artist.album ?? [])
    .filter((album) => {
      const sanitizedSearch = search.toLocaleLowerCase();
      return album.name.toLocaleLowerCase().includes(sanitizedSearch);
    })
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));

  if (artistQuery.isPending) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <Host style={{ flex: 1 }}>
        <ContentUnavailableView
          title={`No results for ${search}`}
          description="Try a new search"
          systemImage="magnifyingglass"
        ></ContentUnavailableView>
      </Host>
    );
  }

  return (
    <Host style={{ flex: 1 }}>
      <List modifiers={[listStyle("automatic")]}>
        {data.map((item) => {
          const title = [item.name, item.year ? `(${item.year})` : null].filter(Boolean).join(" ");
          const subtitle = pluralize(item.songCount, "track");
          return (
            <ListItem
              key={item.id}
              href={{
                pathname: "/(tabs)/artists/[artistId]/albums/[albumId]/tracks",
                params: { artistId: artistId, albumId: item.id },
              }}
              title={title}
              subtitle={subtitle}
              coverId={item.id}
            />
          );
        })}
        {/* Padding to account for FloatingPlayer */}
        <Section modifiers={[frame({ height: 40 })]}>{null}</Section>
      </List>
    </Host>
  );
}
