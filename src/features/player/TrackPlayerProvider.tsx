import { appLogger } from "@/lib/logger";
import TrackPlayer, { Event, PlayerCommand, RepeatMode } from "@rntp/player";
import { useEffect, useRef } from "react";
import { trackPlayerPersistor } from "./persistor";

const setupTrackPlayer = async () => {
  TrackPlayer.setupPlayer({ contentType: "music" });
  TrackPlayer.setCommands({
    handling: "native",
    capabilities: [PlayerCommand.PlayPause, PlayerCommand.Previous, PlayerCommand.Next, PlayerCommand.Seek],
  });
  TrackPlayer.setVolume(1);
  TrackPlayer.setRepeatMode(RepeatMode.All);
  await trackPlayerPersistor.hydrateQueue();
  await trackPlayerPersistor.hydrateActiveTrackIndex();
};

const useSetupTrackPlayer = ({ onLoad }: { onLoad?: () => void }) => {
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

type TrackPlayerProviderProps = {
  children: React.ReactNode;
  onLoad: () => void;
};

export const TrackPlayerProvider = ({ children, onLoad }: TrackPlayerProviderProps) => {
  useSetupTrackPlayer({ onLoad });
  return <>{children}</>;
};
