import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Chip, Divider, Text } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { fantasyTokens } from '../../theme/fantasyTheme';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { DetailRow, ParchmentPanel } from '../../components/FantasyPrimitives';
import { Spell } from '../../types/generated_graphql_types';
import { schoolAndLevelLabel } from '../../lib/spellUtils';

const GET_SPELL = gql`
    query Spell($id: ID!) {
        spell(id: $id) {
            id
            name
            level
            schoolIndex
            classIndexes
            description
            higherLevel
            range
            components
            material
            ritual
            duration
            concentration
            castingTime
        }
    }
`;

type SpellDetailsQueryData = {
    spell?: Spell;
};

export default function SpellDetails() {
    const { id } = useLocalSearchParams<{ id?: string }>();

    const { data, loading, error } = useQuery<SpellDetailsQueryData>(GET_SPELL, {
        variables: { id: id ?? '' },
        skip: !id,
    });
    if (error) console.error(`Error loading spell details: ${error}`);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator />
            </View>
        );
    }

    const spell = data?.spell;
    if (!spell) {
        return (
            <View style={styles.container}>
                <Text style={styles.stateText}>Spell not found.</Text>
            </View>
        );
    }

    const {
        name,
        description,
        higherLevel,
        range,
        components,
        material,
        ritual,
        duration,
        concentration,
        castingTime,
    } = spell;

    const componentsLabel = material
        ? `${components.join(', ')} (${material})`
        : components.join(', ');

    return (
        <ScrollView style={styles.page} contentContainerStyle={styles.content}>
            <ParchmentPanel style={styles.headerPanel} variant="light" elevation={2}>
                <Text style={styles.kicker}>Spell Codex</Text>
                <Text style={styles.title}>{name}</Text>
                <Text style={styles.subtitle}>{schoolAndLevelLabel(spell)}</Text>
            </ParchmentPanel>

            <ParchmentPanel style={styles.detailPanel} elevation={1}>
                <DetailRow label="Casting Time" value={castingTime} />
                <DetailRow label="Range" value={range ?? '—'} />
                <DetailRow label="Components" value={componentsLabel} />
                <DetailRow label="Duration" value={duration ?? '—'} />
                <View style={styles.tagRow}>
                    {ritual && (
                        <Chip compact style={styles.tagChip} textStyle={styles.tagText}>
                            Ritual
                        </Chip>
                    )}
                    {concentration && (
                        <Chip compact style={styles.tagChip} textStyle={styles.tagText}>
                            Concentration
                        </Chip>
                    )}
                </View>
            </ParchmentPanel>

            <ParchmentPanel style={styles.detailPanel} elevation={1}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.body}>{description.join('\n\n')}</Text>
                <Divider style={styles.divider} />
                {higherLevel.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>At Higher Levels</Text>
                        <Text style={styles.body}>{higherLevel.join('\n\n')}</Text>
                    </>
                )}
            </ParchmentPanel>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: fantasyTokens.colors.night,
        padding: fantasyTokens.spacing.md,
    },
    stateText: {
        color: fantasyTokens.colors.parchment,
        fontFamily: 'serif',
        fontSize: 16,
    },
    page: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.night,
    },
    content: {
        padding: fantasyTokens.spacing.lg,
        gap: fantasyTokens.spacing.md,
    },
    headerPanel: {
        padding: fantasyTokens.spacing.lg,
        borderRadius: fantasyTokens.radii.lg,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    kicker: {
        fontSize: 12,
        letterSpacing: 3,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.ember,
        fontFamily: 'serif',
        marginBottom: fantasyTokens.spacing.sm,
    },
    title: {
        fontSize: 30,
        color: fantasyTokens.colors.inkDark,
        fontFamily: 'serif',
        marginBottom: fantasyTokens.spacing.xs,
    },
    subtitle: {
        fontSize: 16,
        color: fantasyTokens.colors.inkSoft,
        fontFamily: 'serif',
    },
    detailPanel: {
        padding: fantasyTokens.spacing.md,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 12,
    },
    tagChip: {
        backgroundColor: fantasyTokens.colors.crimson,
    },
    tagText: {
        color: fantasyTokens.colors.parchment,
        fontFamily: 'serif',
    },
    sectionTitle: {
        fontSize: 14,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.ember,
        marginBottom: fantasyTokens.spacing.sm,
        fontFamily: 'serif',
    },
    body: {
        fontSize: 16,
        lineHeight: 24,
        color: fantasyTokens.colors.inkDark,
        fontFamily: 'serif',
    },
    divider: {
        marginVertical: fantasyTokens.spacing.sm,
        backgroundColor: fantasyTokens.colors.gold,
    },
});
