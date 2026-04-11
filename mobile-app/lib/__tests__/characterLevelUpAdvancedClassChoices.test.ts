import {
    buildInvocationPrerequisiteContext,
    canContinueFromAdvancedResources,
    canContinueFromInvocations,
    canContinueFromMetamagic,
    canContinueFromMysticArcanum,
    canSwapInvocation,
    checkInvocationPrerequisite,
    createLevelUpInvocationState,
    createLevelUpMetamagicState,
    createLevelUpMysticArcanumState,
    hasInvocationGain,
    hasMetamagicGain,
    hasMysticArcanumGain,
    invocationGainCount,
    isAtMaxLevel,
    MAX_CHARACTER_LEVEL,
    metamagicGainCount,
    mysticArcanumSpellLevel,
    setCustomInvocation,
    setCustomMetamagic,
    setInvocationSwapIn,
    setInvocationSwapOut,
    setMysticArcanumSpell,
    toggleInvocationSelection,
    toggleMetamagicSelection,
} from '../characterLevelUp/advancedClassChoices';
import type { InvocationPrerequisiteContext } from '../characterLevelUp/advancedClassChoices';

describe('invocationGainCount', () => {
    it('returns 2 when warlock reaches level 2 (first invocations)', () => {
        expect(invocationGainCount(1, 2)).toBe(2);
    });

    it('returns 1 at invocation gain levels (5, 7, 9, 12, 15, 18)', () => {
        expect(invocationGainCount(4, 5)).toBe(1);
        expect(invocationGainCount(6, 7)).toBe(1);
        expect(invocationGainCount(8, 9)).toBe(1);
        expect(invocationGainCount(11, 12)).toBe(1);
        expect(invocationGainCount(14, 15)).toBe(1);
        expect(invocationGainCount(17, 18)).toBe(1);
    });

    it('returns 0 at levels where no invocation is gained', () => {
        expect(invocationGainCount(2, 3)).toBe(0);
        expect(invocationGainCount(3, 4)).toBe(0);
        expect(invocationGainCount(5, 6)).toBe(0);
    });

    it('returns 0 at level 1', () => {
        expect(invocationGainCount(0, 1)).toBe(0);
    });

    it('caps at 8 invocations at level 18+', () => {
        expect(invocationGainCount(17, 18)).toBe(1);
        expect(invocationGainCount(18, 19)).toBe(0);
        expect(invocationGainCount(19, 20)).toBe(0);
    });
});

describe('hasInvocationGain', () => {
    it('returns true when invocations are gained', () => {
        expect(hasInvocationGain(1, 2)).toBe(true);
    });

    it('returns false when no invocations are gained', () => {
        expect(hasInvocationGain(3, 4)).toBe(false);
    });
});

describe('canSwapInvocation', () => {
    it('returns false below level 3', () => {
        expect(canSwapInvocation(1)).toBe(false);
        expect(canSwapInvocation(2)).toBe(false);
    });

    it('returns true at level 3 and above', () => {
        expect(canSwapInvocation(3)).toBe(true);
        expect(canSwapInvocation(10)).toBe(true);
    });
});

describe('metamagicGainCount', () => {
    it('returns 1 at metamagic gain levels (3, 10, 17)', () => {
        expect(metamagicGainCount(3)).toBe(1);
        expect(metamagicGainCount(10)).toBe(1);
        expect(metamagicGainCount(17)).toBe(1);
    });

    it('returns 0 at non-gain levels', () => {
        expect(metamagicGainCount(1)).toBe(0);
        expect(metamagicGainCount(4)).toBe(0);
        expect(metamagicGainCount(11)).toBe(0);
    });
});

describe('hasMetamagicGain', () => {
    it('returns true at gain levels', () => {
        expect(hasMetamagicGain(3)).toBe(true);
    });

    it('returns false at non-gain levels', () => {
        expect(hasMetamagicGain(4)).toBe(false);
    });
});

describe('mysticArcanumSpellLevel', () => {
    it('returns 6 at warlock level 11', () => {
        expect(mysticArcanumSpellLevel(11)).toBe(6);
    });

    it('returns 7 at warlock level 13', () => {
        expect(mysticArcanumSpellLevel(13)).toBe(7);
    });

    it('returns 8 at warlock level 15', () => {
        expect(mysticArcanumSpellLevel(15)).toBe(8);
    });

    it('returns 9 at warlock level 17', () => {
        expect(mysticArcanumSpellLevel(17)).toBe(9);
    });

    it('returns null at non-arcanum levels', () => {
        expect(mysticArcanumSpellLevel(10)).toBeNull();
        expect(mysticArcanumSpellLevel(12)).toBeNull();
    });
});

