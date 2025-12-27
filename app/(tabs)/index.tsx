import { CoverArt } from "@/components/CoverArt";
import { ThemedSafeAreaView } from "@/components/themed-safe-area-view";
import { ThemedText } from "@/components/themed-text";
import {
  useEnsureSubsonicQuery,
  useSubsonicQuery,
} from "@/hooks/use-subsonic-query";
import { subsonicQueries } from "@/utils/subsonicQueries";
import { subsonicTrackPlayer } from "@/utils/subsonicTrackPlayer";
import Slider from "@react-native-community/slider";
import { useEffect } from "react";
import { Button, View } from "react-native";
import TrackPlayer, { useProgress } from "react-native-track-player";

export default function HomeScreen() {
  const ensureQuery = useEnsureSubsonicQuery();
  const randomSongQuery = useSubsonicQuery(subsonicQueries.randomSong());
  const randomSong = randomSongQuery.data?.randomSongs.song?.[0];

  useEffect(() => {
    const effect = async () => {
      if (!randomSong?.id) {
        return;
      }

      const [streamUrl, coverArtUrl, song] = await Promise.all([
        ensureQuery(subsonicQueries.streamUrl(randomSong.id)),
        ensureQuery(subsonicQueries.coverArtUrl(randomSong.id, 64)),
        ensureQuery(subsonicQueries.song(randomSong.id)),
      ]);

      await TrackPlayer.reset();
      await subsonicTrackPlayer.add({
        id: randomSong.id,
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

    effect();
  }, [ensureQuery, randomSong?.id]);

  const { position, buffered, duration } = useProgress();

  return (
    <ThemedSafeAreaView>
      <View style={{ padding: 32, alignItems: "center", gap: 16 }}>
        {<CoverArt id={randomSong?.id!} size={256} elevated />}
        <View style={{ flexDirection: "row" }}>
          <ThemedText>
            {randomSong?.artist} - {randomSong?.title}
          </ThemedText>
        </View>
      </View>
      <View style={{ paddingHorizontal: 64 }}>
        <Slider
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onSlidingComplete={(time) => TrackPlayer.seekTo(time)}
          tapToSeek={true}
        />
      </View>
      <View style={{ paddingHorizontal: 64 }}>
        <Button
          title="random track"
          onPress={() => randomSongQuery.refetch()}
        />
      </View>
    </ThemedSafeAreaView>
  );
}
