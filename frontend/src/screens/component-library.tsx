import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { hitPoints } from '@/characters/display';
import { PrimaryButton, SecondaryButton } from '@/components/buttons';
import { CharacterToken } from '@/components/character-token';
import { HitPoints } from '@/components/hit-points';
import { LevelBlock } from '@/components/level-block';
import { Paper } from '@/components/paper';
import { PrintPressable } from '@/components/print-pressable';
import { SearchIcon } from '@/components/search-icon';
import { Spinner } from '@/components/spinner';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { colors, offsetShadow, typography } from '@/theme';

/** One component on the page: where it lives, what it's for, and its variants rendered live. */
type Entry = {
    name: string;
    path: string;
    description?: string;
    /** A function so that it can use `styles`, which is defined below the list. */
    demo: () => ReactNode;
};

const ENTRIES: Entry[] = [
    {
        name: 'Paper',
        path: 'src/components/paper.tsx',
        description:
            'The page background, with a dot grid and a coarser line grid. This page sits on one too.',
        demo: () => (
            <View style={styles.paperFrame}>
                <Paper style={styles.paperDemo}>
                    <Text style={[typography.subtitle, styles.body]}>
                        Children render above the grid.
                    </Text>
                </Paper>
            </View>
        ),
    },
    {
        name: 'SearchIcon',
        path: 'src/components/search-icon.tsx',
        description: 'The magnifying glass in the search field, in any ink.',
        demo: () => (
            <Row>
                <Variant label="Dim">
                    <SearchIcon color={colors.dim} />
                </Variant>
                <Variant label="Structural">
                    <SearchIcon color={colors.structural} />
                </Variant>
            </Row>
        ),
    },
    {
        name: 'CharacterToken',
        path: 'src/components/character-token.tsx',
        description: "A round token with the first letter of a character's name.",
        demo: () => (
            <Row>
                <Variant label="56">
                    <CharacterToken name="Thorn Grimsby" />
                </Variant>
                <Variant label="64">
                    <CharacterToken name="Ásta Varr" size={64} />
                </Variant>
                <Variant label="Draft">
                    <CharacterToken name="Nyra Ashfall" draft />
                </Variant>
                <Variant label="Unnamed draft">
                    <CharacterToken name={null} draft />
                </Variant>
                <Variant label="Draft, 64">
                    <CharacterToken name="Kethra Ironsong" draft size={64} />
                </Variant>
            </Row>
        ),
    },
    {
        name: 'HitPoints',
        path: 'src/components/hit-points.tsx',
        description: 'The ten-segment meter and the line under it, from hitPoints().',
        demo: () => (
            <View style={styles.stack}>
                <Variant label="Healthy" wide>
                    <HitPoints display={hitPoints({ current: 68, maximum: 72, temporary: 0 })} />
                </Variant>
                <Variant label="Hurt, with temporary" wide>
                    <HitPoints display={hitPoints({ current: 30, maximum: 64, temporary: 5 })} />
                </Variant>
                <Variant label="At zero" wide>
                    <HitPoints display={hitPoints({ current: 0, maximum: 40, temporary: 0 })} />
                </Variant>
                <Variant label="Not set" wide>
                    <HitPoints
                        display={hitPoints({ current: null, maximum: null, temporary: 0 })}
                    />
                </Variant>
            </View>
        ),
    },
    {
        name: 'LevelBlock',
        path: 'src/components/level-block.tsx',
        description: 'Total level under a small label, or a dim dash with no classes.',
        demo: () => (
            <Row>
                <Variant label="Set">
                    <LevelBlock level={8} />
                </Variant>
                <Variant label="No classes">
                    <LevelBlock level={0} />
                </Variant>
                <Variant label="Large">
                    <LevelBlock level={12} large />
                </Variant>
            </Row>
        ),
    },
    {
        name: 'Spinner',
        path: 'src/components/spinner.tsx',
        description: 'Turns once every 0.9 seconds, and holds still when reduced motion is on.',
        demo: () => (
            <Row>
                <Variant label="16">
                    <Spinner size={16} />
                </Variant>
                <Variant label="36">
                    <Spinner size={36} />
                </Variant>
                <Variant label="44">
                    <Spinner size={44} />
                </Variant>
            </Row>
        ),
    },
    {
        name: 'PrintPressable',
        path: 'src/components/print-pressable.tsx',
        description:
            'A printed surface that sinks onto its shadow while pressed. Press one to see it move.',
        demo: () => (
            <Row>
                {([3, 4, 5] as const).map((depth) => (
                    <Variant key={depth} label={`Depth ${depth}`}>
                        <PrintPressable
                            depth={depth}
                            role="button"
                            accessibilityLabel={`Depth ${depth}`}
                            style={styles.pressableDemo}
                        >
                            <Text style={[typography.buttonSecondary, styles.structural]}>
                                Press me
                            </Text>
                        </PrintPressable>
                    </Variant>
                ))}
                <Variant label="Structural shadow">
                    <PrintPressable
                        depth={5}
                        shadowToken="structural"
                        role="button"
                        accessibilityLabel="Structural shadow"
                        style={styles.pressableDemo}
                    >
                        <Text style={[typography.buttonSecondary, styles.structural]}>
                            Press me
                        </Text>
                    </PrintPressable>
                </Variant>
            </Row>
        ),
    },
    {
        name: 'PrimaryButton',
        path: 'src/components/buttons.tsx',
        description: 'The main action on a screen: accent fill with a structural shadow.',
        demo: () => (
            <View style={styles.stack}>
                <Variant label="Large" wide>
                    <PrimaryButton label="Create character" />
                </Variant>
                <Variant label="Medium">
                    <PrimaryButton label="Create character" size="medium" />
                </Variant>
            </View>
        ),
    },
    {
        name: 'SecondaryButton',
        path: 'src/components/buttons.tsx',
        description: 'Outlined, for every other action.',
        demo: () => (
            <View style={styles.stack}>
                <Row>
                    <Variant label="Large">
                        <SecondaryButton label="Sort: level" size="large" />
                    </Variant>
                    <Variant label="Medium, as a link">
                        <SecondaryButton
                            label="Open sheet"
                            accessibilityLabel="Open Thorn Grimsby's sheet"
                            role="link"
                            size="medium"
                        />
                    </Variant>
                    <Variant label="Small">
                        <SecondaryButton label="Resume" size="small" />
                    </Variant>
                </Row>
                <View style={styles.plate}>
                    <Text style={[typography.smallLabel, styles.onPlate]}>On the plate</Text>
                    <SecondaryButton
                        label="Sort: name"
                        size="large"
                        onPlate
                        style={styles.plateButton}
                    />
                </View>
            </View>
        ),
    },
];

