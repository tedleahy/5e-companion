import { Stack } from 'expo-router';
import RailScreenShell from '@/components/navigation/RailScreenShell';
import { fantasyTokens } from '@/theme/fantasyTheme';

/**
 * Keep the hub as the stack anchor so category pushes (especially on Android /
 * Expo Go) always resolve against `/compendium` rather than an unmatched root.
 */
export const unstable_settings = {
    initialRouteName: 'index',
};

/** Nested navigation stack for the Compendium hub and category screens. */
export default function CompendiumLayout() {
    return (
        <RailScreenShell>
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: fantasyTokens.colors.night },
                    animation: 'slide_from_right',
                    animationDuration: fantasyTokens.motion.standard,
                }}
            >
                <Stack.Screen name="index" />
                <Stack.Screen name="classes" />
                <Stack.Screen name="subclasses" />
                <Stack.Screen name="spells" />
                <Stack.Screen name="races" />
                <Stack.Screen name="subraces" />
                <Stack.Screen name="backgrounds" />
                <Stack.Screen name="feats" />
                <Stack.Screen name="languages" />
            </Stack>
        </RailScreenShell>
    );
}
