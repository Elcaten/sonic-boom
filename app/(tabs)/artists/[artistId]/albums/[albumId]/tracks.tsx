import { ThemedSafeAreaView } from "@/components/themed-safe-area-view";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import {
  useEnsureSubsonicQuery,
  useSubsonicQuery,
} from "@/hooks/use-subsonic-query";
import { useThemeColor } from "@/hooks/use-theme-color";
import { subsonicQueries } from "@/utils/subsonicQueries";
import { Ionicons } from "@expo/vector-icons";
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
  const tintColor = useThemeColor({}, "tint");

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

  return (
    <ThemedSafeAreaView>
      {playError && (
        <ThemedText type="title" style={{ color: "red" }}>
          {playError}
        </ThemedText>
      )}
      <ThemedText>
        <View
          style={{
            flexDirection: "row",
            height: 32,
            width: "100%",
            backgroundColor: iconColor,
            position: "relative",
          }}
        >
          <View
            style={{
              width: (buffered / duration) * 100,
              height: 32,
              backgroundColor: "green",
              left: 0,
              position: "absolute",
            }}
          ></View>
          <View
            style={{
              width: (position / duration) * 100,
              height: 32,
              backgroundColor: tintColor,
              left: 0,
              position: "absolute",
            }}
          ></View>
          <View
            style={{
              position: "absolute",
              inset: 0,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ThemedText type="defaultSemiBold">
              {formatDuration(position)} / {formatDuration(duration)}
            </ThemedText>
          </View>
        </View>
      </ThemedText>
      <FlatList
        data={albumQuery.data?.album.song ?? []}
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

const formatDuration = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};
