import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { fantasyTokens } from '@/theme/fantasyTheme';

export type DetailFact = {
    label: string;
    value: string;
};

type DetailHeroProps = {
    mark: string;
    eyebrow: string;
    title: string;
    summary?: string | null;
    facts?: DetailFact[];
};

export function CompendiumDetailHero({ mark, eyebrow, title, summary, facts = [] }: DetailHeroProps) {
    return (
        <View style={styles.hero}>
            <View style={styles.heroMark}><Text style={styles.heroMarkText}>{mark}</Text></View>
            <View style={styles.heroCopy}>
                <Text style={styles.eyebrow}>{eyebrow}</Text>
                <Text style={styles.heroTitle} selectable>{title}</Text>
                {summary ? <Text style={styles.body} selectable>{summary}</Text> : null}
            </View>
            {facts.length > 0 ? <CompendiumFactGrid facts={facts} /> : null}
        </View>
    );
}

export function CompendiumFactGrid({ facts }: { facts: DetailFact[] }) {
    return (
        <View style={styles.factGrid}>
            {facts.map((fact) => (
                <View key={fact.label} style={styles.fact}>
                    <Text style={styles.factLabel}>{fact.label}</Text>
                    <Text style={styles.factValue} selectable>{fact.value}</Text>
                </View>
            ))}
        </View>
    );
}

export function CompendiumDetailSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
        </View>
    );
}

export function CompendiumBodyText({ children }: { children: ReactNode }) {
    return <Text style={styles.body} selectable>{children}</Text>;
}

export function CompendiumPills({ values, emptyLabel }: { values: string[]; emptyLabel?: string }) {
    if (values.length === 0) {
        return emptyLabel ? <CompendiumBodyText>{emptyLabel}</CompendiumBodyText> : null;
    }

    return (
        <View style={styles.pills}>
            {values.map((value) => (
                <View key={value} style={styles.pill}>
                    <Text style={styles.pillText} selectable>{value}</Text>
                </View>
            ))}
        </View>
    );
}

type Reference = {
    value: string;
    name: string;
};

export function CompendiumReferenceList({
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
        <View style={styles.referenceList}>
            {items.map((item) => {
                const content = (
                    <>
                        <Text style={styles.referenceName} selectable>{item.name}</Text>
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

type Trait = {
    value: string;
    name: string;
    description: string[];
};

export function CompendiumTraitList({ traits, emptyLabel = 'No traits are listed.' }: {
    traits: Trait[];
    emptyLabel?: string;
}) {
    if (traits.length === 0) return <CompendiumBodyText>{emptyLabel}</CompendiumBodyText>;

    return (
        <View style={styles.traitList}>
            {traits.map((trait) => (
                <View key={trait.value} style={styles.traitCard}>
                    <Text style={styles.traitTitle} selectable>{trait.name}</Text>
                    {trait.description.map((paragraph, index) => (
                        <Text key={`${trait.value}-${index}`} style={styles.body} selectable>
                            {paragraph}
                        </Text>
                    ))}
                </View>
            ))}
        </View>
    );
}

export function CompendiumDisclosure({
    title,
    summary,
    expanded,
    onToggle,
    children,
    testID,
}: {
    title: string;
    summary: string;
    expanded: boolean;
    onToggle: () => void;
    children: ReactNode;
    testID?: string;
}) {
    return (
        <View style={styles.disclosure}>
            <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                onPress={onToggle}
                style={({ pressed }) => [styles.disclosureHeader, pressed && styles.pressed]}
                testID={testID}
            >
                <View style={styles.heroCopy}>
                    <Text style={styles.traitTitle}>{title}</Text>
                    <Text style={styles.muted}>{summary}</Text>
                </View>
                <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={fantasyTokens.fontSizes.title}
                    color={fantasyTokens.colors.claret}
                />
            </Pressable>
            {expanded ? <View style={styles.disclosureBody}>{children}</View> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    hero: {
        gap: fantasyTokens.spacing.md,
        paddingBottom: fantasyTokens.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: fantasyTokens.colors.accordionBorder,
    },
    heroMark: {
        width: fantasyTokens.spacing.xxl + fantasyTokens.spacing.xl,
        height: fantasyTokens.spacing.xxl + fantasyTokens.spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: fantasyTokens.colors.goldDark,
        borderRadius: fantasyTokens.radii.md,
        backgroundColor: fantasyTokens.colors.parchmentDeep,
    },
    heroMarkText: {
        ...fantasyTokens.typography.pageTitle,
        color: fantasyTokens.colors.claret,
    },
    heroCopy: {
        flex: 1,
        gap: fantasyTokens.spacing.xs,
    },
    eyebrow: {
        ...fantasyTokens.typography.eyebrow,
        color: fantasyTokens.colors.ember,
    },
    heroTitle: {
        ...fantasyTokens.typography.pageTitle,
        color: fantasyTokens.colors.inkDark,
    },
    body: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
    muted: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.inkSoft,
    },
    factGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: fantasyTokens.spacing.sm,
    },
    fact: {
        flexGrow: 1,
        minWidth: fantasyTokens.spacing.xxl * 2,
        gap: fantasyTokens.spacing.xs,
        padding: fantasyTokens.spacing.sm,
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.colors.parchmentDeep,
    },
    factLabel: {
        ...fantasyTokens.typography.eyebrow,
        color: fantasyTokens.colors.ember,
    },
    factValue: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.inkDark,
    },
    section: {
        gap: fantasyTokens.spacing.sm,
        paddingTop: fantasyTokens.spacing.md,
        borderTopWidth: 1,
        borderTopColor: fantasyTokens.colors.accordionBorder,
    },
    sectionTitle: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.claret,
    },
    pills: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: fantasyTokens.spacing.sm,
    },
    pill: {
        paddingHorizontal: fantasyTokens.spacing.sm,
        paddingVertical: fantasyTokens.spacing.xs,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.goldDark,
        borderRadius: fantasyTokens.radii.lg,
        backgroundColor: fantasyTokens.colors.parchmentLight,
    },
    pillText: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.inkDark,
    },
    referenceList: {
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
    referenceName: {
        flex: 1,
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkDark,
    },
    pressed: {
        backgroundColor: fantasyTokens.colors.claretPressed,
    },
    traitList: {
        gap: fantasyTokens.spacing.sm,
    },
    traitCard: {
        gap: fantasyTokens.spacing.xs,
        padding: fantasyTokens.spacing.md,
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.colors.parchmentLight,
    },
    traitTitle: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.inkDark,
    },
    disclosure: {
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: fantasyTokens.colors.accordionBorder,
        borderRadius: fantasyTokens.radii.sm,
    },
    disclosureHeader: {
        minHeight: fantasyTokens.spacing.xxl + fantasyTokens.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.md,
        padding: fantasyTokens.spacing.md,
        backgroundColor: fantasyTokens.colors.parchmentDeep,
    },
    disclosureBody: {
        gap: fantasyTokens.spacing.md,
        padding: fantasyTokens.spacing.md,
    },
});
