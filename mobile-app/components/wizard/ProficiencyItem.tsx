import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

type Props = {
    name: string;
    abilityAbbr: string;
    selected: boolean;
    onToggle: () => void;
};

export default function ProficiencyItem({ name, abilityAbbr, selected, onToggle }: Props) {
    return (
        <Pressable onPress={onToggle} style={[styles.item, selected && styles.itemSelected]}>
            <View style={[styles.check, selected && styles.checkSelected]}>
                {selected && <View style={styles.checkInner} />}
            </View>
            <Text style={[styles.name, selected && styles.nameSelected]}>{name}</Text>
            <Text style={styles.attr}>{abilityAbbr}</Text>
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
        fontFamily: 'serif',
        fontSize: 10,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: 'rgba(245,230,200,0.55)',
    },
    nameSelected: {
        color: fantasyTokens.colors.gold,
    },
    attr: {
        fontFamily: 'serif',
        fontSize: 9,
        letterSpacing: 1,
        color: 'rgba(201,146,42,0.3)',
    },
});
