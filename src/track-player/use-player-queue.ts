import { useEffect, useState } from "react";
import TrackPlayer, { Track, useActiveTrack } from "react-native-track-player";

export function usePlayerQueue() {
  const activeTrack = useActiveTrack();
  const [queue, setQueue] = useState<Track[]>([]);

  useEffect(() => {
    const effect = async () => {
      const result = await TrackPlayer.getQueue();
      setQueue(result);
    };

    effect();
  }, [activeTrack]);

  return { queue };
}
