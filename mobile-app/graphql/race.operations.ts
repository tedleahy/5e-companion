import { gql } from '@apollo/client';

export const GET_COMPENDIUM_RACES = gql`
    query CompendiumRaces {
        compendiumRaces {
            id
            value
            srdIndex
            name
            isCustom
            sourceBook
            speed
            size
            sizeDescription
            age
            alignment
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
            subraces {
                value
                name
                abilityBonuses {
                    abilityIndex
                    abilityName
                    bonus
                }
                abilitySummary
                traitCount
            }
            characterUsageCount
        }
    }
`;
