import { appLogger } from "@/shared/lib/logger";
import TrackPlayer, { Event, PlayerCommand, RepeatMode } from "@rntp/player";
import { useEffect } from "react";
import { trackPlayerPersistor } from "./persistor";

export const TrackPlayerSetup = () => {
  useSetupTrackPlayer();

  return null;
};

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
  useEffect(() => {
    const eventListener = TrackPlayer.addEventListener(Event.MediaItemTransition, async () => {
      await trackPlayerPersistor.peristQueue();
      trackPlayerPersistor.persistActiveTrackIndex();
    });

    setupTrackPlayer()
      .then(() => {
        appLogger.PLAYER.info("Track player initialized");
      })
      .catch((err) => {
        appLogger.PLAYER.error(err);
      });

    return () => {
      eventListener.remove();
      TrackPlayer.stop();
      TrackPlayer.clear();
    };
  }, []);
};
