import { gql } from '@apollo/client';

/** Lightweight query used to populate counts on implemented Compendium cards. */
export const GET_COMPENDIUM_COUNTS = gql`
    query CompendiumCounts {
        compendiumCounts {
            srdClassCount
            customClassCount
            srdSubclassCount
            customSubclassCount
            spellCount
        }
    }
`;
