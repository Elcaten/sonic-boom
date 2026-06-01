import { useState } from "react";
import { Alert } from "react-native";
import { Image } from "expo-image";
import { usePrefetchQueries } from "./use-prefetch-queries";

type FetcherState = 48 | 256 | "QUERIES" | undefined;

export function useRefreshCache() {
  const prefetchQueries = usePrefetchQueries();
  const [showFetcher, setShowFetcher] = useState<FetcherState>(undefined);

  const startRefresh = async () => {
    setShowFetcher("QUERIES");
    await prefetchQueries.trigger();
    await Image.clearMemoryCache();
    await Image.clearDiskCache();
    setShowFetcher(48);
  };

  const onRefreshPress = () => {
    Alert.alert(
      "Refresh Cache?",
      "This will delete all downloaded album data and artwork from this device. They will be downloaded again.",
      [
        {
          text: "Refresh",
          onPress: startRefresh,
          style: "destructive",
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
    );
  };

  const handleSmallImagesLoaded = () => {
    setShowFetcher(256);
  };

  const handleLargeImagesLoaded = () => {
    setShowFetcher(undefined);
  };

  return {
    showFetcher,
    isRefreshing: Boolean(showFetcher),
    progress: prefetchQueries.progress,
    onRefreshPress,
    handleSmallImagesLoaded,
    handleLargeImagesLoaded,
  };
}
