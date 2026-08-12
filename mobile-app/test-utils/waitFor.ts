import { waitFor as testingLibraryWaitFor } from '@testing-library/react-native';

type WaitForOptions = NonNullable<Parameters<typeof testingLibraryWaitFor>[1]>;

const TEST_POLL_INTERVAL_MS = 20;

/**
 * Waits for a test assertion without React Native Testing Library's 50 ms real-timer floor.
 */
export function waitFor<T>(expectation: () => T, options?: WaitForOptions): Promise<T> {
    return testingLibraryWaitFor(expectation, {
        interval: TEST_POLL_INTERVAL_MS,
        ...options,
    });
}
