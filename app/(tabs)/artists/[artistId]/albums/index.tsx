import { CoverArt } from "@/components/CoverArt";
import { useSubsonicQuery } from "@/hooks/use-subsonic-query";
import { formatDuration } from "@/utils/formatDuration";
import {
  Button,
  ContentUnavailableView,
  Host,
  HStack,
  Image,
  List,
  Spacer,
  Text,
  VStack,
} from "@expo/ui/swift-ui";
import { frame } from "@expo/ui/swift-ui/modifiers";
import { Link, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";

export default function ArtistAlbums() {
  const { artistId } =
    useLocalSearchParams<"/(tabs)/artists/[artistId]/albums">();

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

  const artistQuery = useSubsonicQuery({
    queryKey: ["artist", artistId],
    callApi: (api) => api.getArtist({ id: artistId }),
  });

  const data = (artistQuery.data?.artist.album ?? []).filter((album) => {
    const sanitizedSearch = search.toLocaleLowerCase();
    return album.name.toLocaleLowerCase().includes(sanitizedSearch);
  });

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
      <List listStyle="inset">
        {data.map((item) => {
          const title = [item.name, item.year ? `(${item.year})` : null]
            .filter(Boolean)
            .join(" ");
          const subtitle = `${item.songCount} track(s) | ${formatDuration(
            item.duration
          )}`;
          return (
            <Link
              href={{
                pathname: "/(tabs)/artists/[artistId]/albums/[albumId]/tracks",
                params: { artistId: artistId, albumId: item.id },
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
      </List>
    </Host>
  );
}
