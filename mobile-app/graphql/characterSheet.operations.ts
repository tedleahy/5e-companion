import { gql } from '@apollo/client';
import { CHARACTER_SPELLBOOK_ENTRY_FIELDS_FRAGMENT } from './spell.fragments';

/**
 * Fields needed to render one character card in the roster screen.
 */
const CHARACTER_ROSTER_FIELDS_FRAGMENT = gql`
    fragment CharacterRosterFields on Character {
        id
        name
        race
        class
        subclass
        level
        spellAttackBonus
        initiative
        ac
        conditions
        weapons {
            attackBonus
        }
        stats {
            hp {
                current
                max
            }
        }
    }
`;

/**
 * Shared character-sheet fields used by the detail query and save mutation.
 */
const CHARACTER_SHEET_FIELDS_FRAGMENT = gql`
    fragment CharacterSheetFields on Character {
        id
        name
        race
        class
        subclass
        level
        alignment
        background
        proficiencyBonus
        inspiration
        ac
        speed
        initiative
        spellcastingAbility
        spellSaveDC
        spellAttackBonus
        conditions
        features {
            id
            name
            source
            description
            usesMax
            usesRemaining
            recharge
        }
        weapons {
            id
            name
            attackBonus
            damage
            type
        }
        inventory {
            id
            name
            quantity
            weight
            description
            equipped
            magical
        }
        spellSlots {
            id
            level
            total
            used
        }
        spellbook {
            ...CharacterSpellbookEntryFields
        }
        stats {
            id
            abilityScores {
                strength
                dexterity
                constitution
                intelligence
                wisdom
                charisma
            }
            hp {
                current
                max
                temp
            }
            deathSaves {
                successes
                failures
            }
            hitDice {
                total
                remaining
                die
            }
            savingThrowProficiencies
            traits {
                personality
                ideals
                bonds
                flaws
                armorProficiencies
                weaponProficiencies
                toolProficiencies
                languages
            }
            skillProficiencies {
                acrobatics
                animalHandling
                arcana
                athletics
                deception
                history
                insight
                intimidation
                investigation
                medicine
                nature
                perception
                performance
                persuasion
                religion
                sleightOfHand
                stealth
                survival
            }
            currency {
                cp
                sp
                ep
                gp
                pp
            }
        }
    }
    ${CHARACTER_SPELLBOOK_ENTRY_FIELDS_FRAGMENT}
`;

/**
 * Fetches the smaller roster payload for the signed-in user.
 */
export const GET_CURRENT_USER_CHARACTER_ROSTER = gql`
    query CurrentUserCharacterRoster {
        currentUserCharacters {
            ...CharacterRosterFields
        }
    }
    ${CHARACTER_ROSTER_FIELDS_FRAGMENT}
`;

/**
 * Fetches the full character-sheet payload for the signed-in user.
 */
export const GET_CURRENT_USER_CHARACTER_SHEETS = gql`
    query CurrentUserCharacterSheets {
        currentUserCharacters {
            ...CharacterSheetFields
        }
    }
    ${CHARACTER_SHEET_FIELDS_FRAGMENT}
`;

/**
 * Saves the full editable character-sheet payload atomically.
 */
export const SAVE_CHARACTER_SHEET = gql`
    mutation SaveCharacterSheet($characterId: ID!, $input: SaveCharacterSheetInput!) {
        saveCharacterSheet(characterId: $characterId, input: $input) {
            ...CharacterSheetFields
        }
    }
    ${CHARACTER_SHEET_FIELDS_FRAGMENT}
`;

/**
 * Adds a weapon row to the character sheet.
 */
export const ADD_WEAPON = gql`
    mutation AddWeapon($characterId: ID!, $input: WeaponInput!) {
        addWeapon(characterId: $characterId, input: $input) {
            id
            name
            attackBonus
            damage
            type
        }
    }
`;

/**
 * Updates an existing weapon row.
 */
