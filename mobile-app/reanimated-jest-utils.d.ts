/**
 * `react-native-reanimated` publishes its Jest helpers' types under
 * `lib/typescript` rather than beside the implementation, so the subpath import
 * resolves without types. Declaring the one helper the tests use is safer than
 * re-exporting the published declarations, because this project's
 * `moduleSuffixes` would resolve those to the `.web` variant, whose
 * `getAnimatedStyle` is a no-op returning `void`.
 */
declare module 'react-native-reanimated/lib/module/jestUtils' {
    /** Styles Reanimated is currently applying to an animated component. */
    export function getAnimatedStyle(component: unknown): Record<string, unknown>;
}
