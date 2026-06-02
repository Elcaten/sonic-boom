import { useNavigation } from "expo-router";
import { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient";
import { useEffect } from "react";
import { SearchItem } from "../types";
import { useSearchMedia } from "../hooks";
import { SearchMediaList } from "./SearchMediaList";

export default function SearchScreen() {
  const navigation = useNavigation();
  const search = useSearchMedia();

  useEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: "Search",
        onChangeText: (e) => search.setQuery(e.nativeEvent.text),
      },
    } satisfies ExtendedStackNavigationOptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  const resolveHref = (item: SearchItem) => {
    switch (item.type) {
      case "Song":
        return {
          pathname: "/(tabs)/artists/[artistId]/albums/[albumId]/tracks",
          params: { albumId: item.song.albumId, artistId: item.song.artistId },
        };
      case "Album":
        return {
          pathname: "/(tabs)/artists/[artistId]/albums/[albumId]/tracks",
          params: { albumId: item.album.id, artistId: item.album.artistId! },
        };
      case "Artist":
        return {
          pathname: "/(tabs)/artists/[artistId]/albums",
          params: { artistId: item.artist.id },
        };
    }
  };

  return <SearchMediaList search={search} resolveHref={resolveHref} />;
}
