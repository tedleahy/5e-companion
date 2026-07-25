import Ionicons from '@expo/vector-icons/Ionicons';
import { useMutation, useQuery } from '@apollo/client/react';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Snackbar, Switch, Text } from 'react-native-paper';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import CompendiumBackButton from '@/components/compendium/compendium-back-button';
import CompendiumScreenHeader from '@/components/compendium/compendium-screen-header';
import ConfirmDialog from '@/components/ConfirmDialog';
import CustomClassEditor from '@/components/classes/custom-class-editor';
import {
    formatGroupedEquipmentLines,
    formatGroupedProficiencyLines,
} from '@/components/classes/class-detail-presentation';
import FloatingAddButton from '@/components/floating-add-button';
import { ARCHIVE_CUSTOM_CLASS, GET_AVAILABLE_CLASSES, GET_CLASS_DETAILS } from '@/graphql/class.operations';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { AvailableClassesQuery, ClassDetailsFieldsFragment, ClassDetailsQuery, ClassDetailsQueryVariables } from '@/types/generated_graphql_types';

const ABILITY_LABELS: Record<string, string> = { str: 'Strength', dex: 'Dexterity', con: 'Constitution', int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma' };

export default function ClassCompendium() {
    const [showSrd, setShowSrd] = useState(true);
    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    const [archiveCandidate, setArchiveCandidate] = useState<{ id: string; name: string } | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [editorVisible, setEditorVisible] = useState(false);
    const [editorInitial, setEditorInitial] = useState<ClassDetailsFieldsFragment | null>(null);
    const available = useQuery<AvailableClassesQuery>(GET_AVAILABLE_CLASSES, { fetchPolicy: 'cache-and-network' });
    const details = useQuery<ClassDetailsQuery, ClassDetailsQueryVariables>(GET_CLASS_DETAILS, {
        variables: { value: selectedValue ?? '' },
        skip: selectedValue == null,
    });
    const [archiveClass, archiveState] = useMutation(ARCHIVE_CUSTOM_CLASS);
    const rows = useMemo(() => (available.data?.availableClasses ?? []).filter((row) => showSrd || row.isCustom), [available.data, showSrd]);
    const selected = details.data?.classDetails;
    const selectedMatches = selected != null && selected.value === selectedValue;
    const proficiencyLines = useMemo(
        () => (selectedMatches ? formatGroupedProficiencyLines(selected.proficiencies) : []),
        [selected, selectedMatches],
    );
    const equipmentLines = useMemo(
        () => (selectedMatches ? formatGroupedEquipmentLines(selected.equipment) : []),
        [selected, selectedMatches],
    );

    async function confirmArchive() {
        if (!archiveCandidate) return;
        try {
            await archiveClass({ variables: { id: archiveCandidate.id } });
            setArchiveCandidate(null);
            setSelectedValue(null);
            await available.refetch();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Unable to archive class.');
        }
    }

    if (available.loading && !available.data) return <Loading message="Gathering classes..." />;
    if (available.error) return <Loading message={available.error.message} error />;

    return (
        <View style={styles.container}>
            <CompendiumScreenHeader eyebrow="Compendium" title="Classes" />
            <CompendiumBackButton />
            <View style={styles.card}>
                {selectedValue == null ? (
                    <Animated.View entering={FadeIn.duration(fantasyTokens.motion.quick)} style={styles.flex}>
                        <View style={styles.toggleRow}>
                            <View style={styles.flex}>
                                <Text style={styles.toggleTitle}>Include SRD classes</Text>
                                <Text style={styles.muted}>{rows.length} class{rows.length === 1 ? '' : 'es'}</Text>
                            </View>
                            <Switch value={showSrd} onValueChange={setShowSrd} color={fantasyTokens.colors.claret} />
                        </View>
                        <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.listContent}>
                            {rows.map((row) => (
                                <Pressable key={row.id} onPress={() => setSelectedValue(row.value)} style={({ pressed }) => [styles.row, pressed && styles.pressed]} testID={`class-row-${row.value}`}>
                                    <View style={styles.badge}><Text style={styles.badgeText}>{row.emoji}</Text></View>
                                    <View style={styles.flex}>
                                        <Text style={styles.rowTitle}>{row.name}</Text>
                                        <Text style={styles.muted}>{row.isCustom ? 'Custom' : 'SRD'} · {row.primaryAbilityIndexes.map((value) => ABILITY_LABELS[value] ?? value).join(', ') || 'No primary ability listed'}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={fantasyTokens.colors.inkSoft} />
                                </Pressable>
                            ))}
                        </ScrollView>
                    </Animated.View>
                ) : (
                    <Animated.View entering={SlideInRight.duration(fantasyTokens.motion.standard)} style={styles.flex}>
                        <ClassDetailPane
                            detailsLoading={details.loading && !selectedMatches}
                            detailsError={details.error?.message ?? null}
                            selected={selectedMatches ? selected : null}
                            proficiencyLines={proficiencyLines}
                            equipmentLines={equipmentLines}
                            onBack={() => setSelectedValue(null)}
                            onRetry={() => { void details.refetch(); }}
                            onEdit={(classDetails) => { setEditorInitial(classDetails); setEditorVisible(true); }}
                            onArchive={(classDetails) => setArchiveCandidate({ id: classDetails.id, name: classDetails.name })}
                        />
                    </Animated.View>
                )}
            </View>
            {selectedValue == null ? <FloatingAddButton accessibilityLabel="Add custom class" testID="add-custom-class" onPress={() => { setEditorInitial(null); setEditorVisible(true); }} /> : null}
            <ConfirmDialog visible={archiveCandidate != null} title="Archive custom class?" message={archiveCandidate ? `${archiveCandidate.name} will no longer be available to new characters. Existing characters keep it.` : ''} confirmLabel={archiveState.loading ? 'Archiving...' : 'Archive'} onConfirm={() => void confirmArchive()} onCancel={() => setArchiveCandidate(null)} />
            <Snackbar visible={errorMessage != null} onDismiss={() => setErrorMessage(null)}>{errorMessage ?? ''}</Snackbar>
            <CustomClassEditor
                visible={editorVisible}
                initial={editorInitial}
                onClose={() => {
                    setEditorVisible(false);
                    setEditorInitial(null);
                }}
                onSaved={() => {
                    void available.refetch();
                    if (selectedValue != null) void details.refetch();
                }}
            />
        </View>
    );
}

