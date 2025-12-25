import { ThemedSafeAreaView } from "@/components/themed-safe-area-view";
import { ThemedText } from "@/components/themed-text";
import { useSubsonicQuery } from "@/hooks/use-subsonic-query";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, TouchableOpacity } from "react-native";

export default function AlbumTracks() {
  const { albumId, artistId } =
    useLocalSearchParams<"/(tabs)/artists/[artistId]/albums/[albumId]/tracks">();

  const albumQuery = useSubsonicQuery({
    queryKey: ["albums", artistId, albumId],
    callApi: (api) => api.getAlbum({ id: albumId }),
  });

  const iconColor = useThemeColor({}, "icon");

  const router = useRouter();

  return (
    <ThemedSafeAreaView>
      <FlatList
        data={albumQuery.data?.album.song ?? []}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              // router.navigate({
              //   pathname: "/(tabs)/artists/[artistId]/albums/[albumId]/tracks",
              //   params: { artistId: artistId, albumId: item.id },
              // })
            }}
            style={{
              padding: 12,
              borderBottomWidth: 1,
              borderColor: iconColor,
            }}
          >
            <ThemedText>{item.title}</ThemedText>
          </TouchableOpacity>
        )}
      ></FlatList>
    </ThemedSafeAreaView>
  );
}
