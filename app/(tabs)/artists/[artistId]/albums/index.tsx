import { CoverArt } from "@/components/CoverArt";
import { ThemedSafeAreaView } from "@/components/themed-safe-area-view";
import { ThemedText } from "@/components/themed-text";
import { useSubsonicQuery } from "@/hooks/use-subsonic-query";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, TouchableOpacity, View } from "react-native";

export default function ArtistAlbums() {
  const { artistId } =
    useLocalSearchParams<"/(tabs)/artists/[artistId]/albums">();

  const artistQuery = useSubsonicQuery({
    queryKey: ["artist", artistId],
    callApi: (api) => api.getArtist({ id: artistId }),
  });

  const iconColor = useThemeColor({}, "icon");

  const router = useRouter();

  return (
    <ThemedSafeAreaView>
      <FlatList
        data={artistQuery.data?.artist.album ?? []}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.navigate({
                pathname: "/(tabs)/artists/[artistId]/albums/[albumId]/tracks",
                params: { artistId: artistId, albumId: item.id },
              })
            }
            style={{
              padding: 12,
              borderBottomWidth: 1,
              borderColor: iconColor,
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <CoverArt id={item.id} size={64} />
              <View>
                <ThemedText>
                  {item.name} ({item.year})
                </ThemedText>
                <ThemedText>
                  {item.songCount} track(s) | {item.duration} minute(s)
                </ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        )}
      ></FlatList>
    </ThemedSafeAreaView>
  );
}
