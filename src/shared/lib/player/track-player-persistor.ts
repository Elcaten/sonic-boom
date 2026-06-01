import { appLogger } from "@/shared/lib/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TrackPlayer from "@rntp/player";

export const trackPlayerPersistor = {
  peristQueue: async () => {
    try {
      const queue = TrackPlayer.getQueue();
      if (queue) {
        AsyncStorage.setItem("queue", JSON.stringify(queue));
      }
    } catch (e) {
      appLogger.PLAYER.error(e);
    }
  },
  persistActiveTrackIndex: async () => {
    try {
      const activeTrackIndex = TrackPlayer.getActiveMediaItemIndex();
      if (activeTrackIndex) {
        AsyncStorage.setItem("active-track-index", activeTrackIndex.toString());
      }
    } catch (e) {
      appLogger.PLAYER.error(e);
    }
  },
  hydrateQueue: async () => {
    try {
      const queue = await AsyncStorage.getItem("queue");
      if (queue) {
        //TODO: check for object shape
        TrackPlayer.setMediaItems(JSON.parse(queue));
      }
    } catch (e) {
      appLogger.PLAYER.error(e);
    }
  },
  hydrateActiveTrackIndex: async () => {
    try {
      const activeTrackIndex = await AsyncStorage.getItem("active-track-index");
      if (activeTrackIndex) {
        //TODO: check for object shape
        TrackPlayer.skipToIndex(Number.parseInt(activeTrackIndex));
      }
    } catch (e) {
      appLogger.PLAYER.error(e);
    }
  },
  clearAll: async () => {
    try {
      await AsyncStorage.removeItem("queue");
      await AsyncStorage.removeItem("active-track-index");
    } catch (e) {
      appLogger.PLAYER.error(e);
    }
  },
};
