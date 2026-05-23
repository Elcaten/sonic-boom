import { trackPlayerPersistor } from "@/utils/track-player-persistor";
import TrackPlayer, { PlayerCommand, RepeatMode } from "@rntp/player";
import { useEffect, useRef } from "react";

const setupTrackPlayer = async () => {
  TrackPlayer.setupPlayer({
    contentType: "music",
  });

  TrackPlayer.setCommands({
    handling: "native",
    capabilities: [
      PlayerCommand.PlayPause,
      PlayerCommand.Previous,
      PlayerCommand.Next,
      PlayerCommand.Seek,
    ],
  });

  TrackPlayer.setVolume(1);
  TrackPlayer.setRepeatMode(RepeatMode.All);

  await trackPlayerPersistor.hydrateQueue();
  await trackPlayerPersistor.hydrateActiveTrackIndex();
};

export const useSetupTrackPlayer = ({ onLoad }: { onLoad?: () => void }) => {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;

    setupTrackPlayer()
      .then(() => {
        isInitialized.current = true;
        onLoad?.();
      })
      .catch((err) => {
        isInitialized.current = false;
        console.log(err);
      });
  }, [onLoad]);
};
