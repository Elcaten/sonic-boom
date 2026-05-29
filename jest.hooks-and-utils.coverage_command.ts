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
    "src/hooks/use-color-scheme.ts",
    "src/utils/app-logger.ts",
    "src/utils/batch-process.ts",
    "src/utils/format-duration.ts",
    "src/utils/pluralize.ts",
    "src/utils/shuffle-array.ts",
  ],
  coveragePathIgnorePatterns: [
    "node_modules",
    "/__test__/",
    "\\.test\\.(ts|tsx)$",
    "\\.cs\\.md$",
  ],
  coverageReporters: ["text", "lcov"],
  coverageDirectory: "<rootDir>/.coverage/hooks-and-utils",
};

export default config;
