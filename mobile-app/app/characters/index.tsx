import EmptyState from '@/components/characters/EmptyState';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { supabase } from '@/lib/supabase';
import { fantasyTokens } from '@/theme/fantasyTheme';

/** Loading label shown while the current auth session is being validated. */
const AUTH_LOADING_LABEL = 'Checking your adventurer records...';

/**
 * Characters route entry.
 *
 * This step intentionally always renders the empty state while the list/data
 * flow is being implemented.
 */
export default function CharactersScreen() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingSession, setIsCheckingSession] = useState(true);

    useEffect(() => {
        let isMounted = true;

        /**
         * Ensures the user has an active session before showing the characters route.
         */
        async function validateSession() {
            try {
                const { data, error } = await supabase.auth.getSession();

                if (error || !data.session) {
                    router.replace('/(auth)/sign-in');
                    return;
                }

                if (isMounted) {
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Failed to validate session for /characters.', error);
                router.replace('/(auth)/sign-in');
            } finally {
                if (isMounted) {
                    setIsCheckingSession(false);
                }
            }
        }

        void validateSession();

        return () => {
            isMounted = false;
        };
    }, [router]);

    if (isCheckingSession) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={fantasyTokens.colors.gold} />
                <Text style={styles.loadingText}>{AUTH_LOADING_LABEL}</Text>
            </View>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <EmptyState />;
}

/** Styles for the interim auth-loading state shown on the characters route. */
const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: fantasyTokens.spacing.sm,
        backgroundColor: fantasyTokens.colors.night,
        paddingHorizontal: fantasyTokens.spacing.lg,
    },
    loadingText: {
        color: fantasyTokens.colors.parchmentDeep,
        fontFamily: 'serif',
        fontSize: 14,
        textAlign: 'center',
    },
});