type ClassDetailPaneProps = {
    detailsLoading: boolean;
    detailsError: string | null;
    selected: ClassDetailsFieldsFragment | null;
    proficiencyLines: ReturnType<typeof formatGroupedProficiencyLines>;
    equipmentLines: ReturnType<typeof formatGroupedEquipmentLines>;
    onBack: () => void;
    onRetry: () => void;
    onEdit: (selected: ClassDetailsFieldsFragment) => void;
    onArchive: (selected: ClassDetailsFieldsFragment) => void;
};

/**
 * Detail pane with explicit loading, error, not-found, and loaded states.
 * Every state keeps an All classes action; errors also offer retry.
 */
function ClassDetailPane({
    detailsLoading,
    detailsError,
    selected,
    proficiencyLines,
    equipmentLines,
    onBack,
    onRetry,
    onEdit,
    onArchive,
}: ClassDetailPaneProps) {
    return (
        <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.detailContent}>
            <Pressable onPress={onBack} style={styles.inlineBack} testID="class-detail-all-classes">
                <Ionicons name="arrow-back" size={18} color={fantasyTokens.colors.claret} />
                <Text style={styles.inlineBackText}>All classes</Text>
            </Pressable>
            {detailsLoading ? (
                <Loading message="Opening class details..." parchment testID="class-detail-loading" />
            ) : detailsError != null ? (
                <View style={styles.detailState} testID="class-detail-error">
                    <Text style={styles.error}>{detailsError}</Text>
                    <Pressable onPress={onRetry} style={styles.retryButton} testID="class-detail-retry">
                        <Text style={styles.retryLabel}>Retry</Text>
                    </Pressable>
                </View>
            ) : selected == null ? (
                <View style={styles.detailState} testID="class-detail-not-found">
                    <Text style={styles.muted}>Class details were not found.</Text>
                </View>
            ) : (
                <View testID="class-detail-loaded">
                    <View style={styles.detailHeading}>
                        <View>
                            <Text style={styles.detailTitle}>{selected.name}</Text>
                            <Text style={styles.muted}>{selected.isCustom ? 'Custom class' : selected.sourceBook ?? 'SRD'}</Text>
                        </View>
                        <View style={styles.badgeLarge}>
                            <Text style={styles.badgeLargeText}>d{selected.hitDie}</Text>
                            <Text style={styles.statLabel}>Hit die</Text>
                        </View>
                    </View>
                    {selected.description.length > 0
                        ? selected.description.map((text, index) => <Text key={index} selectable style={styles.body}>{text}</Text>)
                        : <Text style={styles.muted}>No SRD overview text is available.</Text>}
                    <Section title="Core rules">
                        <Text selectable style={styles.body}>Primary: {selected.primaryAbilityIndexes.map((value) => ABILITY_LABELS[value] ?? value).join(', ') || '—'}</Text>
                        <Text selectable style={styles.body}>Saving throws: {selected.savingThrowIndexes.map((value) => ABILITY_LABELS[value] ?? value).join(', ') || '—'}</Text>
                        <Text selectable style={styles.body}>Spellcasting: {selected.spellcastingMode === 'NONE' ? 'None' : `${selected.spellcastingMode.replace('_', ' ')} · ${ABILITY_LABELS[selected.spellcastingAbility ?? ''] ?? selected.spellcastingAbility}`}</Text>
                    </Section>
                    <Section title="Proficiencies">
                        {proficiencyLines.length === 0
                            ? <Text style={styles.muted}>None listed.</Text>
                            : proficiencyLines.map((line) => (
                                <Text key={line.key} selectable style={styles.body} testID={`class-detail-proficiency-${line.key}`}>
                                    {line.text}
                                </Text>
                            ))}
                    </Section>
                    <Section title="Starting equipment">
                        {equipmentLines.length === 0
                            ? <Text style={styles.muted}>None listed.</Text>
                            : equipmentLines.map((line) => (
                                <Text key={line.key} selectable style={styles.body} testID={`class-detail-equipment-${line.key}`}>
                                    {line.text}
                                </Text>
                            ))}
                    </Section>
                    <Section title="Level progression">
                        {selected.progression.map((level) => (
                            <View key={level.level} style={styles.progressionRow}>
                                <Text style={styles.level}>Level {level.level}</Text>
                                <Text style={styles.muted}>
                                    {level.abilityScoreImprovement ? 'ASI · ' : ''}
                                    {level.spellSlots.some(Boolean)
                                        ? `Slots ${level.spellSlots.map((count, index) => count ? `${index + 1}:${count}` : null).filter(Boolean).join(' ')}`
                                        : '—'}
                                </Text>
                            </View>
                        ))}
                    </Section>
                    <Section title="Features">
                        {selected.features.length === 0
                            ? <Text style={styles.muted}>No features listed.</Text>
                            : selected.features.map((feature) => (
                                <View key={feature.id} style={styles.feature}>
                                    <Text style={styles.level}>Level {feature.level}</Text>
                                    <Text style={styles.featureTitle}>{feature.name}</Text>
                                    <Text selectable style={styles.body}>{feature.description}</Text>
                                </View>
                            ))}
                    </Section>
                    <Section title={`Spell list (${selected.spells.length})`}>
                        {selected.spells.length === 0
                            ? <Text style={styles.muted}>No class spells.</Text>
                            : <Text selectable style={styles.body}>{selected.spells.map((spell) => spell.name).join(', ')}</Text>}
                    </Section>
                    {selected.isCustom ? (
                        <View style={styles.actions}>
                            <Pressable style={styles.secondaryButton} onPress={() => onEdit(selected)}>
                                <Text style={styles.secondaryLabel}>Edit class</Text>
                            </Pressable>
                            <Pressable style={styles.archiveButton} onPress={() => onArchive(selected)}>
                                <Text style={styles.archiveLabel}>Archive</Text>
                            </Pressable>
                        </View>
                    ) : null}
                </View>
            )}
        </ScrollView>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
        </View>
    );
}

