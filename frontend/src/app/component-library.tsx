import { Redirect } from 'expo-router';

import { ComponentLibrary } from '@/screens/component-library';

/**
 * Shows every shared component with its variants, for checking them in the running app. It's a
 * development tool, so a release build sends anyone who finds the URL to the character list.
 */
export default function ComponentLibraryRoute() {
    if (!__DEV__) return <Redirect href="/" />;

    return <ComponentLibrary />;
}
