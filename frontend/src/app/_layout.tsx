import { SpaceGrotesk_400Regular } from '@expo-google-fonts/space-grotesk/400Regular';
import { SpaceGrotesk_500Medium } from '@expo-google-fonts/space-grotesk/500Medium';
import { SpaceGrotesk_600SemiBold } from '@expo-google-fonts/space-grotesk/600SemiBold';
import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk/700Bold';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { createQueryClient } from '@/api/query-client';
import { colors, fonts } from '@/theme';

SplashScreen.preventAutoHideAsync();

/**
 * Wraps every route. Keeps the splash screen up until the fonts load (or fail to), and provides
 * the app's one query client.
 */
export default function RootLayout() {
    const [loaded, error] = useFonts({
        [fonts.regular]: SpaceGrotesk_400Regular,
        [fonts.medium]: SpaceGrotesk_500Medium,
        [fonts.semiBold]: SpaceGrotesk_600SemiBold,
        [fonts.bold]: SpaceGrotesk_700Bold,
    });

    const [queryClient] = useState(createQueryClient);

    useEffect(() => {
        if (loaded || error) SplashScreen.hideAsync();
    }, [loaded, error]);

    if (!loaded && !error) return null;

    return (
        <QueryClientProvider client={queryClient}>
            <StatusBar style="dark" />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.paper },
                }}
            />
        </QueryClientProvider>
    );
}
