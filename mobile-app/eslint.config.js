// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
        node: {
          extensions: [
            '.js',
            '.jsx',
            '.ts',
            '.tsx',
            '.web.js',
            '.web.jsx',
            '.web.ts',
            '.web.tsx',
            '.native.js',
            '.native.jsx',
            '.native.ts',
            '.native.tsx',
          ],
        },
      },
    },
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
