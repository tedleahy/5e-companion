import { useMutation } from '@apollo/client/react';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Snackbar, Text, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import ConfirmDialog from '@/components/ConfirmDialog';
import NumericStepper from '@/components/character-creation-wizard/NumericStepper';
import { CREATE_CUSTOM_CLASS, GET_AVAILABLE_CLASSES, GET_CUSTOM_CLASSES, UPDATE_CUSTOM_CLASS } from '@/graphql/class.operations';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { ClassDetailsFieldsFragment, ManagedCustomClassInput } from '@/types/generated_graphql_types';

const STAGES = ['Identity', 'Proficiencies', 'Equipment', 'Progression', 'Features', 'Review'] as const;
const ABILITIES = [{ value: 'str', label: 'STR' }, { value: 'dex', label: 'DEX' }, { value: 'con', label: 'CON' }, { value: 'int', label: 'INT' }, { value: 'wis', label: 'WIS' }, { value: 'cha', label: 'CHA' }] as const;

type DraftLevel = ManagedCustomClassInput['progression'][number];
type DraftFeature = ManagedCustomClassInput['features'][number] & { key: string };
type Draft = Omit<ManagedCustomClassInput, 'progression' | 'features'> & { progression: DraftLevel[]; features: DraftFeature[] };

function emptyProgression(): DraftLevel[] { return Array.from({ length: 20 }, (_, index) => ({ level: index + 1, abilityScoreImprovement: false, spellSlots: Array(9).fill(0), cantripsKnown: null, spellsKnown: null, preparedSpellCount: null, addSpellcastingAbility: false, displayValues: [] })); }
function createDraft(initial?: ClassDetailsFieldsFragment | null): Draft {
    if (!initial) return { name: '', description: '', hitDie: 8, primaryAbilityIndexes: [], savingThrowIndexes: [], multiclassPrerequisites: [], proficiencies: [], equipment: [], spellcastingMode: 'NONE', spellcastingAbility: null, progression: emptyProgression(), features: [], spellIds: [] };
    return {
        name: initial.name,
        description: initial.description.join('\n\n'),
        hitDie: initial.hitDie,
        primaryAbilityIndexes: [...initial.primaryAbilityIndexes],
        savingThrowIndexes: [...initial.savingThrowIndexes],
        multiclassPrerequisites: initial.multiclassPrerequisites.map((item) => ({ ...item })),
        proficiencies: initial.proficiencies.map(({ value, grant, choiceGroup, choiceCount }) => ({ value, grant, choiceGroup, choiceCount })),
        equipment: initial.equipment.map((item) => ({ ...item })),
        spellcastingMode: initial.spellcastingMode,
        spellcastingAbility: initial.spellcastingAbility,
        progression: initial.progression.map(({ displayValues, ...level }) => ({ ...level, spellSlots: [...level.spellSlots], displayValues: displayValues.map((item) => ({ ...item })) })),
        features: initial.features.map((feature) => ({ id: feature.id, key: feature.id, name: feature.name, description: feature.description, level: feature.level })),
        spellIds: initial.spells.map((spell) => spell.id),
    };
}

function serialiseDraft(draft: Draft): ManagedCustomClassInput {
    return { ...draft, features: draft.features.map(({ key: _key, ...feature }) => feature) };
}

function stageError(stage: number, draft: Draft): string | null {
    if (stage === 0) {
        if (!draft.name.trim() || !draft.description.trim()) return 'Name and description are required.';
        if (draft.primaryAbilityIndexes.length === 0) return 'Choose at least one primary ability.';
        if (draft.savingThrowIndexes.length !== 2) return 'Choose exactly two saving throws.';
    }
    if (stage === 3 && draft.spellcastingMode !== 'NONE' && !draft.spellcastingAbility) return 'Choose a spellcasting ability.';
    if (stage === 4 && draft.features.some((feature) => !feature.name.trim() || !feature.description.trim())) return 'Every feature needs a name and description.';
    return null;
}

