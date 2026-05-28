import type { Config } from "jest";
import baseConfig from "./jest.config";

const config: Config = {
  ...baseConfig,
  reporters: ["default", "jest-junit"],
  ci: true,
  watchAll: false,
};

export default config;
