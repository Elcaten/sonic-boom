import { Button, View } from "react-native";
import { Child } from "subsonic-api";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/auth-context";
import { useSubsonicQuery } from "@/hooks/use-subsonic-query";
import { subsonicQueries } from "@/utils/subsonicQueries";
import { useEffect } from "react";
import TrackPlayer from "react-native-track-player";
import { CoverArt } from "../../components/CoverArt";

function Player({ track }: { track: Child }) {
  const streamUrlQuery = useSubsonicQuery(subsonicQueries.streamUrl(track.id));
  const coverArtQuery = useSubsonicQuery({
    queryKey: ["cover-art", track.id],
    callApi: (api) => api.getCoverArt({ id: track.id }),
  });

  useEffect(() => {
    if (
      !streamUrlQuery.data ||
      streamUrlQuery.isLoading ||
      coverArtQuery.isLoading
    ) {
      return;
    }

    TrackPlayer.add([
      {
        id: track.id,
        url: streamUrlQuery.data,
        title: track.title,
        artist: track.artist,
        artwork: coverArtQuery.data?.url,
      },
    ]);

    return () => {
      TrackPlayer.reset();
    };
  }, [
    coverArtQuery.data?.url,
    coverArtQuery.isLoading,
    streamUrlQuery.data,
    streamUrlQuery.isLoading,
    track.artist,
    track.id,
    track.title,
  ]);

  if (streamUrlQuery.error) {
    return (
      <ThemedText>stream error: {streamUrlQuery.error.message}</ThemedText>
    );
  }

  return (
    <View style={{ flexDirection: "row", gap: 32 }}>
      <Button
        title="Play"
        onPress={() => {
          TrackPlayer.play();
        }}
      />
      <Button
        title="Stop"
        onPress={() => {
          TrackPlayer.pause();
          TrackPlayer.seekTo(0);
        }}
      />
    </View>
  );
}

function SubsonicComponent({
  track,
  loading,
  error,
  onRefreshClick,
}: {
  track: Child | null | undefined;
  loading: boolean;
  error: string | null | undefined;
  onRefreshClick: () => void;
}) {
  if (loading) {
    return <ThemedText>Loading...</ThemedText>;
  }
  if (error) {
    return <ThemedText>error: {error}</ThemedText>;
  }

  if (!track) {
    return <ThemedText>Couldnt get random song</ThemedText>;
  }

  return (
    <View style={{ flexDirection: "row", gap: 32 }}>
      <Button onPress={onRefreshClick} disabled={loading} title="Refresh" />
      <Player track={track} />
    </View>
  );
}

export default function HomeScreen() {
  const auth = useAuth();
  const randomTrackQuery = useSubsonicQuery({
    queryKey: ["random-track"],
    callApi: (api) =>
      api
        .getRandomSongs({ size: 1 })
        .then(({ randomSongs }) => randomSongs.song?.[0] ?? null),
  });

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        randomTrackQuery.data ? (
          <View>
            <CoverArt id={randomTrackQuery.data.id} size={256} />
            <View
              style={{ position: "absolute", right: 0, top: 0, padding: 32 }}
            >
              <ThemedText type="title">
                {randomTrackQuery.data.title}
              </ThemedText>
              <ThemedText type="title">
                {randomTrackQuery.data.artist}
              </ThemedText>
            </View>
          </View>
        ) : (
          <></>
        )
      }
    >
      <ThemedView>
        <Button title="Log out" onPress={() => auth.clearAll()} />
        <SubsonicComponent
          loading={randomTrackQuery.isLoading}
          error={randomTrackQuery.error?.message}
          track={randomTrackQuery.data}
          onRefreshClick={randomTrackQuery.refetch}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}
