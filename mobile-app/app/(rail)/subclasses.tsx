import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Snackbar, Text } from 'react-native-paper';
import ConfirmDialog from '@/components/ConfirmDialog';
import FloatingAddButton from '@/components/floating-add-button';
import MainContentFrame from '@/components/layout/MainContentFrame';
import RailScreenShell from '@/components/navigation/RailScreenShell';
import CustomSubclassFormSheet from '@/components/subclasses/CustomSubclassFormSheet';
import SubclassManagerCard from '@/components/subclasses/SubclassManagerCard';
import { ALL_CLASSES_FILTER } from '@/components/subclasses/SubclassClassFilterChips';
import type {
    CustomSubclassFormDraft,
    CustomSubclassFormMode,
    SubclassManagerRow,
} from '@/components/subclasses/subclassManager.types';
import {
    ARCHIVE_CUSTOM_SUBCLASS,
    CREATE_CUSTOM_SUBCLASS,
    GET_CUSTOM_SUBCLASSES,
    UPDATE_CUSTOM_SUBCLASS,
} from '@/graphql/customSubclass.operations';
import { GET_AVAILABLE_SUBCLASSES } from '@/graphql/characterSheet.operations';
import useSessionGuard from '@/hooks/useSessionGuard';
import { isUnauthenticatedError } from '@/lib/graphqlErrors';
import type {
    ArchiveCustomSubclassMutation,
    ArchiveCustomSubclassMutationVariables,
    AvailableSubclassesQuery,
    AvailableSubclassesQueryVariables,
    CreateCustomSubclassMutation,
    CreateCustomSubclassMutationVariables,
    CustomSubclassesQuery,
    CustomSubclassesQueryVariables,
    UpdateCustomSubclassMutation,
    UpdateCustomSubclassMutationVariables,
} from '@/types/generated_graphql_types';
import { fantasyTokens } from '@/theme/fantasyTheme';

const EMPTY_DRAFT: CustomSubclassFormDraft = {
    name: '',
    classId: '',
    description: '',
    selectionLevel: '',
    features: [],
};

/** Loading label shown while auth is being validated. */
const AUTH_LOADING_LABEL = 'Checking your adventurer records...';

/**
 * Builds the soft-archive confirmation text for a custom subclass.
 */
function deleteConfirmationMessage(subclass: SubclassManagerRow): string {
    if (subclass.characterUsageCount === 1) {
        return `"${subclass.name}" will be removed from future picks. 1 existing character will keep their subclass name.`;
    }

    if (subclass.characterUsageCount > 1) {
        return `"${subclass.name}" will be removed from future picks. ${subclass.characterUsageCount} existing characters will keep their subclass name.`;
    }

    return `"${subclass.name}" will be removed from future subclass picks. Existing characters that use it will keep their subclass name.`;
}

function customSubclassFeatureDraftId(featureId: string, index: number): string {
    return `${featureId || 'feature'}-${index}`;
}

