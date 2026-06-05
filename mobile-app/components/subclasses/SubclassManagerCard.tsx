import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { CLASS_OPTIONS } from '@/lib/characterCreation/options';
import { fantasyTokens } from '@/theme/fantasyTheme';
import SubclassClassFilterChips, { ALL_CLASSES_FILTER } from './SubclassClassFilterChips';
import SubclassListRow from './SubclassListRow';
import type { CustomSubclassManagerRow } from './subclassManager.types';

type SubclassManagerCardProps = {
    subclasses: CustomSubclassManagerRow[];
    allSubclassCount: number;
    selectedClassId: string;
    onSelectClassId: (classId: string) => void;
    onCreate: () => void;
    onEdit: (subclass: CustomSubclassManagerRow) => void;
    onDelete: (subclass: CustomSubclassManagerRow) => void;
};

/**
 * Parchment manager panel containing filters and the reusable subclass list.
 */
export default function SubclassManagerCard({
    subclasses,
    allSubclassCount,
    selectedClassId,
    onSelectClassId,
    onCreate,
    onEdit,
    onDelete,
}: SubclassManagerCardProps) {
    const selectedClass = CLASS_OPTIONS.find((option) => option.value === selectedClassId);
    const emptyTitle = selectedClassId === ALL_CLASSES_FILTER
        ? 'No custom subclasses yet.'
        : `No ${selectedClass?.label ?? 'class'} subclasses yet.`;
    const emptyBody = allSubclassCount === 0
        ? 'Tap Add to create your first one.'
        : 'Try another class or add one.';

    return (
        <View style={styles.card} testID="subclass-manager-card">
            <View style={styles.cardHeader}>
                <View style={styles.cardTitleGroup}>
                    <Text style={styles.cardTitle}>Your Subclasses</Text>
                </View>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Add custom subclass"
                    onPress={onCreate}
                    style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
                    testID="add-custom-subclass"
                >
                    <Text style={styles.addButtonText}>Add</Text>
                </Pressable>
            </View>

            <SubclassClassFilterChips
                selectedClassId={selectedClassId}
                onSelectClassId={onSelectClassId}
            />

            <View style={styles.list}>
                {subclasses.length > 0 ? (
                    subclasses.map((subclass) => (
                        <SubclassListRow
                            key={subclass.id}
                            subclass={subclass}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))
                ) : (
                    <View style={styles.emptyState} testID="custom-subclass-empty-state">
                        <Text style={styles.emptyTitle}>{emptyTitle}</Text>
                        <Text style={styles.emptyBody}>{emptyBody}</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: fantasyTokens.colors.cardBg,
        borderRadius: fantasyTokens.radii.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.gold,
        padding: fantasyTokens.spacing.md,
        gap: fantasyTokens.spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.md,
    },
    cardTitleGroup: {
        flex: 1,
        minWidth: 0,
    },
    cardTitle: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.inkDark,
        fontWeight: '700',
    },
    addButton: {
        minWidth: 72,
        minHeight: 42,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.colors.crimson,
        paddingHorizontal: fantasyTokens.spacing.md,
    },
    addButtonPressed: {
        opacity: 0.9,
    },
    addButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.parchment,
    },
    list: {
        borderTopWidth: 1,
        borderTopColor: fantasyTokens.colors.accordionBorder,
    },
    emptyState: {
        minHeight: 180,
        alignItems: 'center',
        justifyContent: 'center',
        gap: fantasyTokens.spacing.sm,
        paddingHorizontal: fantasyTokens.spacing.md,
    },
    emptyTitle: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.inkDark,
        textAlign: 'center',
        fontWeight: '700',
    },
    emptyBody: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
        textAlign: 'center',
    },
});