describe('hasMysticArcanumGain', () => {
    it('returns true at arcanum levels', () => {
        expect(hasMysticArcanumGain(11)).toBe(true);
    });

    it('returns false at non-arcanum levels', () => {
        expect(hasMysticArcanumGain(10)).toBe(false);
    });
});

describe('isAtMaxLevel', () => {
    it('returns false below level 20', () => {
        expect(isAtMaxLevel(19)).toBe(false);
        expect(isAtMaxLevel(1)).toBe(false);
    });

    it('returns true at level 20', () => {
        expect(isAtMaxLevel(20)).toBe(true);
    });

    it('returns true above level 20 (edge case)', () => {
        expect(isAtMaxLevel(21)).toBe(true);
    });

    it('MAX_CHARACTER_LEVEL is 20', () => {
        expect(MAX_CHARACTER_LEVEL).toBe(20);
    });
});

describe('toggleInvocationSelection', () => {
    it('adds an invocation when under the max', () => {
        const state = createLevelUpInvocationState();
        const next = toggleInvocationSelection(state, 'agonizing-blast', 2);

        expect(next.selectedInvocations).toEqual(['agonizing-blast']);
    });

    it('removes an invocation when already selected', () => {
        let state = createLevelUpInvocationState();
        state = toggleInvocationSelection(state, 'agonizing-blast', 2);
        const next = toggleInvocationSelection(state, 'agonizing-blast', 2);

        expect(next.selectedInvocations).toEqual([]);
    });

    it('does not exceed max selections', () => {
        let state = createLevelUpInvocationState();
        state = toggleInvocationSelection(state, 'agonizing-blast', 1);
        const next = toggleInvocationSelection(state, 'armor-of-shadows', 1);

        expect(next.selectedInvocations).toEqual(['agonizing-blast']);
    });
});

describe('setCustomInvocation', () => {
    it('sets a custom invocation', () => {
        const state = createLevelUpInvocationState();
        const next = setCustomInvocation(state, { name: 'Foo', description: 'Bar' });

        expect(next.customInvocation).toEqual({ name: 'Foo', description: 'Bar' });
    });

    it('clears custom invocation with null', () => {
        let state = createLevelUpInvocationState();
        state = setCustomInvocation(state, { name: 'Foo', description: 'Bar' });
        const next = setCustomInvocation(state, null);

        expect(next.customInvocation).toBeNull();
    });
});

describe('setInvocationSwapOut / setInvocationSwapIn', () => {
    it('sets swap out id', () => {
        const state = createLevelUpInvocationState();
        const next = setInvocationSwapOut(state, 'old-inv');

        expect(next.isSwappingInvocation).toBe(true);
        expect(next.swapOutInvocationId).toBe('old-inv');
    });

    it('keeps swap mode active when the swap-out field is blank', () => {
        const state = createLevelUpInvocationState();
        const next = setInvocationSwapOut(state, '');

        expect(next.isSwappingInvocation).toBe(true);
        expect(next.swapOutInvocationId).toBe('');
    });

    it('clears swap state when swap out is set to null', () => {
        let state = createLevelUpInvocationState();
        state = setInvocationSwapOut(state, 'old-inv');
        state = setInvocationSwapIn(state, { id: 'new-inv', name: 'New', isCustom: false });
        const next = setInvocationSwapOut(state, null);

        expect(next.isSwappingInvocation).toBe(false);
        expect(next.swapOutInvocationId).toBeNull();
        expect(next.swapInInvocation).toBeNull();
    });

    it('sets swap in invocation', () => {
        const state = createLevelUpInvocationState();
        const next = setInvocationSwapIn(state, { id: 'new-inv', name: 'New', isCustom: true });

        expect(next.swapInInvocation).toEqual({ id: 'new-inv', name: 'New', isCustom: true });
    });
});

describe('toggleMetamagicSelection', () => {
    it('adds a metamagic option when under the max', () => {
        const state = createLevelUpMetamagicState();
        const next = toggleMetamagicSelection(state, 'careful-spell', 1);

        expect(next.selectedMetamagicIds).toEqual(['careful-spell']);
    });

    it('removes a metamagic option when already selected', () => {
        let state = createLevelUpMetamagicState();
        state = toggleMetamagicSelection(state, 'careful-spell', 1);
        const next = toggleMetamagicSelection(state, 'careful-spell', 1);

        expect(next.selectedMetamagicIds).toEqual([]);
    });

    it('does not exceed max selections', () => {
        let state = createLevelUpMetamagicState();
        state = toggleMetamagicSelection(state, 'careful-spell', 1);
        const next = toggleMetamagicSelection(state, 'distant-spell', 1);

        expect(next.selectedMetamagicIds).toEqual(['careful-spell']);
    });
});

