/**
 * SRD Eldritch Invocation option for warlock level-up.
 */
export type SrdInvocation = {
    id: string;
    name: string;
    /** Short summary shown by default in the picker. */
    description: string;
    /** Full SRD description stored on the character's features. */
    fullDescription: string;
    prerequisite: string | null;
    /** True if this invocation grants the ability to cast a spell. */
    grantsSpell: boolean;
};

/**
 * SRD Metamagic option for sorcerer level-up.
 */
export type SrdMetamagic = {
    id: string;
    name: string;
    /** Short summary shown by default in the picker. */
    description: string;
    /** Full SRD description toggled via Read more. */
    fullDescription: string;
};

/**
 * All SRD Eldritch Invocations available in the level-up picker.
 */
export const SRD_INVOCATIONS: readonly SrdInvocation[] = [
    {
        id: 'agonizing-blast', name: 'Agonizing Blast', prerequisite: 'Eldritch Blast cantrip',
        description: 'When you cast eldritch blast, add your Charisma modifier to the damage it deals on a hit.',
        fullDescription: 'When you cast eldritch blast, add your Charisma modifier to the damage it deals on a hit.',
        grantsSpell: false,
    },
    {
        id: 'armor-of-shadows', name: 'Armor of Shadows', prerequisite: null,
        description: 'You can cast mage armor on yourself at will, without expending a spell slot or material components.',
        fullDescription: 'You can cast mage armor on yourself at will, without expending a spell slot or material components.',
        grantsSpell: true,
    },
    {
        id: 'ascendant-step', name: 'Ascendant Step', prerequisite: '9th level',
        description: 'You can cast levitate on yourself at will, without expending a spell slot or material components.',
        fullDescription: 'You can cast levitate on yourself at will, without expending a spell slot or material components.',
        grantsSpell: true,
    },
    {
        id: 'beast-speech', name: 'Beast Speech', prerequisite: null,
        description: 'You can cast speak with animals at will, without expending a spell slot.',
        fullDescription: 'You can cast speak with animals at will, without expending a spell slot.',
        grantsSpell: true,
    },
    {
        id: 'beguiling-influence', name: 'Beguiling Influence', prerequisite: null,
        description: 'You gain proficiency in the Deception and Persuasion skills.',
        fullDescription: 'You gain proficiency in the Deception and Persuasion skills.',
        grantsSpell: false,
    },
    {
        id: 'book-of-ancient-secrets', name: 'Book of Ancient Secrets', prerequisite: 'Pact of the Tome',
        description: 'Record rituals in your Book of Shadows from any class list.',
        fullDescription: 'You can now inscribe magical rituals in your Book of Shadows. Choose two 1st-level spells that have the ritual tag from any class\u2019s spell list (the two needn\u2019t be from the same list). The spells appear in the book and don\u2019t count against the number of spells you know. With your Book of Shadows in hand, you can cast the chosen spells as rituals. You can\u2019t cast the spells except as rituals, unless you\u2019ve learned them by some other means. You can also cast a warlock spell you know as a ritual if it has the ritual tag.\n\nOn your adventures, you can add other ritual spells to your Book of Shadows. When you find such a spell, you can add it to the book if the spell\u2019s level is equal to or less than half your warlock level (rounded up) and if you can spare the time to transcribe the spell. For each level of the spell, the transcription process takes 2 hours and costs 50 gp for the rare inks needed to inscribe it.',
        grantsSpell: true,
    },
    {
        id: 'chains-of-carceri', name: 'Chains of Carceri', prerequisite: '15th level, Pact of the Chain',
        description: 'Cast hold monster at will on celestials, fiends, or elementals.',
        fullDescription: 'You can cast hold monster at will\u2014targeting a celestial, fiend, or elemental\u2014without expending a spell slot or material components. You must finish a long rest before you can use this invocation on the same creature again.',
        grantsSpell: true,
    },
    {
        id: 'devils-sight', name: "Devil's Sight", prerequisite: null,
        description: 'You can see normally in darkness, both magical and nonmagical, to a distance of 120 feet.',
        fullDescription: 'You can see normally in darkness, both magical and nonmagical, to a distance of 120 feet.',
        grantsSpell: false,
    },
    {
        id: 'dreadful-word', name: 'Dreadful Word', prerequisite: '7th level',
        description: 'Cast confusion once using a warlock spell slot.',
        fullDescription: 'You can cast confusion once using a warlock spell slot. You can\u2019t do so again until you finish a long rest.',
        grantsSpell: true,
    },
    {
        id: 'eldritch-sight', name: 'Eldritch Sight', prerequisite: null,
        description: 'You can cast detect magic at will, without expending a spell slot.',
        fullDescription: 'You can cast detect magic at will, without expending a spell slot.',
        grantsSpell: true,
    },
    {
        id: 'eldritch-spear', name: 'Eldritch Spear', prerequisite: 'Eldritch Blast cantrip',
        description: 'When you cast eldritch blast, its range is 300 feet.',
        fullDescription: 'When you cast eldritch blast, its range is 300 feet.',
        grantsSpell: false,
    },
    {
        id: 'eyes-of-the-rune-keeper', name: 'Eyes of the Rune Keeper', prerequisite: null,
        description: 'You can read all writing.',
        fullDescription: 'You can read all writing.',
        grantsSpell: false,
    },
    {
        id: 'fiendish-vigor', name: 'Fiendish Vigor', prerequisite: null,
        description: 'Cast false life on yourself at will as a 1st-level spell.',
        fullDescription: 'You can cast false life on yourself at will as a 1st-level spell, without expending a spell slot or material components.',
        grantsSpell: true,
    },
    {
        id: 'gaze-of-two-minds', name: 'Gaze of Two Minds', prerequisite: null,
        description: 'Use your action to perceive through a willing humanoid\'s senses.',
        fullDescription: 'You can use your action to touch a willing humanoid and perceive through its senses until the end of your next turn. As long as the creature is on the same plane of existence as you, you can use your action on subsequent turns to maintain this connection, extending the duration until the end of your next turn. While perceiving through the other creature\u2019s senses, you benefit from any special senses possessed by that creature, and you are blinded and deafened to your own surroundings.',
        grantsSpell: false,
    },
    {
        id: 'lifedrinker', name: 'Lifedrinker', prerequisite: '12th level, Pact of the Blade',
        description: 'Add Charisma modifier as necrotic damage to pact weapon attacks.',
        fullDescription: 'When you hit a creature with your pact weapon, the creature takes extra necrotic damage equal to your Charisma modifier (minimum 1).',
        grantsSpell: false,
    },
    {
        id: 'mask-of-many-faces', name: 'Mask of Many Faces', prerequisite: null,
        description: 'You can cast disguise self at will, without expending a spell slot.',
        fullDescription: 'You can cast disguise self at will, without expending a spell slot.',
        grantsSpell: true,
    },
    {
        id: 'master-of-myriad-forms', name: 'Master of Myriad Forms', prerequisite: '15th level',
        description: 'You can cast alter self at will, without expending a spell slot.',
        fullDescription: 'You can cast alter self at will, without expending a spell slot.',
        grantsSpell: true,
    },
    {
        id: 'minions-of-chaos', name: 'Minions of Chaos', prerequisite: '9th level',
        description: 'Cast conjure elemental once using a warlock spell slot.',
        fullDescription: 'You can cast conjure elemental once using a warlock spell slot. You can\u2019t do so again until you finish a long rest.',
        grantsSpell: true,
    },
    {
        id: 'mire-the-mind', name: 'Mire the Mind', prerequisite: '5th level',
        description: 'Cast slow once using a warlock spell slot.',
        fullDescription: 'You can cast slow once using a warlock spell slot. You can\u2019t do so again until you finish a long rest.',
        grantsSpell: true,
    },
    {
        id: 'misty-visions', name: 'Misty Visions', prerequisite: null,
        description: 'You can cast silent image at will, without expending a spell slot or material components.',
        fullDescription: 'You can cast silent image at will, without expending a spell slot or material components.',
        grantsSpell: true,
    },
    {
        id: 'one-with-shadows', name: 'One with Shadows', prerequisite: '5th level',
        description: 'When you are in an area of dim light or darkness, you can use your action to become invisible until you move or take an action or a reaction.',
        fullDescription: 'When you are in an area of dim light or darkness, you can use your action to become invisible until you move or take an action or a reaction.',
        grantsSpell: false,
    },
    {
        id: 'otherworldly-leap', name: 'Otherworldly Leap', prerequisite: '9th level',
        description: 'You can cast jump on yourself at will, without expending a spell slot or material components.',
        fullDescription: 'You can cast jump on yourself at will, without expending a spell slot or material components.',
        grantsSpell: true,
    },
    {
        id: 'repelling-blast', name: 'Repelling Blast', prerequisite: 'Eldritch Blast cantrip',
        description: 'Push a creature 10 feet away when you hit it with eldritch blast.',
        fullDescription: 'When you hit a creature with eldritch blast, you can push the creature up to 10 feet away from you in a straight line.',
        grantsSpell: false,
    },
    {
        id: 'sculptor-of-flesh', name: 'Sculptor of Flesh', prerequisite: '7th level',
        description: 'Cast polymorph once using a warlock spell slot.',
        fullDescription: 'You can cast polymorph once using a warlock spell slot. You can\u2019t do so again until you finish a long rest.',
        grantsSpell: true,
    },
    {
        id: 'sign-of-ill-omen', name: 'Sign of Ill Omen', prerequisite: '5th level',
        description: 'Cast bestow curse once using a warlock spell slot.',
        fullDescription: 'You can cast bestow curse once using a warlock spell slot. You can\u2019t do so again until you finish a long rest.',
        grantsSpell: true,
    },
    {
        id: 'thief-of-five-fates', name: 'Thief of Five Fates', prerequisite: null,
        description: 'Cast bane once using a warlock spell slot.',
        fullDescription: 'You can cast bane once using a warlock spell slot. You can\u2019t do so again until you finish a long rest.',
        grantsSpell: true,
    },
    {
        id: 'thirsting-blade', name: 'Thirsting Blade', prerequisite: '5th level, Pact of the Blade',
        description: 'Attack with your pact weapon twice when you take the Attack action.',
        fullDescription: 'You can attack with your pact weapon twice, instead of once, whenever you take the Attack action on your turn.',
        grantsSpell: false,
    },
    {
        id: 'visions-of-distant-realms', name: 'Visions of Distant Realms', prerequisite: '15th level',
        description: 'You can cast arcane eye at will, without expending a spell slot.',
        fullDescription: 'You can cast arcane eye at will, without expending a spell slot.',
        grantsSpell: true,
    },
    {
        id: 'voice-of-the-chain-master', name: 'Voice of the Chain Master', prerequisite: 'Pact of the Chain',
        description: 'Communicate telepathically with and perceive through your familiar.',
        fullDescription: 'You can communicate telepathically with your familiar and perceive through your familiar\u2019s senses as long as you are on the same plane of existence. Additionally, while perceiving through your familiar\u2019s senses, you can also speak through your familiar in your own voice, even if your familiar is normally incapable of speech.',
        grantsSpell: false,
    },
    {
        id: 'whispers-of-the-grave', name: 'Whispers of the Grave', prerequisite: '9th level',
        description: 'You can cast speak with dead at will, without expending a spell slot.',
        fullDescription: 'You can cast speak with dead at will, without expending a spell slot.',
        grantsSpell: true,
    },
    {
        id: 'witch-sight', name: 'Witch Sight', prerequisite: '15th level',
        description: 'See the true form of shapechangers and creatures concealed by magic within 30 ft.',
        fullDescription: 'You can see the true form of any shapechanger or creature concealed by illusion or transmutation magic while the creature is within 30 feet of you and within line of sight.',
        grantsSpell: false,
    },
];

