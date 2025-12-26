import { CoverArt } from "@/components/CoverArt";
import { ListItem } from "@/components/ListItem";
import { ThemedSafeAreaView } from "@/components/themed-safe-area-view";
import { useSubsonicQuery } from "@/hooks/use-subsonic-query";
import { formatDuration } from "@/utils/formatDuration";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, TouchableOpacity } from "react-native";

export default function ArtistAlbums() {
  const { artistId } =
    useLocalSearchParams<"/(tabs)/artists/[artistId]/albums">();

  const artistQuery = useSubsonicQuery({
    queryKey: ["artist", artistId],
    callApi: (api) => api.getArtist({ id: artistId }),
  });

  const router = useRouter();

  const data = artistQuery.data?.artist.album ?? [];

  return (
    <ThemedSafeAreaView>
      <FlatList
        data={data}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() =>
              router.navigate({
                pathname: "/(tabs)/artists/[artistId]/albums/[albumId]/tracks",
                params: { artistId: artistId, albumId: item.id },
              })
            }
          >
            <ListItem
              leftAddon={<CoverArt id={item.id} size={64} />}
              title={`${item.name} (${item.year})`}
              subtitle={`${item.songCount} track(s) | ${formatDuration(
                item.duration
              )}`}
              isLastItem={index === data.length - 1}
            />
          </TouchableOpacity>
        )}
      ></FlatList>
    </ThemedSafeAreaView>
  );
}
