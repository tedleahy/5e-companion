/**
 * One multiclass ability prerequisite rule (group = OR cluster; groups AND together).
 */
export type MulticlassPrerequisiteRuleLike = {
    abilityIndex: string;
    minimum: number;
    group: number;
};

/**
 * Formats multiclass prerequisite rules for review and warning copy.
 * Rules that share a `group` are OR alternatives; distinct groups are AND requirements.
 * Returns `None` when there are no rules.
 */
export function formatMulticlassPrerequisiteRules(
    rules: readonly MulticlassPrerequisiteRuleLike[],
): string {
    if (rules.length === 0) return 'None';

    const groups = new Map<number, MulticlassPrerequisiteRuleLike[]>();
    for (const rule of rules) {
        groups.set(rule.group, [...(groups.get(rule.group) ?? []), rule]);
    }

    return [...groups.entries()]
        .sort(([left], [right]) => left - right)
        .map(([, groupRules]) =>
            groupRules
                .map((rule) => `${rule.abilityIndex.toUpperCase()} ${rule.minimum}`)
                .join(' or '),
        )
        .join(' and ');
}
