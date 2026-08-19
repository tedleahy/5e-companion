import { useMemo, useState } from 'react';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import type { Subclass } from '@/components/compendium/subclass-presentation';
import type {
    CustomSubclassFormDraft,
    CustomSubclassFormMode,
} from '@/components/subclasses/subclassManager.types';
import { GET_COMPENDIUM_COUNTS } from '@/graphql/compendium.operations';
import { GET_AVAILABLE_SUBCLASSES } from '@/graphql/characterSheet.operations';
import { GET_AVAILABLE_CLASSES } from '@/graphql/class.operations';
import {
    ARCHIVE_CUSTOM_SUBCLASS,
    CREATE_CUSTOM_SUBCLASS,
    GET_CUSTOM_SUBCLASSES,
    UPDATE_CUSTOM_SUBCLASS,
} from '@/graphql/customSubclass.operations';
import { GET_COMPENDIUM_SUBCLASSES } from '@/graphql/subclass.operations';
import { CLASS_OPTIONS, type OptionItem } from '@/lib/characterCreation/options';
import type {
    ArchiveCustomSubclassMutation,
    ArchiveCustomSubclassMutationVariables,
    AvailableClassesQuery,
    CreateCustomSubclassMutation,
    CreateCustomSubclassMutationVariables,
    UpdateCustomSubclassMutation,
    UpdateCustomSubclassMutationVariables,
} from '@/types/generated_graphql_types';

const EMPTY_DRAFT: CustomSubclassFormDraft = {
    name: '',
    classId: '',
    description: '',
    selectionLevel: '',
    features: [],
};

const FEATURES_LOCK_CLASS_MESSAGE = 'Remove saved feature definitions before changing the parent class.';

function featureDraftId(featureId: string, index: number): string {
    return `${featureId || 'feature'}-${index}`;
}

function draftFromSubclass(subclass: Subclass): CustomSubclassFormDraft {
    return {
        name: subclass.name,
        classId: subclass.classId,
        description: subclass.description.join('\n'),
        selectionLevel: String(subclass.selectionLevel),
        features: subclass.features.map((feature, index) => ({
            clientId: featureDraftId(feature.id, index),
            id: feature.id,
            name: feature.name,
            description: feature.description,
            level: String(feature.level > 0 ? feature.level : ''),
        })),
    };
}

function mutationInputFromDraft(draft: CustomSubclassFormDraft) {
    return {
        name: draft.name.trim(),
        classId: draft.classId.trim(),
        description: draft.description.trim(),
        selectionLevel: Number(draft.selectionLevel),
        features: draft.features.map((feature) => ({
            ...(feature.id ? { id: feature.id } : {}),
            name: feature.name.trim(),
            description: feature.description.trim(),
            level: Number(feature.level),
        })),
    };
}

/** Soft-archive wording, which depends on how many characters already picked it. */
export function deleteConfirmationMessage(subclass: Subclass): string {
    if (subclass.characterUsageCount === 1) {
        return `"${subclass.name}" will be removed from future picks. 1 existing character will keep their subclass name.`;
    }

    if (subclass.characterUsageCount > 1) {
        return `"${subclass.name}" will be removed from future picks. ${subclass.characterUsageCount} existing characters will keep their subclass name.`;
    }

    return `"${subclass.name}" will be removed from future subclass picks. Existing characters that use it will keep their subclass name.`;
}

export type CustomSubclassManager = ReturnType<typeof useCustomSubclassManager>;

/**
 * Create, edit, and soft-archive state for current-user custom subclasses.
 *
 * Kept apart from browsing so the Compendium shell stays responsible for
 * presentation and this hook stays responsible for the writes.
 */
