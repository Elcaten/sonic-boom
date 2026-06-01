import { useAuth } from "@/features/auth/model/auth-context";
import { trackPlayerPersistor } from "@/shared/lib/player/track-player-persistor";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import TrackPlayer from "@rntp/player";
import { useCallback } from "react";

export function useSignOut() {
  const auth = useAuth();
  const queryClient = useQueryClient();

  const signOut = useCallback(async () => {
    TrackPlayer.stop();
    TrackPlayer.clear();
    await trackPlayerPersistor.clearAll();

    await Image.clearMemoryCache();
    await Image.clearDiskCache();

    await auth.actions.clearAll();
    queryClient.clear();
  }, [auth.actions, queryClient]);

  return { signOut };
}
