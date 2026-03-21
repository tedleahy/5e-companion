// @ts-expect-error Metro resolves this shim path, but tslib does not ship a declaration for it.
import * as tslibHelpers from '../node_modules/tslib/tslib.es6.js';
import type tslibDefault from 'tslib';

/**
 * Re-exports tslib helpers through a local module so Metro avoids the broken
 * package-exports entry on Expo web.
 */
export default tslibHelpers as typeof tslibDefault;

// @ts-expect-error Metro resolves this shim path, but tslib does not ship a declaration for it.
export * from '../node_modules/tslib/tslib.es6.js';