/**
 * All SRD Metamagic options available in the level-up picker.
 */
export const SRD_METAMAGIC_OPTIONS: readonly SrdMetamagic[] = [
    {
        id: 'careful-spell',
        name: 'Careful Spell',
        description: 'Chosen creatures automatically succeed on a spell\'s saving throw.',
        fullDescription: 'When you cast a spell that forces other creatures to make a saving throw, you can protect some of those creatures from the spell\'s full force. To do so, you spend 1 sorcery point and choose a number of those creatures up to your Charisma modifier (minimum of one creature). A chosen creature automatically succeeds on its saving throw against the spell.',
    },
    {
        id: 'distant-spell',
        name: 'Distant Spell',
        description: 'Double the range of a spell, or give a touch spell a range of 30 feet.',
        fullDescription: 'When you cast a spell that has a range of 5 feet or greater, you can spend 1 sorcery point to double the range of the spell. When you cast a spell that has a range of touch, you can spend 1 sorcery point to make the range of the spell 30 feet.',
    },
    {
        id: 'empowered-spell',
        name: 'Empowered Spell',
        description: 'Reroll up to your Charisma modifier of damage dice.',
        fullDescription: 'When you roll damage for a spell, you can spend 1 sorcery point to reroll a number of the damage dice up to your Charisma modifier (minimum of one). You must use the new rolls. You can use Empowered Spell even if you have already used a different Metamagic option during the casting of the spell.',
    },
    {
        id: 'extended-spell',
        name: 'Extended Spell',
        description: 'Double a spell\'s duration, up to 24 hours.',
        fullDescription: 'When you cast a spell that has a duration of 1 minute or longer, you can spend 1 sorcery point to double its duration, to a maximum duration of 24 hours.',
    },
    {
        id: 'heightened-spell',
        name: 'Heightened Spell',
        description: 'One target has disadvantage on its first saving throw against the spell.',
        fullDescription: 'When you cast a spell that forces a creature to make a saving throw to resist its effects, you can spend 3 sorcery points to give one target of the spell disadvantage on its first saving throw made against the spell.',
    },
    {
        id: 'quickened-spell',
        name: 'Quickened Spell',
        description: 'Change the casting time of a spell to a bonus action.',
        fullDescription: 'When you cast a spell that has a casting time of 1 action, you can spend 2 sorcery points to change the casting time to 1 bonus action for this casting.',
    },
    {
        id: 'subtle-spell',
        name: 'Subtle Spell',
        description: 'Cast a spell without somatic or verbal components.',
        fullDescription: 'When you cast a spell, you can spend 1 sorcery point to cast it without any somatic or verbal components.',
    },
    {
        id: 'twinned-spell',
        name: 'Twinned Spell',
        description: 'Target a second creature with a single-target spell.',
        fullDescription: 'When you cast a spell that targets only one creature and doesn\'t have a range of self, you can spend a number of sorcery points equal to the spell\'s level to target a second creature in range with the same spell (1 sorcery point if the spell is a cantrip). To be eligible, a spell must be incapable of targeting more than one creature at the spell\'s current level. For example, magic missile and scorching ray aren\'t eligible, but ray of frost is.',
    },
];

