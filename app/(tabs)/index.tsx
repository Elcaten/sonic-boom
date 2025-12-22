import * as Crypto from 'expo-crypto';
import { Image } from 'expo-image';
import { Button, ImageStyle, StyleProp, StyleSheet, View } from 'react-native';
import { Child, SubsonicAPI } from "subsonic-api";

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { useCallback, useEffect, useState } from 'react';
import TrackPlayer from 'react-native-track-player';

function CoverArt({ track, style }: { track: Child, style?: StyleProp<ImageStyle> }) {
  const getApi = useGetApi()

  const [data, setData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {

    try {
      setLoading(true);
      const api = await getApi()
      const coverArt = await api.getCoverArt({ id: track.id });
      setData(coverArt.url);
    } catch (err) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError(err.message as string);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [track.id]);


  if (loading) {
    return <ThemedText>Loading...</ThemedText>

  }
  if (error) {
    return <ThemedText>error: {error}</ThemedText>
  }

  if (!data) {
    return <ThemedText>Couldnt get cover</ThemedText>
  }

  return <Image
    source={data}
    style={[{ width: 256, height: 256, }, style]}
  />
}

function Player({ track }: { track: Child }) {
  const getApi = useGetApi()

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSong() {
      try {
        const api = await getApi()
        const stream = await api.stream({ id: track.id })
        const coverArt = await api.getCoverArt({ id: track.id });

        TrackPlayer.reset()
        TrackPlayer.add([{
          id: track.id,
          url: stream.url,
          title: track.title,
          artist: track.artist,
          artwork: coverArt.url
        }])
      } catch (err) {

        if (err && typeof err === 'object' && 'message' in err) {
          setError(err.message as string);
        } else {
          setError('An unknown error occurred');
        }
      }
    }

    fetchSong()
  }, [track.id])


  if (error) {
    return <ThemedText>error: {error}</ThemedText>
  }

  return (
    <View style={{ flexDirection: "row", gap: 32 }}>
      <Button title="Play" onPress={() => {
        TrackPlayer.play()
      }} />
      <Button title="Stop" onPress={() => {
        TrackPlayer.pause()
        TrackPlayer.seekTo(0);
      }} />

    </View>
  );
}

function useGetApi() {
  const auth = useAuth()

  if (!auth.serverAddress || !auth.password || !auth.username) {
    throw new Error("invalid config: server address username or password are missing")
  }

  const getApi = useCallback(async () => {
    const randomBytes = await Crypto.getRandomBytesAsync(16);

    const salt = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const api = new SubsonicAPI({
      url: auth.serverAddress,
      auth: {
        username: auth.username,
        password: auth.password,
      },
      salt: salt,
      reuseSalt: true
    });

    return api
  }, [auth.password, auth.username, auth.serverAddress])

  return getApi
}

function useFetchRandomTrack() {
  const getApi = useGetApi()

  const [data, setData] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const trigger = async () => {
    const api = await getApi()

    try {
      setLoading(true);
      const { randomSongs } = await api.getRandomSongs({ size: 1 });
      setData(randomSongs.song?.[0] ?? null);
    } catch (err) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError(err.message as string);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    trigger
  }
}

function SubsonicComponent({ track, loading, error, onRefreshClick }: { track: Child | null, loading: boolean, error: string | null, onRefreshClick: () => void }) {
  if (loading) {
    return <ThemedText>Loading...</ThemedText>

  }
  if (error) {
    return <ThemedText>error: {error}</ThemedText>
  }

  if (!track) {
    return <ThemedText>Couldnt get random song</ThemedText>
  }

  return <View style={{ flexDirection: "row", gap: 32 }}>
    <Button onPress={onRefreshClick} disabled={loading} title='Refresh' />
    <Player track={track} />
  </View>

}

export default function HomeScreen() {
  const auth = useAuth()
  const { trigger, loading, error, data } = useFetchRandomTrack()

  useEffect(() => {
    trigger();
  }, []);


  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        data ?
          <View style={{}}>
            <CoverArt track={data} />
            <View style={{ position: "absolute", right: 0, top: 0, padding: 32 }}>
              <ThemedText type='title'>{data.title}</ThemedText>
              <ThemedText type='title'>{data.artist}</ThemedText>
            </View>
          </View> : <></>
      }>
      <ThemedView style={styles.stepContainer}>
        <Button title='Log out' onPress={() => auth.clearAll()} />
        <SubsonicComponent loading={loading} error={error} track={data} onRefreshClick={trigger} />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
});
