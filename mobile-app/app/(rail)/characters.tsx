import { useEffect, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@apollo/client/react';
import { ActivityIndicator, Text } from 'react-native-paper';
import CharacterCard, { type CharacterCardData } from '@/components/characters/CharacterCard';
import EmptyState from '@/components/characters/EmptyState';
import RailScreenShell from '@/components/navigation/RailScreenShell';
import { GET_CURRENT_USER_CHARACTER_ROSTER } from '@/graphql/characterSheet.operations';
import { isUnauthenticatedError } from '@/lib/graphqlErrors';
import useSessionGuard from '@/hooks/useSessionGuard';
import { fantasyTokens } from '@/theme/fantasyTheme';

/** Loading label shown while the current auth session is being validated. */
const AUTH_LOADING_LABEL = 'Checking your adventurer records...';

/**
 * GraphQL attack row used by the characters list.
 */
type CharacterAttack = {
    attackBonus: string;
};

/**
 * GraphQL stats row used by the characters list.
 */
type CharacterStats = {
    hp: {
        current: number;
        max: number;
    };
};

/**
 * GraphQL character row used to build list cards.
 */
type CharacterListRow = {
    id: string;
    name: string;
    race: string;
    class: string;
    subclass?: string | null;
    level: number;
    spellAttackBonus?: number | null;
    initiative: number;
    ac: number;
    conditions: string[];
    weapons?: CharacterAttack[];
    attacks?: CharacterAttack[];
    stats?: CharacterStats | null;
};

/**
 * Character roster query result shape for the current user.
 */
type CurrentUserCharacterRosterQueryData = {
    currentUserCharacters: CharacterListRow[];
};

/**
 * Formats values with an explicit leading `+` when positive.
 */
function formatSignedValue(value: number): string {
    if (value > 0) return `+${value}`;
    return `${value}`;
}

/**
 * Resolves the attack bonus shown on a character card.
 */
function attackBonusLabel(character: CharacterListRow): string {
    if (typeof character.spellAttackBonus === 'number') {
        return formatSignedValue(character.spellAttackBonus);
    }

    const combatRows = character.weapons ?? character.attacks ?? [];
    const firstAttackWithBonus = combatRows.find((attack) => attack.attackBonus.trim().length > 0);
    return firstAttackWithBonus?.attackBonus ?? '—';
}

/**
 * Builds the roster subtitle with correct singular/plural wording.
 */
function rosterCountLabel(count: number): string {
    if (count === 1) return '1 adventurer in your roster';
    return `${count} adventurers in your roster`;
}

/**
 * Converts a GraphQL character row to the card model consumed by `CharacterCard`.
 */
function toCharacterCardData(character: CharacterListRow): CharacterCardData {
    return {
        id: character.id,
        name: character.name,
        race: character.race,
        className: character.class,
        subclass: character.subclass,
        level: character.level,
        conditions: character.conditions,
        hpCurrent: character.stats?.hp.current ?? 0,
        hpMax: character.stats?.hp.max ?? 0,
        ac: character.ac,
        attackBonusLabel: attackBonusLabel(character),
        initiative: character.initiative,
    };
}

/**
 * Characters route entry.
 *
 * After validating auth, this screen renders either:
 * - the empty state when there are no characters, or
 * - the step-3 "My Characters" roster list.
 */
export default function CharactersScreen() {
    const router = useRouter();
    const { hasValidSession, isCheckingSession } = useSessionGuard();

    const {
        data,
        loading,
        error,
    } = useQuery<CurrentUserCharacterRosterQueryData>(GET_CURRENT_USER_CHARACTER_ROSTER, {
        skip: !hasValidSession,
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-and-network',
    });

    const isUnauthenticated = isUnauthenticatedError(error);

    useEffect(() => {
        if (!isUnauthenticated) return;
        router.replace('/(auth)/sign-in');
    }, [isUnauthenticated, router]);

    const characterCards = useMemo(
        () => (data?.currentUserCharacters ?? []).map(toCharacterCardData),
        [data?.currentUserCharacters],
    );

    /**
     * Opens a single character sheet from the roster.
     */
    function openCharacterSheet(characterId: string) {
        router.push(`/character/${characterId}`);
    }

    /**
     * Renders one character card inside the roster list.
     */
    function renderCharacterCard({ item }: { item: CharacterCardData }) {
        return (
            <CharacterCard
                character={item}
                onPress={openCharacterSheet}
            />
        );
    }

    if (isCheckingSession) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={fantasyTokens.colors.gold} />
                <Text style={styles.loadingText}>{AUTH_LOADING_LABEL}</Text>
            </View>
        );
    }

    if (!hasValidSession || isUnauthenticated) {
        return null;
    }

    if (loading && !data) {
        return (
            <RailScreenShell>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={fantasyTokens.colors.gold} />
                    <Text style={styles.loadingText}>Gathering your active roster...</Text>
                </View>
            </RailScreenShell>
        );
    }

    if (error) {
        return (
            <RailScreenShell>
                <View style={styles.loadingContainer}>
                    <Text style={styles.errorTitle}>Unable to load characters.</Text>
                    <Text style={styles.errorText}>{error.message}</Text>
                </View>
            </RailScreenShell>
        );
    }

    if (characterCards.length === 0) {
        return (
            <RailScreenShell>
                <EmptyState />
            </RailScreenShell>
        );
    }

    return (
        <RailScreenShell>
            <View style={styles.container}>
                <FlatList
                    data={characterCards}
                    keyExtractor={(item) => item.id}
                    renderItem={renderCharacterCard}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={styles.cardGap} />}
                    ListHeaderComponent={(
                        <View style={styles.header}>
                            <Text style={styles.codexLabel}>Character Codex</Text>
                            <Text style={styles.pageTitle}>My Characters</Text>
                            <Text style={styles.countText}>{rosterCountLabel(characterCards.length)}</Text>
                        </View>
                    )}
                />

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Create a new character"
                    onPress={() => router.push('/characters/create')}
                    style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
                    testID="characters-list-fab"
                >
                    <Text style={styles.fabIcon}>+</Text>
                </Pressable>
            </View>
        </RailScreenShell>
    );
}

/** Styles for the step-3 character roster route. */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.night,
    },
    header: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(201,146,42,0.15)',
        paddingHorizontal: 22,
        paddingTop: 8,
        paddingBottom: 14,
        marginBottom: 16,
    },
    codexLabel: {
        color: fantasyTokens.colors.gold,
        opacity: 0.7,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 9,
        letterSpacing: 3,
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    pageTitle: {
        color: fantasyTokens.colors.parchment,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 28,
        lineHeight: 32,
        marginTop: 6,
        fontWeight: '700',
        textAlign: 'center',
    },
    countText: {
        color: 'rgba(201,146,42,0.5)',
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 13,
        lineHeight: 17,
        marginTop: 2,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    cardGap: {
        height: 14,
    },
    fab: {
        position: 'absolute',
        right: 22,
        bottom: 32,
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: fantasyTokens.colors.crimson,
    },
    fabPressed: {
        opacity: 0.9,
    },
    fabIcon: {
        color: fantasyTokens.colors.parchment,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 22,
        lineHeight: 24,
        marginTop: -1,
    },
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
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 14,
        textAlign: 'center',
    },
    errorTitle: {
        color: fantasyTokens.colors.parchment,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 18,
        textAlign: 'center',
    },
    errorText: {
        color: fantasyTokens.colors.crimson,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 13,
        textAlign: 'center',
        marginTop: fantasyTokens.spacing.xs,
    },
});
