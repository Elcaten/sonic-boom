import AsyncStorage from "@react-native-async-storage/async-storage";
import { MEDIA_SEARCH_STORAGE_KEY } from "../model/const";
import { StorageDependency } from "../model/types";

export const defaultStorage: StorageDependency = {
  load: async () => {
    const stored = await AsyncStorage.getItem(MEDIA_SEARCH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },
  save: async (items) => {
    await AsyncStorage.setItem(MEDIA_SEARCH_STORAGE_KEY, JSON.stringify(items));
  },
};
