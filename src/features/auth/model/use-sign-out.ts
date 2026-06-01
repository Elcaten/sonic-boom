import { trackPlayerPersistor } from "@/shared/lib/player";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import TrackPlayer from "@rntp/player";
import { useCallback } from "react";
import { useAuth } from "./auth-context";

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
