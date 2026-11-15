// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const noColorLiterals = require('./eslint-rules/no-color-literals');
const noFontWeight = require('./eslint-rules/no-font-weight');

module.exports = defineConfig([
    expoConfig,
    {
        plugins: {
            sheet: {
                rules: {
                    'no-color-literals': noColorLiterals,
                    'no-font-weight': noFontWeight,
                },
            },
        },
        rules: {
            'sheet/no-color-literals': 'error',
            'sheet/no-font-weight': 'error',
        },
    },
    {
        // The tokens are defined here, so the raw color values are the point of these files.
        files: ['src/theme/**'],
        rules: {
            'sheet/no-color-literals': 'off',
        },
    },
    {
        ignores: ['dist/*'],
    },
]);
