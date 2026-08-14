import { gql } from '@apollo/client';

export const GET_COMPENDIUM_SUBRACES = gql`
    query CompendiumSubraces {
        compendiumSubraces {
            id
            value
            srdIndex
            name
            description
            isCustom
            sourceBook
            parentRace {
                value
                name
                speed
                size
                languageDescription
                languageChoiceCount
                abilityBonuses {
                    abilityIndex
                    abilityName
                    bonus
                }
                abilitySummary
                traits {
                    value
                    name
                    description
                    languageChoiceCount
                }
                languages {
                    value
                    name
                }
            }
            abilityBonuses {
                abilityIndex
                abilityName
                bonus
            }
            abilitySummary
            traits {
                value
                name
                description
                languageChoiceCount
            }
            characterUsageCount
        }
    }
`;
