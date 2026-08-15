import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import CompendiumBodyText from '@/components/compendium/detail/body-text';
import { fantasyTokens } from '@/theme/fantasyTheme';

type Reference = {
    value: string;
    name: string;
};

export default function CompendiumReferenceList({
    items,
    emptyLabel = 'None listed',
    onSelect,
}: {
    items: Reference[];
    emptyLabel?: string;
    onSelect?: (value: string) => void;
}) {
    if (items.length === 0) return <CompendiumBodyText>{emptyLabel}</CompendiumBodyText>;

    return (
        <View style={styles.list}>
            {items.map((item) => {
                const content = (
                    <>
                        <Text style={styles.name} selectable>{item.name}</Text>
                        {onSelect ? (
                            <Ionicons
                                name="chevron-forward"
                                size={fantasyTokens.fontSizes.body}
                                color={fantasyTokens.colors.claret}
                            />
                        ) : null}
                    </>
                );

                return onSelect ? (
                    <Pressable
                        key={item.value}
                        accessibilityRole="button"
                        onPress={() => onSelect(item.value)}
                        style={({ pressed }) => [styles.reference, pressed && styles.pressed]}
                    >
                        {content}
                    </Pressable>
                ) : (
                    <View key={item.value} style={styles.reference}>{content}</View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    list: {
        gap: fantasyTokens.spacing.sm,
    },
    reference: {
        minHeight: fantasyTokens.spacing.xxl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.sm,
        paddingHorizontal: fantasyTokens.spacing.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.accordionBorder,
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.colors.parchmentLight,
    },
    name: {
        flex: 1,
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkDark,
    },
    pressed: {
        backgroundColor: fantasyTokens.colors.claretPressed,
    },
});