function Loading({
    message,
    error = false,
    parchment = false,
    testID,
}: {
    message: string;
    error?: boolean;
    parchment?: boolean;
    testID?: string;
}) {
    return (
        <View style={[styles.loading, parchment && styles.loadingParchment]} testID={testID}>
            {!error ? <ActivityIndicator color={fantasyTokens.colors.gold} /> : null}
            <Text style={error ? styles.error : styles.loadingText}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: fantasyTokens.colors.night },
    flex: { flex: 1 },
    card: {
        flex: 1,
        margin: fantasyTokens.spacing.md,
        marginTop: fantasyTokens.spacing.sm,
        backgroundColor: fantasyTokens.colors.parchment,
        borderRadius: fantasyTokens.radii.md,
        overflow: 'hidden',
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.md,
        padding: fantasyTokens.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: fantasyTokens.colors.accordionBorder,
    },
    toggleTitle: { ...fantasyTokens.typography.sectionTitle, color: fantasyTokens.colors.inkDark },
    muted: { ...fantasyTokens.typography.bodySmall, color: fantasyTokens.colors.inkSoft },
    listContent: { paddingHorizontal: fantasyTokens.spacing.md, paddingBottom: fantasyTokens.spacing.xxl },
    row: {
        minHeight: 72,
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: fantasyTokens.colors.accordionBorder,
        paddingVertical: fantasyTokens.spacing.sm,
    },
    pressed: { backgroundColor: fantasyTokens.colors.claretSoft },
    badge: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.colors.parchmentDeep,
    },
    badgeText: { ...fantasyTokens.typography.sectionTitle, color: fantasyTokens.colors.claret },
    rowTitle: { ...fantasyTokens.typography.sectionTitle, color: fantasyTokens.colors.inkDark },
    detailContent: {
        padding: fantasyTokens.spacing.lg,
        gap: fantasyTokens.spacing.md,
        paddingBottom: fantasyTokens.spacing.xxl,
    },
    inlineBack: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.sm,
        alignSelf: 'flex-start',
        paddingVertical: fantasyTokens.spacing.xs,
    },
    inlineBackText: { ...fantasyTokens.typography.buttonLabel, color: fantasyTokens.colors.claret },
    detailHeading: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: fantasyTokens.spacing.md,
    },
    detailTitle: { ...fantasyTokens.typography.pageTitle, color: fantasyTokens.colors.inkDark },
    badgeLarge: {
        alignItems: 'center',
        minWidth: 72,
        padding: fantasyTokens.spacing.sm,
        backgroundColor: fantasyTokens.colors.parchmentDeep,
        borderRadius: fantasyTokens.radii.sm,
    },
    badgeLargeText: { ...fantasyTokens.typography.statValue, color: fantasyTokens.colors.claret },
    statLabel: { ...fantasyTokens.typography.statLabel, color: fantasyTokens.colors.inkSoft },
    body: { ...fantasyTokens.typography.body, color: fantasyTokens.colors.inkLight },
    section: {
        gap: fantasyTokens.spacing.sm,
        paddingTop: fantasyTokens.spacing.md,
        borderTopWidth: 1,
        borderTopColor: fantasyTokens.colors.accordionBorder,
    },
    sectionTitle: { ...fantasyTokens.typography.sectionTitle, color: fantasyTokens.colors.claret },
    progressionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.md,
        paddingVertical: fantasyTokens.spacing.xs,
    },
    level: { ...fantasyTokens.typography.buttonLabel, color: fantasyTokens.colors.ember },
    feature: {
        gap: fantasyTokens.spacing.xs,
        padding: fantasyTokens.spacing.md,
        backgroundColor: fantasyTokens.colors.parchmentLight,
        borderRadius: fantasyTokens.radii.sm,
    },
    featureTitle: { ...fantasyTokens.typography.sectionTitle, color: fantasyTokens.colors.inkDark },
    actions: { flexDirection: 'row', gap: fantasyTokens.spacing.sm },
    secondaryButton: {
        flex: 1,
        alignItems: 'center',
        padding: fantasyTokens.spacing.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.claret,
        borderRadius: fantasyTokens.radii.sm,
    },
    secondaryLabel: { ...fantasyTokens.typography.buttonLabel, color: fantasyTokens.colors.claret },
    archiveButton: {
        padding: fantasyTokens.spacing.md,
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.colors.crimson,
    },
    archiveLabel: { ...fantasyTokens.typography.buttonLabel, color: fantasyTokens.colors.parchment },
    loading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: fantasyTokens.spacing.md,
        backgroundColor: fantasyTokens.colors.night,
        padding: fantasyTokens.spacing.xl,
    },
    loadingParchment: { backgroundColor: fantasyTokens.colors.parchment },
    loadingText: { ...fantasyTokens.typography.body, color: fantasyTokens.colors.gold },
    error: { ...fantasyTokens.typography.body, color: fantasyTokens.colors.crimson, textAlign: 'center' },
    detailState: {
        alignItems: 'center',
        gap: fantasyTokens.spacing.md,
        paddingVertical: fantasyTokens.spacing.xl,
    },
    retryButton: {
        borderWidth: 1,
        borderColor: fantasyTokens.colors.claret,
        borderRadius: fantasyTokens.radii.sm,
        paddingVertical: fantasyTokens.spacing.sm,
        paddingHorizontal: fantasyTokens.spacing.md,
    },
    retryLabel: { ...fantasyTokens.typography.buttonLabel, color: fantasyTokens.colors.claret },
});
