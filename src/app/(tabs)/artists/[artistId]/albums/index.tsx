import { ListItem } from "@/components/ListItem";
import { useRequiredQueries } from "@/context/app-context";
import { formatDuration } from "@/utils/formatDuration";
import { isIOSVersion } from "@/utils/is-ios-version";
import { ContentUnavailableView, Host, List } from "@expo/ui/swift-ui";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function ArtistAlbums() {
  const { artistId } = useLocalSearchParams<"/(tabs)/artists/[artistId]/albums">();

  const [search, setSearch] = useState("");

  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        autoCapitalize: "none",
        placeholder: "Search",
        placement: isIOSVersion(26) ? "integratedButton" : "automatic",
        hideWhenScrolling: false,
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

  const data = (artistQuery.data?.artist.album ?? []).filter((album) => {
    const sanitizedSearch = search.toLocaleLowerCase();
    return album.name.toLocaleLowerCase().includes(sanitizedSearch);
  });

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
      <List listStyle={"automatic"}>
        {data.map((item) => {
          const title = [item.name, item.year ? `(${item.year})` : null].filter(Boolean).join(" ");
          const subtitle = `${item.songCount} track(s) | ${formatDuration(item.duration)}`;
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
      </List>
    </Host>
  );
}
