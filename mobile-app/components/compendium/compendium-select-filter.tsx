import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Menu } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

export type CompendiumSelectOption = {
    value: string;
    label: string;
};

type CompendiumSelectFilterProps = {
    label: string;
    value: string;
    options: CompendiumSelectOption[];
    onChange: (value: string) => void;
    testID?: string;
};

/** Compact Paper menu used for a single-select Compendium filter. */
export default function CompendiumSelectFilter({
    label,
    value,
    options,
    onChange,
    testID,
}: CompendiumSelectFilterProps) {
    const [visible, setVisible] = useState(false);
    const selected = options.find((option) => option.value === value) ?? options[0];

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <Menu
                visible={visible}
                onDismiss={() => setVisible(false)}
                contentStyle={styles.menu}
                anchor={(
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`${label}: ${selected?.label ?? ''}`}
                        accessibilityState={{ expanded: visible }}
                        onPress={() => setVisible(true)}
                        style={({ pressed }) => [styles.control, pressed && styles.pressed]}
                        testID={testID}
                    >
                        <Text style={styles.value}>{selected?.label ?? ''}</Text>
                        <Ionicons
                            name="chevron-down"
                            size={fantasyTokens.fontSizes.body}
                            color={fantasyTokens.colors.claret}
                        />
                    </Pressable>
                )}
            >
                {options.map((option) => (
                    <Menu.Item
                        key={option.value}
                        title={option.label}
                        onPress={() => {
                            onChange(option.value);
                            setVisible(false);
                        }}
                        titleStyle={styles.menuLabel}
                        testID={`${testID ?? 'compendium-select'}-${option.value}`}
                    />
                ))}
            </Menu>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: fantasyTokens.spacing.xs,
        paddingTop: fantasyTokens.spacing.sm,
    },
    label: {
        ...fantasyTokens.typography.eyebrow,
        color: fantasyTokens.colors.ember,
    },
    control: {
        minHeight: fantasyTokens.spacing.xxl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.sm,
        paddingHorizontal: fantasyTokens.spacing.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.gold,
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.colors.parchment,
    },
    pressed: {
        backgroundColor: fantasyTokens.colors.claretPressed,
    },
    value: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkDark,
    },
    menu: {
        backgroundColor: fantasyTokens.colors.parchment,
    },
    menuLabel: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkDark,
    },
});
