import { CoverArt } from "@/components/CoverArt";
import { ThemedSafeAreaView } from "@/components/themed-safe-area-view";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import {
  useEnsureSubsonicQuery,
  useSubsonicQuery,
} from "@/hooks/use-subsonic-query";
import { useThemeColor } from "@/hooks/use-theme-color";
import { formatDuration } from "@/utils/formatDuration";
import { subsonicQueries } from "@/utils/subsonicQueries";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import TrackPlayer, {
  Event,
  State,
  Track,
  usePlaybackState,
  usePlayWhenReady,
  useProgress,
  useTrackPlayerEvents,
} from "react-native-track-player";

export default function AlbumTracks() {
  const { albumId, artistId } =
    useLocalSearchParams<"/(tabs)/artists/[artistId]/albums/[albumId]/tracks">();

  const albumQuery = useSubsonicQuery({
    queryKey: ["albums", artistId, albumId],
    callApi: (api) => api.getAlbum({ id: albumId }),
  });

  const iconColor = useThemeColor({}, "icon");

  const [playError, setPlayError] = useState("");

  const playWhenReady = usePlayWhenReady();
  const playbackState = usePlaybackState();
  const playButtonState =
    playWhenReady &&
    (playbackState.state === State.Loading ||
      playbackState.state === State.Buffering)
      ? "loading"
      : playWhenReady &&
        !(
          playbackState.state === State.Error ||
          playbackState.state === State.Buffering
        )
      ? "playing"
      : "paused";
  const [activeTrack, setActiveTrack] = useState<Track | undefined>(undefined);
  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], (data) => {
    setActiveTrack(data.track);
  });
  const { position, buffered, duration } = useProgress();

  const ensureQuery = useEnsureSubsonicQuery();
  const handlePlayPress = async (trackId: string) => {
    try {
      if (trackId === activeTrack?.id) {
        if (playButtonState === "playing") {
          TrackPlayer.pause();
        } else if (playButtonState === "paused") {
          TrackPlayer.play();
        }
        return;
      }

      setPlayError("");
      const [streamUrl, coverArtUrl, song] = await Promise.all([
        ensureQuery(subsonicQueries.streamUrl(trackId)),
        ensureQuery(subsonicQueries.coverArtUrl(trackId, 64)),
        ensureQuery(subsonicQueries.song(trackId)),
      ]);

      await TrackPlayer.reset();
      await TrackPlayer.add([
        {
          id: trackId,
          url: streamUrl,
          title: song.song.title,
          artist: song.song.artist,
          artwork: coverArtUrl,
        },
      ]);
      TrackPlayer.play();
    } catch (e) {
      if (
        e &&
        typeof e === "object" &&
        "message" in e &&
        typeof e.message === "string"
      ) {
        setPlayError(e.message);
      } else {
        setPlayError(JSON.stringify(e, null, 2));
      }
    }
  };

  const handleSeek = (time: number) => {
    console.log("seek to ", time, "(total: ", duration, " ), curr: ", position);

    TrackPlayer.seekTo(time);
  };

  return (
    <ThemedSafeAreaView>
      {playError && (
        <ThemedText type="title" style={{ color: "red" }}>
          {playError}
        </ThemedText>
      )}

      <Slider
        minimumValue={0}
        maximumValue={duration}
        value={position}
        onSlidingComplete={(time) => TrackPlayer.seekTo(time)}
        tapToSeek={true}
      />
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
              disabled={playButtonState === "loading"}
              onPress={() => handlePlayPress(item.id)}
              style={{
                padding: 12,
                borderBottomWidth: 1,
                borderColor: isActive ? activeColor : iconColor,
              }}
            >
              <View style={{ flexDirection: "row", gap: 12 }}>
                {playButtonState === "loading" && (
                  <Ionicons name="play" size={24} color={iconColor} />
                )}
                {playButtonState === "paused" && (
                  <Ionicons
                    name="play"
                    size={24}
                    color={isActive ? activeColor : iconColor}
                  />
                )}
                {playButtonState === "playing" &&
                  (isActive ? (
                    <Ionicons name="pause" size={24} color={activeColor} />
                  ) : (
                    <Ionicons name="play" size={24} color={iconColor} />
                  ))}

                <ThemedText
                  style={{ color: isActive ? activeColor : iconColor }}
                >
                  {item.title} |{" "}
                  {item.duration && formatDuration(item.duration)}
                </ThemedText>
              </View>
            </TouchableOpacity>
          );
        }}
      ></FlatList>
    </ThemedSafeAreaView>
  );
}
