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
    "src/context/use-api-logic.tsx",
    "src/context/use-queries-logic.tsx",
    "src/hooks/use-prefetch-queries.ts",
  ],
  coveragePathIgnorePatterns: [
    "node_modules",
    "/__test__/",
    "\\.test\\.(ts|tsx)$",
    "\\.cs\\.md$",
  ],
  coverageReporters: ["text", "lcov"],
  coverageDirectory: "<rootDir>/.coverage/context-and-hooks",
};

export default config;
