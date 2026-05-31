/** Expo Router route group that contains signed-out screens. */
const AUTH_ROUTE_GROUP = '(auth)';

/**
 * Route groups are not part of the public pathname, so auth routing must use
 * Expo Router segments instead of checking URLs like `/sign-up`.
 */
export function isAuthRouteSegments(segments: readonly string[]): boolean {
    return segments[0] === AUTH_ROUTE_GROUP;
}
