// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const reactQueryPlugin = require('@tanstack/eslint-plugin-query')

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    plugins: {
      '@tanstack/query': reactQueryPlugin
    },
    rules: {
      ...reactQueryPlugin.configs.recommended.rules
    }
  },
]);
