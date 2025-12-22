import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSetupTrackPlayer } from '@/hooks/use-setup-track-player';
import { playbackService } from '@/utils/playbackService';
import { setAudioModeAsync } from 'expo-audio';
import TrackPlayer from 'react-native-track-player';

export const unstable_settings = {
  anchor: '(tabs)',
};

setAudioModeAsync({
  playsInSilentMode: true,
  shouldPlayInBackground: true,
  interruptionMode: 'mixWithOthers'
});

TrackPlayer.registerPlaybackService(() => playbackService);

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useSetupTrackPlayer({ onLoad: () => { } })

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
