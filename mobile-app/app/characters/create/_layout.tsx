import { Stack } from 'expo-router';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { CharacterDraftProvider } from '@/store/characterDraft';
import WizardShell from '@/components/wizard/WizardShell';

export default function WizardLayout() {
    return (
        <CharacterDraftProvider>
            <WizardShell>
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: fantasyTokens.colors.night },
                        animation: 'slide_from_right',
                        animationDuration: fantasyTokens.motion.standard,
                    }}
                />
            </WizardShell>
        </CharacterDraftProvider>
    );
}