/**
 * Sorcerer levels that grant a new Metamagic option.
 */
export const SORCERER_METAMAGIC_LEVELS: readonly number[] = [3, 10, 17];

/**
 * Warlock levels that grant Mystic Arcanum, mapped to the spell level gained.
 */
export const MYSTIC_ARCANUM_LEVELS: Readonly<Record<number, number>> = {
    11: 6,
    13: 7,
    15: 8,
    17: 9,
};

/**
 * Maximum total character level allowed (prevents levelling beyond 20).
 */
export const MAX_CHARACTER_LEVEL = 20;

/**
 * Route-local state for warlock invocation choices during level-up.
 */
export type LevelUpInvocationState = {
    selectedInvocations: string[];
    customInvocation: { name: string; description: string } | null;
    isSwappingInvocation: boolean;
    swapOutInvocationId: string | null;
    swapInInvocation: { id: string; name: string; isCustom: boolean } | null;
};

/**
 * Route-local state for sorcerer metamagic choices during level-up.
 */
export type LevelUpMetamagicState = {
    selectedMetamagicIds: string[];
    customMetamagic: { name: string; description: string } | null;
};

/**
 * Route-local state for warlock mystic arcanum choice during level-up.
 */
export type LevelUpMysticArcanumState = {
    selectedSpell: { id: string; name: string; level: number } | null;
};

