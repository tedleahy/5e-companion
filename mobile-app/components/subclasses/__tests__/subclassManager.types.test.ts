import {
    areCustomSubclassDraftsEqual,
    type CustomSubclassFormDraft,
} from '../subclassManager.types';

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
