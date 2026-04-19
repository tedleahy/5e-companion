import {
    getClassResourceChanges,
    hasClassResourceChanges,
} from '../characterLevelUp/classResources';

describe('getClassResourceChanges', () => {
    it('returns barbarian rage and damage changes at level 3', () => {
        const changes = getClassResourceChanges('barbarian', 2, 3);

        expect(changes).toEqual([
            { key: 'barbarian-rages', label: 'Rages', previousValue: '2', nextValue: '3', changed: true },
            { key: 'barbarian-rage-damage', label: 'Rage Damage', previousValue: '+2', nextValue: '+2', changed: false },
        ]);
    });

    it('returns barbarian infinite rages at level 20', () => {
        const changes = getClassResourceChanges('barbarian', 19, 20);
        const rageChange = changes.find((c) => c.key === 'barbarian-rages')!;

        expect(rageChange.nextValue).toBe('∞');
        expect(rageChange.changed).toBe(true);
    });

    it('returns monk ki, martial arts, and movement changes', () => {
        const changes = getClassResourceChanges('monk', 4, 5);

        expect(changes).toEqual([
            { key: 'monk-martial-arts', label: 'Martial Arts', previousValue: '1d4', nextValue: '1d6', changed: true },
            { key: 'monk-ki', label: 'Ki Points', previousValue: '4', nextValue: '5', changed: true },
            { key: 'monk-movement', label: 'Unarmoured Movement', previousValue: '+10 ft', nextValue: '+10 ft', changed: false },
        ]);
    });

    it('returns monk ki unlocking at level 2', () => {
        const changes = getClassResourceChanges('monk', 1, 2);
        const kiChange = changes.find((c) => c.key === 'monk-ki')!;

        expect(kiChange.previousValue).toBe('—');
        expect(kiChange.nextValue).toBe('2');
        expect(kiChange.changed).toBe(true);
    });

    it('returns rogue sneak attack progression', () => {
        const changes = getClassResourceChanges('rogue', 2, 3);

        expect(changes).toEqual([
            { key: 'rogue-sneak-attack', label: 'Sneak Attack', previousValue: '1d6', nextValue: '2d6', changed: true },
        ]);
    });

    it('returns no change for rogue at even levels', () => {
        const changes = getClassResourceChanges('rogue', 3, 4);

        expect(changes[0].changed).toBe(false);
    });

    it('returns sorcery point changes', () => {
        const changes = getClassResourceChanges('sorcerer', 2, 3);

        expect(changes).toEqual([
            { key: 'sorcerer-sorcery-points', label: 'Sorcery Points', previousValue: '2', nextValue: '3', changed: true },
        ]);
    });

    it('returns warlock invocation changes at level 5', () => {
        const changes = getClassResourceChanges('warlock', 4, 5);

        expect(changes).toEqual([
            { key: 'warlock-invocations', label: 'Invocations Known', previousValue: '2', nextValue: '3', changed: true },
        ]);
    });

    it('returns no warlock invocation change at non-upgrade levels', () => {
        const changes = getClassResourceChanges('warlock', 5, 6);

        expect(changes[0].changed).toBe(false);
    });

    it('returns empty array for classes without resource tracking', () => {
        expect(getClassResourceChanges('wizard', 10, 11)).toEqual([]);
        expect(getClassResourceChanges('cleric', 5, 6)).toEqual([]);
    });

    it('returns empty array for unknown classes', () => {
        expect(getClassResourceChanges('artificer', 1, 2)).toEqual([]);
    });
});

describe('hasClassResourceChanges', () => {
    it('returns true when at least one resource changes', () => {
        expect(hasClassResourceChanges('barbarian', 2, 3)).toBe(true);
    });

    it('returns false when no resources change', () => {
        expect(hasClassResourceChanges('barbarian', 3, 4)).toBe(false);
    });

    it('returns false for classes without tracked resources', () => {
        expect(hasClassResourceChanges('wizard', 10, 11)).toBe(false);
    });
});