/**
 * Creates the default invocation state for a fresh level-up session.
 */
export function createLevelUpInvocationState(): LevelUpInvocationState {
    return {
        selectedInvocations: [],
        customInvocation: null,
        isSwappingInvocation: false,
        swapOutInvocationId: null,
        swapInInvocation: null,
    };
}

/**
 * Creates the default metamagic state for a fresh level-up session.
 */
export function createLevelUpMetamagicState(): LevelUpMetamagicState {
    return {
        selectedMetamagicIds: [],
        customMetamagic: null,
    };
}

/**
 * Creates the default mystic arcanum state for a fresh level-up session.
 */
export function createLevelUpMysticArcanumState(): LevelUpMysticArcanumState {
    return {
        selectedSpell: null,
    };
}

/**
 * Returns the number of new invocations to pick at this warlock level transition.
 * Returns 0 if no new invocations are gained.
 */
export function invocationGainCount(currentWarlockLevel: number, newWarlockLevel: number): number {
    const invocationsAt = (level: number): number => {
        if (level < 2) return 0;
        if (level >= 18) return 8;
        if (level >= 15) return 7;
        if (level >= 12) return 6;
        if (level >= 9) return 5;
        if (level >= 7) return 4;
        if (level >= 5) return 3;
        return 2;
    };

    return Math.max(0, invocationsAt(newWarlockLevel) - invocationsAt(currentWarlockLevel));
}

