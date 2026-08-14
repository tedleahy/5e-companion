import { gql } from '@apollo/client';

export const GET_COMPENDIUM_BACKGROUNDS = gql`
    query CompendiumBackgrounds {
        compendiumBackgrounds {
            id
            value
            srdIndex
            name
            isCustom
            sourceBook
            featureName
            featureDescription
            languageChoiceCount
            proficiencies {
                value
                name
                type
                isCustom
            }
            languages {
                value
                name
            }
            startingEquipment {
                name
                quantity
                choiceGroup
                choiceCount
            }
            suggestedCharacteristics {
                personalityTraits {
                    choose
                    options
                }
                ideals {
                    choose
                    options
                }
                bonds {
                    choose
                    options
                }
                flaws {
                    choose
                    options
                }
            }
            characterUsageCount
        }
    }
`;
