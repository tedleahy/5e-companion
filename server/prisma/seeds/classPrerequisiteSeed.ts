type SrdReference = {
    index: string;
};

/** One option in an SRD proficiency-choice array, including nested choice pools. */
export type SrdProficiencyChoiceOption = {
    option_type?: string;
    item?: SrdReference;
    choice?: {
        from?: {
            options?: SrdProficiencyChoiceOption[];
        };
    };
};

export type SrdMulticlassing = {
    prerequisites?: Array<{ ability_score: SrdReference; minimum_score: number }>;
    prerequisite_options?: {
        from?: {
            options?: Array<{
                ability_score?: SrdReference;
                minimum_score?: number;
            }>;
        };
    };
    proficiencies?: SrdReference[];
    proficiency_choices?: Array<{
        choose?: number;
        from?: { options?: SrdProficiencyChoiceOption[] };
    }>;
};

/** One `ClassProficiency` choice/fixed rule derived from SRD class data. */
export type ClassProficiencyRuleSeed = {
    value: string;
    grant: 'STARTING' | 'MULTICLASS';
    choiceGroup: number | null;
    choiceCount: number | null;
};

/** One MULTICLASS `ClassProficiency` row derived from SRD `multi_classing` data. */
export type MulticlassProficiencyRule = ClassProficiencyRuleSeed & {
    grant: 'MULTICLASS';
};

/**
 * Recursively collects proficiency `index` values from an SRD choice-option
 * array. Nested `option_type: "choice"` pools (e.g. monk artisan tools vs
 * instruments) are flattened into one selectable set so a single pick-N group
 * can include every leaf option.
 */
export function flattenProficiencyChoiceOptionIndexes(
    options: SrdProficiencyChoiceOption[] | undefined,
): string[] {
    const indexes: string[] = [];

    for (const option of options ?? []) {
        if (option.item?.index) {
            indexes.push(option.item.index);
            continue;
        }

        if (option.choice?.from?.options) {
            indexes.push(...flattenProficiencyChoiceOptionIndexes(option.choice.from.options));
        }
    }

    return indexes;
}

/**
 * Maps an SRD `proficiency_choices` (or `multi_classing.proficiency_choices`)
 * array into independently limited `ClassProficiency` choice-group rows.
 */
export function classProficiencyChoiceRules(
    choices: Array<{ choose?: number; from?: { options?: SrdProficiencyChoiceOption[] } }> | undefined,
    grant: 'STARTING' | 'MULTICLASS',
): ClassProficiencyRuleSeed[] {
    return (choices ?? []).flatMap((choice, groupIndex) => (
        flattenProficiencyChoiceOptionIndexes(choice.from?.options).map((value) => ({
            value,
            grant,
            choiceGroup: groupIndex + 1,
            choiceCount: choice.choose ?? 1,
        }))
    ));
}

/** Normalizes required scores and OR-style prerequisite options into groups. */
export function classMulticlassPrerequisites(multiClassing?: SrdMulticlassing) {
    const prerequisites = (multiClassing?.prerequisites ?? []).map((rule, index) => ({
        abilityIndex: rule.ability_score.index,
        minimum: rule.minimum_score,
        group: index + 1,
    }));
    const optionGroup = prerequisites.length + 1;
    const prerequisiteOptions = multiClassing?.prerequisite_options?.from?.options ?? [];

    return [
        ...prerequisites,
        ...prerequisiteOptions.flatMap((rule) => (
            rule.ability_score && rule.minimum_score != null
                ? [{ abilityIndex: rule.ability_score.index, minimum: rule.minimum_score, group: optionGroup }]
                : []
        )),
    ];
}

/**
 * Derives MULTICLASS `ClassProficiency` rows from SRD `multi_classing` data:
 * fixed grants (`multi_classing.proficiencies`, `choiceGroup: null`) plus
 * independently limited choice groups (`multi_classing.proficiency_choices`),
 * mirroring how STARTING proficiency rules are derived from the class root.
 */
export function classMulticlassProficiencyRules(multiClassing?: SrdMulticlassing): MulticlassProficiencyRule[] {
    const fixedRules: MulticlassProficiencyRule[] = (multiClassing?.proficiencies ?? []).map((proficiency) => ({
        value: proficiency.index,
        grant: 'MULTICLASS',
        choiceGroup: null,
        choiceCount: null,
    }));

    const choiceRules = classProficiencyChoiceRules(multiClassing?.proficiency_choices, 'MULTICLASS') as MulticlassProficiencyRule[];

    return [...fixedRules, ...choiceRules];
}
