import { gql } from '@apollo/client';

export const GET_COMPENDIUM_LANGUAGES = gql`
    query CompendiumLanguages {
        compendiumLanguages {
            id
            value
            srdIndex
            name
            isCustom
            sourceBook
            type
            script
            typicalSpeakers
            description
            grantingRaces {
                value
                name
            }
            grantingBackgrounds {
                value
                name
            }
            grantingTraits {
                value
                name
            }
            sameScriptLanguages {
                value
                name
            }
            characterUsageCount
        }
    }
`;
