import {
    canContinueFromAsiOrFeat,
    createLevelUpAsiOrFeatState,
    decrementLevelUpAsiAllocation,
    incrementLevelUpAsiAllocation,
    remainingLevelUpAsiPoints,
    setLevelUpAsiOrFeatMode,
    setLevelUpFeatDescription,
    setLevelUpFeatName,
} from '@/lib/characterLevelUp/asiOrFeat';

describe('characterLevelUp ASI / feat rules', () => {
    it('allocates up to two ASI points across one or two abilities', () => {
        let state = createLevelUpAsiOrFeatState();

        state = incrementLevelUpAsiAllocation(state, 'wisdom', 13);
        state = incrementLevelUpAsiAllocation(state, 'charisma', 11);

        expect(state.allocations.wisdom).toBe(1);
        expect(state.allocations.charisma).toBe(1);
        expect(remainingLevelUpAsiPoints(state.allocations)).toBe(0);
        expect(canContinueFromAsiOrFeat(state)).toBe(true);
    });

    it('prevents spending more than two points or more than two points on one ability', () => {
        let state = createLevelUpAsiOrFeatState();

        state = incrementLevelUpAsiAllocation(state, 'wisdom', 13);
        state = incrementLevelUpAsiAllocation(state, 'wisdom', 13);
        state = incrementLevelUpAsiAllocation(state, 'wisdom', 13);

        expect(state.allocations.wisdom).toBe(2);

        state = incrementLevelUpAsiAllocation(state, 'charisma', 11);
        expect(state.allocations.charisma).toBe(0);
    });

    it('prevents raising an ability score above 20', () => {
        let state = createLevelUpAsiOrFeatState();

        state = incrementLevelUpAsiAllocation(state, 'intelligence', 20);

        expect(state.allocations.intelligence).toBe(0);
        expect(remainingLevelUpAsiPoints(state.allocations)).toBe(2);
    });

    it('allows ASI points to be removed back down to zero only', () => {
        let state = createLevelUpAsiOrFeatState();

        state = incrementLevelUpAsiAllocation(state, 'wisdom', 13);
        state = decrementLevelUpAsiAllocation(state, 'wisdom');
        state = decrementLevelUpAsiAllocation(state, 'wisdom');

        expect(state.allocations.wisdom).toBe(0);
        expect(remainingLevelUpAsiPoints(state.allocations)).toBe(2);
    });

    it('requires both a feat name and description before continuing in feat mode', () => {
        let state = createLevelUpAsiOrFeatState();

        state = setLevelUpAsiOrFeatMode(state, 'feat');
        expect(canContinueFromAsiOrFeat(state)).toBe(false);

        state = setLevelUpFeatName(state, 'War Caster');
        expect(canContinueFromAsiOrFeat(state)).toBe(false);

        state = setLevelUpFeatDescription(
            state,
            'Advantage on Constitution saving throws made to maintain concentration.',
        );
        expect(canContinueFromAsiOrFeat(state)).toBe(true);
    });
});
