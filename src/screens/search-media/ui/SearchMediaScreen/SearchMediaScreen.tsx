import { SearchItem } from "@/features/search-media/model/types";
import { useSearchMedia } from "@/features/search-media/model/use-search-media";
import { SearchMediaList } from "@/features/search-media/ui/search-media-list";
import { useNavigation } from "expo-router";
import { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient";
import { useEffect } from "react";

export function SearchScreen() {
  const navigation = useNavigation();
  const search = useSearchMedia();

  // 1. Setup the Native App Header integration
  useEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: "Search",
        onChangeText: (e) => search.setQuery(e.nativeEvent.text),
      },
    } satisfies ExtendedStackNavigationOptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  // 2. Define your app's specific routing logic
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

  // 3. Compose the Feature
  return <SearchMediaList search={search} resolveHref={resolveHref} />;
}
