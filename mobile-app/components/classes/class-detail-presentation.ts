/**
 * Shared presentation helpers for class proficiency/equipment choice rules.
 * Groups fixed grants separately from pick-N pools so detail and editor review
 * describe the same mechanics.
 */

/** One proficiency or equipment alternative with optional choice-group metadata. */
export type ChoiceRuleItem = {
    label: string;
    choiceGroup?: number | null;
    choiceCount?: number | null;
};

/** Fixed grant or one pick-N choice group. */
export type GroupedChoiceRule =
    | { kind: 'fixed'; label: string }
    | { kind: 'choice'; choiceGroup: number; choiceCount: number; labels: string[] };

/** Display line with a stable React key. */
export type GroupedChoiceLine = {
    key: string;
    text: string;
};

/**
 * Groups fixed rules and pick-N pools. Fixed entries keep input order; choice
 * groups are sorted by `choiceGroup` and use the first member's `choiceCount`.
 */
export function groupChoiceRules(items: readonly ChoiceRuleItem[]): GroupedChoiceRule[] {
    const fixed: GroupedChoiceRule[] = [];
    const groups = new Map<number, { choiceCount: number; labels: string[] }>();

    for (const item of items) {
        if (item.choiceGroup == null || item.choiceCount == null) {
            fixed.push({ kind: 'fixed', label: item.label });
            continue;
        }
        const existing = groups.get(item.choiceGroup);
        if (existing) {
            existing.labels.push(item.label);
        } else {
            groups.set(item.choiceGroup, {
                choiceCount: item.choiceCount,
                labels: [item.label],
            });
        }
    }

    const choices: GroupedChoiceRule[] = [...groups.entries()]
        .sort(([left], [right]) => left - right)
        .map(([choiceGroup, group]) => ({
            kind: 'choice' as const,
            choiceGroup,
            choiceCount: group.choiceCount,
            labels: group.labels,
        }));

    return [...fixed, ...choices];
}

/** Formats one grouped rule for display. */
export function formatGroupedChoiceRule(rule: GroupedChoiceRule): string {
    if (rule.kind === 'fixed') {
        return rule.label;
    }
    return `Choose ${rule.choiceCount} of ${rule.labels.join(', ')}`;
}

/** Formats every grouped rule as display strings. */
export function formatGroupedChoiceRules(items: readonly ChoiceRuleItem[]): string[] {
    return groupChoiceRules(items).map(formatGroupedChoiceRule);
}

/** Formats every grouped rule as keyed display lines. */
export function formatGroupedChoiceLines(
    items: readonly ChoiceRuleItem[],
    keyPrefix = 'rule',
): GroupedChoiceLine[] {
    return groupChoiceRules(items).map((rule, index) => {
        if (rule.kind === 'fixed') {
            return {
                key: `${keyPrefix}-fixed-${index}-${rule.label}`,
                text: formatGroupedChoiceRule(rule),
            };
        }
        return {
            key: `${keyPrefix}-choice-${rule.choiceGroup}`,
            text: formatGroupedChoiceRule(rule),
        };
    });
}

const GRANT_LABELS: Record<string, string> = {
    STARTING: 'Starting',
    MULTICLASS: 'Multiclass',
};

/**
 * Class-detail proficiency lines grouped by grant, then fixed vs pick-N.
 * Example: `Starting · Choose 2 of Athletics, Acrobatics`.
 */
export function formatGroupedProficiencyLines(
    items: ReadonlyArray<{
        name: string;
        grant: string;
        value?: string;
        choiceGroup?: number | null;
        choiceCount?: number | null;
    }>,
): GroupedChoiceLine[] {
    const grantOrder: string[] = [];
    const byGrant = new Map<string, ChoiceRuleItem[]>();

    for (const item of items) {
        if (!byGrant.has(item.grant)) {
            grantOrder.push(item.grant);
            byGrant.set(item.grant, []);
        }
        byGrant.get(item.grant)!.push({
            label: item.name,
            choiceGroup: item.choiceGroup,
            choiceCount: item.choiceCount,
        });
    }

    const preferred = ['STARTING', 'MULTICLASS'];
    const orderedGrants = [
        ...preferred.filter((grant) => byGrant.has(grant)),
        ...grantOrder.filter((grant) => !preferred.includes(grant)),
    ];

    const lines: GroupedChoiceLine[] = [];
    for (const grant of orderedGrants) {
        const grantLabel = GRANT_LABELS[grant] ?? grant;
        for (const line of formatGroupedChoiceLines(byGrant.get(grant) ?? [], `proficiency-${grant}`)) {
            lines.push({
                key: line.key,
                text: `${grantLabel} · ${line.text}`,
            });
        }
    }
    return lines;
}

/**
 * Class-detail / review equipment lines: fixed quantities and pick-N pools.
 * Example: `Choose 1 of 1× Mace, 1× Warhammer`.
 */
export function formatGroupedEquipmentLines(
    items: ReadonlyArray<{
        name: string;
        quantity: number;
        choiceGroup?: number | null;
        choiceCount?: number | null;
    }>,
): GroupedChoiceLine[] {
    return formatGroupedChoiceLines(
        items.map((item) => ({
            label: `${item.quantity}× ${item.name}`,
            choiceGroup: item.choiceGroup,
            choiceCount: item.choiceCount,
        })),
        'equipment',
    );
}

/** Plain text lines for editor review summaries (no React keys). */
export function formatClassProficiencySummaryLines(
    items: ReadonlyArray<{
        name: string;
        grant: string;
        choiceGroup?: number | null;
        choiceCount?: number | null;
    }>,
): string[] {
    return formatGroupedProficiencyLines(items).map((line) => line.text);
}

/** Plain text equipment lines for editor review summaries. */
export function formatClassEquipmentSummaryLines(
    items: ReadonlyArray<{
        name: string;
        quantity: number;
        choiceGroup?: number | null;
        choiceCount?: number | null;
    }>,
): string[] {
    return formatGroupedEquipmentLines(items).map((line) => line.text);
}
