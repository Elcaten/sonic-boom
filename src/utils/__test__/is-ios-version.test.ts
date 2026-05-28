import { Platform } from "react-native";

import { isIOSVersion } from "../is-ios-version";

describe("isIOSVersion", () => {
  const originalOS = Platform.OS;
  const originalVersion = Platform.Version;

  afterEach(() => {
    Platform.OS = originalOS;
    Platform.Version = originalVersion;
  });

  it("uses the react-native mock defaults", () => {
    expect(Platform.OS).toBe("ios");
    expect(Platform.Version).toBe("17");
  });

  it("returns false when not on iOS", () => {
    Platform.OS = "android";

    expect(isIOSVersion(17)).toBe(false);
  });

  it("returns true when iOS version meets the minimum", () => {
    Platform.Version = "17";

    expect(isIOSVersion(17)).toBe(true);
    expect(isIOSVersion(16)).toBe(true);
  });

  it("returns false when iOS version is below the minimum", () => {
    Platform.Version = "16";

    expect(isIOSVersion(17)).toBe(false);
  });

  it("returns true when iOS version is exactly the minimum", () => {
    Platform.OS = "ios";
    Platform.Version = "15";

    expect(isIOSVersion(15)).toBe(true);
  });

  it("returns true when iOS version is well above the minimum", () => {
    Platform.OS = "ios";
    Platform.Version = "18";

    expect(isIOSVersion(14)).toBe(true);
  });
});
