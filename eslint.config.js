// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const reactQueryPlugin = require('@tanstack/eslint-plugin-query');
const testingLibrary = require('eslint-plugin-testing-library');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    plugins: {
      '@tanstack/query': reactQueryPlugin,
    },
    rules: {
      ...reactQueryPlugin.configs.recommended.rules,
    },
  },
  {
    files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    ...testingLibrary.configs['flat/react'],
  },
]);
