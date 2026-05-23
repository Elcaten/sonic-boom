import { trackPlayerPersistor } from "@/utils/track-player-persistor";
import TrackPlayer, { Event } from "@rntp/player";
import { useEffect } from "react";

export function useSubscribeToEvents() {
  useEffect(() => {
    const sub = TrackPlayer.addEventListener(Event.MediaItemTransition, async () => {
      await trackPlayerPersistor.peristQueue();
      trackPlayerPersistor.persistActiveTrackIndex();
    });
    return () => sub.remove();
  });
}
