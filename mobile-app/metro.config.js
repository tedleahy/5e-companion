const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

/** @type {import('@expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Allow Metro to resolve shared modules outside the project root.
config.watchFolders = [
    ...(config.watchFolders ?? []),
    path.resolve(__dirname, '../shared'),
];

const tslibShimPath = path.resolve(__dirname, 'shims/tslib.ts');

/**
 * Work around Metro resolving `tslib` through its package `exports` map to
 * `modules/index.js`, which currently breaks Apollo on Expo web.
 */
config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === 'tslib' && platform === 'web') {
        return {
            type: 'sourceFile',
            filePath: tslibShimPath,
        };
    }

    return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
