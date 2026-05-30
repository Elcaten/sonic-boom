import { appLogger } from "@/shared/logger/app-logger";
import { trackPlayerPersistor } from "@/track-player/track-player-persistor";
import TrackPlayer, { Event, PlayerCommand, RepeatMode } from "@rntp/player";
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

    const eventListener = TrackPlayer.addEventListener(Event.MediaItemTransition, async () => {
      await trackPlayerPersistor.peristQueue();
      trackPlayerPersistor.persistActiveTrackIndex();
    });

    setupTrackPlayer()
      .then(() => {
        isInitialized.current = true;
        onLoad?.();
        appLogger.PLAYER.info("Track player initialized");
      })
      .catch((err) => {
        isInitialized.current = false;
        appLogger.PLAYER.error(err);
      });

    return () => {
      eventListener.remove();
      TrackPlayer.stop();
      TrackPlayer.clear();
    };
  }, [onLoad]);
};
