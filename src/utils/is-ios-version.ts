import { Platform } from "react-native";

export const isIOSVersion = (minVersion: number): boolean => {
  if (Platform.OS !== "ios") {
    return false;
  }

  const majorVersionIOS = parseInt(Platform.Version, 10);

  return majorVersionIOS >= minVersion;
};
