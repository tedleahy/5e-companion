import { gql } from '@apollo/client';

/**
 * Shared custom subclass fields returned by manager mutations.
 */
export const CUSTOM_SUBCLASS_MANAGER_FIELDS = gql`
    fragment CustomSubclassManagerFields on CustomSubclass {
        id
        value
        classId
        className
        name
        description
        characterUsageCount
        features {
            id
            name
            description
            level
        }
    }
`;

/**
 * Loads current-user custom subclasses with manager-only metadata such as usage count.
 */
export const GET_CUSTOM_SUBCLASSES = gql`
    query CustomSubclasses($classIds: [String!]) {
        customSubclasses(classIds: $classIds) {
            ...CustomSubclassManagerFields
        }
    }
    ${CUSTOM_SUBCLASS_MANAGER_FIELDS}
`;

/**
 * Creates a current-user custom subclass.
 */
export const CREATE_CUSTOM_SUBCLASS = gql`
    mutation CreateCustomSubclass($input: ManagedCustomSubclassInput!) {
        createCustomSubclass(input: $input) {
            ...CustomSubclassManagerFields
        }
    }
    ${CUSTOM_SUBCLASS_MANAGER_FIELDS}
`;

/**
 * Updates a current-user custom subclass.
 */
export const UPDATE_CUSTOM_SUBCLASS = gql`
    mutation UpdateCustomSubclass($id: ID!, $input: ManagedCustomSubclassInput!) {
        updateCustomSubclass(id: $id, input: $input) {
            ...CustomSubclassManagerFields
        }
    }
    ${CUSTOM_SUBCLASS_MANAGER_FIELDS}
`;

/**
 * Archives a current-user custom subclass so future pickers no longer show it.
 */
export const ARCHIVE_CUSTOM_SUBCLASS = gql`
    mutation ArchiveCustomSubclass($id: ID!) {
        archiveCustomSubclass(id: $id)
    }
`;
