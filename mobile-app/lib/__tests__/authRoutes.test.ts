import { isAuthRouteSegments } from '../authRoutes';

describe('authRoutes', () => {
    it('identifies signed-out screens inside the auth route group', () => {
        expect(isAuthRouteSegments(['(auth)', 'sign-in'])).toBe(true);
        expect(isAuthRouteSegments(['(auth)', 'sign-up'])).toBe(true);
    });

    it('does not infer auth routes from public URL segments alone', () => {
        expect(isAuthRouteSegments(['sign-up'])).toBe(false);
        expect(isAuthRouteSegments(['sign-in'])).toBe(false);
    });

    it('does not treat protected route groups as auth routes', () => {
        expect(isAuthRouteSegments(['(rail)', 'characters'])).toBe(false);
        expect(isAuthRouteSegments([])).toBe(false);
    });
});
