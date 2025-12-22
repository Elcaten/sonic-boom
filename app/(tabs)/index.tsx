import * as Crypto from 'expo-crypto';
import { Image } from 'expo-image';
import { Button, StyleSheet, View } from 'react-native';
import { Child, SubsonicAPI } from "subsonic-api";

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { useCallback, useEffect, useState } from 'react';
import TrackPlayer from 'react-native-track-player';

function CoverArt({ track }: { track: Child }) {
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
  }, []);


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
    style={{ width: 128, height: 128 }}
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

function SubsonicComponent() {
  const getApi = useGetApi()

  const [data, setData] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
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

  useEffect(() => {
    fetchData();
  }, []);


  if (loading) {
    return <ThemedText>Loading...</ThemedText>

  }
  if (error) {
    return <ThemedText>error: {error}</ThemedText>
  }

  if (!data) {
    return <ThemedText>Couldnt get random song</ThemedText>
  }

  return <View style={{ gap: 64 }}>
    <View style={{ flexDirection: "row", gap: 32 }}>
      <Button onPress={fetchData} disabled={loading} title='Refresh' />
      <Player track={data} />
    </View>
    <View>
      <CoverArt track={data} />
      <ThemedText>
        {data.artist} - {data.title}
      </ThemedText>
    </View>

  </View>

}

export default function HomeScreen() {
  const auth = useAuth()

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.stepContainer}>
        <Button title='Log out' onPress={() => auth.clearAll()} />
        <SubsonicComponent />
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
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
