import { CoverArt } from "@/components/CoverArt";
import { ThemedText } from "@/components/themed-text";
import { TrackProgressIndicator } from "@/components/TrackProgressIndicator";
import {
  useEnsureSubsonicQuery,
  useSubsonicQuery,
} from "@/hooks/use-subsonic-query";
import { useThemeColor } from "@/hooks/use-theme-color";
import { subsonicQueries } from "@/utils/subsonicQueries";
import {
  SubsonicTrack,
  subsonicTrackPlayer,
} from "@/utils/subsonicTrackPlayer";
import { useLocalSearchParams } from "expo-router";
import React from "react";
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
  const albumData = albumQuery.data?.album.song ?? [];

  const textSecondary = useThemeColor({}, "textSecondary");
  const separator = useThemeColor({}, "separator");

  const { playing, bufferingDuringPlay } = useIsPlaying();
  const { position, duration } = useProgress();
  //TODO: fix typing
  const activeTrack = useActiveTrack() as SubsonicTrack;

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

    await TrackPlayer.reset();

    const startIndex = albumData.findIndex((song) => song.id === trackId);
    const albumSlice = albumData.slice(startIndex);

    const tracksToAdd: SubsonicTrack[] = [];
    for (const song of albumSlice) {
      const streamUrl = await ensureQuery(subsonicQueries.streamUrl(song.id));
      const coverArtUrl = await ensureQuery(
        subsonicQueries.coverArtUrl(song.id, 64)
      );
      tracksToAdd.push({
        id: song.id,
        url: streamUrl,
        title: song.title,
        artist: song.artist,
        artistId: song.artistId,
        album: song.album,
        albumId: song.albumId,
        artwork: coverArtUrl,
      });
    }

    await subsonicTrackPlayer.add(...tracksToAdd);

    TrackPlayer.play();
  };

  return (
    <View>
      <FlatList
        data={albumData}
        keyExtractor={(child) => child.id}
        ListHeaderComponent={
          <View style={{ padding: 16, alignItems: "center" }}>
            <CoverArt id={albumId} size={320} elevated />
          </View>
        }
        renderItem={({ item }) => {
          const isActive = item.id === activeTrack?.id;

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
                    <TrackProgressIndicator
                      isPlaying={!!playing}
                      progress={position / duration}
                      trackNumber={item.track!}
                    />
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
