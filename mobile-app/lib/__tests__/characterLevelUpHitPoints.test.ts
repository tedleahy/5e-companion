import {
    averageLevelUpHitDieValue,
    calculateLevelUpHpGain,
    createLevelUpHitPointsState,
    formatLevelUpHitDieLabel,
    levelUpHitDieSize,
    rollLevelUpHitDieValue,
} from '@/lib/characterLevelUp/hitPoints';

describe('characterLevelUp hit points', () => {
    it('returns the correct hit-die sizes and averages for supported classes', () => {
        expect(levelUpHitDieSize('barbarian')).toBe(12);
        expect(levelUpHitDieSize('fighter')).toBe(10);
        expect(levelUpHitDieSize('bard')).toBe(8);
        expect(levelUpHitDieSize('wizard')).toBe(6);

        expect(averageLevelUpHitDieValue('barbarian')).toBe(7);
        expect(averageLevelUpHitDieValue('fighter')).toBe(6);
        expect(averageLevelUpHitDieValue('bard')).toBe(5);
        expect(averageLevelUpHitDieValue('wizard')).toBe(4);
    });

    it('derives labels and averages from a configured custom-class hit die', () => {
        expect(formatLevelUpHitDieLabel('custom-class-id', 10)).toBe('d10');
        expect(averageLevelUpHitDieValue('custom-class-id', 10)).toBe(6);
        expect(levelUpHitDieSize('custom-class-id', 10)).toBe(10);
        expect(formatLevelUpHitDieLabel('custom-class-id')).toBe('d?');
        expect(averageLevelUpHitDieValue('custom-class-id')).toBe(1);
    });

    it('rolls within the class hit-die bounds', () => {
        expect(rollLevelUpHitDieValue('fighter', () => 0)).toBe(1);
        expect(rollLevelUpHitDieValue('fighter', () => 0.999)).toBe(10);
        expect(rollLevelUpHitDieValue('custom-class-id', () => 0.999, 10)).toBe(10);
    });

    it('applies the minimum-one HP gain rule after Constitution', () => {
        expect(calculateLevelUpHpGain(1, -5)).toBe(1);
        expect(calculateLevelUpHpGain(4, 2)).toBe(6);
    });

    it('builds rolled and average results with the stored breakdown fields', () => {
        expect(createLevelUpHitPointsState('wizard', 14, 'roll', () => 0.99)).toEqual({
            method: 'roll',
            hitDieSize: 6,
            hitDieValue: 6,
            constitutionModifier: 2,
            hpGained: 8,
        });

        expect(createLevelUpHitPointsState('wizard', 1, 'average')).toEqual({
            method: 'average',
            hitDieSize: 6,
            hitDieValue: 4,
            constitutionModifier: -5,
            hpGained: 1,
        });

        expect(createLevelUpHitPointsState('custom-class-id', 14, 'average', undefined, 10)).toEqual({
            method: 'average',
            hitDieSize: 10,
            hitDieValue: 6,
            constitutionModifier: 2,
            hpGained: 8,
        });
    });
});
