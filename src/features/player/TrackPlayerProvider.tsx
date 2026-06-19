import { appLogger } from "@/shared/lib/logger";
import TrackPlayer, { Event, PlayerCommand, RepeatMode } from "@rntp/player";
import { PropsWithChildren, useEffect, useRef } from "react";
import { trackPlayerPersistor } from "./persistor";

const setupTrackPlayer = async () => {
  TrackPlayer.setupPlayer({ contentType: "music" });
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

const useSetupTrackPlayer = () => {
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
  }, []);
};

export const TrackPlayerProvider = ({ children }: PropsWithChildren<unknown>) => {
  useSetupTrackPlayer();
  return <>{children}</>;
};
