import type { Config } from "jest";

// Expo's WinterCG fetch shim requires native modules that are unavailable in Jest.
process.env.EXPO_PUBLIC_USE_RN_FETCH = "1";

const config: Config = {
  preset: "jest-expo",
  roots: ["<rootDir>/src"],
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1",
  },
};

export default config;
