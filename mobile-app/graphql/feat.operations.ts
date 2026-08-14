import { gql } from '@apollo/client';

export const GET_COMPENDIUM_FEATS = gql`
    query CompendiumFeats {
        compendiumFeats {
            id
            value
            srdIndex
            name
            isCustom
            sourceBook
            description
            prerequisites {
                abilityIndex
                abilityName
                minimumScore
            }
            prerequisiteSummary
            characterUsageCount
        }
    }
`;