export const UPDATE_WEAPON = gql`
    mutation UpdateWeapon($characterId: ID!, $weaponId: ID!, $input: WeaponInput!) {
        updateWeapon(characterId: $characterId, weaponId: $weaponId, input: $input) {
            id
            name
            attackBonus
            damage
            type
        }
    }
`;

/**
 * Removes a weapon row from the character sheet.
 */
export const REMOVE_WEAPON = gql`
    mutation RemoveWeapon($characterId: ID!, $weaponId: ID!) {
        removeWeapon(characterId: $characterId, weaponId: $weaponId)
    }
`;

/**
 * Adds an inventory item row to the character sheet.
 */
export const ADD_INVENTORY_ITEM = gql`
    mutation AddInventoryItem($characterId: ID!, $input: InventoryItemInput!) {
        addInventoryItem(characterId: $characterId, input: $input) {
            id
            name
            quantity
            weight
            description
            equipped
            magical
        }
    }
`;

/**
 * Updates an existing inventory item row.
 */
export const UPDATE_INVENTORY_ITEM = gql`
    mutation UpdateInventoryItem($characterId: ID!, $itemId: ID!, $input: InventoryItemInput!) {
        updateInventoryItem(characterId: $characterId, itemId: $itemId, input: $input) {
            id
            name
            quantity
            weight
            description
            equipped
            magical
        }
    }
`;

/**
 * Removes an inventory item row from the character sheet.
 */
export const REMOVE_INVENTORY_ITEM = gql`
    mutation RemoveInventoryItem($characterId: ID!, $itemId: ID!) {
        removeInventoryItem(characterId: $characterId, itemId: $itemId)
    }
`;

/**
 * Adds a feature row to the character sheet.
 */
export const ADD_FEATURE = gql`
    mutation AddFeature($characterId: ID!, $input: FeatureInput!) {
        addFeature(characterId: $characterId, input: $input) {
            id
            name
            source
            description
            usesMax
            usesRemaining
            recharge
        }
    }
`;

/**
 * Updates an existing feature row.
 */
export const UPDATE_FEATURE = gql`
    mutation UpdateFeature($characterId: ID!, $featureId: ID!, $input: FeatureInput!) {
        updateFeature(characterId: $characterId, featureId: $featureId, input: $input) {
            id
            name
            source
            description
            usesMax
            usesRemaining
            recharge
        }
    }
`;

/**
 * Removes a feature row from the character sheet.
 */
export const REMOVE_FEATURE = gql`
    mutation RemoveFeature($characterId: ID!, $featureId: ID!) {
        removeFeature(characterId: $characterId, featureId: $featureId)
    }
`;

/**
 * Updates top-level character fields such as AC, speed, initiative, and conditions.
 */
export const UPDATE_CHARACTER = gql`
    mutation UpdateCharacter($id: ID!, $input: UpdateCharacterInput!) {
        updateCharacter(id: $id, input: $input) {
            id
            level
            proficiencyBonus
            ac
            speed
            initiative
            conditions
            spellSaveDC
            spellAttackBonus
        }
    }
`;

/**
 * Replaces the character HP object.
 */
export const UPDATE_HP = gql`
    mutation UpdateHP($characterId: ID!, $input: HPInput!) {
        updateHP(characterId: $characterId, input: $input) {
            id
            hp {
                current
                max
                temp
            }
        }
    }
`;

/**
 * Replaces all six ability scores.
 */
export const UPDATE_ABILITY_SCORES = gql`
    mutation UpdateAbilityScores($characterId: ID!, $input: AbilityScoresInput!) {
        updateAbilityScores(characterId: $characterId, input: $input) {
            id
            abilityScores {
                strength
                dexterity
                constitution
                intelligence
                wisdom
                charisma
            }
        }
    }
`;

/**
 * Replaces character currency values.
 */
export const UPDATE_CURRENCY = gql`
    mutation UpdateCurrency($characterId: ID!, $input: CurrencyInput!) {
        updateCurrency(characterId: $characterId, input: $input) {
            id
            currency {
                cp
                sp
                ep
                gp
                pp
            }
        }
    }
`;

