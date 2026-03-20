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
    updateAbilityScores,
    updateHP,
    updateDeathSaves,
    updateHitDice,
    updateSkillProficiencies,
    updateTraits,
    updateCurrency,
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
    addWeapon,
    updateWeapon,
    removeWeapon,
    addInventoryItem,
    updateInventoryItem,
    removeInventoryItem,
    addFeature,
    updateFeature,
    removeFeature,
} from "./character/gearAndFeaturesMutations";

export {
    spendHitDie,
    shortRest,
    longRest,
} from "./character/restMutations";