/**
 * Returns whether the warlock gains new invocations at this level transition.
 */
export function hasInvocationGain(currentWarlockLevel: number, newWarlockLevel: number): boolean {
    return invocationGainCount(currentWarlockLevel, newWarlockLevel) > 0;
}

/**
 * Returns whether a warlock can swap one invocation at this level-up.
 * Warlocks can swap one invocation for another whenever they gain a level (starting from level 2+).
 */
export function canSwapInvocation(newWarlockLevel: number): boolean {
    return newWarlockLevel >= 3;
}

/**
 * Returns the number of new metamagic options to pick at this sorcerer level.
 * Returns 0 if this is not a metamagic-gain level.
 */
export function metamagicGainCount(newSorcererLevel: number): number {
    return SORCERER_METAMAGIC_LEVELS.includes(newSorcererLevel) ? 1 : 0;
}

/**
 * Returns whether the sorcerer gains a new metamagic option at this level.
 */
export function hasMetamagicGain(newSorcererLevel: number): boolean {
    return metamagicGainCount(newSorcererLevel) > 0;
}

/**
 * Returns the mystic arcanum spell level gained at this warlock level, or null if none.
 */
export function mysticArcanumSpellLevel(newWarlockLevel: number): number | null {
    return MYSTIC_ARCANUM_LEVELS[newWarlockLevel] ?? null;
}

/**
 * Returns whether the warlock gains a mystic arcanum at this level.
 */
export function hasMysticArcanumGain(newWarlockLevel: number): boolean {
    return mysticArcanumSpellLevel(newWarlockLevel) != null;
}

/**
 * Returns whether the class has any advanced choices (invocations, metamagic, mystic arcanum, or swaps)
 * that require the class resources step to appear.
 */
export function hasAdvancedClassChoices(classId: string, currentLevel: number, newLevel: number): boolean {
    if (classId === 'warlock') {
        if (hasInvocationGain(currentLevel, newLevel)) {
            return true;
        }
        if (hasMysticArcanumGain(newLevel)) {
            return true;
        }
        if (canSwapInvocation(newLevel)) {
            return true;
        }
    }
    if (classId === 'sorcerer') {
        if (hasMetamagicGain(newLevel)) {
            return true;
        }
    }
    return false;
}

/**
 * Context needed to evaluate invocation prerequisites.
 */
export type InvocationPrerequisiteContext = {
    /** The warlock class level after this level-up. */
    warlockLevel: number;
    /** Lowercased spell names in the character's spellbook. */
    knownSpellNames: readonly string[];
    /** Lowercased feature names the character currently has. */
    featureNames: readonly string[];
};

/**
 * Result of evaluating a single invocation's prerequisite.
 */
export type InvocationPrerequisiteResult = {
    met: boolean;
    reason: string | null;
};

/**
 * Parses an SRD prerequisite string and checks it against the character's context.
 * Combined prerequisites (e.g. "5th level, Pact of the Blade") require all parts to be met.
 */
