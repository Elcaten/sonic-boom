import { CoverArt } from "@/components/CoverArt";
import { useSubsonicQuery } from "@/hooks/use-subsonic-query";
import {
  Button,
  ContentUnavailableView,
  Host,
  HStack,
  Image,
  List,
  Section,
  Spacer,
  Text,
  VStack,
} from "@expo/ui/swift-ui";
import { frame } from "@expo/ui/swift-ui/modifiers";
import { Link, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { ArtistID3 } from "subsonic-api";

export default function ArtistsScreen() {
  const [search, setSearch] = useState("");

  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        autoCapitalize: false,
        placeholder: "Search",
        onChangeText(e) {
          console.log(e.nativeEvent);
          setSearch(e.nativeEvent.text);
        },
        onCancelButtonPress: () => {
          setSearch("");
        },
      },
    });
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
    .filter((artist) =>
      artist.artist.name.toLocaleLowerCase().includes(sanitizedSearch)
    )
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
      <List listStyle="grouped">
        {data.map((item) => {
          return (
            <Section key={item.title} title={item.title}>
              {item.data.map((item) => {
                const title = item.name;
                const subtitle = `${item.albumCount} album(s)`;
                return (
                  <Link
                    href={{
                      pathname: "/(tabs)/artists/[artistId]/albums",
                      params: { artistId: item.id },
                    }}
                    asChild
                    key={item.id}
                  >
                    <Button>
                      <HStack spacing={16}>
                        <VStack modifiers={[frame({ width: 64, height: 64 })]}>
                          <CoverArt id={item.id} size={64} />
                        </VStack>
                        <VStack alignment="leading" spacing={2}>
                          <Text color="primary" lineLimit={1}>
                            {title}
                          </Text>
                          <Text color="secondary">{subtitle}</Text>
                        </VStack>
                        <Spacer />
                        <Image
                          systemName="chevron.right"
                          size={14}
                          color="secondary"
                        />
                      </HStack>
                    </Button>
                  </Link>
                );
              })}
            </Section>
          );
        })}
      </List>
    </Host>
  );
}
