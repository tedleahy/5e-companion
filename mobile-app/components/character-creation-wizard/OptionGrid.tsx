import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import InfoModal from '@/components/InfoModal';
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

/**
 * Returns the number of option columns for the current viewport.
 */
function getOptionGridColumnCount(width: number) {
    if (width >= fantasyTokens.breakpoints.laptop) {
        return 4;
    }

    if (width >= fantasyTokens.breakpoints.tablet) {
        return 3;
    }

    return 2;
}

/**
 * Renders selectable wizard options in a responsive grid.
 */
export default function OptionGrid({
    options,
    selected,
    onSelect,
    tone = 'night',
    getOptionTestId,
    getOptionAccessibilityLabel,
}: Props) {
    const { width } = useWindowDimensions();
    const columnCount = getOptionGridColumnCount(width);
    const incompleteFinalRowCount = options.length % columnCount;
    const isParchmentTone = tone === 'parchment';
    const columnWidthStyle = columnCount === 4
        ? styles.cardQuarter
        : columnCount === 3
            ? styles.cardThird
            : styles.cardHalf;

    const [descriptionToShow, setDescriptionToShow] = useState<{ label: string; text: string } | null>(null);

    return (
        <>
            <FlatList
                key={columnCount}
                data={options}
                keyExtractor={(item) => item.value}
                numColumns={columnCount}
                scrollEnabled={false}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.grid}
                renderItem={({ item, index }) => {
                    const isSelected = item.value === selected;
                    const isInIncompleteFinalRow = incompleteFinalRowCount !== 0 &&
                        index >= options.length - incompleteFinalRowCount;
                    return (
                        <Pressable
                            onPress={() => {
                                if (item.value === selected) return;
                                onSelect(item.value);
                            }}
                            style={[
                                styles.card,
                                isParchmentTone ? styles.cardParchment : styles.cardNight,
                                isSelected && styles.cardSelected,
                                isSelected && isParchmentTone && styles.cardSelectedParchment,
                                isInIncompleteFinalRow && columnWidthStyle,
                            ]}
                            testID={getOptionTestId?.(item) ?? `option-${item.value}`}
                            accessibilityRole="button"
                            accessibilityLabel={getOptionAccessibilityLabel?.(item)}
                        >
                            {item.description ? (
                                <Pressable
                                    onPress={() => setDescriptionToShow({ label: item.label, text: item.description! })}
                                    style={styles.infoBtn}
                                    hitSlop={8}
                                    accessibilityLabel={`Info about ${item.label}`}
                                    accessibilityRole="button"
                                    testID={`option-info-${item.value}`}
                                >
                                    <Ionicons
                                        name="information-circle"
                                        size={20}
                                        color={fantasyTokens.colors.goldLight}
                                    />
                                </Pressable>
                            ) : null}
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

            <InfoModal
                visible={descriptionToShow !== null}
                title={descriptionToShow?.label ?? ''}
                body={descriptionToShow?.text ?? ''}
                onClose={() => setDescriptionToShow(null)}
            />
        </>
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
    cardHalf: {
        maxWidth: '50%',
    },
    cardThird: {
        maxWidth: '33.3333%',
    },
    cardQuarter: {
        maxWidth: '25%',
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
    infoBtn: {
        position: 'absolute',
        top: 6,
        right: 6,
        zIndex: 1,
    },
});