describe('setCustomMetamagic', () => {
    it('sets and clears custom metamagic', () => {
        const state = createLevelUpMetamagicState();
        const withCustom = setCustomMetamagic(state, { name: 'My Meta', description: 'Desc' });

        expect(withCustom.customMetamagic).toEqual({ name: 'My Meta', description: 'Desc' });

        const cleared = setCustomMetamagic(withCustom, null);

        expect(cleared.customMetamagic).toBeNull();
    });
});

describe('setMysticArcanumSpell', () => {
    it('sets the selected spell', () => {
        const state = createLevelUpMysticArcanumState();
        const next = setMysticArcanumSpell(state, { id: 'spell-1', name: 'Mass Suggestion', level: 6 });

        expect(next.selectedSpell).toEqual({ id: 'spell-1', name: 'Mass Suggestion', level: 6 });
    });

    it('clears the selected spell with null', () => {
        let state = createLevelUpMysticArcanumState();
        state = setMysticArcanumSpell(state, { id: 'spell-1', name: 'Mass Suggestion', level: 6 });
        const next = setMysticArcanumSpell(state, null);

        expect(next.selectedSpell).toBeNull();
    });
});

describe('canContinueFromInvocations', () => {
    it('returns true when enough SRD invocations are selected', () => {
        let state = createLevelUpInvocationState();
        state = toggleInvocationSelection(state, 'agonizing-blast', 2);
        state = toggleInvocationSelection(state, 'armor-of-shadows', 2);

        expect(canContinueFromInvocations(state, 2)).toBe(true);
    });

    it('returns false when not enough invocations are selected', () => {
        const state = toggleInvocationSelection(createLevelUpInvocationState(), 'agonizing-blast', 2);

        expect(canContinueFromInvocations(state, 2)).toBe(false);
    });

    it('counts a custom invocation with a non-empty name', () => {
        let state = createLevelUpInvocationState();
        state = toggleInvocationSelection(state, 'agonizing-blast', 2);
        state = setCustomInvocation(state, { name: 'Custom', description: '' });

        expect(canContinueFromInvocations(state, 2)).toBe(true);
    });

    it('does not count a custom invocation with an empty name', () => {
        let state = createLevelUpInvocationState();
        state = toggleInvocationSelection(state, 'agonizing-blast', 2);
        state = setCustomInvocation(state, { name: '  ', description: '' });

        expect(canContinueFromInvocations(state, 2)).toBe(false);
    });
});

describe('canContinueFromMetamagic', () => {
    it('returns true when enough metamagic options are selected', () => {
        const state = toggleMetamagicSelection(createLevelUpMetamagicState(), 'careful-spell', 1);

        expect(canContinueFromMetamagic(state, 1)).toBe(true);
    });

    it('returns false when not enough', () => {
        expect(canContinueFromMetamagic(createLevelUpMetamagicState(), 1)).toBe(false);
    });

    it('counts a custom metamagic with a non-empty name', () => {
        const state = setCustomMetamagic(createLevelUpMetamagicState(), { name: 'Custom', description: '' });

        expect(canContinueFromMetamagic(state, 1)).toBe(true);
    });
});

describe('canContinueFromMysticArcanum', () => {
    it('returns true when no arcanum is required', () => {
        expect(canContinueFromMysticArcanum(createLevelUpMysticArcanumState(), false)).toBe(true);
    });

    it('returns false when arcanum is required but none selected', () => {
        expect(canContinueFromMysticArcanum(createLevelUpMysticArcanumState(), true)).toBe(false);
    });

    it('returns true when arcanum is required and a spell is selected', () => {
        const state = setMysticArcanumSpell(createLevelUpMysticArcanumState(), { id: 's1', name: 'Spell', level: 6 });

        expect(canContinueFromMysticArcanum(state, true)).toBe(true);
    });
});