/**
 * Every shared component, rendered live with its variants, so they can be checked in the app
 * before a screen uses them.
 */
export function ComponentLibrary() {
    const isPhone = useBreakpoint() === 'phone';

    return (
        <Paper>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    contentContainerStyle={[styles.content, isPhone && styles.contentPhone]}
                >
                    <View style={styles.header}>
                        <Text
                            role="heading"
                            style={[
                                isPhone ? typography.titlePhone : typography.titleDesktop,
                                styles.onPlate,
                            ]}
                        >
                            Component library
                        </Text>
                    </View>
                    {ENTRIES.map((entry) => (
                        <Section key={entry.name} entry={entry} isPhone={isPhone} />
                    ))}
                </ScrollView>
            </SafeAreaView>
        </Paper>
    );
}

/**
 * A card for one component: its name, path, description and demo.
 *
 * @param props.entry - The component name, source path, description, and examples to show.
 * @param props.isPhone - Whether to use the smaller phone heading and body text.
 */
function Section({ entry, isPhone }: { entry: Entry; isPhone: boolean }) {
    return (
        <View style={styles.section}>
            <Text
                role="heading"
                style={[isPhone ? typography.namePhone : typography.nameDesktop, styles.name]}
            >
                {entry.name}
            </Text>
            <Text style={[typography.subtitle, styles.path]}>{entry.path}</Text>
            {entry.description && (
                <Text style={[typography.subtitle, styles.body]}>{entry.description}</Text>
            )}
            <View style={styles.demo}>{entry.demo()}</View>
        </View>
    );
}

/** Lays variants side by side, wrapping when they run out of room. */
function Row({ children }: { children: ReactNode }) {
    return <View style={styles.row}>{children}</View>;
}

/**
 * One variant of a component with a small label above it. `wide` gives it a card's width.
 *
 * @param props.label - The text identifying this component variant.
 * @param props.wide - Whether the example should stretch across the available row width.
 * @param props.children - The live component example to show below its label.
 */
function Variant({
    label,
    wide = false,
    children,
}: {
    label: string;
    wide?: boolean;
    children: ReactNode;
}) {
    return (
        <View style={[styles.variant, wide && styles.variantWide]}>
            <Text style={[typography.smallLabel, styles.label]}>{label}</Text>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    content: {
        width: '100%',
        maxWidth: 1020,
        alignSelf: 'center',
        gap: 24,
        padding: 24,
        paddingBottom: 48,
    },
    contentPhone: {
        gap: 18,
        padding: 12,
    },
    header: {
        padding: 20,
        backgroundColor: colors.structural,
        boxShadow: offsetShadow(5, 'accent'),
    },
    onPlate: {
        color: colors.onStructural,
    },
    section: {
        padding: 18,
        backgroundColor: colors.card,
        borderWidth: 2,
        borderColor: colors.structural,
        boxShadow: offsetShadow(5, 'accent'),
    },
    name: {
        color: colors.text,
    },
    path: {
        marginTop: 2,
        color: colors.dim,
    },
    body: {
        marginTop: 6,
        color: colors.text,
    },
    demo: {
        marginTop: 18,
    },
    stack: {
        gap: 18,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        gap: 24,
    },
    variant: {
        alignItems: 'flex-start',
        gap: 10,
    },
    variantWide: {
        alignItems: 'stretch',
        width: '100%',
        maxWidth: 342,
    },
    label: {
        color: colors.dim,
    },
    paperFrame: {
        height: 120,
        borderWidth: 2,
        borderColor: colors.rule,
    },
    paperDemo: {
        padding: 14,
    },
    pressableDemo: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: colors.card,
        borderWidth: 2,
        borderColor: colors.structural,
    },
    structural: {
        color: colors.structural,
    },
    plate: {
        alignItems: 'flex-start',
        gap: 10,
        padding: 18,
        backgroundColor: colors.structural,
    },
    plateButton: {
        marginBottom: 4,
    },
});
