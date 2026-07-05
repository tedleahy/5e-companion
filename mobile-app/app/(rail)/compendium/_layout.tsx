import { Stack } from 'expo-router';
import RailScreenShell from '@/components/navigation/RailScreenShell';
import { fantasyTokens } from '@/theme/fantasyTheme';

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
            />
        </RailScreenShell>
    );
}
