// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Resolve the local subsonic-api package path
const subsonicApiPath = path.resolve(__dirname, "../subsonic-api");

// Add the local subsonic-api package to watchFolders
config.watchFolders = [...(config.watchFolders || []), subsonicApiPath];

// Configure resolver to handle the local package
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    ...config.resolver?.extraNodeModules,
    "subsonic-api": subsonicApiPath,
  },
};

module.exports = config;
