import { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_AVAILABLE_BACKGROUNDS } from '@/graphql/characterSheet.operations';
import type { AvailableBackgroundsQuery } from '@/types/generated_graphql_types';
import type { OptionItem } from '@/lib/characterCreation/options';

/**
 * Loads the visible background list for the signed-in user.
 */
export default function useAvailableBackgrounds() {
    const { data, loading } = useQuery<AvailableBackgroundsQuery>(GET_AVAILABLE_BACKGROUNDS);

    const backgroundOptions: OptionItem[] = useMemo(() => {
        return (data?.availableBackgrounds ?? []).map((bg) => ({
            value: bg.value,
            label: bg.name,
            icon: backgroundIcon(bg.value),
            description: formatBackgroundDescription(bg),
        }));
    }, [data?.availableBackgrounds]);

    return { backgroundOptions, loading };
}

/**
 * Returns a themed emoji icon for one background selection value.
 */
function backgroundIcon(value: string): string {
    const ICONS: Record<string, string> = {
        acolyte: '🙏',
    };
    return ICONS[value] ?? '📜';
}

/**
 * Formats the modal body text for one background, including its feature name when present.
 */
function formatBackgroundDescription(bg: { featureName?: string | null; description: string }): string {
    if (bg.featureName) {
        return `${bg.featureName}\n\n${bg.description}`;
    }
    return bg.description;
}
