import TrackPlayer, { MediaItem, useActiveMediaItem } from "@rntp/player";
import { useEffect, useState } from "react";

export function usePlayerQueue() {
  const activeTrack = useActiveMediaItem();
  const [queue, setQueue] = useState<MediaItem[]>([]);

  useEffect(() => {
    const effect = async () => {
      const result = TrackPlayer.getQueue();
      setQueue(result);
    };

    effect();
  }, [activeTrack]);

  return { queue };
}
