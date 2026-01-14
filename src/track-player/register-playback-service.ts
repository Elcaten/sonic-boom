import { trackPlayerPersistor } from "@/utils/track-player-persistor";
import TrackPlayer, { Event } from "react-native-track-player";

const playbackService = async () => {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    TrackPlayer.stop();
  });

  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    TrackPlayer.skipToNext();
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    TrackPlayer.skipToPrevious();
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, (e) => {
    TrackPlayer.seekTo(e.position);
  });

  TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (e) => {
    await trackPlayerPersistor.peristQueue();
    await trackPlayerPersistor.persistActiveTrackIndex();
  });
};

export function registerPlaybackService() {
  TrackPlayer.registerPlaybackService(() => playbackService);
}
