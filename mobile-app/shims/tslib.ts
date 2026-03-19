import * as tslibHelpers from '../node_modules/tslib/tslib.es6.js';

/**
 * Re-exports tslib helpers through a local module so Metro avoids the broken
 * package-exports entry on Expo web.
 */
export default tslibHelpers;

export * from '../node_modules/tslib/tslib.es6.js';
