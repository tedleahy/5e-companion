import { gql } from '@apollo/client';

/**
 * Fetches the full character-sheet payload for the signed-in user.
 */
export const GET_CURRENT_USER_CHARACTERS = gql`
    query CurrentUserCharacters {
        currentUserCharacters {
            id
            name
            race
            class
            subclass
            level
            alignment
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
            attacks {
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
                prepared
                spell {
                    id
                    name
                    level
                    schoolIndex
                    castingTime
                    range
                    concentration
                    ritual
                }
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
