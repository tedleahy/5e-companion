import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import CompendiumCategoryCard from '@/components/compendium/compendium-category-card';
import CompendiumScreenHeader from '@/components/compendium/compendium-screen-header';
import {
    COMPENDIUM_CATEGORIES,
    type CompendiumCategoryKey,
} from '@/components/compendium/compendium-categories';
import useProtectedNavigation from '@/hooks/useProtectedNavigation';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { CompendiumCountsQuery } from '@/types/generated_graphql_types';

/** Lightweight query used to populate counts on implemented Compendium cards. */
export const GET_COMPENDIUM_COUNTS = gql`
    query CompendiumCounts {
        compendiumCounts {
            srdSubclassCount
            customSubclassCount
            spellCount
        }
    }
`;

/** Hub for browsing implemented and planned Compendium content categories. */
export default function CompendiumScreen() {
    const { width } = useWindowDimensions();
    const protectedRouter = useProtectedNavigation();
    const { data, loading, error } = useQuery<CompendiumCountsQuery>(GET_COMPENDIUM_COUNTS);
    const cardWidth = width >= fantasyTokens.breakpoints.tablet ? '31%' : '47%';
    const counts = data?.compendiumCounts;
    const unavailableSummary = loading ? 'Gathering records…' : 'Counts unavailable';
    const summaries: Partial<Record<CompendiumCategoryKey, string>> = counts && !error
        ? {
            subclasses: `${counts.srdSubclassCount} SRD · ${counts.customSubclassCount} custom`,
            spells: `${counts.spellCount} available`,
        }
        : {
            subclasses: unavailableSummary,
            spells: unavailableSummary,
        };

    return (
        <View style={styles.container}>
            <CompendiumScreenHeader eyebrow="Library" title="Compendium" />
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.grid}>
                    {COMPENDIUM_CATEGORIES.map((category) => (
                        <CompendiumCategoryCard
                            key={category.key}
                            icon={category.icon}
                            label={category.label}
                            summary={summaries[category.key]}
                            width={cardWidth}
                            testID={`compendium-category-${category.key}`}
                            onPress={category.href == null
                                ? undefined
                                : () => {
                                    void protectedRouter.push(category.href);
                                }}
                        />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.night,
    },
    scrollContent: {
        flexGrow: 1,
        padding: fantasyTokens.spacing.lg,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: fantasyTokens.spacing.md,
    },
});
