import { useArtworkSync } from "../cover-art";
import { Image } from "expo-image";
import { useState } from "react";
import { Alert } from "react-native";
import { usePrefetchQueries } from "./use-prefetch-queries";

type RefreshStage = "QUERIES" | "ARTWORK" | undefined;

export function useRefreshCache() {
  const prefetchQueries = usePrefetchQueries();
  const artworkSync = useArtworkSync();
  const [stage, setStage] = useState<RefreshStage>(undefined);

  const startRefresh = async () => {
    try {
      setStage("QUERIES");
      await prefetchQueries.trigger();
      setStage("ARTWORK");
      await artworkSync.start({ force: true });
      await Image.clearMemoryCache();
    } finally {
      setStage(undefined);
    }
  };

  const onRefreshPress = () => {
    Alert.alert(
      "Refresh Cache?",
      "This will refresh album data and artwork. Existing artwork is kept if a replacement cannot be downloaded.",
      [
        { text: "Refresh", onPress: startRefresh, style: "destructive" },
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  return {
    stage,
    isRefreshing: Boolean(stage),
    queryProgress: prefetchQueries.progress,
    artworkProgress: artworkSync.progress,
    onRefreshPress,
  };
}
