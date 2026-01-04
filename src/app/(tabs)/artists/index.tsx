import { ListItem } from "@/components/ListItem";
import { useSubsonicQuery } from "@/queries/use-subsonic-query";
import { ContentUnavailableView, Host, List, Section } from "@expo/ui/swift-ui";
import { useNavigation } from "expo-router";
import { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { ArtistID3 } from "subsonic-api";

export default function ArtistsScreen() {
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

  const artistsQuery = useSubsonicQuery({
    queryKey: ["artists"],
    callApi: (api) => api.getArtists(),
  });

  const sanitizedSearch = search.toLocaleLowerCase();
  const _data = (
    artistsQuery.data?.artists.index?.flatMap((section) =>
      (section.artist ?? []).map((artist) => ({
        artist,
        section: section.name,
      }))
    ) ?? []
  )
    .filter((artist) => artist.artist.name.toLocaleLowerCase().includes(sanitizedSearch))
    .reduce<Record<string, ArtistID3[]>>((acc, curr) => {
      if (!acc[curr.section]) {
        acc[curr.section] = [];
      }
      acc[curr.section].push(curr.artist);
      return acc;
    }, {});

  const data = Object.keys(_data).map((section) => ({
    title: section,
    data: _data[section as keyof typeof _data],
  }));

  if (artistsQuery.isLoading) {
    return (
      <Host style={{ flex: 1 }}>
        <ContentUnavailableView
          title={`Loading`}
          description="Wait"
          systemImage="progress.indicator"
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
          Platform.OS === "ios" ? (Platform.isPad ? "insetGrouped" : "grouped") : "automatic"
        }
      >
        {data.map((item) => {
          return (
            <Section key={item.title} title={item.title}>
              {item.data.map((item) => {
                const title = item.name;
                const subtitle = `${item.albumCount} album(s)`;
                return (
                  <ListItem
                    key={item.id}
                    href={{
                      pathname: "/(tabs)/artists/[artistId]/albums",
                      params: { artistId: item.id },
                    }}
                    coverId={item.id}
                    title={title}
                    subtitle={subtitle}
                  />
                );
              })}
            </Section>
          );
        })}
      </List>
    </Host>
  );
}
