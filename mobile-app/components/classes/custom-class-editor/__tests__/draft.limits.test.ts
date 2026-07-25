import { applyDraftPatch, isEditorSessionOpenChange } from '../editorSession';
import {
    canAddEquipmentEntry,
    canAddFeature,
    canAddSpell,
    canFitProficiencies,
    CUSTOM_CLASS_EQUIPMENT_MAX_COUNT,
    CUSTOM_CLASS_FEATURE_MAX_COUNT,
    CUSTOM_CLASS_NAME_MAX_LENGTH,
    CUSTOM_CLASS_PROFICIENCY_MAX_COUNT,
    CUSTOM_CLASS_SPELL_LIST_MAX_COUNT,
    draftLimitError,
    maxSelectableProficiencies,
} from '../limits';
import { createDraft } from '../draft';

describe('editorSession helpers', () => {
    test('detects only closed-to-open session transitions', () => {
        expect(isEditorSessionOpenChange(true, false)).toBe(true);
        expect(isEditorSessionOpenChange(true, true)).toBe(false);
        expect(isEditorSessionOpenChange(false, true)).toBe(false);
        expect(isEditorSessionOpenChange(false, false)).toBe(false);
    });

    test('applyDraftPatch merges and marks dirty without serialising', () => {
        expect(applyDraftPatch({ name: 'Warden', hitDie: 8 }, { name: 'Guardian' })).toEqual({
            next: { name: 'Guardian', hitDie: 8 },
            dirty: true,
        });
    });
});

describe('custom class draft limits', () => {
    test('rejects oversized identity and collection payloads', () => {
        const draft = createDraft(null);
        draft.name = 'A'.repeat(CUSTOM_CLASS_NAME_MAX_LENGTH + 1);
        expect(draftLimitError(draft)).toMatch(/Class name must be/);

        draft.name = 'Warden';
        draft.equipment = Array.from({ length: CUSTOM_CLASS_EQUIPMENT_MAX_COUNT + 1 }, (_, index) => ({
            key: `eq-${index}`,
            name: `Item ${index}`,
            quantity: 1,
            choiceGroup: null,
            choiceCount: null,
        }));
        expect(draftLimitError(draft)).toMatch(/Starting equipment is limited/);

        draft.equipment = [];
        draft.features = Array.from({ length: CUSTOM_CLASS_FEATURE_MAX_COUNT + 1 }, (_, index) => ({
            key: `f-${index}`,
            name: `Feature ${index}`,
            description: 'Rules text.',
            level: 1,
        }));
        expect(draftLimitError(draft)).toMatch(/Class features are limited/);

        draft.features = [];
        draft.spells = Array.from({ length: CUSTOM_CLASS_SPELL_LIST_MAX_COUNT + 1 }, (_, index) => ({
            id: `spell-${index}`,
            name: `Spell ${index}`,
            level: 1,
        }));
        expect(draftLimitError(draft)).toMatch(/Class spell list is limited/);
    });

    test('add helpers respect shared collection caps', () => {
        expect(canAddEquipmentEntry(CUSTOM_CLASS_EQUIPMENT_MAX_COUNT - 1)).toBe(true);
        expect(canAddEquipmentEntry(CUSTOM_CLASS_EQUIPMENT_MAX_COUNT)).toBe(false);
        expect(canAddFeature(CUSTOM_CLASS_FEATURE_MAX_COUNT)).toBe(false);
        expect(canAddSpell(CUSTOM_CLASS_SPELL_LIST_MAX_COUNT - 1)).toBe(true);
        expect(canAddSpell(CUSTOM_CLASS_SPELL_LIST_MAX_COUNT)).toBe(false);
        expect(maxSelectableProficiencies(CUSTOM_CLASS_PROFICIENCY_MAX_COUNT, 0)).toBe(0);
        expect(maxSelectableProficiencies(CUSTOM_CLASS_PROFICIENCY_MAX_COUNT, 3)).toBe(3);
        expect(maxSelectableProficiencies(CUSTOM_CLASS_PROFICIENCY_MAX_COUNT - 2, 0)).toBe(2);
        expect(canFitProficiencies(CUSTOM_CLASS_PROFICIENCY_MAX_COUNT - 1, 1)).toBe(true);
        expect(canFitProficiencies(CUSTOM_CLASS_PROFICIENCY_MAX_COUNT, 1)).toBe(false);
    });
});