export default function CustomClassEditor({ initial }: { initial?: ClassDetailsFieldsFragment | null }) {
    const router = useRouter();
    const initialDraft = useMemo(() => createDraft(initial), [initial]);
    const [draft, setDraft] = useState(initialDraft);
    const [stage, setStage] = useState(0);
    const [progressionLevel, setProgressionLevel] = useState(1);
    const [validationMessage, setValidationMessage] = useState<string | null>(null);
    const [discardVisible, setDiscardVisible] = useState(false);
    const [createClass, createState] = useMutation(CREATE_CUSTOM_CLASS);
    const [updateClass, updateState] = useMutation(UPDATE_CUSTOM_CLASS);
    const pending = createState.loading || updateState.loading;
    const locked = initial?.mechanicsLocked ?? false;
    const dirty = JSON.stringify(draft) !== JSON.stringify(initialDraft);
    const currentLevel = draft.progression[progressionLevel - 1]!;

    function update(patch: Partial<Draft>) { setDraft((value) => ({ ...value, ...patch })); setValidationMessage(null); }
    function toggleAbility(field: 'primaryAbilityIndexes' | 'savingThrowIndexes', value: string) {
        if (locked) return;
        const values = draft[field];
        update({ [field]: values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value] });
    }
    function updateCurrentLevel(patch: Partial<DraftLevel>) { if (!locked) update({ progression: draft.progression.map((item) => item.level === progressionLevel ? { ...item, ...patch } : item) }); }
    function move(delta: number) {
        if (delta > 0) { const error = stageError(stage, draft); if (error) { setValidationMessage(error); return; } }
        setStage((value) => Math.max(0, Math.min(STAGES.length - 1, value + delta)));
    }
    async function submit() {
        for (let index = 0; index < STAGES.length - 1; index += 1) { const error = stageError(index, draft); if (error) { setStage(index); setValidationMessage(error); return; } }
        try {
            if (initial) await updateClass({ variables: { id: initial.id, input: serialiseDraft(draft) }, refetchQueries: [GET_AVAILABLE_CLASSES, GET_CUSTOM_CLASSES] });
            else await createClass({ variables: { input: serialiseDraft(draft) }, refetchQueries: [GET_AVAILABLE_CLASSES, GET_CUSTOM_CLASSES] });
            router.replace('/compendium/classes');
        } catch (error) { setValidationMessage(error instanceof Error ? error.message : 'Unable to save custom class.'); }
    }
    function requestClose() { if (dirty) setDiscardVisible(true); else router.back(); }

    return (
        <View style={styles.screen}>
            <View style={styles.header}><Pressable testID="custom-class-cancel" onPress={requestClose}><Text style={styles.cancel}>Cancel</Text></Pressable><View style={styles.headerTitle}><Text style={styles.eyebrow}>{initial ? 'Edit custom class' : 'New custom class'}</Text><Text style={styles.title}>{STAGES[stage]}</Text></View><Text style={styles.step}>{stage + 1}/{STAGES.length}</Text></View>
            <View style={styles.progress}>{STAGES.map((_, index) => <View key={index} style={[styles.progressSegment, index <= stage && styles.progressSegmentActive]} />)}</View>
            {locked ? <View style={styles.lockBanner}><Text style={styles.lockText}>{initial?.mechanicsLockedReason}</Text></View> : null}
            <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                {stage === 0 ? <>
                    <Field testID="custom-class-name" label="Class name" value={draft.name} editable={!locked} onChangeText={(name) => update({ name })} />
                    <Field label="Description" value={draft.description} multiline onChangeText={(description) => update({ description })} />
                    <Text style={styles.label}>Hit die</Text><View style={styles.chips}>{[6, 8, 10, 12].map((die) => <Chip key={die} label={`d${die}`} selected={draft.hitDie === die} disabled={locked} onPress={() => update({ hitDie: die })} />)}</View>
                    <AbilityPicker label="Primary abilities" selected={draft.primaryAbilityIndexes} disabled={locked} onPress={(value) => toggleAbility('primaryAbilityIndexes', value)} />
                    <AbilityPicker label="Saving throws (choose two)" selected={draft.savingThrowIndexes} disabled={locked} onPress={(value) => toggleAbility('savingThrowIndexes', value)} />
                </> : null}
                {stage === 1 ? <>
                    <Field label="Multiclass prerequisites" helper="One per line: ability:minimum:group (for example str:13:1)" editable={!locked} value={draft.multiclassPrerequisites.map((item) => `${item.abilityIndex}:${item.minimum}:${item.group}`).join('\n')} multiline onChangeText={(text) => update({ multiclassPrerequisites: text.split('\n').filter(Boolean).map((line) => { const [abilityIndex, minimum, group] = line.split(':'); return { abilityIndex: abilityIndex?.trim() ?? '', minimum: Number(minimum), group: Number(group) }; }) })} />
                    <Field label="Starting proficiencies" helper="Comma-separated proficiency values. Use value|group|count for a choice." editable={!locked} value={formatProficiencies(draft, 'STARTING')} multiline onChangeText={(text) => update({ proficiencies: [...draft.proficiencies.filter((item) => item.grant !== 'STARTING'), ...parseProficiencies(text, 'STARTING')] })} />
                    <Field label="Multiclass proficiencies" helper="Comma-separated proficiency values." editable={!locked} value={formatProficiencies(draft, 'MULTICLASS')} multiline onChangeText={(text) => update({ proficiencies: [...draft.proficiencies.filter((item) => item.grant !== 'MULTICLASS'), ...parseProficiencies(text, 'MULTICLASS')] })} />
                </> : null}
                {stage === 2 ? <Field label="Starting equipment" helper="One per line: name|quantity|choice group|choice count. Choice fields may be blank." editable={!locked} value={draft.equipment.map((item) => `${item.name}|${item.quantity}|${item.choiceGroup ?? ''}|${item.choiceCount ?? ''}`).join('\n')} multiline onChangeText={(text) => update({ equipment: text.split('\n').filter(Boolean).map((line) => { const [name, quantity, group, count] = line.split('|'); return { name: name?.trim() ?? '', quantity: Number(quantity || 1), choiceGroup: group ? Number(group) : null, choiceCount: count ? Number(count) : null }; }) })} /> : null}
                {stage === 3 ? <>
                    <Text style={styles.label}>Spellcasting mode</Text><View style={styles.chips}>{['NONE', 'STANDARD', 'PACT_MAGIC'].map((mode) => <Chip key={mode} label={mode.replace('_', ' ')} selected={draft.spellcastingMode === mode} disabled={locked} onPress={() => update({ spellcastingMode: mode, spellcastingAbility: mode === 'NONE' ? null : draft.spellcastingAbility })} />)}</View>
                    {draft.spellcastingMode !== 'NONE' ? <AbilityPicker label="Spellcasting ability" selected={draft.spellcastingAbility ? [draft.spellcastingAbility] : []} disabled={locked} onPress={(value) => update({ spellcastingAbility: value })} /> : null}
                    <View style={styles.levelPicker}><Text style={styles.label}>Progression level</Text><NumericStepper value={progressionLevel} canDecrease={progressionLevel > 1} canIncrease={progressionLevel < 20} decrementLabel="Previous class level" incrementLabel="Next class level" tone="parchment" onDecrease={() => setProgressionLevel((value) => value - 1)} onIncrease={() => setProgressionLevel((value) => value + 1)} /></View>
                    <Pressable disabled={locked} onPress={() => updateCurrentLevel({ abilityScoreImprovement: !currentLevel.abilityScoreImprovement })} style={[styles.checkbox, currentLevel.abilityScoreImprovement && styles.checkboxSelected]}><Text style={styles.checkboxText}>{currentLevel.abilityScoreImprovement ? '✓ ' : ''}Ability Score Improvement</Text></Pressable>
                    <Field label="Spell slots, levels 1–9" helper="Nine comma-separated non-negative values." editable={!locked && draft.spellcastingMode !== 'NONE'} value={currentLevel.spellSlots.join(',')} onChangeText={(text) => updateCurrentLevel({ spellSlots: text.split(',').map((value) => Math.max(0, Number(value.trim()) || 0)).concat(Array(9).fill(0)).slice(0, 9) })} />
                    <View style={styles.fieldGrid}><NumberField label="Cantrips known" value={currentLevel.cantripsKnown} disabled={locked} onChange={(cantripsKnown) => updateCurrentLevel({ cantripsKnown })} /><NumberField label="Spells known" value={currentLevel.spellsKnown} disabled={locked} onChange={(spellsKnown) => updateCurrentLevel({ spellsKnown })} /><NumberField label="Prepared base" value={currentLevel.preparedSpellCount} disabled={locked} onChange={(preparedSpellCount) => updateCurrentLevel({ preparedSpellCount })} /></View>
                    <Pressable testID="custom-class-add-spellcasting-ability" disabled={locked || draft.spellcastingMode === 'NONE'} onPress={() => updateCurrentLevel({ addSpellcastingAbility: !currentLevel.addSpellcastingAbility })} style={[styles.checkbox, currentLevel.addSpellcastingAbility && styles.checkboxSelected, (locked || draft.spellcastingMode === 'NONE') && styles.disabled]}><Text style={styles.checkboxText}>{currentLevel.addSpellcastingAbility ? '✓ ' : ''}Add spellcasting ability modifier to prepared spells</Text></Pressable>
                </> : null}
                {stage === 4 ? <>
                    {draft.features.map((feature, index) => <View key={feature.key} style={styles.featureCard}><View style={styles.featureHeader}><Text style={styles.featureTitle}>Feature {index + 1}</Text>{!locked ? <Pressable onPress={() => update({ features: draft.features.filter((item) => item.key !== feature.key) })}><Text style={styles.remove}>Remove</Text></Pressable> : null}</View><Field label="Name" value={feature.name} onChangeText={(name) => update({ features: draft.features.map((item) => item.key === feature.key ? { ...item, name } : item) })} /><Field label="Description" value={feature.description} multiline onChangeText={(description) => update({ features: draft.features.map((item) => item.key === feature.key ? { ...item, description } : item) })} /><Field label="Level" value={String(feature.level)} keyboardType="number-pad" editable={!locked} onChangeText={(value) => update({ features: draft.features.map((item) => item.key === feature.key ? { ...item, level: Math.max(1, Math.min(20, Number(value) || 1)) } : item) })} /></View>)}
                    {!locked ? <Pressable style={styles.addButton} onPress={() => update({ features: [...draft.features, { key: `new-${Date.now()}`, name: '', description: '', level: 1 }] })}><Text style={styles.addLabel}>+ Add feature</Text></Pressable> : null}
                    <Field label="Class spell IDs" helper="Comma-separated spell IDs from the Compendium." editable={!locked && draft.spellcastingMode !== 'NONE'} value={draft.spellIds.join(', ')} multiline onChangeText={(text) => update({ spellIds: text.split(',').map((value) => value.trim()).filter(Boolean) })} />
                </> : null}
                {stage === 5 ? <Review draft={draft} locked={locked} /> : null}
            </ScrollView>
            <View style={styles.footer}>{stage > 0 ? <Pressable style={styles.secondary} onPress={() => move(-1)}><Text style={styles.secondaryText}>Back</Text></Pressable> : <View />}{stage < STAGES.length - 1 ? <Pressable style={styles.primary} onPress={() => move(1)}><Text style={styles.primaryText}>Continue</Text></Pressable> : <Pressable disabled={pending} style={[styles.primary, pending && styles.disabled]} onPress={() => void submit()}>{pending ? <ActivityIndicator color={fantasyTokens.colors.parchment} /> : <Text style={styles.primaryText}>Save class</Text>}</Pressable>}</View>
            <ConfirmDialog visible={discardVisible} title="Discard custom class draft?" message="Your unsaved class changes will be lost." confirmLabel="Discard" onConfirm={() => router.back()} onCancel={() => setDiscardVisible(false)} />
            <Snackbar visible={validationMessage != null} onDismiss={() => setValidationMessage(null)}>{validationMessage ?? ''}</Snackbar>
        </View>
    );
}

