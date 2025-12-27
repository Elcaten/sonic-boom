import { SongProgress } from "@/components/CircularProgress";
import { CoverArt } from "@/components/CoverArt";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import {
  useEnsureSubsonicQuery,
  useSubsonicQuery,
} from "@/hooks/use-subsonic-query";
import { useThemeColor } from "@/hooks/use-theme-color";
import { subsonicQueries } from "@/utils/subsonicQueries";
import { subsonicTrackPlayer } from "@/utils/subsonicTrackPlayer";
import Ionicons from "@expo/vector-icons/Ionicons";
import Slider from "@react-native-community/slider";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import TrackPlayer, {
  useActiveTrack,
  useIsPlaying,
  useProgress,
} from "react-native-track-player";

export default function AlbumTracks() {
  const { albumId, artistId } =
    useLocalSearchParams<"/(tabs)/artists/[artistId]/albums/[albumId]/tracks">();

  const albumQuery = useSubsonicQuery({
    queryKey: ["albums", artistId, albumId],
    callApi: (api) => api.getAlbum({ id: albumId }),
  });

  const iconColor = useThemeColor({}, "icon");
  const textPrimary = useThemeColor({}, "textPrimary");
  const textSecondary = useThemeColor({}, "textSecondary");
  const separator = useThemeColor({}, "separator");

  const { playing, bufferingDuringPlay } = useIsPlaying();
  const { position, buffered, duration } = useProgress();
  const activeTrack = useActiveTrack();

  const ensureQuery = useEnsureSubsonicQuery();
  const handlePlayPress = async (trackId: string) => {
    //TODO: handle errors
    if (trackId === activeTrack?.id) {
      if (bufferingDuringPlay) {
        return;
      }

      if (playing) {
        TrackPlayer.pause();
      } else {
        TrackPlayer.play();
      }
      return;
    }

    const [streamUrl, coverArtUrl, song] = await Promise.all([
      ensureQuery(subsonicQueries.streamUrl(trackId)),
      ensureQuery(subsonicQueries.coverArtUrl(trackId, 64)),
      ensureQuery(subsonicQueries.song(trackId)),
    ]);

    await TrackPlayer.reset();
    await subsonicTrackPlayer.add({
      id: trackId,
      url: streamUrl,
      title: song.song.title,
      artist: song.song.artist,
      artistId: song.song.artistId,
      album: song.song.album,
      albumId: song.song.albumId,
      artwork: coverArtUrl,
    });
    TrackPlayer.play();
  };

  const navigation = useNavigation();
  useEffect(() => {
    if (albumQuery.data?.album.artist) {
      navigation.setOptions({
        headerTitle: albumQuery.data?.album.artist,
      });
    }
  }, [albumQuery.data?.album.artist, navigation]);

  return (
    <View>
      <View style={{ marginHorizontal: 16 }}>
        <Slider
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onSlidingComplete={(time) => TrackPlayer.seekTo(time)}
          tapToSeek={true}
        />
      </View>
      <FlatList
        data={albumQuery.data?.album.song ?? []}
        ListHeaderComponent={
          <View style={{ padding: 16, alignItems: "center" }}>
            <CoverArt id={albumId} size={256} elevated />
          </View>
        }
        renderItem={({ item }) => {
          const isActive = item.id === activeTrack?.id;
          const activeColor = Colors.light.tint;
          return (
            <TouchableOpacity
              disabled={bufferingDuringPlay}
              onPress={() => handlePlayPress(item.id)}
              style={{
                padding: 12,
                paddingHorizontal: 16,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderColor: separator,
              }}
            >
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {isActive && (
                    <View style={{ position: "relative" }}>
                      <Ionicons
                        name={playing ? "pause-sharp" : "play-sharp"}
                        size={12}
                        color={activeColor}
                        style={{
                          position: "absolute",
                          top: 6,
                          left: 7,
                          color: "red",
                        }}
                      />
                      <SongProgress progress={position / duration} size={24} />
                    </View>
                  )}
                  {!isActive && (
                    <ThemedText style={{ color: textSecondary }}>
                      {item.track}
                    </ThemedText>
                  )}
                </View>
                <ThemedText>{item.title}</ThemedText>
              </View>
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={ListFooter}
      />
    </View>
  );
}

function ListFooter() {
  //TODO: correctly account for tabs + floating player
  return <View style={{ height: 200 }}></View>;
}
