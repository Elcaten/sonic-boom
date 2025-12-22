import { useAudioPlayer } from 'expo-audio';
import * as Crypto from 'expo-crypto';
import { Image } from 'expo-image';
import { Button, Platform, StyleSheet, View } from 'react-native';
import { Child, SubsonicAPI } from "subsonic-api";

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

function Player({ id }: { id: string }) {
  const [error, setError] = useState<string | null>(null);
  const setupComplete = useRef(false)

  const player = useAudioPlayer();

  useEffect(() => {
    async function fetchSong() {
      try {
        const api = await getApi()
        const stream = await api.stream({ id })

        player.replace(stream.url)
      } catch (err) {

        if (err && typeof err === 'object' && 'message' in err) {
          setError(err.message as string);
        } else {
          setError('An unknown error occurred');
        }
      }
    }

    fetchSong()
  }, [id])


  if (error) {
    return <ThemedText>error: {error}</ThemedText>
  }

  return (
    <View>
      <Button title="Play Sound" onPress={() => {
        player.play()
      }} />
      <Button title="Stop" onPress={() => {
        player.pause()
        player.seekTo(0);
      }} />

    </View>
  );
}

async function getApi() {
  const randomBytes = await Crypto.getRandomBytesAsync(16);

  const salt = Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  const api = new SubsonicAPI({
    url: process.env.EXPO_PUBLIC_NAVIDROME_HOST!,
    auth: {
      username: process.env.EXPO_PUBLIC_NAVIDROME_USERNAME!,
      password: process.env.EXPO_PUBLIC_NAVIDROME_PASSWORD!,
    },
    salt: salt,
    reuseSalt: true
  });

  return api
}

function SubsonicComponent() {
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

  return <View>
    <View style={{ flexDirection: "row" }}>
      <ThemedText>
        {data.artist} -  {data.title}
      </ThemedText>
      <Button onPress={fetchData} disabled={loading} title='🔄' />
    </View>
    <Player id={data.id} />
  </View>

}

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <SubsonicComponent />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert('Share pressed')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert('Delete pressed')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
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
