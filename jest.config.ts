import type { Config } from "jest";

const config: Config = {
  preset: "jest-expo",
  roots: ["<rootDir>/src"],
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1",
  },
};

export default config;