export default function useCustomSubclassManager() {
    const apolloClient = useApolloClient();
    const [formVisible, setFormVisible] = useState(false);
    const [formMode, setFormMode] = useState<CustomSubclassFormMode>('create');
    const [draft, setDraft] = useState<CustomSubclassFormDraft>(EMPTY_DRAFT);
    const [initialDraft, setInitialDraft] = useState<CustomSubclassFormDraft>(EMPTY_DRAFT);
    const [editingSubclass, setEditingSubclass] = useState<Subclass | null>(null);
    const [deleteCandidate, setDeleteCandidate] = useState<Subclass | null>(null);
    const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
    const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

    const { data: classData } = useQuery<AvailableClassesQuery>(GET_AVAILABLE_CLASSES, {
        fetchPolicy: 'cache-first',
    });
    const classOptions = useMemo<OptionItem[]>(() => {
        const options = (classData?.availableClasses ?? []).map((classRef) => {
            const visual = CLASS_OPTIONS.find((option) => option.value === classRef.srdIndex);
            return {
                value: classRef.value,
                label: classRef.name,
                icon: visual?.icon ?? '⚔️',
                hitDie: classRef.hitDie,
                multiclassPrerequisites: classRef.multiclassPrerequisites.map((rule) => ({ ...rule })),
            };
        });
        return options.length > 0 ? options : CLASS_OPTIONS;
    }, [classData?.availableClasses]);

    const [createCustomSubclass, createState] = useMutation<
        CreateCustomSubclassMutation,
        CreateCustomSubclassMutationVariables
    >(CREATE_CUSTOM_SUBCLASS);
    const [updateCustomSubclass, updateState] = useMutation<
        UpdateCustomSubclassMutation,
        UpdateCustomSubclassMutationVariables
    >(UPDATE_CUSTOM_SUBCLASS);
    const [archiveCustomSubclass, archiveState] = useMutation<
        ArchiveCustomSubclassMutation,
        ArchiveCustomSubclassMutationVariables
    >(ARCHIVE_CUSTOM_SUBCLASS);

    const saving = createState.loading || updateState.loading;
    const archiving = archiveState.loading;

    /** Refreshes browse rows, hub counts, and any mounted subclass picker. */
    async function refreshSubclassData() {
        await apolloClient.refetchQueries({
            include: [
                GET_COMPENDIUM_SUBCLASSES,
                GET_AVAILABLE_SUBCLASSES,
                GET_CUSTOM_SUBCLASSES,
                GET_COMPENDIUM_COUNTS,
            ],
        });
    }

    function openCreateForm() {
        setFormMode('create');
        setEditingSubclass(null);
        setDraft(EMPTY_DRAFT);
        setInitialDraft(EMPTY_DRAFT);
        setFormErrorMessage(null);
        setFormVisible(true);
    }

    function openEditForm(subclass: Subclass) {
        if (!subclass.isCustom) return;

        const nextDraft = draftFromSubclass(subclass);

        setFormMode('edit');
        setEditingSubclass(subclass);
        setDraft(nextDraft);
        setInitialDraft(nextDraft);
        setFormErrorMessage(null);
        setFormVisible(true);
    }

    function closeForm() {
        if (saving) return;
        setFormVisible(false);
        setEditingSubclass(null);
        setDraft(EMPTY_DRAFT);
        setFormErrorMessage(null);
    }

    function changeDraft(nextDraft: CustomSubclassFormDraft) {
        setDraft(nextDraft);
        if (formErrorMessage) setFormErrorMessage(null);
    }

    async function saveForm() {
        const input = mutationInputFromDraft(draft);

        try {
            setFormErrorMessage(null);

            if (formMode === 'edit' && editingSubclass) {
                await updateCustomSubclass({ variables: { id: editingSubclass.id, input } });
            } else {
                await createCustomSubclass({ variables: { input } });
            }

            await refreshSubclassData();
            closeForm();
        } catch (mutationError) {
            setFormErrorMessage(mutationError instanceof Error
                ? mutationError.message
                : 'Unable to save custom subclass.');
        }
    }

    async function confirmArchive() {
        if (!deleteCandidate || !deleteCandidate.isCustom || archiving) return;

        try {
            setActionErrorMessage(null);
            await archiveCustomSubclass({ variables: { id: deleteCandidate.id } });
            setDeleteCandidate(null);
            await refreshSubclassData();
        } catch (mutationError) {
            setActionErrorMessage(mutationError instanceof Error
                ? mutationError.message
                : 'Unable to delete custom subclass.');
        }
    }

    function cancelArchive() {
        if (!archiving) setDeleteCandidate(null);
    }

    // Saved features pin the parent class even when the server would still allow
    // a move, because reparenting would strand them on the previous class.
    const lockedClassSelection = formMode === 'edit'
        && editingSubclass != null
        && (
            !editingSubclass.canChangeClass
            || (initialDraft.features.length > 0 && draft.features.length > 0)
        );

    return {
        classOptions,
        formVisible,
        formMode,
        draft,
        initialDraft,
        formErrorMessage,
        actionErrorMessage,
        deleteCandidate,
        saving,
        archiving,
        lockedClassSelection,
        lockedClassMessage: formMode === 'edit' && editingSubclass != null
            ? editingSubclass.cannotChangeClassReason || FEATURES_LOCK_CLASS_MESSAGE
            : '',
        openCreateForm,
        openEditForm,
        closeForm,
        changeDraft,
        saveForm,
        requestArchive: setDeleteCandidate,
        confirmArchive,
        cancelArchive,
        dismissActionError: () => setActionErrorMessage(null),
    };
}
