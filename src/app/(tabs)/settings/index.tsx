import { PrefetchAllAlbumImages } from "@/components/Prefetcher";
import { ThemedSafeAreaView } from "@/components/themed/themed-safe-area-view";
import { ThemedText } from "@/components/themed/themed-text";
import { Slider } from "@/components/ui/slider/slider";
import { useAuth, useColors } from "@/context/app-context";
import { usePrefetchQueries } from "@/hooks/use-prefetch-queries";
import { formatDuration } from "@/utils/formatDuration";
import { trackPlayerPersistor } from "@/utils/track-player-persistor";
import {
  Button,
  CircularProgress,
  Form,
  Host,
  HStack,
  Section,
  Spacer,
  Text,
} from "@expo/ui/swift-ui";
import { disabled, padding } from "@expo/ui/swift-ui/modifiers";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import TrackPlayer, { useProgress } from "react-native-track-player";
export default function SettingsView() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const prefetchQueries = usePrefetchQueries();

  const [showFetcher, setShowFetcher] = useState<48 | 256 | "QUERIES" | undefined>(undefined);
  const isDisabled = Boolean(showFetcher);

  const onRefreshPress = () => {
    Alert.alert(
      "Refresh Cache?",
      "This will delete all downloaded album data and artwork from this device. They will be downloaded again.",
      [
        {
          text: "Refresh",
          onPress: async () => {
            setShowFetcher("QUERIES");
            await prefetchQueries.trigger();
            await Image.clearMemoryCache();
            await Image.clearDiskCache();
            setShowFetcher(48);
          },
          style: "destructive",
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const onSignOutPress = async () => {
    await TrackPlayer.reset();
    await trackPlayerPersistor.clearAll();

    await Image.clearMemoryCache();
    await Image.clearDiskCache();

    await auth.clearAll();

    queryClient.clear();
  };

  const progress = useProgress();

  const onProgressChange = (value: number) => {
    setProgressOptimistic(value * progress.duration);
    TrackPlayer.seekTo(value * progress.duration);
  };

  const [progressOptimistic, setProgressOptimistic] = useState<number>(progress.position);

  useEffect(() => {
    setProgressOptimistic(progress.position);
  }, [progress.position]);

  const colors = useColors();

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <ThemedSafeAreaView
        style={{
          height: 400,
          paddingTop: 100,
          paddingHorizontal: 48,
          backgroundColor: colors.systemBackground,
        }}
      >
        <Slider
          progress={Boolean(progress.duration) ? progressOptimistic / progress.duration : 0}
          onProgressChange={onProgressChange}
          addonBottomLeft={({ isDragging }) => (
            <ThemedText
              style={{
                fontSize: 13,
                color: isDragging ? colors.label : colors.lightText,
                // fontWeight: isDragging ? "bold" : "normal",
              }}
            >
              {formatDuration(progress.position)}
            </ThemedText>
          )}
          addonBottomRight={({ isDragging }) => (
            <ThemedText
              style={{
                fontSize: 13,
                color: isDragging ? colors.label : colors.lightText,
                // fontWeight: isDragging ? "bold" : "normal",
              }}
            >
              -{formatDuration(progress.duration - progress.position)}
            </ThemedText>
          )}
        />
      </ThemedSafeAreaView>
      <Host style={{ flex: 1 }}>
        <Form modifiers={isDisabled ? [disabled()] : undefined}>
          <Section title="Developer">
            <Link href="/settings/animations" asChild>
              <Button modifiers={[padding({ horizontal: 8 })]}>Animations</Button>
            </Link>
            <Link href="/settings/colors" asChild>
              <Button modifiers={[padding({ horizontal: 8 })]}>Colors</Button>
            </Link>
          </Section>

          <Section title="Server">
            <Button onPress={onRefreshPress} modifiers={[padding({ horizontal: 8 })]}>
              <HStack spacing={16}>
                {!isDisabled && <Text>Refresh Cache</Text>}
                {isDisabled && showFetcher === "QUERIES" && (
                  <Text>
                    {`${prefetchQueries.progress?.title!}... ${
                      prefetchQueries.progress?.progressPercentage
                    }%`}
                  </Text>
                )}
                {isDisabled && (showFetcher === 48 || showFetcher === 256) && (
                  <Text>{`Images...`}</Text>
                )}
                <Spacer />
                {isDisabled && <CircularProgress />}
              </HStack>
            </Button>
            <Button onPress={onSignOutPress} modifiers={[padding({ horizontal: 8 })]}>
              Sign out
            </Button>
          </Section>
        </Form>
      </Host>

      {showFetcher && (
        <View
          style={{
            flexWrap: "wrap",
            flexDirection: "row",
            position: "absolute",
            inset: 0,
          }}
        >
          {showFetcher === 48 && (
            <PrefetchAllAlbumImages size={48} onLoadEnd={() => setShowFetcher(256)} />
          )}
          {showFetcher === 256 && (
            <PrefetchAllAlbumImages size={256} onLoadEnd={() => setShowFetcher(undefined)} />
          )}
        </View>
      )}
    </View>
  );
}
