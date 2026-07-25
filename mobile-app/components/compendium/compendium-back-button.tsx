import CompendiumBackControl from '@/components/compendium/compendium-back-control';
import useProtectedNavigation from '@/hooks/useProtectedNavigation';

/** Returns from a Compendium category to the previous screen, or the hub on direct entry. */
export default function CompendiumBackButton() {
    const protectedRouter = useProtectedNavigation();

    return (
        <CompendiumBackControl
            accessibilityLabel="Back to all Compendium categories"
            tone="gold"
            onPress={() => {
                if (protectedRouter.canGoBack()) {
                    void protectedRouter.back();
                    return;
                }
                void protectedRouter.replace('/compendium');
            }}
        />
    );
}
