import {
    areCustomSubclassDraftsEqual,
    type CustomSubclassFormDraft,
} from '../subclassManager.types';
import {
    addCustomSubclassFeatureDraft,
    buildBlankCustomSubclassFeatureDraft,
    normaliseLevelInput,
    patchCustomSubclassDraft,
    patchCustomSubclassFeatureDraft,
    removeCustomSubclassFeatureDraft,
    validateCustomSubclassDraft,
} from '../customSubclassFormDraft';

function draftWithFeatures(
    features: CustomSubclassFormDraft['features'],
): CustomSubclassFormDraft {
    return {
        name: 'School of Glass',
        classId: 'wizard',
        description: 'A delicate art.',
        selectionLevel: '3',
        features,
    };
}

describe('areCustomSubclassDraftsEqual', () => {
    it('matches persisted and new features by stable identity regardless of order', () => {
        const persistedFeature = {
            clientId: 'persisted-client-id',
            id: 'feature-1',
            name: 'Glass Ward',
            description: 'Raise a brittle ward.',
            level: '3',
        };
        const newFeature = {
            clientId: 'new-feature-1',
            name: 'Shatterstep',
            description: 'Step through a nearby pane.',
            level: '6',
        };

        expect(areCustomSubclassDraftsEqual(
            draftWithFeatures([persistedFeature, newFeature]),
            draftWithFeatures([
                newFeature,
                { ...persistedFeature, clientId: 'different-transient-id' },
            ]),
        )).toBe(true);
    });

    it('detects a changed feature after matching by stable identity', () => {
        const feature = {
            clientId: 'new-feature-1',
            name: 'Shatterstep',
            description: 'Step through a nearby pane.',
            level: '6',
        };

        expect(areCustomSubclassDraftsEqual(
            draftWithFeatures([feature]),
            draftWithFeatures([{ ...feature, level: '10' }]),
        )).toBe(false);
    });

    it('rejects duplicate feature identities on either draft', () => {
        const feature = {
            clientId: 'new-feature-1',
            name: 'Shatterstep',
            description: 'Step through a nearby pane.',
            level: '6',
        };

        expect(areCustomSubclassDraftsEqual(
            draftWithFeatures([feature, { ...feature }]),
            draftWithFeatures([
                feature,
                { ...feature, clientId: 'new-feature-2' },
            ]),
        )).toBe(false);
    });
});

describe('custom subclass draft helpers', () => {
    it('normalises level input to numeric text with two digits by default', () => {
        expect(normaliseLevelInput('level 12')).toBe('12');
        expect(normaliseLevelInput('100')).toBe('10');
    });

    it('updates top-level and feature draft fields without mutating the source draft', () => {
        const feature = {
            clientId: 'feature-1',
            name: 'Glass Ward',
            description: 'Raise a brittle ward.',
            level: '3',
        };
        const draft = draftWithFeatures([feature]);

        const renamedDraft = patchCustomSubclassDraft(draft, { name: 'School of Mirrors' });
        const updatedFeatureDraft = patchCustomSubclassFeatureDraft(draft, 'feature-1', { level: '6' });
        const featureToAdd = buildBlankCustomSubclassFeatureDraft('feature-2');
        const draftWithAddedFeature = addCustomSubclassFeatureDraft(draft, featureToAdd);
        const draftWithoutFeature = removeCustomSubclassFeatureDraft(draft, 'feature-1');

        expect(renamedDraft.name).toBe('School of Mirrors');
        expect(updatedFeatureDraft.features[0]?.level).toBe('6');
        expect(draftWithAddedFeature.features).toHaveLength(2);
        expect(draftWithoutFeature.features).toHaveLength(0);
        expect(draft.name).toBe('School of Glass');
        expect(draft.features).toEqual([feature]);
    });

    it('validates required fields, selection level range, and duplicate features', () => {
        const feature = {
            clientId: 'feature-1',
            name: 'Glass Ward',
            description: 'Raise a brittle ward.',
            level: '3',
        };
        const validDraft = draftWithFeatures([feature]);

        expect(validateCustomSubclassDraft(validDraft)).toEqual({
            canSave: true,
            featureRowsAreValid: true,
        });
        expect(validateCustomSubclassDraft({
            ...validDraft,
            selectionLevel: '21',
        }).canSave).toBe(false);
        expect(validateCustomSubclassDraft(draftWithFeatures([
            feature,
            { ...feature, clientId: 'feature-2', name: ' glass ward ' },
        ])).featureRowsAreValid).toBe(false);
        expect(validateCustomSubclassDraft(draftWithFeatures([
            { ...feature, level: '' },
        ])).featureRowsAreValid).toBe(false);
    });
});