export function checkInvocationPrerequisite(
    prerequisite: string | null,
    context: InvocationPrerequisiteContext,
): InvocationPrerequisiteResult {
    if (prerequisite == null) {
        return { met: true, reason: null };
    }

    const parts = prerequisite.split(',').map((p) => p.trim());
    const unmetParts: string[] = [];

    for (const part of parts) {
        if (!checkSinglePrerequisitePart(part, context)) {
            unmetParts.push(part);
        }
    }

    if (unmetParts.length === 0) {
        return { met: true, reason: null };
    }

    return { met: false, reason: unmetParts.join(', ') };
}

/**
 * Checks a single prerequisite clause (e.g. "5th level" or "Pact of the Blade").
 */
function checkSinglePrerequisitePart(
    part: string,
    context: InvocationPrerequisiteContext,
): boolean {
    const levelMatch = part.match(/^(\d+)(?:st|nd|rd|th)\s+level$/i);

    if (levelMatch) {
        return context.warlockLevel >= Number(levelMatch[1]);
    }

    if (part.toLowerCase() === 'eldritch blast cantrip') {
        return context.knownSpellNames.includes('eldritch blast');
    }

    if (part.toLowerCase().startsWith('pact of the')) {
        return context.featureNames.some((f) => f.includes(part.toLowerCase()));
    }

    // Unknown prerequisite format — allow it (don't block the user)
    return true;
}

/**
 * Builds an InvocationPrerequisiteContext from character data available in the wizard.
 */
export function buildInvocationPrerequisiteContext(
    warlockLevel: number,
    spellbook: readonly { spell: { name: string } }[],
    features: readonly { name: string }[],
): InvocationPrerequisiteContext {
    return {
        warlockLevel,
        knownSpellNames: spellbook.map((entry) => entry.spell.name.toLowerCase()),
        featureNames: features.map((f) => f.name.toLowerCase()),
    };
}

/**
 * Returns whether a character has reached the maximum total level (20).
 */
export function isAtMaxLevel(currentCharacterLevel: number): boolean {
    return currentCharacterLevel >= MAX_CHARACTER_LEVEL;
}

/**
 * Toggles an invocation selection in the state.
 */
export function toggleInvocationSelection(
    state: LevelUpInvocationState,
    invocationId: string,
    maxSelections: number,
): LevelUpInvocationState {
    const isSelected = state.selectedInvocations.includes(invocationId);

    if (isSelected) {
        return {
            ...state,
            selectedInvocations: state.selectedInvocations.filter((id) => id !== invocationId),
        };
    }

    if (state.selectedInvocations.length >= maxSelections) {
        return state;
    }

    return {
        ...state,
        selectedInvocations: [...state.selectedInvocations, invocationId],
    };
}

/**
 * Sets a custom invocation entry in the state.
 */
export function setCustomInvocation(
    state: LevelUpInvocationState,
    custom: { name: string; description: string } | null,
): LevelUpInvocationState {
    return { ...state, customInvocation: custom };
}

/**
 * Sets the invocation to swap out.
 */
export function setInvocationSwapOut(
    state: LevelUpInvocationState,
    invocationId: string | null,
): LevelUpInvocationState {
    return {
        ...state,
        isSwappingInvocation: invocationId != null,
        swapOutInvocationId: invocationId,
        swapInInvocation: invocationId == null ? null : state.swapInInvocation,
    };
}

/**
 * Sets the invocation to swap in.
 */
export function setInvocationSwapIn(
    state: LevelUpInvocationState,
    invocation: { id: string; name: string; isCustom: boolean } | null,
): LevelUpInvocationState {
    return { ...state, swapInInvocation: invocation };
}

/**
 * Toggles a metamagic selection in the state.
 */
export function toggleMetamagicSelection(
    state: LevelUpMetamagicState,
    metamagicId: string,
    maxSelections: number,
): LevelUpMetamagicState {
    const isSelected = state.selectedMetamagicIds.includes(metamagicId);

    if (isSelected) {
        return {
            ...state,
            selectedMetamagicIds: state.selectedMetamagicIds.filter((id) => id !== metamagicId),
        };
    }

    if (state.selectedMetamagicIds.length >= maxSelections) {
        return state;
    }

    return {
        ...state,
        selectedMetamagicIds: [...state.selectedMetamagicIds, metamagicId],
    };
}