describe('canContinueFromAdvancedResources', () => {
    it('returns true for a non-warlock/sorcerer class', () => {
        expect(canContinueFromAdvancedResources(
            'fighter', 5, 4,
            createLevelUpInvocationState(),
            createLevelUpMetamagicState(),
            createLevelUpMysticArcanumState(),
        )).toBe(true);
    });

    it('returns false for warlock gaining invocations without selections', () => {
        expect(canContinueFromAdvancedResources(
            'warlock', 2, 1,
            createLevelUpInvocationState(),
            createLevelUpMetamagicState(),
            createLevelUpMysticArcanumState(),
        )).toBe(false);
    });

    it('returns true for warlock at a non-gain level', () => {
        expect(canContinueFromAdvancedResources(
            'warlock', 4, 3,
            createLevelUpInvocationState(),
            createLevelUpMetamagicState(),
            createLevelUpMysticArcanumState(),
        )).toBe(true);
    });

    it('returns false for sorcerer gaining metamagic without selections', () => {
        expect(canContinueFromAdvancedResources(
            'sorcerer', 3, 2,
            createLevelUpInvocationState(),
            createLevelUpMetamagicState(),
            createLevelUpMysticArcanumState(),
        )).toBe(false);
    });

    it('returns true for sorcerer at a non-gain level', () => {
        expect(canContinueFromAdvancedResources(
            'sorcerer', 4, 3,
            createLevelUpInvocationState(),
            createLevelUpMetamagicState(),
            createLevelUpMysticArcanumState(),
        )).toBe(true);
    });

    it('returns false for warlock at mystic arcanum level without spell selected', () => {
        expect(canContinueFromAdvancedResources(
            'warlock', 11, 10,
            createLevelUpInvocationState(),
            createLevelUpMetamagicState(),
            createLevelUpMysticArcanumState(),
        )).toBe(false);
    });
});

describe('checkInvocationPrerequisite', () => {
    const baseContext: InvocationPrerequisiteContext = {
        warlockLevel: 5,
        knownSpellNames: ['eldritch blast', 'hex'],
        featureNames: ['pact of the blade'],
    };

    it('returns met for null prerequisite', () => {
        const result = checkInvocationPrerequisite(null, baseContext);
        expect(result.met).toBe(true);
        expect(result.reason).toBeNull();
    });

    it('returns met when level prerequisite is satisfied', () => {
        const result = checkInvocationPrerequisite('5th level', baseContext);
        expect(result.met).toBe(true);
    });

    it('returns unmet when level prerequisite is not satisfied', () => {
        const result = checkInvocationPrerequisite('7th level', baseContext);
        expect(result.met).toBe(false);
        expect(result.reason).toBe('7th level');
    });

    it('returns met when Eldritch Blast cantrip prerequisite is satisfied', () => {
        const result = checkInvocationPrerequisite('Eldritch Blast cantrip', baseContext);
        expect(result.met).toBe(true);
    });

    it('returns unmet when Eldritch Blast cantrip is missing', () => {
        const ctx = { ...baseContext, knownSpellNames: ['hex'] };
        const result = checkInvocationPrerequisite('Eldritch Blast cantrip', ctx);
        expect(result.met).toBe(false);
        expect(result.reason).toBe('Eldritch Blast cantrip');
    });

    it('returns met when Pact prerequisite is satisfied', () => {
        const result = checkInvocationPrerequisite('Pact of the Blade', baseContext);
        expect(result.met).toBe(true);
    });

    it('returns unmet when Pact prerequisite is not satisfied', () => {
        const result = checkInvocationPrerequisite('Pact of the Chain', baseContext);
        expect(result.met).toBe(false);
        expect(result.reason).toBe('Pact of the Chain');
    });

    it('checks combined prerequisites (all must be met)', () => {
        const result = checkInvocationPrerequisite('5th level, Pact of the Blade', baseContext);
        expect(result.met).toBe(true);
    });

    it('returns unmet parts for partially satisfied combined prerequisite', () => {
        const result = checkInvocationPrerequisite('5th level, Pact of the Chain', baseContext);
        expect(result.met).toBe(false);
        expect(result.reason).toBe('Pact of the Chain');
    });

    it('returns all unmet parts when none are satisfied', () => {
        const ctx: InvocationPrerequisiteContext = {
            warlockLevel: 2,
            knownSpellNames: [],
            featureNames: [],
        };
        const result = checkInvocationPrerequisite('15th level, Pact of the Chain', ctx);
        expect(result.met).toBe(false);
        expect(result.reason).toBe('15th level, Pact of the Chain');
    });

    it('allows unknown prerequisite formats (does not block user)', () => {
        const result = checkInvocationPrerequisite('Some Unknown Prerequisite', baseContext);
        expect(result.met).toBe(true);
    });
});

describe('buildInvocationPrerequisiteContext', () => {
    it('lowercases spell names and feature names', () => {
        const ctx = buildInvocationPrerequisiteContext(
            5,
            [{ spell: { name: 'Eldritch Blast' } }, { spell: { name: 'Hex' } }],
            [{ name: 'Pact of the Blade' }],
        );
        expect(ctx.warlockLevel).toBe(5);
        expect(ctx.knownSpellNames).toEqual(['eldritch blast', 'hex']);
        expect(ctx.featureNames).toEqual(['pact of the blade']);
    });

    it('handles empty spellbook and features', () => {
        const ctx = buildInvocationPrerequisiteContext(2, [], []);
        expect(ctx.knownSpellNames).toEqual([]);
        expect(ctx.featureNames).toEqual([]);
    });
});
