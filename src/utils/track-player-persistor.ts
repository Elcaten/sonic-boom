import AsyncStorage from "@react-native-async-storage/async-storage";
import TrackPlayer from "react-native-track-player";

export const trackPlayerPersistor = {
  peristQueue: async () => {
    try {
      const queue = await TrackPlayer.getQueue();
      if (queue) {
        AsyncStorage.setItem("queue", JSON.stringify(queue));
      }
    } catch (e) {
      //TODO: log error
      console.error(e);
    }
  },
  persistActiveTrackIndex: async () => {
    try {
      const activeTrackIndex = await TrackPlayer.getActiveTrackIndex();
      if (activeTrackIndex) {
        AsyncStorage.setItem("active-track-index", activeTrackIndex.toString());
      }
    } catch (e) {
      //TODO: log error
      console.error(e);
    }
  },
  hydrateQueue: async () => {
    try {
      const queue = await AsyncStorage.getItem("queue");
      if (queue) {
        //TODO: check for object shape
        TrackPlayer.setQueue(JSON.parse(queue));
      }
    } catch (e) {
      //TODO: log error
      console.error(e);
    }
  },
  hydrateActiveTrackIndex: async () => {
    try {
      const activeTrackIndex = await AsyncStorage.getItem("active-track-index");
      if (activeTrackIndex) {
        //TODO: check for object shape
        TrackPlayer.skip(Number.parseInt(activeTrackIndex));
      }
    } catch (e) {
      //TODO: log error
      console.error(e);
    }
  },
  clearAll: async () => {
    try {
      await AsyncStorage.removeItem("queue");
      await AsyncStorage.removeItem("active-track-index");
    } catch (e) {
      //TODO: log error
      console.error(e);
    }
  },
};
