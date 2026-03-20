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
