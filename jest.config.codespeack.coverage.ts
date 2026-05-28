import type { Config } from "jest";
import baseConfig from "./jest.config";

const config: Config = {
  ...baseConfig,
  reporters: ["default", "jest-junit"],
  ci: true,
  watchAll: false,
  collectCoverage: true,
  coverageProvider: "v8",
  collectCoverageFrom: [
    "src/hooks/**/*.{ts,tsx}",
    "src/utils/**/*.{ts,tsx}",
    "src/components/core/**/*.{ts,tsx}",
    "src/components/feature/CoverArt/**/*.{ts,tsx}",
    "src/components/feature/PrefetchAllAlbumImages.tsx",
    "!src/**/__test__/**",
    "!src/**/*.test.{ts,tsx}",
    "!**/*.cs.md",
  ],
  coverageReporters: ["text", "lcov"],
  coverageDirectory: ".coverage-tmp",
};

export default config;
