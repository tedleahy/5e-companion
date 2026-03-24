// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    rules: {
      '@typescript-eslint/array-type': 'off',
    },
    ignores: [
      'dist/*',
      'types/generated_graphql_types.ts',
      '.expo',
    ],
  },
]);
