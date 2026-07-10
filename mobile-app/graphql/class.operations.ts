import { gql } from '@apollo/client';

export const CLASS_SUMMARY_FIELDS = gql`
    fragment ClassSummaryFields on AvailableClass {
        id
        value
        srdIndex
        name
        description
        hitDie
        primaryAbilityIndexes
        savingThrowIndexes
        spellcastingMode
        spellcastingAbility
        multiclassPrerequisites { abilityIndex minimum group }
        isCustom
    }
`;

export const CLASS_DETAILS_FIELDS = gql`
    fragment ClassDetailsFields on ClassDetails {
        id
        value
        srdIndex
        name
        description
        hitDie
        primaryAbilityIndexes
        savingThrowIndexes
        spellcastingMode
        spellcastingAbility
        isCustom
        archived
        sourceBook
        multiclassPrerequisites { abilityIndex minimum group }
        proficiencies { value name type grant choiceGroup choiceCount }
        equipment { name quantity choiceGroup choiceCount }
        progression {
            level
            abilityScoreImprovement
            spellSlots
            cantripsKnown
            spellsKnown
            preparedSpellCount
            addSpellcastingAbility
            displayValues { key value }
        }
        features { id name description level }
        spells { id name level }
        characterUsageCount
        mechanicsLocked
        mechanicsLockedReason
    }
`;

export const GET_AVAILABLE_CLASSES = gql`
    query AvailableClasses {
        availableClasses { ...ClassSummaryFields }
    }
    ${CLASS_SUMMARY_FIELDS}
`;

export const GET_CLASS_DETAILS = gql`
    query ClassDetails($value: String!) {
        classDetails(value: $value) { ...ClassDetailsFields }
    }
    ${CLASS_DETAILS_FIELDS}
`;

export const GET_CUSTOM_CLASSES = gql`
    query CustomClasses {
        customClasses { ...ClassDetailsFields }
    }
    ${CLASS_DETAILS_FIELDS}
`;

export const CREATE_CUSTOM_CLASS = gql`
    mutation CreateCustomClass($input: ManagedCustomClassInput!) {
        createCustomClass(input: $input) { ...ClassDetailsFields }
    }
    ${CLASS_DETAILS_FIELDS}
`;

export const UPDATE_CUSTOM_CLASS = gql`
    mutation UpdateCustomClass($id: ID!, $input: ManagedCustomClassInput!) {
        updateCustomClass(id: $id, input: $input) { ...ClassDetailsFields }
    }
    ${CLASS_DETAILS_FIELDS}
`;

export const GET_PROFICIENCIES = gql`
    query Proficiencies($type: String) {
        proficiencies(type: $type) {
            value
            name
            type
            isCustom
        }
    }
`;

export const ARCHIVE_CUSTOM_CLASS = gql`
    mutation ArchiveCustomClass($id: ID!) { archiveCustomClass(id: $id) }
`;
