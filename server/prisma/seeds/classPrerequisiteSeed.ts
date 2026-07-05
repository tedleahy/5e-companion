type SrdReference = {
    index: string;
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
};

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
