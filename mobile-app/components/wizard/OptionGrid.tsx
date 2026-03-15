import { FlatList, Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { OptionItem } from '@/lib/characterCreation/options';

type Props = {
    options: OptionItem[];
    selected: string;
    onSelect: (value: string) => void;
};

export default function OptionGrid({ options, selected, onSelect }: Props) {
    return (
        <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => {
                const isSelected = item.value === selected;
                return (
                    <Pressable
                        onPress={() => onSelect(item.value)}
                        style={[styles.card, isSelected && styles.cardSelected]}
                    >
                        <Text style={styles.icon}>{item.icon}</Text>
                        <Text style={[styles.name, isSelected && styles.nameSelected]}>
                            {item.label}
                        </Text>
                        {item.hint ? (
                            <Text style={styles.hint}>{item.hint}</Text>
                        ) : null}
                    </Pressable>
                );
            }}
        />
    );
}

const styles = StyleSheet.create({
    grid: {
        gap: 8,
    },
    row: {
        gap: 8,
    },
    card: {
        flex: 1,
        backgroundColor: 'rgba(240,224,188,0.06)',
        borderWidth: 1.5,
        borderColor: 'rgba(201,146,42,0.2)',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    cardSelected: {
        borderColor: fantasyTokens.colors.gold,
        backgroundColor: 'rgba(201,146,42,0.1)',
    },
    icon: {
        fontSize: 24,
        marginBottom: 6,
    },
    name: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 10,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: 'rgba(245,230,200,0.7)',
    },
    nameSelected: {
        color: fantasyTokens.colors.gold,
    },
    hint: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 11,
        fontStyle: 'italic',
        color: 'rgba(245,230,200,0.35)',
        marginTop: 3,
    },
});