/**
 * Sets a custom metamagic entry in the state.
 */
export function setCustomMetamagic(
    state: LevelUpMetamagicState,
    custom: { name: string; description: string } | null,
): LevelUpMetamagicState {
    return { ...state, customMetamagic: custom };
}

/**
 * Sets the selected mystic arcanum spell.
 */
export function setMysticArcanumSpell(
    state: LevelUpMysticArcanumState,
    spell: { id: string; name: string; level: number } | null,
): LevelUpMysticArcanumState {
    return { selectedSpell: spell };
}

/**
 * Returns whether invocation selection is complete for the class resources step.
 */
export function canContinueFromInvocations(
    state: LevelUpInvocationState,
    gainCount: number,
): boolean {
    const customCount = state.customInvocation && state.customInvocation.name.trim().length > 0 ? 1 : 0;

    return (state.selectedInvocations.length + customCount) >= gainCount;
}

/**
 * Returns whether metamagic selection is complete for the class resources step.
 */
export function canContinueFromMetamagic(
    state: LevelUpMetamagicState,
    gainCount: number,
): boolean {
    const customCount = state.customMetamagic && state.customMetamagic.name.trim().length > 0 ? 1 : 0;

    return (state.selectedMetamagicIds.length + customCount) >= gainCount;
}

/**
 * Returns whether mystic arcanum selection is complete.
 */
export function canContinueFromMysticArcanum(
    state: LevelUpMysticArcanumState,
    hasMysticArcanum: boolean,
): boolean {
    if (!hasMysticArcanum) return true;

    return state.selectedSpell != null;
}

/**
 * Returns whether all advanced pickers on the class resources step are complete.
 */
export function canContinueFromAdvancedResources(
    classId: string,
    newClassLevel: number,
    currentClassLevel: number,
    invocationState: LevelUpInvocationState,
    metamagicState: LevelUpMetamagicState,
    mysticArcanumState: LevelUpMysticArcanumState,
): boolean {
    if (classId === 'warlock') {
        const gain = invocationGainCount(currentClassLevel, newClassLevel);

        if (gain > 0 && !canContinueFromInvocations(invocationState, gain)) {
            return false;
        }

        if (hasMysticArcanumGain(newClassLevel) && !canContinueFromMysticArcanum(mysticArcanumState, true)) {
            return false;
        }
    }

    if (classId === 'sorcerer') {
        const gain = metamagicGainCount(newClassLevel);

        if (gain > 0 && !canContinueFromMetamagic(metamagicState, gain)) {
            return false;
        }
    }

    return true;
}

/**
 * Looks up an SRD invocation by ID.
 * Returns the invocation or undefined if not found.
 */
export function findSrdInvocation(id: string): SrdInvocation | undefined {
    return SRD_INVOCATIONS.find((inv) => inv.id === id);
}

/**
 * Extracts existing invocation features from the character's feature list.
 * Returns SRD invocations that the character currently has.
 * Invocations are stored with the prefix "Eldritch Invocation: " in feature names.
 */
export function extractExistingInvocations(
    features: readonly { name: string }[],
): SrdInvocation[] {
    const invocationPrefix = 'eldritch invocation:';

    // Extract invocation names from features that have the "Eldritch Invocation: " prefix
    const invocationFeatureNames = new Set(
        features
            .map((f) => f.name.trim().toLowerCase())
            .filter((name) => name.startsWith(invocationPrefix))
            .map((name) => name.slice(invocationPrefix.length).trim()),
    );

    return SRD_INVOCATIONS.filter((inv) =>
        invocationFeatureNames.has(inv.name.toLowerCase()),
    );
}

/**
 * Looks up an SRD metamagic option by ID.
 * Returns the metamagic option or undefined if not found.
 */
export function findSrdMetamagic(id: string): SrdMetamagic | undefined {
    return SRD_METAMAGIC_OPTIONS.find((m) => m.id === id);
}
