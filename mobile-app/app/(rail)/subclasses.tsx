import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Snackbar, Text } from 'react-native-paper';
import ConfirmDialog from '@/components/ConfirmDialog';
import MainContentFrame from '@/components/layout/MainContentFrame';
import RailScreenShell from '@/components/navigation/RailScreenShell';
import CustomSubclassFormSheet from '@/components/subclasses/CustomSubclassFormSheet';
import SubclassManagerCard from '@/components/subclasses/SubclassManagerCard';
import { ALL_CLASSES_FILTER } from '@/components/subclasses/SubclassClassFilterChips';
import type {
    CustomSubclassFormDraft,
    CustomSubclassFormMode,
    CustomSubclassManagerRow,
} from '@/components/subclasses/subclassManager.types';
import {
    ARCHIVE_CUSTOM_SUBCLASS,
    CREATE_CUSTOM_SUBCLASS,
    GET_AVAILABLE_SUBCLASSES,
    GET_CUSTOM_SUBCLASSES,
    UPDATE_CUSTOM_SUBCLASS,
} from '@/graphql/customSubclass.operations';
import useSessionGuard from '@/hooks/useSessionGuard';
import { isUnauthenticatedError } from '@/lib/graphqlErrors';
import type {
    ArchiveCustomSubclassMutation,
    ArchiveCustomSubclassMutationVariables,
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
};

/** Loading label shown while auth is being validated. */
const AUTH_LOADING_LABEL = 'Checking your adventurer records...';

/**
 * Builds the soft-archive confirmation text for a custom subclass.
 */
function deleteConfirmationMessage(subclass: CustomSubclassManagerRow): string {
    if (subclass.characterUsageCount > 0) {
        const characterLabel = subclass.characterUsageCount === 1 ? 'character' : 'characters';
        return `"${subclass.name}" will be removed from future picks. ${subclass.characterUsageCount} existing ${characterLabel} will keep their subclass name.`;
    }

    return `"${subclass.name}" will be removed from future subclass picks. Existing characters that use it will keep their subclass name.`;
}

/**
 * Rail route for managing reusable current-user custom subclasses.
 */
export default function CustomSubclassesScreen() {
    const router = useRouter();
    const apolloClient = useApolloClient();
    const { hasValidSession, isCheckingSession } = useSessionGuard();
    const [selectedClassId, setSelectedClassId] = useState(ALL_CLASSES_FILTER);
    const [formVisible, setFormVisible] = useState(false);
    const [formMode, setFormMode] = useState<CustomSubclassFormMode>('create');
    const [draft, setDraft] = useState<CustomSubclassFormDraft>(EMPTY_DRAFT);
    const [editingSubclass, setEditingSubclass] = useState<CustomSubclassManagerRow | null>(null);
    const [deleteCandidate, setDeleteCandidate] = useState<CustomSubclassManagerRow | null>(null);
    const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
    const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

    const {
        data,
        loading,
        error,
        refetch,
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

    const isUnauthenticated = isUnauthenticatedError(error);
    const allSubclasses = data?.customSubclasses ?? [];
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
     * Refetches manager data and any mounted subclass picker queries.
     */
    async function refreshSubclassData() {
        await refetch();
        await apolloClient.refetchQueries({
            include: [GET_AVAILABLE_SUBCLASSES],
        });
    }

    /**
     * Opens a blank create form.
     */
    function openCreateForm() {
        setFormMode('create');
        setEditingSubclass(null);
        setDraft(EMPTY_DRAFT);
        setFormErrorMessage(null);
        setFormVisible(true);
    }

    /**
     * Opens the edit form with existing row values.
     */
    function openEditForm(subclass: CustomSubclassManagerRow) {
        setFormMode('edit');
        setEditingSubclass(subclass);
        setDraft({
            name: subclass.name,
            classId: subclass.classId,
            description: subclass.description.join('\n'),
        });
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
        const input = {
            name: draft.name.trim(),
            classId: draft.classId.trim(),
            description: draft.description.trim(),
        };

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
        if (!deleteCandidate || archiveState.loading) return;

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

    if (loading && !data) {
        return (
            <RailScreenShell>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={fantasyTokens.colors.gold} />
                    <Text style={styles.loadingText}>Gathering your custom subclasses...</Text>
                </View>
            </RailScreenShell>
        );
    }

    if (error) {
        return (
            <RailScreenShell>
                <View style={styles.loadingContainer}>
                    <Text style={styles.errorTitle}>Unable to load custom subclasses.</Text>
                    <Text style={styles.errorText}>{error.message}</Text>
                </View>
            </RailScreenShell>
        );
    }

    return (
        <RailScreenShell>
            <View style={styles.container}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <Text style={styles.codexLabel}>Custom Subclasses</Text>
                        <Text style={styles.pageTitle}>Subclass Manager</Text>
                        <Text style={styles.subtitle}>
                            Build reusable subclass options for character creation and level-up.
                        </Text>
                    </View>

                    <MainContentFrame style={styles.frame}>
                        <SubclassManagerCard
                            subclasses={visibleSubclasses}
                            allSubclassCount={allSubclasses.length}
                            selectedClassId={selectedClassId}
                            onSelectClassId={setSelectedClassId}
                            onCreate={openCreateForm}
                            onEdit={openEditForm}
                            onDelete={setDeleteCandidate}
                        />
                    </MainContentFrame>
                </ScrollView>

                <CustomSubclassFormSheet
                    visible={formVisible}
                    mode={formMode}
                    draft={draft}
                    pending={saving}
                    errorMessage={formErrorMessage}
                    lockedClassSelection={Boolean(editingSubclass && editingSubclass.characterUsageCount > 0)}
                    onChangeDraft={(nextDraft) => {
                        setDraft(nextDraft);
                        if (formErrorMessage) setFormErrorMessage(null);
                    }}
                    onDismissError={() => setFormErrorMessage(null)}
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
    scrollContent: {
        paddingBottom: fantasyTokens.spacing.xxl,
    },
    header: {
        borderBottomWidth: 1,
        borderBottomColor: fantasyTokens.rail.border,
        paddingHorizontal: fantasyTokens.spacing.xl,
        paddingTop: fantasyTokens.spacing.sm,
        paddingBottom: fantasyTokens.spacing.md,
        marginBottom: fantasyTokens.spacing.md,
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
    subtitle: {
        color: fantasyTokens.colors.gold,
        ...fantasyTokens.typography.bodySmall,
        marginTop: fantasyTokens.spacing.xs,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    frame: {
        paddingHorizontal: fantasyTokens.spacing.md,
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
