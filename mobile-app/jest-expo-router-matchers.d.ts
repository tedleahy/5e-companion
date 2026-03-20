declare namespace jest {
    interface Matchers<R, T = unknown> {
        toHavePathname(pathname: string): R;
    }
}
