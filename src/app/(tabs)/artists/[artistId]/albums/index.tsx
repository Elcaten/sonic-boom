import { ListItem } from "@/components/ListItem";
import { useSubsonicQuery } from "@/queries/use-subsonic-query";
import { formatDuration } from "@/utils/formatDuration";
import { ContentUnavailableView, Host, List } from "@expo/ui/swift-ui";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

export default function ArtistAlbums() {
  const { artistId } =
    useLocalSearchParams<"/(tabs)/artists/[artistId]/albums">();

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

  const artistQuery = useSubsonicQuery({
    queryKey: ["artist", artistId],
    callApi: (api) => api.getArtist({ id: artistId }),
  });

  const data = (artistQuery.data?.artist.album ?? []).filter((album) => {
    const sanitizedSearch = search.toLocaleLowerCase();
    return album.name.toLocaleLowerCase().includes(sanitizedSearch);
  });

  if (artistQuery.isLoading) {
    return (
      <Host style={{ flex: 1 }}>
        <ContentUnavailableView
          title={`Loading`}
          description="Wait"
          systemImage="hourglass.tophalf.fill"
        ></ContentUnavailableView>
      </Host>
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
      <List
        listStyle={
          Platform.OS === "ios"
            ? Platform.isPad
              ? "insetGrouped"
              : "grouped"
            : "sidebar"
        }
      >
        {data.map((item) => {
          const title = [item.name, item.year ? `(${item.year})` : null]
            .filter(Boolean)
            .join(" ");
          const subtitle = `${item.songCount} track(s) | ${formatDuration(
            item.duration
          )}`;
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
