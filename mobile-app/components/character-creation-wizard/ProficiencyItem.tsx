import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

type Props = {
    name: string;
    abilityAbbr: string;
    selected: boolean;
    onToggle: () => void;
    /** If true, the item is locked (auto-selected, not toggleable). */
    locked?: boolean;
    /** If true, the item is greyed out and not toggleable. */
    disabled?: boolean;
    /** Whether this skill has expertise (double proficiency). */
    expertise?: boolean;
    /** Called on long-press to toggle expertise. */
    onToggleExpertise?: () => void;
};

export default function ProficiencyItem({
    name, abilityAbbr, selected, onToggle, locked, disabled, expertise, onToggleExpertise,
}: Props) {
    const isInteractive = !locked && !disabled;

    return (
        <Pressable
            onPress={isInteractive ? onToggle : undefined}
            onLongPress={isInteractive && selected && onToggleExpertise ? onToggleExpertise : undefined}
            style={[
                styles.item,
                selected && styles.itemSelected,
                expertise && styles.itemExpertise,
                locked && styles.itemLocked,
                disabled && styles.itemDisabled,
            ]}
        >
            <View style={[
                styles.check,
                selected && styles.checkSelected,
                expertise && styles.checkExpertise,
                locked && styles.checkLocked,
            ]}>
                {selected && <View style={styles.checkInner} />}
                {expertise && <View style={styles.checkExpertiseRing} />}
            </View>
            <Text style={[styles.name, selected && styles.nameSelected, locked && styles.nameLocked]}>
                {name}
            </Text>
            <Text style={styles.attr}>{abilityAbbr}</Text>
            {locked && <Text style={styles.lockedTag}>BG</Text>}
            {expertise && <Text style={styles.expertiseTag}>EXP</Text>}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: 'rgba(240,224,188,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.2)',
        borderRadius: 10,
        paddingVertical: 11,
        paddingHorizontal: 14,
    },
    itemSelected: {
        borderColor: fantasyTokens.colors.gold,
        backgroundColor: 'rgba(201,146,42,0.08)',
    },
    check: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 1.5,
        borderColor: 'rgba(201,146,42,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkSelected: {
        backgroundColor: fantasyTokens.colors.gold,
        borderColor: fantasyTokens.colors.gold,
    },
    checkInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: fantasyTokens.colors.night,
    },
    name: {
        flex: 1,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: 'rgba(245,230,200,0.55)',
    },
    nameSelected: {
        color: fantasyTokens.colors.gold,
    },
    attr: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
        letterSpacing: 1,
        color: 'rgba(201,146,42,0.3)',
    },
    itemLocked: {
        borderColor: 'rgba(42,122,42,0.25)',
        backgroundColor: 'rgba(42,122,42,0.06)',
    },
    itemDisabled: {
        opacity: 0.35,
    },
    checkLocked: {
        backgroundColor: '#2a7a2a',
        borderColor: '#2a7a2a',
    },
    nameLocked: {
        color: '#2a7a2a',
    },
    lockedTag: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
        letterSpacing: 1,
        color: 'rgba(42,122,42,0.6)',
        textTransform: 'uppercase',
    },
    itemExpertise: {
        borderColor: '#6a4fd4',
        backgroundColor: 'rgba(106,79,212,0.08)',
    },
    checkExpertise: {
        backgroundColor: '#6a4fd4',
        borderColor: '#6a4fd4',
    },
    checkExpertiseRing: {
        position: 'absolute',
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1.5,
        borderColor: '#6a4fd4',
    },
    expertiseTag: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
        letterSpacing: 1,
        color: 'rgba(106,79,212,0.7)',
        textTransform: 'uppercase',
    },
});
