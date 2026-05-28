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
    // you can add files managed by module here
  ],
  coveragePathIgnorePatterns: [
    "node_modules",
    "src/**/__test__/**",
    "src/**/*.test.{ts,tsx}",
    "**/*.cs.md",
  ],
  coverageReporters: ["text", "lcov"],
  coverageDirectory: ".coverage/<SPEC_NAME>", // update this to module name
};

export default config;