/**
 * Updates editable personality trait fields.
 */
export const UPDATE_TRAITS = gql`
    mutation UpdateTraits($characterId: ID!, $input: TraitsInput!) {
        updateTraits(characterId: $characterId, input: $input) {
            id
            traits {
                personality
                ideals
                bonds
                flaws
                armorProficiencies
                weaponProficiencies
                toolProficiencies
                languages
            }
        }
    }
`;

/**
 * Creates a new character with the full initial sheet data.
 */
export const CREATE_CHARACTER = gql`
    mutation CreateCharacter($input: CreateCharacterInput!) {
        createCharacter(input: $input) {
            id
            name
        }
    }
`;

/**
 * Toggles a character's inspiration flag.
 */
export const TOGGLE_INSPIRATION = gql`
    mutation ToggleInspiration($characterId: ID!) {
        toggleInspiration(characterId: $characterId) {
            id
            inspiration
        }
    }
`;

/**
 * Updates death save successes and failures.
 */
export const UPDATE_DEATH_SAVES = gql`
    mutation UpdateDeathSaves($characterId: ID!, $input: DeathSavesInput!) {
        updateDeathSaves(characterId: $characterId, input: $input) {
            id
            deathSaves {
                successes
                failures
            }
        }
    }
`;

/**
 * Updates one or more skill proficiency values.
 */
export const UPDATE_SKILL_PROFICIENCIES = gql`
    mutation UpdateSkillProficiencies($characterId: ID!, $input: SkillProficienciesInput!) {
        updateSkillProficiencies(characterId: $characterId, input: $input) {
            id
            skillProficiencies {
                acrobatics
                animalHandling
                arcana
                athletics
                deception
                history
                insight
                intimidation
                investigation
                medicine
                nature
                perception
                performance
                persuasion
                religion
                sleightOfHand
                stealth
                survival
            }
        }
    }
`;

/**
 * Replaces the set of proficient saving throws.
 */
export const UPDATE_SAVING_THROW_PROFICIENCIES = gql`
    mutation UpdateSavingThrowProficiencies($characterId: ID!, $input: SavingThrowProficienciesInput!) {
        updateSavingThrowProficiencies(characterId: $characterId, input: $input) {
            id
            savingThrowProficiencies
        }
    }
`;

/**
 * Cycles used spell slots at a given spell level.
 */
export const TOGGLE_SPELL_SLOT = gql`
    mutation ToggleSpellSlot($characterId: ID!, $level: Int!) {
        toggleSpellSlot(characterId: $characterId, level: $level) {
            id
            level
            total
            used
        }
    }
`;

/**
 * Adds a spell to the character spellbook if it is not already known.
 */
export const LEARN_SPELL = gql`
    mutation LearnSpell($characterId: ID!, $spellId: ID!) {
        learnSpell(characterId: $characterId, spellId: $spellId) {
            ...CharacterSpellbookEntryFields
        }
    }
    ${CHARACTER_SPELLBOOK_ENTRY_FIELDS_FRAGMENT}
`;

/**
 * Removes a spell from the character spellbook.
 */
export const FORGET_SPELL = gql`
    mutation ForgetSpell($characterId: ID!, $spellId: ID!) {
        forgetSpell(characterId: $characterId, spellId: $spellId)
    }
`;

/**
 * Marks a known spell as prepared.
 */
export const PREPARE_SPELL = gql`
    mutation PrepareSpell($characterId: ID!, $spellId: ID!) {
        prepareSpell(characterId: $characterId, spellId: $spellId) {
            prepared
            spell {
                id
            }
        }
    }
`;

/**
 * Marks a known spell as unprepared.
 */
export const UNPREPARE_SPELL = gql`
    mutation UnprepareSpell($characterId: ID!, $spellId: ID!) {
        unprepareSpell(characterId: $characterId, spellId: $spellId) {
            prepared
            spell {
                id
            }
        }
    }
`;
