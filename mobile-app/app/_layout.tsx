import { useEffect, useRef, useState } from 'react';
import { Stack, usePathname, useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, useColorScheme, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { ApolloProvider } from '@apollo/client/react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useFonts } from 'expo-font';
import {
    Spectral_400Regular,
    Spectral_500Medium,
    Spectral_600SemiBold,
    Spectral_700Bold,
} from '@expo-google-fonts/spectral';
import apolloClient from './apolloClient';
import { buildFantasyTheme, fantasyTokens } from '../theme/fantasyTheme';
import { supabase } from '@/lib/supabase';

/** `null` means the session is still being checked. */
type ResolvedSession = boolean | null;

/** Dispatched by Supabase on mount when a session is recovered from storage. */
const INITIAL_SESSION = 'INITIAL_SESSION';

/**
 * Root layout — single auth gate for the entire app.
 *
 * Checks the session on mount, listens for sign-in / sign-out events,
 * and redirects when the current route does not match the auth state.
 */
export default function RootLayout() {
    const colorScheme = useColorScheme();
    const theme = buildFantasyTheme(colorScheme);
    const [fontsLoaded] = useFonts({
        Spectral_400Regular,
        Spectral_500Medium,
        Spectral_600SemiBold,
        Spectral_700Bold,
    });

    const router = useRouter();
    const routerRef = useRef(router);
    const pathname = usePathname();
    const [hasValidSession, setHasValidSession] = useState<ResolvedSession>(null);

    // Keep a stable router reference for the effect closure.
    useEffect(() => {
        routerRef.current = router;
    }, [router]);

    // Mount-time session check.
    useEffect(() => {
        let cancelled = false;

        async function checkSession() {
            try {
                const { data } = await supabase.auth.getSession();
                if (!cancelled) {
                    setHasValidSession(Boolean(data.session));
                }
            } catch {
                if (!cancelled) {
                    setHasValidSession(false);
                }
            }
        }

        void checkSession();

        return () => {
            cancelled = true;
        };
    }, []);

    // Runtime auth state listener — catches sign-in, sign-out, and token refresh.
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            // INITIAL_SESSION fires with the same value as getSession() above;
            // skip it to avoid a duplicate setState.
            if (event === INITIAL_SESSION) return;
            setHasValidSession(Boolean(session));
        });

        return () => subscription.unsubscribe();
    }, []);

    // Redirect when the current route does not match the resolved auth state.
    useEffect(() => {
        if (hasValidSession === null) return;

        const isAuthRoute = pathname.startsWith('/(auth)');

        if (!hasValidSession && !isAuthRoute) {
            routerRef.current.replace('/(auth)/sign-in');
        } else if (hasValidSession && isAuthRoute) {
            routerRef.current.replace('/');
        }
    }, [hasValidSession, pathname]);

    // Hold a loading view until fonts and session are both resolved.
    if (!fontsLoaded || hasValidSession === null) {
        return (
            <View style={styles.loadingScreen}>
                <ActivityIndicator size="large" color={fantasyTokens.colors.gold} />
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={styles.gestureRoot}>
            <SafeAreaProvider>
                <SafeAreaView style={styles.safeArea}>
                    <ApolloProvider client={apolloClient}>
                        <PaperProvider theme={theme}>
                            <KeyboardProvider>
                                <Stack
                                    screenOptions={{
                                        headerShown: false,
                                        contentStyle: { backgroundColor: fantasyTokens.colors.night },
                                        animation: 'fade_from_bottom',
                                        animationDuration: fantasyTokens.motion.standard,
                                    }}
                                >
                                    <Stack.Screen name="(rail)" options={{ animation: 'none' }} />
                                    <Stack.Screen
                                        name="characters/create"
                                        options={{ animation: 'slide_from_right', animationDuration: fantasyTokens.motion.standard }}
                                    />
                                    <Stack.Screen
                                        name="spells/[id]"
                                        options={{ animation: 'slide_from_right', animationDuration: fantasyTokens.motion.standard }}
                                    />
                                </Stack>
                            </KeyboardProvider>
                        </PaperProvider>
                    </ApolloProvider>
                </SafeAreaView>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    gestureRoot: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.night,
    },
    loadingScreen: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.night,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