function draftFromSubclass(subclass: SubclassManagerRow): CustomSubclassFormDraft {
    return {
        name: subclass.name,
        classId: subclass.classId,
        description: subclass.description.join('\n'),
        selectionLevel: String(subclass.selectionLevel),
        features: subclass.features.map((feature, index) => ({
            clientId: customSubclassFeatureDraftId(feature.id, index),
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

/**
 * Rail route for browsing SRD subclasses and managing reusable current-user custom subclasses.
 */
export default function CustomSubclassesScreen() {
    const router = useRouter();
    const apolloClient = useApolloClient();
    const { hasValidSession, isCheckingSession } = useSessionGuard();
    const [selectedClassId, setSelectedClassId] = useState(ALL_CLASSES_FILTER);
    const [isViewingSubclass, setIsViewingSubclass] = useState(false);
    const [formVisible, setFormVisible] = useState(false);
    const [formMode, setFormMode] = useState<CustomSubclassFormMode>('create');
    const [draft, setDraft] = useState<CustomSubclassFormDraft>(EMPTY_DRAFT);
    const [initialDraft, setInitialDraft] = useState<CustomSubclassFormDraft>(EMPTY_DRAFT);
    const [editingSubclass, setEditingSubclass] = useState<SubclassManagerRow | null>(null);
    const [deleteCandidate, setDeleteCandidate] = useState<SubclassManagerRow | null>(null);
    const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
    const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

    const {
        data: availableData,
        loading: availableLoading,
        error: availableError,
    } = useQuery<AvailableSubclassesQuery, AvailableSubclassesQueryVariables>(
        GET_AVAILABLE_SUBCLASSES,
        {
            skip: !hasValidSession,
            notifyOnNetworkStatusChange: true,
            fetchPolicy: 'cache-and-network',
        },
    );
    const {
        data: customData,
        loading: customLoading,
        error: customError,
    } = useQuery<CustomSubclassesQuery, CustomSubclassesQueryVariables>(
        GET_CUSTOM_SUBCLASSES,
        {
            skip: !hasValidSession,
            notifyOnNetworkStatusChange: true,
            fetchPolicy: 'cache-and-network',
        },
    );

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

    const error = availableError ?? customError;
    const loading = availableLoading || customLoading;
    const isUnauthenticated = isUnauthenticatedError(error);
    const customSubclassUsageCountById = useMemo(() => {
        return new Map(
            (customData?.customSubclasses ?? []).map((subclass) => [
                subclass.id,
                subclass.characterUsageCount,
            ]),
        );
    }, [customData?.customSubclasses]);
    const customSubclassCanChangeById = useMemo(() => {
        return new Map(
            (customData?.customSubclasses ?? []).map((subclass) => [
                subclass.id,
                {
                    canChangeClass: subclass.canChangeClass,
                    cannotChangeClassReason: subclass.cannotChangeClassReason,
                },
            ]),
        );
    }, [customData?.customSubclasses]);
    const allSubclasses = useMemo<SubclassManagerRow[]>(() => {
        return (availableData?.availableSubclasses ?? []).map((subclass) => ({
            ...subclass,
            characterUsageCount: subclass.isCustom
                ? customSubclassUsageCountById.get(subclass.id) ?? 0
                : 0,
        }));
    }, [availableData?.availableSubclasses, customSubclassUsageCountById]);
    const visibleSubclasses = useMemo(() => {
        if (selectedClassId === ALL_CLASSES_FILTER) return allSubclasses;
        return allSubclasses.filter((subclass) => subclass.classId === selectedClassId);
    }, [allSubclasses, selectedClassId]);
    const saving = createState.loading || updateState.loading;

    useEffect(() => {
        if (!isUnauthenticated) return;
        router.replace('/(auth)/sign-in');
    }, [isUnauthenticated, router]);

    /**
     * Refetches manager data and any mounted subclass picker queries after custom subclass mutations.
     */
    async function refreshSubclassData() {
        await apolloClient.refetchQueries({
            include: [GET_AVAILABLE_SUBCLASSES, GET_CUSTOM_SUBCLASSES],
        });
    }

    /**
     * Opens a blank create form.
     */
    function openCreateForm() {
        setFormMode('create');
        setEditingSubclass(null);
        setDraft(EMPTY_DRAFT);
        setInitialDraft(EMPTY_DRAFT);
        setFormErrorMessage(null);
        setFormVisible(true);
    }

    /**
     * Opens the edit form with existing row values.
     */
    function openEditForm(subclass: SubclassManagerRow) {
        if (!subclass.isCustom) return;

        const nextDraft = draftFromSubclass(subclass);

        setFormMode('edit');
        setEditingSubclass(subclass);
        setDraft(nextDraft);
        setInitialDraft(nextDraft);
        setFormErrorMessage(null);
        setFormVisible(true);
    }

    /**
     * Closes and resets the create/edit form.
     */
    function closeForm() {
        if (saving) return;
        setFormVisible(false);
        setEditingSubclass(null);
        setDraft(EMPTY_DRAFT);
        setFormErrorMessage(null);
    }

    /**
     * Persists the current create/edit form draft.
     */
    async function saveForm() {
        const input = mutationInputFromDraft(draft);

        try {
            setFormErrorMessage(null);

            if (formMode === 'edit' && editingSubclass) {
                await updateCustomSubclass({
                    variables: {
                        id: editingSubclass.id,
                        input,
                    },
                });
            } else {
                await createCustomSubclass({
                    variables: {
                        input,
                    },
                });
            }

            await refreshSubclassData();
            closeForm();
        } catch (mutationError) {
            const message = mutationError instanceof Error
                ? mutationError.message
                : 'Unable to save custom subclass.';
            setFormErrorMessage(message);
        }
    }

    /**
     * Archives the selected subclass after confirmation.
     */
    async function confirmArchiveSubclass() {
        if (!deleteCandidate || !deleteCandidate.isCustom || archiveState.loading) return;

        try {
            setActionErrorMessage(null);
            await archiveCustomSubclass({
                variables: {
                    id: deleteCandidate.id,
                },
            });
            setDeleteCandidate(null);
            await refreshSubclassData();
        } catch (mutationError) {
            const message = mutationError instanceof Error
                ? mutationError.message
                : 'Unable to delete custom subclass.';
            setActionErrorMessage(message);
        }
    }

    if (isCheckingSession) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={fantasyTokens.colors.gold} />
                <Text style={styles.loadingText}>{AUTH_LOADING_LABEL}</Text>
            </View>
        );
    }

    if (!hasValidSession || isUnauthenticated) {
        return null;
    }

    if (loading && !availableData) {
        return (
            <RailScreenShell>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={fantasyTokens.colors.gold} />
                    <Text style={styles.loadingText}>Gathering subclasses...</Text>
                </View>
            </RailScreenShell>
        );
    }

    if (error) {
        return (
            <RailScreenShell>
                <View style={styles.loadingContainer}>
                    <Text style={styles.errorTitle}>Unable to load subclasses.</Text>
                    <Text style={styles.errorText}>{error.message}</Text>
                </View>
            </RailScreenShell>
        );
    }

    return (
        <RailScreenShell>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <Text style={styles.codexLabel}>Subclasses</Text>
                        <Text style={styles.pageTitle}>Subclass Manager</Text>
                    </View>
                </View>

                <View style={styles.contentArea}>
                    <MainContentFrame style={styles.frame}>
                        <SubclassManagerCard
                            style={styles.managerCard}
                            subclasses={visibleSubclasses}
                            allSubclassCount={allSubclasses.length}
                            selectedClassId={selectedClassId}
                            onDetailVisibilityChange={setIsViewingSubclass}
                            onSelectClassId={setSelectedClassId}
                            onEdit={openEditForm}
                            onDelete={setDeleteCandidate}
                        />
                    </MainContentFrame>
                </View>

                {!isViewingSubclass && (
                    <FloatingAddButton
                        accessibilityLabel="Add custom subclass"
                        onPress={openCreateForm}
                        testID="add-custom-subclass"
                    />
                )}

                <CustomSubclassFormSheet
                    visible={formVisible}
                    mode={formMode}
                    draft={draft}
                    initialDraft={initialDraft}
                    pending={saving}
                    errorMessage={formErrorMessage}
                    lockedClassSelection={
                        formMode === 'edit'
                        && editingSubclass != null
                        && (
                            !(customSubclassCanChangeById.get(editingSubclass.id)?.canChangeClass ?? false)
                            || (initialDraft.features.length > 0 && draft.features.length > 0)
                        )
                    }
                    lockedClassMessage={
                        formMode === 'edit' && editingSubclass != null
                            ? (customSubclassCanChangeById.get(editingSubclass.id)?.cannotChangeClassReason)
                                || 'Remove saved feature definitions before changing the parent class.'
                            : ''
                    }
                    onChangeDraft={(nextDraft) => {
                        setDraft(nextDraft);
                        if (formErrorMessage) setFormErrorMessage(null);
                    }}
                    onClose={closeForm}
                    onSave={() => {
                        void saveForm();
                    }}
                />

                <ConfirmDialog
                    visible={deleteCandidate != null}
                    title="Delete custom subclass?"
                    message={deleteCandidate ? deleteConfirmationMessage(deleteCandidate) : ''}
                    confirmLabel={archiveState.loading ? 'Deleting...' : 'Delete'}
                    onConfirm={() => {
                        void confirmArchiveSubclass();
                    }}
                    onCancel={() => {
                        if (!archiveState.loading) setDeleteCandidate(null);
                    }}
                />

                <Snackbar
                    visible={actionErrorMessage != null}
                    onDismiss={() => setActionErrorMessage(null)}
                    duration={4000}
                    style={styles.snackbar}
                >
                    {actionErrorMessage ?? ''}
                </Snackbar>
            </View>
        </RailScreenShell>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.night,
    },
    contentArea: {
        flex: 1,
        paddingBottom: fantasyTokens.spacing.md,
    },
    header: {
        backgroundColor: fantasyTokens.colors.night,
        borderBottomWidth: 1,
        borderBottomColor: fantasyTokens.rail.border,
        paddingHorizontal: fantasyTokens.spacing.xl,
        marginBottom: fantasyTokens.spacing.md,

    },
    headerContent: {
        paddingTop: fantasyTokens.spacing.sm,
        paddingBottom: fantasyTokens.spacing.md,
    },
    codexLabel: {
        color: fantasyTokens.colors.gold,
        opacity: 0.7,
        ...fantasyTokens.typography.eyebrow,
        textAlign: 'center',
    },
    pageTitle: {
        color: fantasyTokens.colors.parchment,
        ...fantasyTokens.typography.pageTitle,
        marginTop: fantasyTokens.spacing.xs,
        fontWeight: '700',
        textAlign: 'center',
    },
    frame: {
        flex: 1,
        paddingHorizontal: fantasyTokens.spacing.md,
    },
    managerCard: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: fantasyTokens.spacing.sm,
        backgroundColor: fantasyTokens.colors.night,
        paddingHorizontal: fantasyTokens.spacing.lg,
    },
    loadingText: {
        color: fantasyTokens.colors.parchmentDeep,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.body,
        textAlign: 'center',
    },
    errorTitle: {
        color: fantasyTokens.colors.parchment,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.title,
        textAlign: 'center',
    },
    errorText: {
        color: fantasyTokens.colors.crimson,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.label,
        textAlign: 'center',
        marginTop: fantasyTokens.spacing.xs,
    },
    snackbar: {
        backgroundColor: fantasyTokens.colors.crimson,
    },
});
