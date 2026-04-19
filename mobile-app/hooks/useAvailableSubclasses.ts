import { useMemo } from 'react';
import { skipToken, useQuery } from '@apollo/client/react';
import {
    GET_AVAILABLE_SUBCLASSES,
} from '@/graphql/characterSheet.operations';
import {
    groupAvailableSubclassesByClassId,
    mapAvailableSubclassOption,
    subclassOptionItems,
    type AvailableSubclassOption,
} from '@/lib/subclasses';
import type {
    AvailableSubclassesQuery,
    AvailableSubclassesQueryVariables,
} from '@/types/generated_graphql_types';

type UseAvailableSubclassesResult = {
    availableSubclasses: AvailableSubclassOption[];
    availableSubclassesByClassId: Record<string, AvailableSubclassOption[]>;
    subclassOptionItemsByClassId: Record<string, ReturnType<typeof subclassOptionItems>>;
    loading: boolean;
};

/**
 * Loads the visible subclass list for the signed-in user and groups it by class.
 */
export default function useAvailableSubclasses(
    classIds: readonly string[],
): UseAvailableSubclassesResult {
    const filteredClassIds = useMemo(
        () => Array.from(new Set(classIds.filter((classId) => classId.trim().length > 0))),
        [classIds],
    );
    const { data, loading } = useQuery<
        AvailableSubclassesQuery,
        AvailableSubclassesQueryVariables
    >(
        GET_AVAILABLE_SUBCLASSES,
        filteredClassIds.length > 0
            ? {
                  variables: { classIds: filteredClassIds },
              }
            : skipToken,
    );

    const availableSubclasses = useMemo(
        () => (data?.availableSubclasses ?? []).map(mapAvailableSubclassOption),
        [data?.availableSubclasses],
    );
    const availableSubclassesByClassId = useMemo(
        () => groupAvailableSubclassesByClassId(availableSubclasses),
        [availableSubclasses],
    );
    const subclassOptionItemsByClassId = useMemo(
        () => Object.fromEntries(
            Object.entries(availableSubclassesByClassId).map(([classId, subclasses]) => [
                classId,
                subclassOptionItems(subclasses),
            ]),
        ),
        [availableSubclassesByClassId],
    );

    return {
        availableSubclasses,
        availableSubclassesByClassId,
        subclassOptionItemsByClassId,
        loading,
    };
}
