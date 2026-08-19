import { gql } from '@apollo/client';

export const GET_COMPENDIUM_SUBCLASSES = gql`
    query CompendiumSubclasses {
        compendiumSubclasses {
            id
            value
            srdIndex
            name
            description
            isCustom
            sourceBook
            classId
            className
            selectionLevel
            features {
                id
                name
                description
                level
            }
            characterUsageCount
            canChangeClass
            cannotChangeClassReason
        }
    }
`;
