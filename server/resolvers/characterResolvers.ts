export {
    character,
    currentUserCharacters,
} from "./character/queries";

export {
    createCharacter,
    updateCharacter,
    deleteCharacter,
    toggleInspiration,
} from "./character/lifecycleMutations";

export {
    saveCharacterSheet,
} from "./character/saveCharacterSheetMutation";

export {
    updateDeathSaves,
    updateHitDice,
    updateSkillProficiencies,
    updateSavingThrowProficiencies,
} from "./character/statsMutations";

export {
    characterStats,
    characterWeapons,
    characterInventory,
    characterFeatures,
    characterSpellSlots,
    characterSpellbook,
} from "./character/fieldResolvers";

export {
    learnSpell,
    forgetSpell,
    prepareSpell,
    unprepareSpell,
    toggleSpellSlot,
} from "./character/spellbookMutations";

export {
    updateInventoryItem,
} from "./character/gearAndFeaturesMutations";

export {
    spendHitDie,
    shortRest,
    longRest,
} from "./character/restMutations";