function Field({ label, helper, ...props }: React.ComponentProps<typeof TextInput> & { label: string; helper?: string }) { return <View style={styles.field}><Text style={styles.label}>{label}</Text>{helper ? <Text style={styles.helper}>{helper}</Text> : null}<TextInput mode="outlined" outlineColor={fantasyTokens.colors.accordionBorder} activeOutlineColor={fantasyTokens.colors.claret} textColor={fantasyTokens.colors.inkDark} style={styles.input} {...props} /></View>; }
function Chip({ label, selected, disabled, onPress }: { label: string; selected: boolean; disabled?: boolean; onPress: () => void }) { return <Pressable disabled={disabled} onPress={onPress} style={[styles.chip, selected && styles.chipSelected, disabled && styles.disabled]}><Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text></Pressable>; }
function AbilityPicker({ label, selected, disabled, onPress }: { label: string; selected: string[]; disabled?: boolean; onPress: (value: string) => void }) { return <View style={styles.field}><Text style={styles.label}>{label}</Text><View style={styles.chips}>{ABILITIES.map((ability) => <Chip key={ability.value} label={ability.label} selected={selected.includes(ability.value)} disabled={disabled} onPress={() => onPress(ability.value)} />)}</View></View>; }
function NumberField({ label, value, disabled, onChange }: { label: string; value: number | null | undefined; disabled: boolean; onChange: (value: number | null) => void }) { return <Field label={label} value={value == null ? '' : String(value)} editable={!disabled} keyboardType="number-pad" onChangeText={(text) => onChange(text.trim() ? Math.max(0, Number(text) || 0) : null)} />; }
function formatProficiencies(draft: Draft, grant: string) { return draft.proficiencies.filter((item) => item.grant === grant).map((item) => [item.value, item.choiceGroup, item.choiceCount].filter((value) => value != null).join('|')).join(', '); }
function parseProficiencies(text: string, grant: string) { return text.split(',').map((entry) => entry.trim()).filter(Boolean).map((entry) => { const [value, group, count] = entry.split('|'); return { value: value ?? '', grant, choiceGroup: group ? Number(group) : null, choiceCount: count ? Number(count) : null }; }); }
function Review({ draft, locked }: { draft: Draft; locked: boolean }) { return <View style={styles.review}><Text style={styles.reviewTitle}>{draft.name}</Text><Text selectable style={styles.reviewBody}>{draft.description}</Text><Text style={styles.reviewLine}>d{draft.hitDie} · {draft.primaryAbilityIndexes.join(', ').toUpperCase()}</Text><Text style={styles.reviewLine}>{draft.features.length} features · {draft.spellIds.length} spells</Text>{locked ? <Text style={styles.lockText}>Only descriptive fields will be updated.</Text> : <Text style={styles.helper}>Review all stages. Saving is available only here.</Text>}</View>; }

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: fantasyTokens.colors.parchment }, header: { minHeight: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: fantasyTokens.spacing.md, paddingHorizontal: fantasyTokens.spacing.lg, borderBottomWidth: 1, borderBottomColor: fantasyTokens.colors.accordionBorder }, headerTitle: { flex: 1, alignItems: 'center' }, eyebrow: { ...fantasyTokens.typography.eyebrow, color: fantasyTokens.colors.inkSoft }, title: { ...fantasyTokens.typography.sectionTitle, color: fantasyTokens.colors.inkDark }, cancel: { ...fantasyTokens.typography.buttonLabel, color: fantasyTokens.colors.claret }, step: { ...fantasyTokens.typography.buttonLabel, color: fantasyTokens.colors.inkSoft }, progress: { flexDirection: 'row', gap: fantasyTokens.spacing.xs, padding: fantasyTokens.spacing.sm }, progressSegment: { flex: 1, height: 3, borderRadius: 2, backgroundColor: fantasyTokens.colors.accordionBorder }, progressSegmentActive: { backgroundColor: fantasyTokens.colors.claret }, lockBanner: { padding: fantasyTokens.spacing.sm, backgroundColor: fantasyTokens.colors.crimsonSoft }, lockText: { ...fantasyTokens.typography.bodySmall, color: fantasyTokens.colors.crimson, textAlign: 'center' }, content: { padding: fantasyTokens.spacing.lg, gap: fantasyTokens.spacing.lg, paddingBottom: fantasyTokens.spacing.xxl }, field: { gap: fantasyTokens.spacing.xs }, label: { ...fantasyTokens.typography.buttonLabel, color: fantasyTokens.colors.ember }, helper: { ...fantasyTokens.typography.bodySmall, color: fantasyTokens.colors.inkSoft }, input: { backgroundColor: fantasyTokens.colors.parchmentLight }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: fantasyTokens.spacing.sm }, chip: { paddingHorizontal: fantasyTokens.spacing.md, paddingVertical: fantasyTokens.spacing.sm, borderWidth: 1, borderColor: fantasyTokens.colors.accordionBorder, borderRadius: fantasyTokens.radii.sm }, chipSelected: { backgroundColor: fantasyTokens.colors.claret, borderColor: fantasyTokens.colors.claret }, chipText: { ...fantasyTokens.typography.buttonLabel, color: fantasyTokens.colors.inkLight }, chipTextSelected: { color: fantasyTokens.colors.parchment }, levelPicker: { gap: fantasyTokens.spacing.sm, alignItems: 'flex-start' }, checkbox: { padding: fantasyTokens.spacing.md, borderWidth: 1, borderColor: fantasyTokens.colors.accordionBorder, borderRadius: fantasyTokens.radii.sm }, checkboxSelected: { borderColor: fantasyTokens.colors.claret, backgroundColor: fantasyTokens.colors.claretSoft }, checkboxText: { ...fantasyTokens.typography.body, color: fantasyTokens.colors.inkDark }, fieldGrid: { gap: fantasyTokens.spacing.md }, featureCard: { gap: fantasyTokens.spacing.md, padding: fantasyTokens.spacing.md, backgroundColor: fantasyTokens.colors.parchmentLight, borderRadius: fantasyTokens.radii.md, borderWidth: 1, borderColor: fantasyTokens.colors.accordionBorder }, featureHeader: { flexDirection: 'row', justifyContent: 'space-between' }, featureTitle: { ...fantasyTokens.typography.sectionTitle, color: fantasyTokens.colors.inkDark }, remove: { ...fantasyTokens.typography.buttonLabel, color: fantasyTokens.colors.crimson }, addButton: { alignItems: 'center', padding: fantasyTokens.spacing.md, borderWidth: 1, borderColor: fantasyTokens.colors.claret, borderRadius: fantasyTokens.radii.sm }, addLabel: { ...fantasyTokens.typography.buttonLabel, color: fantasyTokens.colors.claret }, review: { gap: fantasyTokens.spacing.md }, reviewTitle: { ...fantasyTokens.typography.pageTitle, color: fantasyTokens.colors.inkDark }, reviewBody: { ...fantasyTokens.typography.body, color: fantasyTokens.colors.inkLight }, reviewLine: { ...fantasyTokens.typography.sectionTitle, color: fantasyTokens.colors.claret }, footer: { minHeight: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: fantasyTokens.spacing.md, padding: fantasyTokens.spacing.md, borderTopWidth: 1, borderTopColor: fantasyTokens.colors.accordionBorder }, primary: { minWidth: 124, alignItems: 'center', padding: fantasyTokens.spacing.md, backgroundColor: fantasyTokens.colors.claret, borderRadius: fantasyTokens.radii.sm }, primaryText: { ...fantasyTokens.typography.buttonLabel, color: fantasyTokens.colors.parchment }, secondary: { minWidth: 100, alignItems: 'center', padding: fantasyTokens.spacing.md, borderWidth: 1, borderColor: fantasyTokens.colors.accordionBorder, borderRadius: fantasyTokens.radii.sm }, secondaryText: { ...fantasyTokens.typography.buttonLabel, color: fantasyTokens.colors.inkLight }, disabled: { opacity: 0.5 },
});
