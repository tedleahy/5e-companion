import { FlatList, Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { OptionItem } from '@/lib/characterCreation/options';

type Props = {
    options: OptionItem[];
    selected: string;
    onSelect: (value: string) => void;
    tone?: 'night' | 'parchment';
    getOptionTestId?: (option: OptionItem) => string | undefined;
    getOptionAccessibilityLabel?: (option: OptionItem) => string | undefined;
};

export default function OptionGrid({
    options,
    selected,
    onSelect,
    tone = 'night',
    getOptionTestId,
    getOptionAccessibilityLabel,
}: Props) {
    const isParchmentTone = tone === 'parchment';

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
                        style={[
                            styles.card,
                            isParchmentTone ? styles.cardParchment : styles.cardNight,
                            isSelected && styles.cardSelected,
                            isSelected && isParchmentTone && styles.cardSelectedParchment,
                        ]}
                        testID={getOptionTestId?.(item)}
                        accessibilityRole="button"
                        accessibilityLabel={getOptionAccessibilityLabel?.(item)}
                    >
                        <Text style={styles.icon}>{item.icon}</Text>
                        <Text
                            style={[
                                styles.name,
                                isParchmentTone ? styles.nameParchment : styles.nameNight,
                                isSelected && styles.nameSelected,
                                isSelected && isParchmentTone && styles.nameSelectedParchment,
                            ]}
                        >
                            {item.label}
                        </Text>
                        {item.hint ? (
                            <Text
                                style={[
                                    styles.hint,
                                    isParchmentTone ? styles.hintParchment : styles.hintNight,
                                ]}
                            >
                                {item.hint}
                            </Text>
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
        borderWidth: 1.5,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    cardNight: {
        backgroundColor: 'rgba(240,224,188,0.06)',
        borderColor: 'rgba(201,146,42,0.2)',
    },
    cardParchment: {
        backgroundColor: fantasyTokens.colors.parchmentLight,
        borderColor: fantasyTokens.colors.sheetDivider,
    },
    cardSelected: {
        borderColor: fantasyTokens.colors.gold,
        backgroundColor: 'rgba(201,146,42,0.1)',
    },
    cardSelectedParchment: {
        borderColor: fantasyTokens.colors.claret,
        backgroundColor: fantasyTokens.colors.parchmentDeep,
    },
    icon: {
        fontSize: fantasyTokens.fontSizes.headline,
        marginBottom: 6,
    },
    name: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    nameNight: {
        color: 'rgba(245,230,200,0.7)',
    },
    nameParchment: {
        color: fantasyTokens.colors.inkDark,
    },
    nameSelected: {
        color: fantasyTokens.colors.gold,
    },
    nameSelectedParchment: {
        color: fantasyTokens.colors.claret,
    },
    hint: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.caption,
        fontStyle: 'italic',
        marginTop: 3,
        textAlign: 'center',
    },
    hintNight: {
        color: 'rgba(245,230,200,0.35)',
    },
    hintParchment: {
        color: fantasyTokens.colors.inkLight,
    },
});
