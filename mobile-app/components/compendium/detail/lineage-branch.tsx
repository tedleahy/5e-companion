import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { fantasyTokens } from '@/theme/fantasyTheme';

export type LineageBranchNode = {
    glyph: string;
    label: string;
    name: string;
    detail: string;
    emphasiseGlyph?: boolean;
};

/** Parent → child inheritance diagram used on subrace (and similar lineage) details. */
export default function CompendiumLineageBranch({
    accessibilityLabel,
    parent,
    child,
}: {
    accessibilityLabel: string;
    parent: LineageBranchNode;
    child: LineageBranchNode;
}) {
    const { width } = useWindowDimensions();
    const stacked = width < fantasyTokens.breakpoints.tablet;

    function renderNode(node: LineageBranchNode) {
        return (
            <View style={[styles.node, !stacked && styles.nodeGrow]}>
                <View style={styles.glyph}>
                    <Text style={[styles.glyphText, node.emphasiseGlyph && styles.bonusGlyph]}>
                        {node.glyph}
                    </Text>
                </View>
                <View style={styles.copy}>
                    <Text style={styles.label}>{node.label}</Text>
                    <Text style={styles.name} numberOfLines={1}>{node.name}</Text>
                    <Text style={styles.detail} numberOfLines={2}>{node.detail}</Text>
                </View>
            </View>
        );
    }

    return (
        <View
            accessible
            accessibilityLabel={accessibilityLabel}
            style={[styles.branch, stacked && styles.branchStacked]}
            testID="compendium-lineage-branch"
        >
            {renderNode(parent)}
            <View style={[styles.connector, stacked && styles.connectorStacked]}>
                <View style={stacked ? styles.lineStacked : styles.line} />
                <Text style={styles.plus}>plus</Text>
            </View>
            {renderNode(child)}
        </View>
    );
}

const styles = StyleSheet.create({
    branch: {
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: fantasyTokens.spacing.sm,
        padding: fantasyTokens.spacing.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.accordionBorder,
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.colors.parchmentLight,
    },
    branchStacked: {
        flexDirection: 'column',
    },
    node: {
        minWidth: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.sm,
    },
    nodeGrow: {
        flex: 1,
    },
    glyph: {
        width: fantasyTokens.spacing.xxl,
        height: fantasyTokens.spacing.xxl,
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.colors.parchmentDeep,
    },
    glyphText: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.claret,
    },
    bonusGlyph: {
        ...fantasyTokens.typography.pageTitle,
        fontSize: fantasyTokens.fontSizes.title,
        lineHeight: fantasyTokens.fontSizes.headline,
        color: fantasyTokens.colors.claret,
    },
    copy: {
        flex: 1,
        minWidth: 0,
        gap: fantasyTokens.spacing.xs,
    },
    label: {
        ...fantasyTokens.typography.eyebrow,
        color: fantasyTokens.colors.ember,
    },
    name: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.inkDark,
    },
    detail: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.inkSoft,
    },
    connector: {
        position: 'relative',
        minWidth: fantasyTokens.spacing.xxl + fantasyTokens.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    connectorStacked: {
        minWidth: 0,
        minHeight: fantasyTokens.spacing.xl + fantasyTokens.spacing.xs,
        alignSelf: 'stretch',
    },
    line: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: StyleSheet.hairlineWidth,
        backgroundColor: fantasyTokens.colors.gold,
    },
    lineStacked: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: fantasyTokens.spacing.lg,
        width: StyleSheet.hairlineWidth,
        backgroundColor: fantasyTokens.colors.gold,
    },
    plus: {
        zIndex: 1,
        paddingHorizontal: fantasyTokens.spacing.xs,
        ...fantasyTokens.typography.eyebrow,
        color: fantasyTokens.colors.inkSoft,
        backgroundColor: fantasyTokens.colors.parchmentLight,
    },
});
